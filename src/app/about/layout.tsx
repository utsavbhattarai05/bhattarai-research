import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title:       "About",
  description: "Learn about Professor Dhruba Prasad Bhattarai — Nepali researcher and scholar of folk literature, oral traditions, and cultural studies based in Kathmandu, Nepal.",
  keywords:    ['Dhruba Prasad Bhattarai biography', 'Nepali folk literature researcher', 'Nepal cultural studies', 'लोक साहित्य अनुसन्धानकर्ता'],
  openGraph: {
    title:       "About Prof. Dhruba Prasad Bhattarai",
    description: "Nepali researcher and scholar of folk literature and oral traditions, based in Kathmandu.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
