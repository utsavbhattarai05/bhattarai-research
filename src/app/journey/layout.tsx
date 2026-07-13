import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

export const metadata: Metadata = {
  title:       "Journey",
  description: "Explore the life and academic journey of Professor Dhruba Prasad Bhattarai — from Nepal to decades of research, scholarship, and impact.",
  keywords:    ['Dhruba Bhattarai life story', 'Nepali scholar biography', 'folk literature scholar Nepal', 'academic journey Nepal', 'भट्टराई जीवन यात्रा'],
  openGraph: {
    title:       "The Journey of Prof. Dhruba Prasad Bhattarai",
    description: "A life story of curiosity, dedication, and academic achievement.",
  },
  alternates: {
    canonical: `${BASE_URL}/journey`,
    languages: { 'en': `${BASE_URL}/journey`, 'ne': `${BASE_URL}/journey` },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
