import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await query(`
      SELECT 
        t.*,
        COALESCE(m.url, t.poster_image) as poster_image
      FROM trainings t
      LEFT JOIN (
        SELECT DISTINCT ON (entity_id) entity_id, url
        FROM media
        WHERE entity_type = 'training' AND media_type = 'cover'
        ORDER BY entity_id, id DESC
      ) m ON t.id = m.entity_id
      WHERE t.slug = $1
      LIMIT 1
    `, [slug]);
    if (res.rows.length === 0) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}

    const training = res.rows[0];

    // Fetch associated instructors
    const instRes = await query(`
      SELECT i.id, i.name, i.slug, i.photo, i.expertise 
      FROM instructors i
      JOIN training_instructors ei ON i.id = ei.instructor_id
      WHERE ei.training_id = $1
      ORDER BY i.display_order ASC
    `, [training.id]);

    training.instructors = instRes.rows;

    return NextResponse.json({ data: training });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
