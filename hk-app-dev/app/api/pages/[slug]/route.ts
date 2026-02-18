import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const res = await query('SELECT slug, title, content, updated_at FROM pages WHERE slug=$1 LIMIT 1', [slug]);
    if (res.rows.length === 0) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await requireAuth(req);
  if (authError) {return authError;}
  try {
    const { slug } = await params;
    const body = await req.json();
    const { title, content } = body;
    const res = await query(
      'UPDATE pages SET title=$1, content=$2, updated_at=NOW() WHERE slug=$3 RETURNING *',
      [title || '', content || '', slug]
    );
    if (res.rows.length === 0) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
