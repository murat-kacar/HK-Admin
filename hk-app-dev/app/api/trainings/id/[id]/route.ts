import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const trainingId = parseInt(rawId, 10);

    if (Number.isNaN(trainingId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const trainingQueryResult = await query(`
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
      WHERE t.id = $1
      LIMIT 1
    `, [trainingId]);

    if (trainingQueryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const trainingRecord = trainingQueryResult.rows[0];
    const instructorsQueryResult = await query(`
      SELECT i.id, i.name, i.slug, i.photo, i.expertise 
      FROM instructors i
      JOIN training_instructors ei ON i.id = ei.instructor_id
      WHERE ei.training_id = $1
      ORDER BY i.display_order ASC
    `, [trainingRecord.id]);

    trainingRecord.instructors = instructorsQueryResult.rows;
    return NextResponse.json({ data: trainingRecord });
  } catch (err) {
    console.error('[API Trainings by id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
