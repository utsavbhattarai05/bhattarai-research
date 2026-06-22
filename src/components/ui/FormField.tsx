'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FormField({ label, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
