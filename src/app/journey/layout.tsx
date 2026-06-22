import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title:       "Journey",
  description: "Explore the life and academic journey of Professor Dhruba Prasad Bhattarai — from Nepal to decades of research, scholarship, and impact.",
  openGraph: {
    title:       "The Journey of Prof. Dhruba Prasad Bhattarai",
    description: "A life story of curiosity, dedication, and academic achievement.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
