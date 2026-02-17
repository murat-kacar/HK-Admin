import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { training_id, training_title, training_date, event_id, event_title, event_date, name, email, phone, message } = body;

    if (!name || !email || !phone) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const res = await query(
      `INSERT INTO applications (training_id, training_title, training_date, name, email, phone, message) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [training_id || event_id || null, training_title || event_title || null, training_date || event_date || null, name, email, phone, message || null]
    );

    return NextResponse.json({ data: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const res = await query('SELECT * FROM applications ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json({ data: res.rows });
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
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const res = await query('UPDATE applications SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
