import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastContainer from "@/components/ui/Toast";

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:  'Prof. Dr. Dhruba Prasad Bhattarai | Research & Publications',
    template: '%s | Prof. Dr. Dhruba Prasad Bhattarai',
  },
  description:
    'Explore the research, publications, and academic journey of Prof. Dr. Dhruba Prasad Bhattarai — Nepali researcher and scholar specialising in folk literature, oral traditions, and cultural studies.',
  keywords: [
    'Dhruba Prasad Bhattarai',
    'Prof. Dr. Dhruba Prasad Bhattarai',
    'ध्रुव प्रसाद भट्टराई',
    'Nepal research',
    'folk literature Nepal',
    'लोक साहित्य',
    'Nepali folk poetry',
    'academic publications Nepal',
    'professor Nepal',
    'Nepali researcher',
    'lok sahitya',
    'Nepal folklore',
    'Nepali academic',
  ],
  authors: [{ name: 'Prof. Dr. Dhruba Prasad Bhattarai' }],
  creator: 'Prof. Dr. Dhruba Prasad Bhattarai',
  openGraph: {
    type:        'website',
    locale:      'en_US',
    siteName:    'Prof. Dr. Dhruba Prasad Bhattarai',
    title:       'Prof. Dr. Dhruba Prasad Bhattarai | Research & Publications',
    description: 'Research, publications, and academic journey of Prof. Dr. Dhruba Prasad Bhattarai from Nepal.',
    url:         BASE_URL,
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Prof. Dr. Dhruba Prasad Bhattarai' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Prof. Dr. Dhruba Prasad Bhattarai | Research & Publications',
    description: 'Research, publications, and academic journey of Prof. Dr. Dhruba Prasad Bhattarai from Nepal.',
    images:      [`${BASE_URL}/opengraph-image`],
  },
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: { 'en': BASE_URL, 'ne': BASE_URL },
  },
  verification: {
    google: 'wk9vBBC4jqSc_Y4HZDsu9nV-kQhaYH8cNU2IPj7ol4M',
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Prof. Dr. Dhruba Prasad Bhattarai',
  alternateName: ['Dhruba Prasad Bhattarai', 'ध्रुव प्रसाद भट्टराई'],
  url: BASE_URL,
  jobTitle: 'Professor & Researcher',
  description: 'Nepali professor and researcher specialising in folk literature, oral traditions, and cultural studies.',
  knowsAbout: ['Folk Literature', 'Nepali Oral Traditions', 'Lok Sahitya', 'Cultural Studies', 'Nepal Folklore'],
  nationality: { '@type': 'Country', name: 'Nepal' },
  sameAs: [BASE_URL],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Prof. Dr. Dhruba Prasad Bhattarai',
  url: BASE_URL,
  description: 'Official research portal of Prof. Dr. Dhruba Prasad Bhattarai — folk literature and cultural studies.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/research?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const lang = pathname.startsWith('/ne') ? 'ne' : 'en';

  return (
    <html lang={lang} suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3580545311067892"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
