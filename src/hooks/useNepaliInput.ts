'use client';

import { useState, useCallback } from 'react';
import { detectFont } from '@/utils/nepaliConverter';

type FontMode = 'auto' | 'preeti' | 'kantipur' | 'unicode';

export function useNepaliInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [notice, setNotice] = useState('');
  const [fontMode, setFontMode] = useState<FontMode>('auto');

  const convert = useCallback(async (text: string, mode: FontMode): Promise<string> => {
    const font = mode === 'auto' ? detectFont(text) : mode;
    if (font === 'unicode' || font === 'english') return text;

    try {
      const res = await fetch('/api/convert-nepali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, font }),
      });
      const data = await res.json();
      return data.converted ?? text;
    } catch {
      return text;
    }
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const font = fontMode === 'auto' ? detectFont(text) : fontMode;
    if (font === 'unicode' || font === 'english') return; // let browser handle

    e.preventDefault();
    const converted = await convert(text, fontMode);

    setValue((prev) => {
      const el = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = el.selectionStart ?? prev.length;
      const end = el.selectionEnd ?? prev.length;
      return prev.slice(0, start) + converted + prev.slice(end);
    });

    const wasConverted = converted !== text;
    if (wasConverted) {
      setNotice(`✓ Converted from ${font === 'preeti' ? 'Preeti' : 'Kantipur'} to Unicode`);
      setTimeout(() => setNotice(''), 3000);
    }
  }, [fontMode, convert]);

  return {
    value,
    setValue,
    notice,
    fontMode,
    setFontMode,
    inputProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
      onPaste: handlePaste,
    },
  };
}
