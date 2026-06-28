// Server-side auto-translation via MyMemory free API
// Called when saving publications — translates missing language field
// Result stored in MongoDB so visitors never hit the API

async function translateOne(text: string, from: string, to: string): Promise<string> {
  if (!text?.trim()) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    // MyMemory sometimes returns the original on failure
    if (translated && translated !== text && data?.responseStatus === 200) {
      return translated;
    }
  } catch (e) {
    console.warn('Auto-translate failed:', e);
  }
  return text; // fallback to original
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
    return { en, ne: translated };
  }
  if (!en && ne) {
    const translated = await translateOne(ne, 'ne', 'en');
    return { en: translated, ne };
  }
  return { en: '', ne: '' };
}
