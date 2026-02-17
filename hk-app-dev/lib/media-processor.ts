import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { randomUUID } from 'crypto';
import { uploadToStorage, generateStoragePath } from './storage';
import path from 'path';
import { writeFile, unlink, mkdir } from 'fs/promises';
import os from 'os';

export interface ImageVariants {
  original: { url: string; key: string; width: number; height: number; size: number };
  large?: { url: string; key: string; width: number; height: number; size: number };
  medium?: { url: string; key: string; width: number; height: number; size: number };
  thumbnail: { url: string; key: string; width: number; height: number; size: number };
  formats: {
    webp: { url: string; key: string; size: number };
    avif?: { url: string; key: string; size: number };
  };
}

export interface VideoVariants {
  original: { url: string; key: string; size: number; duration: number };
  variants: Array<{ url: string; key: string; size: number; resolution: string; codec: string }>;
  thumbnail: { url: string; key: string; size: number };
  poster: { url: string; key: string; size: number };
}

export interface CropParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Process and upload an image with multiple variants
 */
export async function processImage(
  buffer: Buffer,
  entityType: string,
  entityId: string | number,
  crop?: CropParams,
  generateAVIF: boolean = false
): Promise<ImageVariants> {
  const uid = randomUUID().slice(0, 12);
  let pipeline = sharp(buffer);

  // Apply crop if provided
  if (crop && crop.width > 0 && crop.height > 0) {
    pipeline = pipeline.extract({
      left: Math.round(crop.x),
      top: Math.round(crop.y),
      width: Math.round(crop.width),
      height: Math.round(crop.height),
    });
  }

  // Get original metadata
  const originalMeta = await pipeline.metadata();
  const originalWidth = originalMeta.width || 0;
  const originalHeight = originalMeta.height || 0;

  const results: ImageVariants = {
    original: { url: '', key: '', width: originalWidth, height: originalHeight, size: 0 },
    thumbnail: { url: '', key: '', width: 0, height: 0, size: 0 },
    formats: {
      webp: { url: '', key: '', size: 0 },
    },
  };

  // 1. Large (1920px max) - WebP
  const largeBuffer = await pipeline
    .clone()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  const largeMeta = await sharp(largeBuffer).metadata();
  const largePath = generateStoragePath(entityType, entityId, `${uid}_large.webp`);
  const largeResult = await uploadToStorage(largeBuffer, largePath, 'image/webp');

  results.large = {
    url: largeResult.url,
    key: largeResult.key,
    width: largeMeta.width || 0,
    height: largeMeta.height || 0,
    size: largeResult.size,
  };

  // Use large as original
  results.original = { ...results.large };

  // 2. Medium (800px) - WebP
  const mediumBuffer = await pipeline
    .clone()
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const mediumMeta = await sharp(mediumBuffer).metadata();
  const mediumPath = generateStoragePath(entityType, entityId, `${uid}_medium.webp`);
  const mediumResult = await uploadToStorage(mediumBuffer, mediumPath, 'image/webp');

  results.medium = {
    url: mediumResult.url,
    key: mediumResult.key,
    width: mediumMeta.width || 0,
    height: mediumMeta.height || 0,
    size: mediumResult.size,
  };

  // 3. Thumbnail (400px) - WebP
  const thumbBuffer = await pipeline
    .clone()
    .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  const thumbMeta = await sharp(thumbBuffer).metadata();
  const thumbPath = generateStoragePath(entityType, entityId, `${uid}_thumb.webp`);
  const thumbResult = await uploadToStorage(thumbBuffer, thumbPath, 'image/webp');

  results.thumbnail = {
    url: thumbResult.url,
    key: thumbResult.key,
    width: thumbMeta.width || 0,
    height: thumbMeta.height || 0,
    size: thumbResult.size,
  };

  // 4. WebP format (main)
  results.formats.webp = {
    url: results.large.url,
    key: results.large.key,
    size: results.large.size,
  };

  // 5. AVIF format (optional, better compression but slower)
  if (generateAVIF) {
    const avifBuffer = await pipeline
      .clone()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 75, effort: 4 })
      .toBuffer();

    const avifPath = generateStoragePath(entityType, entityId, `${uid}_large.avif`);
    const avifResult = await uploadToStorage(avifBuffer, avifPath, 'image/avif');

    results.formats.avif = {
      url: avifResult.url,
      key: avifResult.key,
      size: avifResult.size,
    };
  }

  return results;
}

/**
 * Process and upload a video with multiple variants
 */
export async function processVideo(
  buffer: Buffer,
  entityType: string,
  entityId: string | number,
  originalFilename: string
): Promise<VideoVariants> {
  const uid = randomUUID().slice(0, 12);
  const tempDir = path.join(os.tmpdir(), 'hk-video-processing', uid);
  await mkdir(tempDir, { recursive: true });

  const ext = path.extname(originalFilename) || '.mp4';
  const inputPath = path.join(tempDir, `input${ext}`);
  await writeFile(inputPath, buffer);

  const results: VideoVariants = {
    original: { url: '', key: '', size: 0, duration: 0 },
    variants: [],
    thumbnail: { url: '', key: '', size: 0 },
    poster: { url: '', key: '', size: 0 },
  };

  try {
    // Get video metadata
    const metadata = await getVideoMetadata(inputPath);
    results.original.duration = metadata.duration || 0;

    // 1. Upload original (optimized H.264)
    const originalOptimizedPath = path.join(tempDir, 'original.mp4');
    await compressVideo(inputPath, originalOptimizedPath, { crf: 23, preset: 'medium' });
    
    const originalBuffer = await import('fs/promises').then(fs => fs.readFile(originalOptimizedPath));
    const originalStoragePath = generateStoragePath(entityType, entityId, `${uid}_original.mp4`);
    const originalResult = await uploadToStorage(originalBuffer, originalStoragePath, 'video/mp4');

    results.original.url = originalResult.url;
    results.original.key = originalResult.key;
    results.original.size = originalResult.size;

    // 2. Generate 720p variant (mobile-friendly)
    const variant720Path = path.join(tempDir, '720p.mp4');
    await compressVideo(inputPath, variant720Path, { crf: 25, preset: 'medium', scale: '1280:720' });

    const variant720Buffer = await import('fs/promises').then(fs => fs.readFile(variant720Path));
    const variant720StoragePath = generateStoragePath(entityType, entityId, `${uid}_720p.mp4`);
    const variant720Result = await uploadToStorage(variant720Buffer, variant720StoragePath, 'video/mp4');

    results.variants.push({
      url: variant720Result.url,
      key: variant720Result.key,
      size: variant720Result.size,
      resolution: '720p',
      codec: 'h264',
    });

    // 3. Generate thumbnail (at 1 second)
    const thumbnailPath = path.join(tempDir, 'thumb.jpg');
    await extractThumbnail(inputPath, thumbnailPath, '00:00:01');

    const thumbnailBuffer = await import('fs/promises').then(fs => fs.readFile(thumbnailPath));
    const thumbProcessed = await sharp(thumbnailBuffer)
      .resize({ width: 400, height: 400, fit: 'inside' })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbStoragePath = generateStoragePath(entityType, entityId, `${uid}_thumb.webp`);
    const thumbResult = await uploadToStorage(thumbProcessed, thumbStoragePath, 'image/webp');

    results.thumbnail.url = thumbResult.url;
    results.thumbnail.key = thumbResult.key;
    results.thumbnail.size = thumbResult.size;

    // 4. Generate poster (at 25% duration)
    const posterTime = Math.floor((metadata.duration || 1) * 0.25);
    const posterPath = path.join(tempDir, 'poster.jpg');
    await extractThumbnail(inputPath, posterPath, formatTime(posterTime));

    const posterBuffer = await import('fs/promises').then(fs => fs.readFile(posterPath));
    const posterProcessed = await sharp(posterBuffer)
      .resize({ width: 1200, height: 1200, fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer();

    const posterStoragePath = generateStoragePath(entityType, entityId, `${uid}_poster.webp`);
    const posterResult = await uploadToStorage(posterProcessed, posterStoragePath, 'image/webp');

    results.poster.url = posterResult.url;
    results.poster.key = posterResult.key;
    results.poster.size = posterResult.size;

  } finally {
    // Cleanup temp files
    try {
      const fs = await import('fs/promises');
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('[Video Processing] Cleanup failed:', err);
    }
  }

  return results;
}

// Helper functions

function getVideoMetadata(inputPath: string): Promise<{ duration?: number; width?: number; height?: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      resolve({
        duration: metadata.format.duration,
        width: videoStream?.width,
        height: videoStream?.height,
      });
    });
  });
}

function compressVideo(
  inputPath: string,
  outputPath: string,
  options: { crf: number; preset: string; scale?: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        `-crf ${options.crf}`,
        `-preset ${options.preset}`,
        '-movflags +faststart', // Enable streaming
      ]);

    if (options.scale) {
      command = command.size(options.scale);
    }

    command
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

function extractThumbnail(inputPath: string, outputPath: string, timestamp: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timestamp],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1280x720',
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
