import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { slugify } from '@/lib/slugify';
import { requireAuth } from '@/lib/api-auth';

type EventBody = {
  id?: number;
  title: string;
  description?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  image_url?: string;
  slug?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
  display_order?: number;
  highlight_tags?: string[];
};

const VALID_CATEGORIES = ['hero', 'homepage'] as const;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const includeInactive = url.searchParams.get('includeInactive') === 'true';
  const category = url.searchParams.get('category');
  
  try {
    const where: string[] = [];
    const params: (string | number | boolean)[] = [];
    
    if (!includeInactive) {
      where.push('is_active = true');
    }
    
    if (category) {
      params.push(category);
      where.push(`$${params.length} = ANY(highlight_tags)`);
    }
    
    params.push(limit);
    
    const res = await query(`
      SELECT 
        e.id,
        e.title,
        e.slug,
        e.description,
        e.event_type,
        e.start_date,
        e.end_date,
        e.location,
        COALESCE(m.url, e.image_url) as image_url,
        e.content,
        e.metadata,
        e.is_active,
        e.display_order,
        e.highlight_tags
      FROM events e
      LEFT JOIN (
        SELECT DISTINCT ON (entity_id) entity_id, url
        FROM media
        WHERE entity_type = 'event' AND media_type = 'cover'
        ORDER BY entity_id, id DESC
      ) m ON e.id = m.entity_id
      ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY e.display_order ASC, e.start_date DESC NULLS LAST
      LIMIT $${params.length}
    `, params);

    return NextResponse.json({ data: res.rows });
  } catch (err) {
    console.error('[API Events]', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAuth(req);
  if (authError) {return authError;}
  
  try {
    const body: EventBody = await req.json();
    if (!body.title || body.title.trim().length < 3) {
      return NextResponse.json({ error: 'Title is required and must be at least 3 characters' }, { status: 400 });
    }
    
    const slug = body.slug ? body.slug : slugify(body.title);
    const tags = (body.highlight_tags || []).filter((c) => VALID_CATEGORIES.includes(c as typeof VALID_CATEGORIES[number]));
    
    // Auto-increment display_order if not provided
    let displayOrder = body.display_order;
    if (displayOrder === undefined || displayOrder === null || displayOrder === 0) {
      const maxOrderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM events');
      displayOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;
    }
    
    const res = await query(
      `INSERT INTO events (title, description, event_type, start_date, end_date, location, image_url, slug, content, metadata, is_active, display_order, highlight_tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        body.title,
        body.description || null,
        body.event_type || null,
        body.start_date || null,
        body.end_date || null,
        body.location || null,
        body.image_url || null,
        slug,
        body.content || null,
        JSON.stringify(body.metadata || {}),
        body.is_active !== undefined ? body.is_active : true,
        displayOrder ?? 0,
        tags
      ]
    );

    return NextResponse.json({ data: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[API Events POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await requireAuth(req);
  if (authError) {return authError;}
  
  try {
    const body: EventBody = await req.json();
    if (!body.id) {return NextResponse.json({ error: 'Missing id' }, { status: 400 });}
    
    const existing = await query('SELECT * FROM events WHERE id=$1 LIMIT 1', [body.id]);
    if (existing.rows.length === 0) {return NextResponse.json({ error: 'Not found' }, { status: 404 });}
    
    const cur = existing.rows[0];
    const slug = body.slug ? body.slug : slugify(body.title || cur.title);
    const tags = body.highlight_tags !== undefined
      ? (body.highlight_tags || []).filter((c) => VALID_CATEGORIES.includes(c as typeof VALID_CATEGORIES[number]))
      : cur.highlight_tags;
    
    const res = await query(
      `UPDATE events SET 
        title=$1, description=$2, event_type=$3, start_date=$4, end_date=$5, 
        location=$6, image_url=$7, slug=$8, content=$9, metadata=$10, 
        is_active=$11, display_order=$12, highlight_tags=$13
       WHERE id=$14 RETURNING *`,
      [
        body.title || cur.title,
        body.description ?? cur.description,
        body.event_type ?? cur.event_type,
        body.start_date ?? cur.start_date,
        body.end_date ?? cur.end_date,
        body.location ?? cur.location,
        body.image_url ?? cur.image_url,
        slug,
        body.content ?? cur.content,
        JSON.stringify(body.metadata ?? cur.metadata),
        body.is_active ?? cur.is_active,
        body.display_order ?? cur.display_order,
        tags,
        body.id
      ]
    );

    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error('[API Events PUT]', err);
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
    
    await query('DELETE FROM events WHERE id=$1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API Events DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
