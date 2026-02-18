import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { deleteFromStorage } from '@/lib/storage';

function getStorageKeyFromUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('/uploads/')) return value.replace('/uploads/', '');

  try {
    const parsed = new URL(value);
    return parsed.pathname.replace(/^\//, '') || null;
  } catch {
    return null;
  }
}

function collectVariantKeys(variants: unknown): string[] {
  if (!variants || typeof variants !== 'object') return [];

  const keys = new Set<string>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const record = node as Record<string, unknown>;
    const key = record.key;
    if (typeof key === 'string' && key.trim()) {
      keys.add(key);
    }

    for (const value of Object.values(record)) {
      walk(value);
    }
  };

  walk(variants);
  return Array.from(keys);
}

// GET: list media for an entity
export async function GET(req: Request) {
  const url = new URL(req.url);
  const entityType = url.searchParams.get('entity_type');
  const entityId = url.searchParams.get('entity_id');

  if (!entityType || !entityId) return NextResponse.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });

  try {
    const res = await query(
      `SELECT * FROM media WHERE entity_type=$1 AND entity_id=$2 ORDER BY media_type ASC, display_order ASC`,
      [entityType, parseInt(entityId)]
    );
    return NextResponse.json({ data: res.rows });
  } catch (err) {
    console.error('[Media GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: reorder media
export async function PUT(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    // body: { items: [{ id: number, display_order: number }] }
    const items = body.items as { id: number; display_order: number }[];
    if (!items || !Array.isArray(items)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

    for (const item of items) {
      await query('UPDATE media SET display_order=$1 WHERE id=$2', [item.display_order, item.id]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Media PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: remove media
export async function DELETE(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const id = body.id as number;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Get file info before deleting
    const res = await query('SELECT url, thumbnail_url, variants FROM media WHERE id=$1', [id]);
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { url: fileUrl, thumbnail_url: thumbUrl, variants } = res.rows[0];

    // Delete from DB
    await query('DELETE FROM media WHERE id=$1', [id]);

    // Delete files from storage (R2 or local)
    const directKeys = [
      getStorageKeyFromUrl(fileUrl),
      getStorageKeyFromUrl(thumbUrl),
      ...collectVariantKeys(variants),
    ].filter((key): key is string => Boolean(key));

    const uniqueKeys = Array.from(new Set(directKeys));
    try {
      await Promise.all(uniqueKeys.map((key) => deleteFromStorage(key)));
    } catch {
      // file may already be deleted or unavailable
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Media DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
