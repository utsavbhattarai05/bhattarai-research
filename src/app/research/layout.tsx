import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title:       'Research & Publications',
  description: 'Browse, search, and download peer-reviewed research papers and publications by Professor Dhruba Prasad Bhattarai covering sustainable development, economic policy, and social impact.',
  openGraph: {
    title:       'Research & Publications — Prof. Dhruba Prasad Bhattarai',
    description: 'Peer-reviewed papers on sustainable development, economic policy, and social impact.',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
