'use client';

import { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export default function TextInput({ error, className = '', ...props }: TextInputProps) {
  return (
    <div>
      <input
        {...props}
        style={{ color: 'var(--text-primary)' }}
        className={`w-full px-3 py-2.5 text-sm bg-[var(--surface)] border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-maroon-700/20 dark:focus:ring-maroon-400/20
          placeholder-gray-400
          ${error
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-700'}
          ${className}`}
      />
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
