import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

type NewsBody = {
  id?: number;
  title?: string;
  excerpt?: string;
  source_name?: string;
  source_url?: string;
  image_url?: string;
  published_at?: string;
  is_active?: boolean;
  display_order?: number;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const includeInactive = url.searchParams.get('includeInactive') === 'true';

  if (includeInactive) {
    const authError = await requireAuth(req);
    if (authError) {
      return authError;
    }
  }

  try {
    const where = includeInactive ? '' : 'WHERE is_active = true';
    const res = await query(
      `SELECT
        id,
        title,
        excerpt,
        source_name,
        source_url,
        image_url,
        published_at,
        is_active,
        display_order,
        created_at,
        updated_at
      FROM press_news
      ${where}
      ORDER BY display_order ASC, published_at DESC NULLS LAST, id DESC
      LIMIT $1`,
      [limit],
    );

    return NextResponse.json({ data: res.rows });
  } catch (err) {
    console.error('[API News GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAuth(req);
  if (authError) {
    return authError;
  }

  try {
    const body: NewsBody = await req.json();

    if (!body.title || body.title.trim().length < 3) {
      return NextResponse.json({ error: 'Title is required (min 3 chars)' }, { status: 400 });
    }

    let displayOrder = body.display_order;
    if (displayOrder === undefined || displayOrder === null) {
      const maxOrderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM press_news');
      displayOrder = Number(maxOrderRes.rows[0]?.max_order || 0) + 1;
    }

    const res = await query(
      `INSERT INTO press_news (
        title, excerpt, source_name, source_url, image_url, published_at, is_active, display_order
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        body.title.trim(),
        body.excerpt?.trim() || null,
        body.source_name?.trim() || null,
        body.source_url?.trim() || null,
        body.image_url?.trim() || null,
        body.published_at || null,
        body.is_active ?? true,
        displayOrder,
      ],
    );

    return NextResponse.json({ data: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[API News POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await requireAuth(req);
  if (authError) {
    return authError;
  }

  try {
    const body: NewsBody = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const existing = await query('SELECT * FROM press_news WHERE id = $1 LIMIT 1', [body.id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const current = existing.rows[0];

    const res = await query(
      `UPDATE press_news
       SET
        title = $1,
        excerpt = $2,
        source_name = $3,
        source_url = $4,
        image_url = $5,
        published_at = $6,
        is_active = $7,
        display_order = $8,
        updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        (body.title || current.title).trim(),
        body.excerpt?.trim() ?? current.excerpt,
        body.source_name?.trim() ?? current.source_name,
        body.source_url?.trim() ?? current.source_url,
        body.image_url?.trim() ?? current.image_url,
        body.published_at ?? current.published_at,
        body.is_active ?? current.is_active,
        body.display_order ?? current.display_order,
        body.id,
      ],
    );

    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error('[API News PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await requireAuth(req);
  if (authError) {
    return authError;
  }

  try {
    const body = await req.json() as { id?: number };

    if (!body.id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await query('DELETE FROM press_news WHERE id = $1', [body.id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API News DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
