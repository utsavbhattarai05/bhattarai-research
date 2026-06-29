import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';

// GET - Public profile data
export async function GET() {
  try {
    await dbConnect();
    const profile = await Profile.findOne().lean();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update profile (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const incoming = await req.json();

    // Merge: keep existing non-empty values when incoming field is blank
    function mergeField(incoming: any, existing: any): any {
      if (incoming === null || incoming === undefined) return existing;
      if (typeof incoming === 'string') return incoming.trim() || existing || '';
      if (Array.isArray(incoming)) return incoming.length > 0 ? incoming : (existing ?? []);
      if (typeof incoming === 'object') {
        const result: any = { ...(existing ?? {}) };
        for (const key of Object.keys(incoming)) {
          result[key] = mergeField(incoming[key], existing?.[key]);
        }
        return result;
      }
      return incoming ?? existing;
    }

    let profile = await Profile.findOne();
    if (profile) {
      const merged = mergeField(incoming, profile.toObject());
      delete merged._id;
      delete merged.__v;
      profile = await Profile.findByIdAndUpdate(profile._id, merged, {
        new: true,
        runValidators: false,
      });
    } else {
      profile = await Profile.create(incoming);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
