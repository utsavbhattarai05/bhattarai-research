import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Download from '@/models/Download';
import Publication from '@/models/Publication';
import User from '@/models/User';
import Message from '@/models/Message';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Date range — last 12 months
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalDownloads,
      totalUsers,
      totalPublications,
      totalMessages,
      monthlyDownloads,
      topPublications,
      downloadsByType,
    ] = await Promise.all([

      // Totals
      Download.countDocuments(),
      User.countDocuments(),
      Publication.countDocuments({ published: true }),
      Message.countDocuments(),

      // Downloads per month (last 12 months)
      Download.aggregate([
        { $match: { downloadedAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: {
              year:  { $year:  '$downloadedAt' },
              month: { $month: '$downloadedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Top 5 most downloaded publications
      Download.aggregate([
        {
          $group: {
            _id: '$publication',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'publications',
            localField: '_id',
            foreignField: '_id',
            as: 'pub',
          },
        },
        { $unwind: '$pub' },
        {
          $project: {
            count: 1,
            title: '$pub.title.en',
            type: '$pub.type',
            year: '$pub.year',
          },
        },
      ]),

      // Downloads by publication type
      Download.aggregate([
        {
          $lookup: {
            from: 'publications',
            localField: 'publication',
            foreignField: '_id',
            as: 'pub',
          },
        },
        { $unwind: '$pub' },
        { $group: { _id: '$pub.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Fill in months with 0 for missing months
    const monthMap: Record<string, number> = {};
    monthlyDownloads.forEach(({ _id, count }: any) => {
      monthMap[`${_id.year}-${String(_id.month).padStart(2, '0')}`] = count;
    });

    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: monthMap[key] ?? 0,
      };
    });

    return NextResponse.json({
      totals: { totalDownloads, totalUsers, totalPublications, totalMessages },
      months,
      topPublications,
      downloadsByType,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
