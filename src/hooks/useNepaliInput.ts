'use client';

import { useState, useCallback, useRef } from 'react';
import { detectFont } from '@/utils/nepaliConverter';

type FontMode = 'auto' | 'preeti' | 'kantipur' | 'unicode';

export function useNepaliInput(
  value: string,
  onChange: (v: string) => void,
) {
  const [notice, setNotice]     = useState('');
  const [fontMode, setFontMode] = useState<FontMode>('auto');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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

    // Insert at cursor position
    const el = e.target as HTMLInputElement | HTMLTextAreaElement;
    const start = el.selectionStart ?? value.length;
    const end   = el.selectionEnd   ?? value.length;
    const newVal = value.slice(0, start) + converted + value.slice(end);

    // Call parent onChange so the controlled value updates
    onChangeRef.current(newVal);

    if (converted !== text) {
      setNotice(`✓ Converted from ${font === 'preeti' ? 'Preeti' : 'Kantipur'} to Unicode`);
      setTimeout(() => setNotice(''), 3000);
    }
  }, [fontMode, convert, value]);

  return {
    notice,
    fontMode,
    setFontMode,
    inputProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChangeRef.current(e.target.value),
      onPaste: handlePaste,
      lang: 'ne' as const,
      spellCheck: false as const,
      autoCorrect: 'off' as const,
      autoCapitalize: 'off' as const,
    },
  };
}
