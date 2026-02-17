import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { query } from '@/lib/db';
import { processImage, processVideo } from '@/lib/media-processor';
import path from 'path';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100MB
const PHOTO_LIMIT = 10;
const VIDEO_LIMIT = 4;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

const VALID_ENTITIES = ['training', 'instructor', 'event'];
const VALID_MEDIA_TYPES = ['photo', 'video', 'cover'];

export async function POST(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entity_type') as string;
    const entityId = formData.get('entity_id') as string;
    const mediaType = (formData.get('media_type') as string) || 'photo';

    // Crop parameters (from cropper — pixel coordinates)
    const cropX = parseInt(formData.get('crop_x') as string) || 0;
    const cropY = parseInt(formData.get('crop_y') as string) || 0;
    const cropW = parseInt(formData.get('crop_width') as string) || 0;
    const cropH = parseInt(formData.get('crop_height') as string) || 0;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!entityType || !VALID_ENTITIES.includes(entityType)) return NextResponse.json({ error: 'Invalid entity_type' }, { status: 400 });
    if (!entityId) return NextResponse.json({ error: 'Missing entity_id' }, { status: 400 });
    if (!VALID_MEDIA_TYPES.includes(mediaType)) return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isImage && !isVideo) return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    if (isImage && file.size > MAX_PHOTO_SIZE) return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 400 });
    if (isVideo && file.size > MAX_VIDEO_SIZE) return NextResponse.json({ error: 'Video too large (max 100MB)' }, { status: 400 });

    // Check limits
    const dbMediaType = isVideo ? 'video' : mediaType;
    if (dbMediaType !== 'cover') {
      const countRes = await query(
        `SELECT count(*) as cnt FROM media WHERE entity_type=$1 AND entity_id=$2 AND media_type=$3`,
        [entityType, parseInt(entityId), dbMediaType]
      );
      const cnt = parseInt(countRes.rows[0].cnt);
      const limit = isVideo ? VIDEO_LIMIT : PHOTO_LIMIT;
      if (cnt >= limit) return NextResponse.json({ error: `Limit reached (max ${limit} ${dbMediaType}s)` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let finalUrl: string;
    let thumbUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;
    let fileSize: number;
    let variants: Record<string, any> = {};

    if (isImage) {
      // Use new media processor for images
      const crop = (cropW > 0 && cropH > 0) ? {
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH
      } : undefined;

      const enableAVIF = process.env.ENABLE_AVIF === 'true';
      const imageVariants = await processImage(buffer, entityType, parseInt(entityId), crop, enableAVIF);

      // Use large variant as primary URL
      finalUrl = imageVariants.large?.url || imageVariants.original.url;
      thumbUrl = imageVariants.thumbnail.url;
      width = imageVariants.large?.width || imageVariants.original.width;
      height = imageVariants.large?.height || imageVariants.original.height;
      fileSize = (imageVariants.large?.size || 0) + (imageVariants.medium?.size || 0) + imageVariants.thumbnail.size;
      variants = imageVariants;
    } else {
      // Use new media processor for videos
      const videoVariants = await processVideo(buffer, entityType, parseInt(entityId), file.name);

      finalUrl = videoVariants.original.url;
      thumbUrl = videoVariants.poster?.url || videoVariants.thumbnail?.url || null;
      width = null; // Video dimensions not tracked in variants
      height = null;
      fileSize = videoVariants.original.size;
      variants = videoVariants;
    }

    // For cover type, delete existing cover first
    if (mediaType === 'cover') {
      await query(`DELETE FROM media WHERE entity_type=$1 AND entity_id=$2 AND media_type='cover'`, [entityType, parseInt(entityId)]);
    }

    // Get next display_order
    const orderRes = await query(
      `SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM media WHERE entity_type=$1 AND entity_id=$2 AND media_type=$3`,
      [entityType, parseInt(entityId), dbMediaType]
    );
    const displayOrder = parseInt(orderRes.rows[0].next_order) || 0;

    const insertRes = await query(
      `INSERT INTO media (entity_type, entity_id, media_type, url, thumbnail_url, original_name, mime_type, file_size, width, height, display_order, variants)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [entityType, parseInt(entityId), dbMediaType, finalUrl, thumbUrl, file.name, file.type, fileSize, width, height, displayOrder, JSON.stringify(variants)]
    );

    return NextResponse.json({ data: insertRes.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[Upload]', err);
    return NextResponse.json({ error: 'Upload failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
