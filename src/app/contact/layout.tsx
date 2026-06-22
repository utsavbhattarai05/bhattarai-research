import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title:       "Contact",
  description: "Get in touch with Professor Dhruba Prasad Bhattarai for research inquiries, collaboration opportunities, or general questions.",
  openGraph: {
    title:       "Contact Prof. Dhruba Prasad Bhattarai",
    description: "Reach out for research inquiries or collaboration.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
