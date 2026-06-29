'use client';

import { useState } from 'react';
import { useNepaliInput } from '@/hooks/useNepaliInput';
import TextInput from './TextInput';
import TextareaInput from './TextareaInput';

type Tab = 'en' | 'ne';
type FontMode = 'auto' | 'preeti' | 'kantipur' | 'unicode';

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

const FONT_MODES: { key: FontMode; label: string }[] = [
  { key: 'auto',     label: 'Auto' },
  { key: 'preeti',   label: 'Preeti' },
  { key: 'kantipur', label: 'Kantipur' },
  { key: 'unicode',  label: 'Unicode' },
];

export default function BilingualInput({
  valueEn, valueNe, onChangeEn, onChangeNe,
  placeholder, multiline = false, rows = 4, error,
}: BilingualInputProps) {
  const [tab, setTab] = useState<Tab>('en');

  // Hook receives the controlled value + setter — no internal state needed
  const { notice, fontMode, setFontMode, inputProps: neProps } =
    useNepaliInput(valueNe, onChangeNe);

  return (
    <div>
      {/* Language tabs + font picker */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
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

        {tab === 'ne' && (
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-400 mr-1">Font:</span>
            {FONT_MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setFontMode(m.key)}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  fontMode === m.key
                    ? 'bg-gold-100 dark:bg-gold-900 text-gold-700 dark:text-gold-300 font-medium'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversion success notice */}
      {notice && tab === 'ne' && (
        <p className="text-[11px] text-green-600 dark:text-green-400 mb-1.5">
          {notice}
        </p>
      )}

      {/* Input / Textarea */}
      {multiline ? (
        tab === 'en' ? (
          <TextareaInput
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            error={error}
            disableNepaliPaste
          />
        ) : (
          <TextareaInput
            {...neProps}
            placeholder={`${placeholder ?? ''} (नेपाली)`}
            rows={rows}
            error={error}
          />
        )
      ) : (
        tab === 'en' ? (
          <TextInput
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder={placeholder}
            error={error}
            disableNepaliPaste
          />
        ) : (
          <TextInput
            {...neProps}
            placeholder={`${placeholder ?? ''} (नेपाली)`}
            error={error}
          />
        )
      )}

      {tab === 'ne' && (
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">
          Paste Preeti or Unicode — auto-converts to Unicode
        </p>
      )}
    </div>
  );
}
