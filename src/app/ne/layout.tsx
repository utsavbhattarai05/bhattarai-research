import type { ReactNode } from 'react';

// Passthrough layout — html lang="ne" is set by the root layout via middleware x-pathname header
export default function NepaliLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
