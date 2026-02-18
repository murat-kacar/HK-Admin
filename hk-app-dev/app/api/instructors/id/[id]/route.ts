import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const res = await query('SELECT * FROM instructors WHERE id=$1 LIMIT 1', [id]);
    if (res.rows.length === 0) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
