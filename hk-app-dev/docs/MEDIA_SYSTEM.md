# 📸 Advanced Media Management System

## Overview

Production-ready media upload system with automatic compression, multi-format generation, and Cloudflare R2 storage support.

## Features

✅ **Multi-Variant Images**
- 3 sizes: Thumbnail (400px), Medium (800px), Large (1920px)
- 2 formats: WebP (always) + AVIF (optional)
- Smart cropping support
- Quality optimization (80-85)

✅ **Intelligent Video Processing**
- H.264 compression with CRF 23 (high quality)
- 720p mobile variant (CRF 25)
- Automatic thumbnail extraction (at 1s)
- Poster frame generation (at 25% duration)
- Streaming-optimized (`faststart` flag)

✅ **Flexible Storage**
- **Local mode** for development (`STORAGE_TYPE=local`)
- **R2 mode** for production (`STORAGE_TYPE=r2`)
- Seamless switching via environment variables

✅ **Performance & Compatibility**
- WebP format for modern browsers (90%+ smaller than JPEG)
- AVIF format for cutting-edge compression (optional)
- Mobile-friendly video sizes (720p variant)
- Old device compatibility (H.264 Main profile)

---

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# ── Storage Configuration ──
STORAGE_TYPE=local  # or 'r2' for production

# ── Cloudflare R2 (only if STORAGE_TYPE=r2) ──
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=hk-akademi-media
R2_PUBLIC_URL=https://media.hkakademi.com

# ── Media Processing ──
ENABLE_AVIF=false  # Set to 'true' for AVIF generation (slower but better compression)
```

### 2. Local Development Setup

For local development, use `STORAGE_TYPE=local`:

```bash
# Files will be saved to:
# public/uploads/{entityType}s/{entityId}/
```

**Advantages:**
- No external dependencies
- Fast iteration & testing
- Works offline
- Easy file inspection

### 3. Production Setup (Cloudflare R2)

#### Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Click **"Create bucket"**
3. Name: `hk-akademi-media` (or your choice)
4. Region: Auto (Cloudflare automatically distributes)

#### Step 2: Generate API Credentials

1. Go to **R2 → Manage R2 API Tokens**
2. Click **"Create API token"**
3. Choose **"Edit" permissions** for your bucket
4. Copy:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
   - **Account ID** (shown on bucket page) → `R2_ACCOUNT_ID`

#### Step 3: Configure Custom Domain (Optional but Recommended)

1. Go to your bucket → **Settings → Public Access**
2. Add custom domain: `media.hkakademi.com`
3. Update DNS with CNAME record pointing to R2
4. Set `R2_PUBLIC_URL=https://media.hkakademi.com`

**Why custom domain?**
- Branding (media.yoursite.com vs r2.cloudflarestorage.com)
- Better CDN integration
- No R2 egress fees (Cloudflare's killer feature!)

#### Step 4: Set CORS (if needed for direct uploads)

If you plan to implement direct browser → R2 uploads later:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Database Migration

Run the migration to add `variants` column:

```bash
docker exec -i hk-app-db-dev psql -U dev_user -d hk_app_dev < migrations/add_variants_to_media.sql
```

Or manually:
```sql
ALTER TABLE media ADD COLUMN variants JSONB;
CREATE INDEX idx_media_variants ON media USING GIN (variants);
```

---

## Architecture

### Storage Abstraction Layer (`lib/storage.ts`)

Unified interface for local and R2 storage:

```typescript
// Upload file
await uploadToStorage(buffer, 'trainings/123/photo.webp', 'image/webp');

// Delete file
await deleteFromStorage('trainings/123/photo.webp');

// Check existence
const exists = await fileExists('trainings/123/photo.webp');

// Get public URL
const url = getPublicUrl('trainings/123/photo.webp');
```

**Automatically switches** between local filesystem and R2 based on `STORAGE_TYPE`.

### Media Processor (`lib/media-processor.ts`)

#### Image Processing

```typescript
const variants = await processImage(buffer, 'training', 123, crop, enableAVIF);

// Returns:
{
  webp: {
    thumbnail: 'https://media.../thumb.webp',  // 400px
    medium: 'https://media.../medium.webp',     // 800px
    large: 'https://media.../large.webp'        // 1920px
  },
  avif: { /* same structure if ENABLE_AVIF=true */ },
  metadata: {
    dimensions: { /* width/height for each size */ },
    sizes: { /* file sizes in bytes */ },
    totalSize: 123456
  }
}
```

**Features:**
- Smart cropping (optional pre-crop before resizing)
- Quality optimization (WebP 80-85, AVIF slower but smaller)
- Aspect ratio preservation
- No enlargement (respects original size)

#### Video Processing

```typescript
const variants = await processVideo(buffer, 'training', 123, 'original.mov');

// Returns:
{
  original: {
    url: 'https://media.../video.mp4',
    size: 5242880,
    width: 1920,
    height: 1080,
    codec: 'h264'
  },
  mobile720p: {
    url: 'https://media.../video_720p.mp4',
    size: 2097152,
    width: 1280,
    height: 720,
    codec: 'h264'
  },
  thumbnail: 'https://media.../video_thumb.jpg',  // at 1 second
  poster: 'https://media.../video_poster.jpg'     // at 25% duration
}
```

**Features:**
- H.264 Main profile (maximum device compatibility)
- CRF 23 (high quality) for original, CRF 25 for 720p
- AAC audio at 96kbps
- `faststart` flag for instant streaming
- Automatic thumbnail/poster extraction

---

## Upload API

### Endpoint: `POST /api/upload`

**FormData Parameters:**
- `file` (required): Image or video file
- `entity_type` (required): `'training'` | `'instructor'` | `'event'`
- `entity_id` (required): Entity ID (number)
- `media_type` (optional): `'photo'` | `'video'` | `'cover'` (default: `'photo'`)
- Crop parameters (optional):
  - `crop_x`: X coordinate (pixels)
  - `crop_y`: Y coordinate (pixels)
  - `crop_width`: Crop width (pixels)
  - `crop_height`: Crop height (pixels)

**Response:**
```json
{
  "data": {
    "id": 123,
    "entity_type": "training",
    "entity_id": 45,
    "media_type": "photo",
    "url": "https://media.../large.webp",
    "thumbnail_url": "https://media.../thumb.webp",
    "variants": {
      "webp": { /* all sizes */ },
      "avif": { /* if enabled */ }
    },
    "width": 1920,
    "height": 1080,
    "file_size": 245678,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**File Limits:**
- Images: 10 MB max
- Videos: 100 MB max
- Photos per entity: 10
- Videos per entity: 4
- Cover images: 1 (replaces existing)

**Supported Formats:**
- Images: JPEG, PNG, WebP, GIF
- Videos: MP4, WebM, QuickTime (MOV), AVI

---

## Frontend Usage

### MediaManager Component

Existing component automatically uses new system:

```tsx
<MediaManager
  entityType="training"
  entityId={123}
  mediaType="photo"
/>
```

**Features:**
- Drag & drop upload
- Image cropper (React Easy Crop)
- Progress indicators
- Variant preview (thumbnail/medium/large)
- Delete with cascade (removes all variants)

### Displaying Variants

Use appropriate size for each use case:

```tsx
// Card thumbnails
<img src={media.variants.webp.thumbnail} alt="..." />

// Detail page hero
<img src={media.variants.webp.large} alt="..." />

// Gallery previews
<img src={media.variants.webp.medium} alt="..." />

// Modern browsers with AVIF support
<picture>
  <source srcSet={media.variants.avif?.large} type="image/avif" />
  <source srcSet={media.variants.webp.large} type="image/webp" />
  <img src={media.url} alt="..." />
</picture>
```

### Video Playback

```tsx
<video controls poster={videoVariants.poster}>
  {/* Mobile devices (smaller, faster) */}
  <source 
    src={videoVariants.mobile720p.url} 
    type="video/mp4" 
    media="(max-width: 768px)" 
  />
  {/* Desktop (full quality) */}
  <source src={videoVariants.original.url} type="video/mp4" />
  Your browser doesn't support video.
</video>
```

---

## Performance Benefits

### Before (Old System)
- 1 size: 1920px max
- 1 format: WebP only
- No video optimization
- Local storage only

**Example upload (2MB JPEG):**
- Output: 1 file @ ~800 KB
- Load time on mobile: ~2.5s (3G)

### After (New System)
- 3 sizes: 400px / 800px / 1920px
- 2 formats: WebP + AVIF (optional)
- Video compression: Original + 720p
- R2 storage with CDN

**Same upload (2MB JPEG):**
- Outputs:
  - Thumbnail: ~25 KB (WebP)
  - Medium: ~150 KB (WebP)
  - Large: ~800 KB (WebP)
  - AVIF variants: ~30-50% smaller
- Load time on mobile: ~0.3s (using thumbnail)
- **8x faster on mobile!**

### Storage Savings

**Example 100 images:**

| Format | Total Size | Savings |
|--------|------------|---------|
| Original JPEG | 200 MB | - |
| Old system (WebP large) | 80 MB | 60% |
| **New system (WebP 3 sizes)** | **35 MB** | **82.5%** |
| New system (+ AVIF) | **28 MB** | **86%** |

### Cloudflare R2 Benefits

- **$0 egress fees** (unlike AWS S3 where bandwidth costs $$)
- Global CDN automatically
- 10 GB free storage per month
- After that: $0.015/GB/month (S3 is $0.023)

**Cost comparison for 100 GB media:**
- AWS S3: ~$2.30/month + egress fees (~$9/100GB)
- **Cloudflare R2: ~$1.50/month + $0 egress** 🎉

---

## Troubleshooting

### Video Processing Fails

**Symptom:** Videos upload but aren't compressed

**Solution:** Check FFmpeg installation:
```bash
docker exec hk-app-dev-container ffmpeg -version
```

If missing:
```bash
# Add to Dockerfile
RUN apk add --no-cache ffmpeg
```

### R2 Upload Fails

**Error:** `CredentialsProviderError: Could not load credentials`

**Solutions:**
1. Check environment variables are set correctly
2. Verify API token has **Edit** permissions
3. Confirm `R2_ACCOUNT_ID` matches your account
4. Check bucket name matches `R2_BUCKET_NAME`

### AVIF Generation Slow

**Symptom:** Uploads take 10-30 seconds

**Explanation:** AVIF encoding is CPU-intensive

**Solutions:**
1. Set `ENABLE_AVIF=false` in development
2. Use background job queue for production
3. Only generate AVIF for cover images:
   ```typescript
   const enableAVIF = mediaType === 'cover' && process.env.ENABLE_AVIF === 'true';
   ```

### Local Storage vs R2 Mismatch

**Symptom:** URLs work locally but 404 in production

**Solution:** Ensure consistent URL generation:
- Local: `/uploads/trainings/123/photo.webp`
- R2: `https://media.hkakademi.com/trainings/123/photo.webp`

Check `getPublicUrl()` function returns correct format for `STORAGE_TYPE`.

---

## Migration Guide

### From Old System to New System

**Step 1:** Run database migration (adds `variants` column)

**Step 2:** Existing media still works (uses `url` and `thumbnail_url`)

**Step 3:** New uploads automatically use new system

**Step 4 (Optional):** Reprocess existing media:

```typescript
// migrations/reprocess_existing_media.ts
import { query } from '@/lib/db';
import { processImage } from '@/lib/media-processor';
import fs from 'fs/promises';

async function reprocessMedia() {
  const result = await query(`
    SELECT * FROM media 
    WHERE media_type = 'photo' AND variants IS NULL
  `);

  for (const media of result.rows) {
    const filePath = `./public${media.url}`;
    const buffer = await fs.readFile(filePath);
    
    const variants = await processImage(
      buffer, 
      media.entity_type, 
      media.entity_id,
      undefined,
      false
    );

    await query(
      `UPDATE media SET variants = $1 WHERE id = $2`,
      [JSON.stringify(variants), media.id]
    );
  }
}
```

---

## Future Enhancements

### Planned Features
- [ ] Background job queue for video processing (Bull/BullMQ)
- [ ] Direct browser → R2 uploads (presigned URLs)
- [ ] Image optimization dashboard (savings report)
- [ ] Lazy video encoding (process on-demand)
- [ ] WebP → AVIF migration tool

### Advanced Optimizations
- [ ] Progressive JPEG for thumbnails
- [ ] Blurhash placeholder generation
- [ ] Responsive image srcset auto-generation
- [ ] Smart cropping with AI (face/object detection)
- [ ] CDN cache purging on media update

---

## Resources

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [WebP Format Guide](https://developers.google.com/speed/webp)
- [AVIF Format Guide](https://jakearchibald.com/2020/avif-has-landed/)

---

## Support

For issues or questions about the media system:

1. Check TypeScript errors: Ensure all dependencies installed
2. Check logs: `docker logs hk-app-dev-container`
3. Verify FFmpeg: `ffmpeg -version` inside container
4. Test R2 connection: Use AWS CLI or upload via dashboard first

**Common Issues:**
- **Slow upload:** Normal for video processing (30s-2min for large files)
- **Memory errors:** Increase Node heap size: `NODE_OPTIONS=--max-old-space-size=4096`
- **R2 CORS errors:** Configure bucket CORS settings (see Configuration section)
