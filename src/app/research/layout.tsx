import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

export const metadata: Metadata = {
  title:       'Research & Publications',
  description: 'Browse and download peer-reviewed research papers by Professor Dhruba Prasad Bhattarai — folk literature, oral traditions, and Nepali cultural studies.',
  keywords:    ['Nepali folk literature research', 'lok sahitya publications', 'Nepal oral traditions', 'Dhruba Bhattarai publications', 'लोक साहित्य अनुसन्धान'],
  openGraph: {
    title:       'Research & Publications — Prof. Dhruba Prasad Bhattarai',
    description: 'Peer-reviewed papers on Nepali folk literature, oral traditions, and cultural studies.',
  },
  alternates: {
    canonical: `${BASE_URL}/research`,
    languages: { 'en': `${BASE_URL}/research`, 'ne': `${BASE_URL}/research` },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
