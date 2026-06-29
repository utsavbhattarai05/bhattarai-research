// Detects whether text is Preeti/Kantipur (legacy ASCII) or Unicode Nepali
export type NepaliFont = 'preeti' | 'kantipur' | 'unicode' | 'english';

export function detectFont(text: string): NepaliFont {
  if (!text || !text.trim()) return 'english';
  // Unicode Devanagari range U+0900–U+097F
  if (/[ऀ-ॿ]/.test(text)) return 'unicode';
  // Preeti uses ; \ | { } [ ] heavily — these rarely appear in plain English prose
  // Only flag as Preeti if the text has a high ratio of these non-English punctuation chars
  const preetiSpecial = (text.match(/[;\\|{}\[\]]/g) || []).length;
  const ratio = preetiSpecial / text.length;
  if (ratio > 0.08) return 'preeti'; // >8% special chars → likely Preeti
  return 'english';
}

export function isLegacyFont(text: string): boolean {
  return detectFont(text) === 'preeti' || detectFont(text) === 'kantipur';
}
