import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Publication from '@/models/Publication';

export const revalidate = 3600; // regenerate sitemap every hour

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                     lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/research`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/journey`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`,        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
  ];

  try {
    await dbConnect();
    const pubs = await Publication.find({ published: true })
      .select('slug updatedAt')
      .lean();

    const pubPages: MetadataRoute.Sitemap = pubs.flatMap((p: any) => [
      {
        url:             `${BASE_URL}/research/${p.slug}`,
        lastModified:    p.updatedAt ?? new Date(),
        changeFrequency: 'monthly' as const,
        priority:        0.8,
      },
      {
        url:             `${BASE_URL}/ne/research/${p.slug}`,
        lastModified:    p.updatedAt ?? new Date(),
        changeFrequency: 'monthly' as const,
        priority:        0.8,
      },
    ]);

    return [...staticPages, ...pubPages];
  } catch {
    return staticPages;
  }
}
