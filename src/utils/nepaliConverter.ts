// Detects whether text is Preeti/Kantipur (legacy ASCII) or Unicode Nepali
export type NepaliFont = 'preeti' | 'kantipur' | 'unicode' | 'english';

export function detectFont(text: string): NepaliFont {
  if (!text || !text.trim()) return 'english';
  // Unicode Devanagari range U+0900–U+097F
  if (/[ऀ-ॿ]/.test(text)) return 'unicode';
  // Heuristic: Preeti/Kantipur text is mostly ASCII with common Preeti patterns
  // Preeti uses chars like f, k, g, ; heavily in patterns that don't appear in English
  const preetiPattern = /[;'\[\]{}\\|<>\/kfguldnmpeqrtsio]{4,}/i;
  if (preetiPattern.test(text)) return 'preeti';
  return 'english';
}

export function isLegacyFont(text: string): boolean {
  return detectFont(text) === 'preeti' || detectFont(text) === 'kantipur';
}
