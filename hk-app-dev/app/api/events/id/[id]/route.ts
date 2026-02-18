import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const res = await query(
      `SELECT
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
      WHERE e.id = $1
      LIMIT 1`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error('[API Events by id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
