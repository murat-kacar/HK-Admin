import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { query } from '@/lib/db';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100MB
const PHOTO_LIMIT = 10;
const VIDEO_LIMIT = 4;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

const VALID_ENTITIES = ['training', 'instructor'];
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
    const ext = isVideo ? path.extname(file.name) || '.mp4' : '.webp';
    const uid = randomUUID().slice(0, 12);
    const filename = `${uid}${ext}`;
    const thumbFilename = `${uid}_thumb.webp`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', `${entityType}s`, entityId);
    await mkdir(uploadDir, { recursive: true });

    let finalUrl: string;
    let thumbUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;
    let fileSize: number;

    if (isImage) {
      let pipeline = sharp(buffer);

      // Apply crop if provided
      if (cropW > 0 && cropH > 0) {
        pipeline = pipeline.extract({ left: cropX, top: cropY, width: cropW, height: cropH });
      }

      // Main image: resize max 1920px, WebP quality 82
      const mainBuffer = await pipeline
        .clone()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      const meta = await sharp(mainBuffer).metadata();
      width = meta.width || null;
      height = meta.height || null;
      fileSize = mainBuffer.length;

      await writeFile(path.join(uploadDir, filename), mainBuffer);
      finalUrl = `/uploads/${entityType}s/${entityId}/${filename}`;

      // Thumbnail: 400px
      const thumbBuffer = await sharp(mainBuffer)
        .resize({ width: 400, height: 400, fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      await writeFile(path.join(uploadDir, thumbFilename), thumbBuffer);
      thumbUrl = `/uploads/${entityType}s/${entityId}/${thumbFilename}`;
    } else {
      // Video: save original temporarily, then compress with ffmpeg
      const tempFilename = `${uid}_temp${path.extname(file.name) || '.mp4'}`;
      const tempPath = path.join(uploadDir, tempFilename);
      const compressedFilename = `${uid}.mp4`;
      const compressedPath = path.join(uploadDir, compressedFilename);

      await writeFile(tempPath, buffer);

      try {
        const { execSync } = await import('child_process');
        // Compress: H.264 Main profile (max device compat), max 720p, CRF 28, AAC 96k
        execSync(
          `ffmpeg -y -i "${tempPath}" -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p -preset medium -crf 28 -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" -c:a aac -b:a 96k -movflags +faststart "${compressedPath}" 2>/dev/null`,
          { timeout: 120000 }
        );
        // Remove temp file
        try { const { unlinkSync } = await import('fs'); unlinkSync(tempPath); } catch { /* ignore */ }
      } catch {
        // If compression fails, fall back to original
        const { renameSync } = await import('fs');
        try { renameSync(tempPath, compressedPath); } catch { /* ignore */ }
      }

      // Read compressed file size
      try {
        const { statSync } = await import('fs');
        fileSize = statSync(compressedPath).size;
      } catch {
        fileSize = buffer.length;
      }

      finalUrl = `/uploads/${entityType}s/${entityId}/${compressedFilename}`;

      // Generate video thumbnail using ffmpeg
      try {
        const { execSync } = await import('child_process');
        const thumbPath = path.join(uploadDir, thumbFilename);
        execSync(`ffmpeg -y -i "${compressedPath}" -ss 00:00:01 -vframes 1 -vf "scale=400:400:force_original_aspect_ratio=decrease,pad=400:400:(ow-iw)/2:(oh-ih)/2" "${thumbPath}" 2>/dev/null`);
        thumbUrl = `/uploads/${entityType}s/${entityId}/${thumbFilename}`;
      } catch {
        // Thumbnail generation failed — non-critical
      }
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
      `INSERT INTO media (entity_type, entity_id, media_type, url, thumbnail_url, original_name, mime_type, file_size, width, height, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [entityType, parseInt(entityId), dbMediaType, finalUrl, thumbUrl, file.name, file.type, fileSize, width, height, displayOrder]
    );

    return NextResponse.json({ data: insertRes.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[Upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
