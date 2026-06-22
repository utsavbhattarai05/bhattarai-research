'use client';

import { TextareaHTMLAttributes } from 'react';

interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export default function TextareaInput({ error, className = '', ...props }: TextareaInputProps) {
  return (
    <div>
      <textarea
        {...props}
        style={{ color: 'var(--text-primary)' }}
        className={`w-full px-3 py-2.5 text-sm bg-[var(--surface)] border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-maroon-700/20 dark:focus:ring-maroon-400/20
          placeholder-gray-400 resize-none
          ${error
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-700'}
          ${className}`}
      />
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
