import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { r2, R2_BUCKET, r2ObjectKey } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_MB = 50;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'Only PDF and Word documents are allowed' }, { status: 400 });
    }
    if (fileSize && fileSize > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File must be under ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const key = r2ObjectKey(fileName);

    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket:      R2_BUCKET,
        Key:         key,
        ContentType: fileType,
      }),
      { expiresIn: 300 } // 5 minutes
    );

    return NextResponse.json({ uploadUrl, key, fileName });
  } catch (error) {
    console.error('Upload presign error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
