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
  summary?: string;
  detail_content?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_online?: boolean;
  online_url?: string;
  is_free?: boolean;
  price?: number;
  capacity?: number;
  registration_url?: string;
  ticketing_url?: string;
  biletleme_sistemi?: string;
  poster_image?: string;
  slug?: string;
  highlight_tags?: string[];
  is_featured?: boolean;
  display_order?: number;
  duration?: string;
  level?: string;
  timing?: string;
  audience?: string;
  language?: string;
  agenda?: string;
  faqs?: Array<{ question: string; answer: string }>;
  metadata?: Record<string, unknown>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
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

    const sql = `
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
      WHERE ${where.join(' AND ')}
      ORDER BY t.display_order ASC, t.start_date ASC
      LIMIT $${params.length + 1}
    `;
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
  if (authError) {return authError;}
  try {
    const body: TrainingBody = await req.json();
    if (!body.title || body.title.trim().length < 3) {return NextResponse.json({ error: 'Title is required and must be at least 3 characters' }, { status: 400 });}
    if (body.start_date && isNaN(Date.parse(body.start_date))) {return NextResponse.json({ error: 'start_date must be a valid ISO date' }, { status: 400 });}
    const tags = (body.highlight_tags || []).filter((c) => VALID_CATEGORIES.includes(c as typeof VALID_CATEGORIES[number]));
    const slug = body.slug ? body.slug : slugify(body.title || '');
    
    // Auto-increment display_order if not provided
    let displayOrder = body.display_order;
    if (displayOrder === undefined || displayOrder === null || displayOrder === 0) {
      const maxOrderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM trainings');
      displayOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;
    }
    
    const res = await query(
      `INSERT INTO trainings (
        title, slug, summary, description, detail_content, event_type,
        start_date, end_date, start_time, end_time,
        location, is_online, online_url,
        is_free, price, capacity, registration_url, ticketing_url, biletleme_sistemi,
        poster_image, highlight_tags, is_featured, display_order,
        duration, level, timing, audience, language, agenda, faqs, metadata,
        seo_title, seo_description, seo_keywords, status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,'active'
      ) RETURNING *`,
      [
        body.title,
        slug,
        body.summary || null,
        body.description || null,
        body.detail_content || null,
        body.event_type || null,
        body.start_date || null,
        body.end_date || null,
        body.start_time || null,
        body.end_time || null,
        body.location || null,
        body.is_online || false,
        body.online_url || null,
        body.is_free !== undefined ? body.is_free : true,
        body.price || null,
        body.capacity || null,
        body.registration_url || null,
        body.ticketing_url || null,
        body.biletleme_sistemi || null,
        body.poster_image || null,
        tags,
        body.is_featured || false,
        displayOrder ?? 0,
        body.duration || null,
        body.level || null,
        body.timing || null,
        body.audience || null,
        body.language || 'Türkçe',
        body.agenda || null,
        body.faqs ? JSON.stringify(body.faqs) : null,
        JSON.stringify(body.metadata || {}),
        body.seo_title || null,
        body.seo_description || null,
        body.seo_keywords || null
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
  if (authError) {return authError;}
  try {
    const body: TrainingBody = await req.json();
    if (!body.id) {return NextResponse.json({ error: 'Missing id' }, { status: 400 });}
    if (body.title && body.title.trim().length < 3) {return NextResponse.json({ error: 'Title must be at least 3 characters' }, { status: 400 });}
    if (body.start_date && isNaN(Date.parse(body.start_date))) {return NextResponse.json({ error: 'start_date must be a valid ISO date' }, { status: 400 });}
    const existing = await query('SELECT * FROM trainings WHERE id=$1 LIMIT 1', [body.id]);
    if (existing.rows.length === 0) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    const cur = existing.rows[0];
    const tags = body.highlight_tags !== undefined
      ? (body.highlight_tags || []).filter((c) => VALID_CATEGORIES.includes(c as typeof VALID_CATEGORIES[number]))
      : cur.highlight_tags;
    const slug = body.slug ? body.slug : slugify(body.title || cur.title || '');
    const res = await query(
      `UPDATE trainings SET
        title=$1, slug=$2, summary=$3, description=$4, detail_content=$5, event_type=$6,
        start_date=$7, end_date=$8, start_time=$9, end_time=$10,
        location=$11, is_online=$12, online_url=$13,
        is_free=$14, price=$15, capacity=$16, registration_url=$17, ticketing_url=$18, biletleme_sistemi=$19,
        poster_image=$20, highlight_tags=$21, is_featured=$22, display_order=$23,
        duration=$24, level=$25, timing=$26, audience=$27, language=$28, agenda=$29, faqs=$30, metadata=$31,
        seo_title=$32, seo_description=$33, seo_keywords=$34,
        updated_at=NOW()
       WHERE id=$35 RETURNING *`,
      [
        body.title || cur.title,
        slug,
        body.summary ?? cur.summary,
        body.description ?? cur.description,
        body.detail_content ?? cur.detail_content,
        body.event_type || cur.event_type,
        body.start_date || cur.start_date,
        body.end_date || cur.end_date,
        body.start_time ?? cur.start_time,
        body.end_time ?? cur.end_time,
        body.location || cur.location,
        body.is_online ?? cur.is_online,
        body.online_url ?? cur.online_url,
        body.is_free ?? cur.is_free,
        body.price ?? cur.price,
        body.capacity ?? cur.capacity,
        body.registration_url ?? cur.registration_url,
        body.ticketing_url ?? cur.ticketing_url,
        body.biletleme_sistemi ?? cur.biletleme_sistemi,
        body.poster_image || cur.poster_image,
        tags,
        body.is_featured ?? cur.is_featured,
        body.display_order ?? cur.display_order,
        body.duration ?? cur.duration,
        body.level ?? cur.level,
        body.timing ?? cur.timing,
        body.audience ?? cur.audience,
        body.language ?? cur.language,
        body.agenda ?? cur.agenda,
        body.faqs ? JSON.stringify(body.faqs) : cur.faqs,
        JSON.stringify(body.metadata ?? cur.metadata),
        body.seo_title ?? cur.seo_title,
        body.seo_description ?? cur.seo_description,
        body.seo_keywords ?? cur.seo_keywords,
        body.id,
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
  if (authError) {return authError;}
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {return NextResponse.json({ error: 'Missing id' }, { status: 400 });}
    await query('DELETE FROM trainings WHERE id=$1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
