// Server-side auto-translation via MyMemory free API
// Called when saving publications — translates missing language field
// Result stored in MongoDB so visitors never hit the API

function hasDevanagari(text: string): boolean {
  return /[ऀ-ॿ]/.test(text);
}

async function translateOne(text: string, from: string, to: string): Promise<string | null> {
  if (!text?.trim()) return null;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText ?? '';

    if (!translated || translated === text) return null; // no change
    if (data?.responseStatus !== 200) return null; // API error

    // If translating ne→en, result must NOT be Devanagari
    if (from === 'ne' && to === 'en' && hasDevanagari(translated)) return null;

    // If translating en→ne, result MUST contain Devanagari
    if (from === 'en' && to === 'ne' && !hasDevanagari(translated)) return null;

    return translated;
  } catch (e) {
    console.warn('Auto-translate failed:', e);
    return null;
  }
}

// Fill in missing language for a bilingual field
export async function fillBilingual(
  field: { en?: string; ne?: string }
): Promise<{ en: string; ne: string }> {
  const en = field.en?.trim() ?? '';
  const ne = field.ne?.trim() ?? '';

  if (en && ne) return { en, ne }; // both present — no translation needed
  if (en && !ne) {
    const translated = await translateOne(en, 'en', 'ne');
    return { en, ne: translated ?? '' }; // keep empty if translation failed
  }
  if (!en && ne) {
    const translated = await translateOne(ne, 'ne', 'en');
    return { en: translated ?? '', ne }; // keep empty if translation failed
  }
  return { en: '', ne: '' };
}
