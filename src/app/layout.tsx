import type { Metadata } from "next";
import { Inter } from 'next/font/google';
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
    default:  'Dr. Dhruba Prasad Bhattarai | Research & Publications',
    template: '%s | Dr. Dhruba Prasad Bhattarai',
  },
  description:
    'Explore the research, publications, and academic journey of Professor Dhruba Prasad Bhattarai — researcher and scholar from Nepal specialising in sustainable development, economic policy, and social impact.',
  keywords: [
    'Dhruba Prasad Bhattarai',
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
  authors: [{ name: 'Prof. Dhruba Prasad Bhattarai' }],
  creator: 'Prof. Dhruba Prasad Bhattarai',
  openGraph: {
    type:        'website',
    locale:      'en_US',
    siteName:    'Dr. Dhruba Prasad Bhattarai',
    title:       'Dr. Dhruba Prasad Bhattarai | Research & Publications',
    description: 'Research, publications, and academic journey of Professor Dhruba Prasad Bhattarai from Nepal.',
    url:         BASE_URL,
  },
  twitter: {
    card:        'summary',
    title:       'Dr. Dhruba Prasad Bhattarai | Research & Publications',
    description: 'Research, publications, and academic journey of Professor Dhruba Prasad Bhattarai from Nepal.',
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
  },
  verification: {
    google: 'wk9vBBC4jqSc_Y4HZDsu9nV-kQhaYH8cNU2IPj7ol4M',
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dhruba Prasad Bhattarai',
  alternateName: 'ध्रुव प्रसाद भट्टराई',
  url: BASE_URL,
  jobTitle: 'Researcher & Scholar',
  description: 'Nepali researcher specialising in folk literature, oral traditions, and cultural studies.',
  knowsAbout: ['Folk Literature', 'Nepali Oral Traditions', 'Lok Sahitya', 'Cultural Studies', 'Nepal Folklore'],
  nationality: { '@type': 'Country', name: 'Nepal' },
  sameAs: [
    'https://scholar.google.com',
    BASE_URL,
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dr. Dhruba Prasad Bhattarai',
  url: BASE_URL,
  description: 'Official research portal of Prof. Dhruba Prasad Bhattarai — folk literature and cultural studies.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/research?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
