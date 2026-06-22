import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { deleteR2Object } from '@/lib/r2';

// GET - Fetch single publication by ID or slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Try finding by slug first, then by ID
    let publication = await Publication.findOne({ slug: id }).lean();
    if (!publication) {
      publication = await Publication.findById(id).lean();
    }

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    // Find related publications by matching tags
    const related = await Publication.find({
      _id: { $ne: (publication as any)._id },
      tags: { $in: (publication as any).tags },
      published: true,
    })
      .limit(3)
      .sort({ year: -1 })
      .lean();

    return NextResponse.json({ publication, related });
  } catch (error) {
    console.error('Error fetching publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update publication (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    // Prevent changing the ID
    delete data._id;

    const publication = await Publication.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    return NextResponse.json({ publication });
  } catch (error) {
    console.error('Error updating publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove publication (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const publication = await Publication.findByIdAndDelete(id);
    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    // Delete file from R2 if it was uploaded there (key starts with 'publications/')
    if (publication.fileUrl?.startsWith('publications/')) {
      try {
        await deleteR2Object(publication.fileUrl);
      } catch (e) {
        // Log but don't fail the request — DB record is already deleted
        console.error('R2 delete failed:', e);
      }
    }

    return NextResponse.json({ message: 'Publication deleted' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
