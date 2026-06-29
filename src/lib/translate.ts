// Server-side auto-translation via MyMemory free API
// Called when saving publications — translates missing language field
// Result stored in MongoDB so visitors never hit the API

function hasDevanagari(text: string): boolean {
  return /[ऀ-ॿ]/.test(text);
}

const CHUNK_LIMIT = 400; // MyMemory free API caps at 500 chars — stay safely under

// Split text into chunks at sentence boundaries, keeping each under CHUNK_LIMIT
function splitChunks(text: string, separator: RegExp): string[] {
  const sentences = text.split(separator).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    const candidate = current ? current + ' ' + s : s;
    if (candidate.length > CHUNK_LIMIT && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, CHUNK_LIMIT)];
}

async function translateOne(text: string, from: string, to: string): Promise<string | null> {
  if (!text?.trim()) return null;

  // Split long text into sentence chunks so we stay under the API limit
  const separator = from === 'ne' ? /(?<=[।!?])\s+/ : /(?<=[.!?])\s+/;
  const chunks = text.length > CHUNK_LIMIT ? splitChunks(text, separator) : [text];

  try {
    const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${from}|${to}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      const translated: string = data?.responseData?.translatedText ?? '';

      if (!translated || translated === chunk) return chunk; // fallback to original chunk
      if (data?.responseStatus !== 200) return chunk;

      // Validate script direction
      if (from === 'ne' && to === 'en' && hasDevanagari(translated)) return chunk;
      if (from === 'en' && to === 'ne' && !hasDevanagari(translated)) return chunk;

      return translated;
    }));

    const result = translatedChunks.join(' ').trim();

    // If result is identical to input (all chunks fell back), return null
    if (result === text.trim()) return null;
    if (from === 'ne' && to === 'en' && hasDevanagari(result)) return null;
    if (from === 'en' && to === 'ne' && !hasDevanagari(result)) return null;

    return result;
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
