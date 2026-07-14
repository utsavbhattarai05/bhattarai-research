'use client';

import { useState, useEffect, useRef } from 'react';

type Lang = 'en' | 'ne';
const CACHE_KEY = 'auto_translations_v1';
const LANG_CODE: Record<Lang, string> = { en: 'en', ne: 'ne' };

function loadCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}'); } catch { return {}; }
}
function saveCache(cache: Record<string, string>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

async function translateText(text: string, source: Lang, target: Lang): Promise<string | null> {
  const cache = loadCache();
  const key = `${source}:${target}:${text}`;
  if (cache[key]) return cache[key];

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text], source: LANG_CODE[source], target: LANG_CODE[target] }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const translated = data.translations?.[0];
    if (translated) {
      const updated = { ...loadCache(), [key]: translated };
      saveCache(updated);
      return translated;
    }
  } catch {}
  return null;
}

// Hook: given a bilingual field, returns the best text for the current language.
// If the target language is missing, auto-translates and caches the result.
export function useAutoTranslate(
  field: { en?: string; ne?: string } | undefined,
  language: Lang,
): { text: string; translating: boolean } {
  const target = language;
  const source: Lang = target === 'ne' ? 'en' : 'ne';

  const targetText = target === 'ne' ? field?.ne : field?.en;
  const sourceText = source === 'ne' ? field?.ne : field?.en;

  const [translated, setTranslated] = useState<string>('');
  const [translating, setTranslating] = useState(false);
  const pendingRef = useRef(false);

  // If target already has text, use it directly
  const hasTarget = !!targetText?.trim();
  const hasSource = !!sourceText?.trim();

  useEffect(() => {
    if (hasTarget || !hasSource || pendingRef.current) return;
    const src = sourceText!;

    // Check cache first
    const cache = loadCache();
    const cacheKey = `${source}:${target}:${src}`;
    if (cache[cacheKey]) { setTranslated(cache[cacheKey]); return; }

    pendingRef.current = true;
    setTranslating(true);
    translateText(src, source, target).then((result) => {
      if (result) setTranslated(result);
      setTranslating(false);
      pendingRef.current = false;
    });
  }, [field, target, source, hasTarget, hasSource, sourceText]);

  const text = hasTarget
    ? targetText!
    : translated || sourceText || '';

  return { text, translating };
}
