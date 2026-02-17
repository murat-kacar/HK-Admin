import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { slugify } from '@/lib/slugify';
import { requireAuth } from '@/lib/api-auth';

// Valid category values for training placement
const VALID_CATEGORIES = ['hero', 'homepage', 'featured'] as const;

type TrainingBody = {
  id?: number;
  title: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  poster_image?: string;
  slug?: string;
  highlight_tags?: string[];
  display_order?: number;
  duration?: string;
  level?: string;
  timing?: string;
  detail_content?: string;
  metadata?: any;
  instructor_ids?: number[];
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const category = url.searchParams.get('category');     // e.g. hero, homepage, featured
  const archive = url.searchParams.get('archive');       // true → past trainings only
  const upcoming = url.searchParams.get('upcoming');     // true → future trainings only

  try {
    const where: string[] = ["status != 'deleted'"];
    const params: (string | number | boolean)[] = [];

    if (type) {
      params.push(type);
      where.push(`event_type = $${params.length}`);
    }
    if (category) {
      params.push(category);
      where.push(`$${params.length} = ANY(highlight_tags)`);
    }
    if (archive === 'true') {
      where.push(`COALESCE(end_date, start_date) < CURRENT_DATE`);
    }
    if (upcoming === 'true') {
      // Include trainings that haven't ended yet, OR trainings that have no date set at all
      where.push(`(COALESCE(end_date, start_date) >= CURRENT_DATE OR (start_date IS NULL AND end_date IS NULL))`);
    }

    const sql = `SELECT * FROM trainings WHERE ${where.join(' AND ')} ORDER BY display_order ASC, start_date ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await query(sql, params);
    return NextResponse.json({ data: res.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body: TrainingBody = await req.json();
    if (!body.title || body.title.trim().length < 3) return NextResponse.json({ error: 'Title is required and must be at least 3 characters' }, { status: 400 });
    if (body.start_date && isNaN(Date.parse(body.start_date))) return NextResponse.json({ error: 'start_date must be a valid ISO date' }, { status: 400 });
    const tags = (body.highlight_tags || []).filter((c) => VALID_CATEGORIES.includes(c as typeof VALID_CATEGORIES[number]));
    const slug = body.slug ? body.slug : slugify(body.title || '');
    const res = await query(
      `INSERT INTO trainings (title, description, event_type, start_date, end_date, location, poster_image, slug, highlight_tags, display_order, duration, level, timing, detail_content, metadata, status) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'active') RETURNING *`,
      [
        body.title,
        body.description || null,
        body.event_type || null,
        body.start_date || null,
        body.end_date || null,
        body.location || null,
        body.poster_image || null,
        slug,
        tags,
        body.display_order ?? 0,
        body.duration || null,
        body.level || null,
        body.timing || null,
        body.detail_content || null,
        JSON.stringify(body.metadata || {}),
      ]
    );

    const training = res.rows[0];

    // Handle instructors
    if (body.instructor_ids && Array.isArray(body.instructor_ids)) {
      for (const instId of body.instructor_ids) {
        await query('INSERT INTO training_instructors (training_id, instructor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [training.id, instId]);
      }
    }

    return NextResponse.json({ data: training }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body: TrainingBody = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (body.title && body.title.trim().length < 3) return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });
    if (body.start_date && isNaN(Date.parse(body.start_date))) return NextResponse.json({ error: 'start_date must be a valid ISO date' }, { status: 400 });
    const existing = await query('SELECT * FROM trainings WHERE id=$1 LIMIT 1', [body.id]);
    if (existing.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cur = existing.rows[0];
    const tags = body.highlight_tags !== undefined
      ? (body.highlight_tags || []).filter((c) => VALID_CATEGORIES.includes(c as typeof VALID_CATEGORIES[number]))
      : cur.highlight_tags;
    const slug = body.slug ? body.slug : slugify(body.title || cur.title || '');
    const res = await query(
      `UPDATE trainings SET 
        title=$1, description=$2, event_type=$3, start_date=$4, end_date=$5, 
        location=$6, poster_image=$7, slug=$8, highlight_tags=$9, display_order=$10, 
        duration=$11, level=$12, timing=$13, detail_content=$14, metadata=$15,
        updated_at=NOW() 
       WHERE id=$16 RETURNING *`,
      [
        body.title || cur.title,
        body.description ?? cur.description,
        body.event_type || cur.event_type,
        body.start_date || cur.start_date,
        body.end_date || cur.end_date,
        body.location || cur.location,
        body.poster_image || cur.poster_image,
        slug,
        tags,
        body.display_order ?? cur.display_order,
        body.duration ?? cur.duration,
        body.level ?? cur.level,
        body.timing ?? cur.timing,
        body.detail_content ?? cur.detail_content,
        JSON.stringify(body.metadata ?? cur.metadata),
        body.id
      ]
    );

    // Sync instructors
    if (body.instructor_ids && Array.isArray(body.instructor_ids)) {
      await query('DELETE FROM training_instructors WHERE training_id = $1', [body.id]);
      for (const instId of body.instructor_ids) {
        await query('INSERT INTO training_instructors (training_id, instructor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [body.id, instId]);
      }
    }

    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await query('DELETE FROM trainings WHERE id=$1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
