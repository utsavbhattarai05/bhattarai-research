import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { fillBilingual } from '@/lib/translate';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();
  const pubs = await Publication.find({
    $or: [
      { 'title.en': { $in: ['', null, undefined] } },
      { 'title.ne': { $in: ['', null, undefined] } },
      { 'abstract.en': { $in: ['', null, undefined] } },
      { 'abstract.ne': { $in: ['', null, undefined] } },
    ]
  });

  let updated = 0;
  for (const pub of pubs) {
    const [title, abstract] = await Promise.all([
      fillBilingual(pub.title ?? {}),
      fillBilingual(pub.abstract ?? {}),
    ]);
    await Publication.findByIdAndUpdate(pub._id, { title, abstract });
    updated++;
  }

  return NextResponse.json({ message: `Translated ${updated} publications`, updated });
}
