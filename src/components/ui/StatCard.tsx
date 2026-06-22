'use client';

import { ElementType } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ElementType;
  iconColor?: string;
}

export default function StatCard({ label, value, icon: Icon, iconColor }: StatCardProps) {
  return (
    <div className="bg-[var(--surface)] rounded-lg p-4">
      {Icon && (
        <div className="flex items-center gap-2 mb-2">
          <Icon className={iconColor ?? 'text-maroon-700 dark:text-maroon-400'} size={16} />
          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        </div>
      )}
      <div className="text-2xl font-semibold text-maroon-700 dark:text-maroon-400">
        {value}
      </div>
      {!Icon && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{label}</div>
      )}
    </div>
  );
}
