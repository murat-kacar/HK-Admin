import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await query('SELECT * FROM instructors WHERE slug = $1 LIMIT 1', [slug]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const instructor = res.rows[0];

    // Fetch associated trainings
    const trainingsRes = await query(`
      SELECT t.id, t.title, t.slug, t.event_type, t.poster_image 
      FROM trainings t
      JOIN training_instructors ti ON t.id = ti.training_id
      WHERE ti.instructor_id = $1
      ORDER BY t.display_order ASC
    `, [instructor.id]);

    instructor.trainings = trainingsRes.rows;

    return NextResponse.json({ data: instructor });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
