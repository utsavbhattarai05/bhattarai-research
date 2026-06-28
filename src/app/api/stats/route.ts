import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import User from '@/models/User';
import Download from '@/models/Download';

export async function GET() {
  try {
    await dbConnect();
    const [publications, users, downloads] = await Promise.all([
      Publication.countDocuments({ published: true }),
      User.countDocuments(),
      Download.countDocuments(),
    ]);
    return NextResponse.json({ publications, users, downloads });
  } catch {
    return NextResponse.json({ publications: 0, users: 0, downloads: 0 });
  }
}
