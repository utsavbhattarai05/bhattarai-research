import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
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
    'Nepal research',
    'academic publications',
    'professor Nepal',
    'sustainable development',
    'economic policy',
    'social impact Nepal',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3580545311067892"
          crossOrigin="anonymous"
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
