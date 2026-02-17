import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET() {
  try {
    const res = await query('SELECT key, value FROM site_settings');
    const obj: Record<string, string> = {};
    for (const r of res.rows) obj[r.key] = r.value;
    return NextResponse.json({ data: obj });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    // body expected: { key: value, ... }
    const keys = Object.keys(body || {});
    for (const k of keys) {
      const v = body[k];
      // basic server-side validation for known keys
      if (k === 'contact_email' && v && !/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(String(v))) {
        return NextResponse.json({ error: 'Invalid contact_email' }, { status: 400 });
      }
      if (k === 'canonical_domain' && v && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(v).replace(/^https?:\/\//, '').replace(/\/$/, ''))) {
        return NextResponse.json({ error: 'Invalid canonical_domain' }, { status: 400 });
      }
      await query(`INSERT INTO site_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`, [k, String(v)]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Note: export named handlers only (no default export)
