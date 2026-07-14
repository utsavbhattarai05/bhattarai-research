import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${BASE_URL}/api/publications/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('not found');
    const { publication: p } = await res.json();

    const titleNe   = p?.title?.ne ?? p?.title?.en ?? 'प्रकाशन';
    const fullTitle = `${titleNe} | ध्रुव प्रसाद भट्टराई`;
    const desc      = p?.abstract?.ne
      ? p.abstract.ne.slice(0, 160).trimEnd() + (p.abstract.ne.length > 160 ? '…' : '')
      : p?.abstract?.en?.slice(0, 160).trimEnd() ?? 'यो अनुसन्धान प्रकाशन पढ्नुस् र डाउनलोड गर्नुस्।';
    const url  = `${BASE_URL}/ne/research/${slug}`;
    const enUrl = `${BASE_URL}/research/${slug}`;

    return {
      title:       { absolute: fullTitle },
      description: desc,
      openGraph: {
        type:          'article',
        title:         fullTitle,
        description:   desc,
        url,
        locale:        'ne_NP',
        publishedTime: p?.year ? `${p.year}-01-01` : undefined,
        authors:       p?.authors ?? [],
        tags:          p?.tags ?? [],
        images:        [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: titleNe }],
      },
      twitter: {
        card:        'summary_large_image',
        title:       fullTitle,
        description: desc,
        images:      [`${BASE_URL}/opengraph-image`],
      },
      alternates: {
        canonical: url,
        languages: { 'ne': url, 'en': enUrl },
      },
    };
  } catch {
    return {
      title: { absolute: 'प्रकाशन | ध्रुव प्रसाद भट्टराई' },
      description: 'यो अनुसन्धान प्रकाशन पढ्नुस् र डाउनलोड गर्नुस्।',
    };
  }
}

export default async function NepaliSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const BASE = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';
  let jsonLd: object | null = null;

  try {
    const res = await fetch(`${BASE}/api/publications/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const { publication: p } = await res.json();
      jsonLd = {
        '@context':    'https://schema.org',
        '@type':       'ScholarlyArticle',
        headline:      p?.title?.ne ?? p?.title?.en ?? '',
        name:          p?.title?.ne ?? p?.title?.en ?? '',
        abstract:      p?.abstract?.ne ?? p?.abstract?.en ?? '',
        inLanguage:    'ne',
        author: (p?.authors ?? []).map((a: string) => ({ '@type': 'Person', name: a })),
        datePublished: p?.year ? `${p.year}-01-01` : undefined,
        publisher:     { '@type': 'Person', name: 'Dhruba Prasad Bhattarai', url: BASE },
        isPartOf:      p?.journal ? { '@type': 'Periodical', name: p.journal } : undefined,
        keywords:      (p?.tags ?? []).join(', '),
        url:           `${BASE}/ne/research/${slug}`,
      };
    }
  } catch { /* silent */ }

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
