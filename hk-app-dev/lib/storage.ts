import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { lookup } from 'mime-types';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local'; // 'local' or 'r2'

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'hk-media-dev';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://media.hkakademi.com`;

let s3Client: S3Client | null = null;

if (STORAGE_TYPE === 'r2' && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

/**
 * Upload a file to storage (R2 or local)
 */
export async function uploadToStorage(
  buffer: Buffer,
  filePath: string,
  contentType?: string
): Promise<UploadResult> {
  const fileSize = buffer.length;
  const mimeType = contentType || lookup(filePath) || 'application/octet-stream';

  if (STORAGE_TYPE === 'r2' && s3Client) {
    // Upload to Cloudflare R2
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: R2_BUCKET_NAME,
        Key: filePath,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      },
    });

    await upload.done();

    return {
      url: `${R2_PUBLIC_URL}/${filePath}`,
      key: filePath,
      size: fileSize,
    };
  } else {
    // Upload to local /public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const fullPath = path.join(uploadDir, filePath);
    const dirPath = path.dirname(fullPath);

    await mkdir(dirPath, { recursive: true });
    await writeFile(fullPath, buffer);

    return {
      url: `/uploads/${filePath}`,
      key: filePath,
      size: fileSize,
    };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFromStorage(key: string): Promise<void> {
  if (STORAGE_TYPE === 'r2' && s3Client) {
    // Delete from R2
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  } else {
    // Delete from local
    const fullPath = path.join(process.cwd(), 'public', 'uploads', key);
    try {
      await unlink(fullPath);
    } catch (err) {
      // File might not exist, ignore
      console.warn('[Storage] Delete failed:', err);
    }
  }
}

/**
 * Check if a file exists in storage
 */
export async function fileExists(key: string): Promise<boolean> {
  if (STORAGE_TYPE === 'r2' && s3Client) {
    try {
      const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  } else {
    const fullPath = path.join(process.cwd(), 'public', 'uploads', key);
    try {
      const fs = await import('fs/promises');
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Generate storage path for entity media
 */
export function generateStoragePath(
  entityType: string,
  entityId: string | number,
  filename: string
): string {
  return `${entityType}s/${entityId}/${filename}`;
}

/**
 * Get public URL for a storage key
 */
export function getPublicUrl(key: string): string {
  if (STORAGE_TYPE === 'r2') {
    return `${R2_PUBLIC_URL}/${key}`;
  } else {
    return `/uploads/${key}`;
  }
}

export { STORAGE_TYPE };
