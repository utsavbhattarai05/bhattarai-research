import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/publications/${slug}`, {
      next: { revalidate: 3600 }, // re-fetch at most once per hour
    });

    if (!res.ok) throw new Error('not found');

    const { publication: p } = await res.json();

    const pubTitle    = p?.title?.en ?? 'Publication';
    const fullTitle   = `${pubTitle} | Dr. Dhruba Prasad Bhattarai`;
    const description = p?.abstract?.en
      ? p.abstract.en.slice(0, 160).trimEnd() + (p.abstract.en.length > 160 ? '…' : '')
      : 'Read and download this research publication.';
    const authors     = (p?.authors ?? []).join(', ');
    const url         = `${BASE_URL}/research/${slug}`;

    return {
      title:       { absolute: fullTitle }, // absolute skips template, includes suffix manually
      description,
      authors:     authors ? [{ name: authors }] : undefined,
      openGraph: {
        type:          'article',
        title:         fullTitle,
        description,
        url,
        publishedTime: p?.year ? `${p.year}-01-01` : undefined,
        authors:       p?.authors ?? [],
        tags:          p?.tags ?? [],
      },
      twitter: {
        card:        'summary_large_image',
        title:       fullTitle,
        description,
      },
      alternates: { canonical: url },
    };
  } catch {
    return {
      title:       { absolute: 'Publication | Dr. Dhruba Prasad Bhattarai' },
      description: 'Read and download this research publication.',
    };
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
