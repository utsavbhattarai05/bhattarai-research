import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import User from '@/models/User';
import Download from '@/models/Download';
import Message from '@/models/Message';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const [publications, users, downloads, unreadMessages] = await Promise.all([
      Publication.countDocuments({ published: true }),
      User.countDocuments(),
      Download.countDocuments(),
      Message.countDocuments({ read: false }),
    ]);

    return NextResponse.json({ publications, users, downloads, unreadMessages });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
