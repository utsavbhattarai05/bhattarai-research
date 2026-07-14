import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

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
        images:        [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: fullTitle }],
      },
      twitter: {
        card:        'summary_large_image',
        title:       fullTitle,
        description,
        images:      [`${BASE_URL}/opengraph-image`],
      },
      alternates: {
        canonical: url,
        languages: { 'en': url, 'ne': `${BASE_URL}/ne/research/${slug}` },
      },
    };
  } catch {
    return {
      title:       { absolute: 'Publication | Dr. Dhruba Prasad Bhattarai' },
      description: 'Read and download this research publication.',
    };
  }
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let jsonLd: object | null = null;

  try {
    const res = await fetch(`${BASE_URL}/api/publications/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const { publication: p } = await res.json();
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ScholarlyArticle',
        headline: p?.title?.en ?? '',
        name:     p?.title?.en ?? '',
        abstract: p?.abstract?.en ?? '',
        author: (p?.authors ?? []).map((a: string) => ({ '@type': 'Person', name: a })),
        datePublished: p?.year ? `${p.year}-01-01` : undefined,
        publisher: {
          '@type': 'Person',
          name:    'Dhruba Prasad Bhattarai',
          url:     BASE_URL,
        },
        isPartOf:  p?.journal ? { '@type': 'Periodical', name: p.journal } : undefined,
        keywords:  (p?.tags ?? []).join(', '),
        url:       `${BASE_URL}/research/${slug}`,
        inLanguage: ['en', 'ne'],
      };
    }
  } catch { /* silently skip JSON-LD if fetch fails */ }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
