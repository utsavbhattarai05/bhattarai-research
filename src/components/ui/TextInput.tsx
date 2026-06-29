'use client';

import { InputHTMLAttributes, useState, useRef } from 'react';
import { handleNepaliPaste } from '@/utils/nepaliPaste';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  disableNepaliPaste?: boolean;
}

export default function TextInput({ error, className = '', onChange, onPaste, disableNepaliPaste = false, ...props }: TextInputProps) {
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showNotice = (msg: string) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2500);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!disableNepaliPaste) {
      await handleNepaliPaste(
        e,
        String(props.value ?? ''),
        (newVal) => {
          if (onChange) {
            const syntheticEvent = { ...e, target: { ...e.target, value: newVal }, currentTarget: { ...e.currentTarget, value: newVal } };
            onChange(syntheticEvent as any);
          }
        },
        showNotice,
      );
    }
    if (onPaste) onPaste(e);
  };

  return (
    <div>
      <input
        {...props}
        onChange={onChange}
        onPaste={handlePaste}
        style={{ color: 'var(--text-primary)' }}
        className={`w-full px-3 py-2.5 text-sm bg-[var(--surface)] border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-maroon-700/20 dark:focus:ring-maroon-400/20
          placeholder-gray-400
          ${error
            ? 'border-red-400 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-700'}
          ${className}`}
      />
      {notice && <p className="mt-1 text-[11px] text-green-600 dark:text-green-400">{notice}</p>}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
