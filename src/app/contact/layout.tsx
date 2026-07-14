import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://dhrubabhattarai.com.np';

export const metadata: Metadata = {
  title:       "Contact",
  description: "Get in touch with Professor Dhruba Prasad Bhattarai for research inquiries, collaboration opportunities, or general questions.",
  keywords:    ['contact Dhruba Bhattarai', 'Nepal researcher contact', 'folk literature collaboration', 'academic inquiry Nepal'],
  openGraph: {
    title:       "Contact Prof. Dhruba Prasad Bhattarai",
    description: "Reach out for research inquiries or collaboration.",
  },
  alternates: {
    canonical: `${BASE_URL}/contact`,
    languages: { 'en': `${BASE_URL}/contact`, 'ne': `${BASE_URL}/contact` },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
