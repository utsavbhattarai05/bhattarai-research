import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title:       "About",
  description: "Learn about Professor Dhruba Prasad Bhattarai — researcher, scholar, and academic based in Kathmandu, Nepal with over 15 years of experience in applied research.",
  openGraph: {
    title:       "About Prof. Dhruba Prasad Bhattarai",
    description: "Researcher, scholar, and academic based in Kathmandu, Nepal.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
