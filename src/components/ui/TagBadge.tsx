'use client';

interface TagBadgeProps {
  label: string;
  variant?: 'default' | 'gold' | 'outline';
}

export default function TagBadge({ label, variant = 'default' }: TagBadgeProps) {
  const styles = {
    default: 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    gold:    'bg-gold-100 dark:bg-gold-900 text-gold-600 dark:text-gold-300 border border-gold-200 dark:border-gold-800',
    outline: 'bg-transparent text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600',
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded ${styles[variant]}`}>
      {label}
    </span>
  );
}
