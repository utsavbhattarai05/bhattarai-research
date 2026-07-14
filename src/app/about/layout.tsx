import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

export const metadata: Metadata = {
  title:       "About",
  description: "Learn about Professor Dhruba Prasad Bhattarai — Nepali researcher and scholar of folk literature, oral traditions, and cultural studies based in Kathmandu, Nepal.",
  keywords:    ['Dhruba Prasad Bhattarai biography', 'Nepali folk literature researcher', 'Nepal cultural studies', 'लोक साहित्य अनुसन्धानकर्ता'],
  openGraph: {
    title:       "About Prof. Dhruba Prasad Bhattarai",
    description: "Nepali researcher and scholar of folk literature and oral traditions, based in Kathmandu.",
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
    languages: { 'en': `${BASE_URL}/about`, 'ne': `${BASE_URL}/about` },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
