import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Milestone from '@/models/Milestone';

// GET - List all milestones sorted by order
export async function GET() {
  try {
    await dbConnect();
    const milestones = await Milestone.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create milestone (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();

    if (!data.year || !data.title?.en || !data.description?.en || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const milestone = await Milestone.create(data);
    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update milestone (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const data = await req.json();
    const { id, ...updateData } = data;

    const milestone = await Milestone.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove milestone (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const milestone = await Milestone.findByIdAndDelete(id);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Milestone deleted' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
