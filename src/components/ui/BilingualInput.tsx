'use client';

import { useState } from 'react';
import TextInput from './TextInput';
import TextareaInput from './TextareaInput';

type Tab = 'en' | 'ne';

interface BilingualInputProps {
  valueEn: string;
  valueNe: string;
  onChangeEn: (v: string) => void;
  onChangeNe: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
}

export default function BilingualInput({
  valueEn, valueNe, onChangeEn, onChangeNe,
  placeholder, multiline = false, rows = 4, error,
}: BilingualInputProps) {
  const [tab, setTab] = useState<Tab>('en');

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(['en', 'ne'] as Tab[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setTab(lang)}
            className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
              tab === lang
                ? 'bg-maroon-700 dark:bg-maroon-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {lang === 'en' ? 'English' : 'नेपाली'}
          </button>
        ))}
      </div>

      {multiline ? (
        <TextareaInput
          value={tab === 'en' ? valueEn : valueNe}
          onChange={(e) => tab === 'en' ? onChangeEn(e.target.value) : onChangeNe(e.target.value)}
          placeholder={tab === 'en' ? placeholder : `${placeholder ?? ''} (नेपाली)`}
          rows={rows}
          error={error}
          lang={tab === 'ne' ? 'ne' : 'en'}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      ) : (
        <TextInput
          value={tab === 'en' ? valueEn : valueNe}
          onChange={(e) => tab === 'en' ? onChangeEn(e.target.value) : onChangeNe(e.target.value)}
          placeholder={tab === 'en' ? placeholder : `${placeholder ?? ''} (नेपाली)`}
          error={error}
          lang={tab === 'ne' ? 'ne' : 'en'}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      )}
    </div>
  );
}
