'use client';

import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{title}</h3>
        {description && (
          <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
