import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

// GET: return instructors for a training, or trainings for an instructor
export async function GET(req: Request) {
  const url = new URL(req.url);
  const trainingId = url.searchParams.get('training_id') || url.searchParams.get('event_id');
  const instructorId = url.searchParams.get('instructor_id');

  try {
    if (trainingId) {
      const res = await query(
        `SELECT i.* FROM instructors i
         JOIN training_instructors ei ON ei.instructor_id = i.id
         WHERE ei.training_id = $1
         ORDER BY i.display_order ASC`,
        [Number(trainingId)]
      );
      return NextResponse.json({ data: res.rows });
    }
    if (instructorId) {
      const res = await query(
        `SELECT e.* FROM trainings e
         JOIN training_instructors ei ON ei.training_id = e.id
         WHERE ei.instructor_id = $1 AND e.status != 'deleted'
         ORDER BY e.start_date DESC`,
        [Number(instructorId)]
      );
      return NextResponse.json({ data: res.rows });
    }
    // return all relations
    const res = await query('SELECT * FROM training_instructors');
    return NextResponse.json({ data: res.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: set instructors for a training (replace all)
export async function POST(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { training_id, instructor_ids } = body as { training_id: number; instructor_ids: number[] };
    const tid = training_id || (body as any).event_id;
    if (!tid || !Array.isArray(instructor_ids)) {
      return NextResponse.json({ error: 'training_id and instructor_ids[] required' }, { status: 400 });
    }
    // replace all: delete existing, insert new
    await query('DELETE FROM training_instructors WHERE training_id=$1', [tid]);
    for (const iid of instructor_ids) {
      await query('INSERT INTO training_instructors (training_id, instructor_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [tid, iid]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
