import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Download from '@/models/Download';
import { r2, R2_BUCKET, R2_PUBLIC_BASE } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to download' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    // Find publication - don't expose internal file paths
    const publication = await Publication.findById(id);
    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    if (!publication.published) {
      return NextResponse.json({ error: 'Publication not available' }, { status: 403 });
    }

    // Track the download
    await Download.create({
      user: (session.user as any).id,
      publication: publication._id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    });

    // Increment download count
    await Publication.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    // Generate a presigned download URL (expires in 5 minutes)
    // fileUrl stores either the R2 object key (publications/xxx.pdf)
    // or a legacy full URL — handle both.
    let downloadUrl: string;
    const fileUrl: string = publication.fileUrl;

    const isR2Key = fileUrl.startsWith('publications/');

    if (isR2Key) {
      if (R2_PUBLIC_BASE) {
        // Public bucket — serve directly, no presigning needed
        downloadUrl = `${R2_PUBLIC_BASE}/${fileUrl}`;
      } else {
        // Private bucket — presigned URL
        downloadUrl = await getSignedUrl(
          r2,
          new GetObjectCommand({
            Bucket:                     R2_BUCKET,
            Key:                        fileUrl,
            ResponseContentDisposition: `attachment; filename="${publication.fileName}"`,
          }),
          { expiresIn: 300 }
        );
      }
    } else {
      // Legacy / external URL — pass through as-is
      downloadUrl = fileUrl;
    }

    return NextResponse.json({
      downloadUrl,
      fileName: publication.fileName,
      message:  'Download authorized',
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
