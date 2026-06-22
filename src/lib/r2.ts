import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const R2_BUCKET    = process.env.R2_BUCKET_NAME ?? '';
export const R2_PUBLIC_BASE = process.env.R2_PUBLIC_URL || null;

export const r2 = new S3Client({
  region:   'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID ?? ''}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID     ?? '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
  },
});

export function r2ObjectKey(fileName: string): string {
  const ext  = fileName.split('.').pop() ?? 'pdf';
  const slug = fileName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60);
  const rand = Math.random().toString(36).slice(2, 8);
  return `publications/${slug}-${rand}.${ext}`;
}

export async function deleteR2Object(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
