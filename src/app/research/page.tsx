import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';
import ResearchClient from './ResearchClient';
import type { Publication as PubType } from '@/components/ui/PublicationCard';

type Cat = 'journal' | 'conference' | 'book_chapter';

export const revalidate = 3600;

export default async function ResearchPage() {
  await dbConnect();

  const raw = await Publication.find({ published: true })
    .select('title abstract authors year type journal tags slug fileUrl fileName downloadCount featured published')
    .sort({ year: -1, createdAt: -1 })
    .lean();

  // Serialize MongoDB docs → plain objects safe to pass to Client Components
  const all = raw.map((p: any) => ({
    _id:           p._id.toString(),
    title:         p.title   ?? {},
    abstract:      p.abstract ?? {},
    authors:       p.authors  ?? [],
    year:          p.year,
    type:          p.type,
    journal:       p.journal  ?? '',
    tags:          p.tags     ?? [],
    slug:          p.slug,
    fileUrl:       p.fileUrl  ?? '',
    fileName:      p.fileName ?? '',
    downloadCount: p.downloadCount ?? 0,
    featured:      p.featured ?? false,
    published:     p.published ?? true,
  })) as PubType[];

  const byType: Record<Cat, PubType[]> = {
    journal:      all.filter(p => p.type === 'journal'),
    conference:   all.filter(p => p.type === 'conference'),
    book_chapter: all.filter(p => p.type === 'book_chapter'),
  };

  return <ResearchClient initialPubs={byType} />;
}
