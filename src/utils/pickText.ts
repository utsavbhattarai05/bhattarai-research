// Pick the best available text from a flexible bilingual field.
// No language is enforced — uses whichever is filled in.
export function pickText(
  field: { en?: string; ne?: string } | undefined,
  language: string,
): string {
  if (!field) return '';
  if (language === 'ne') return field.ne || field.en || '';
  return field.en || field.ne || '';
}
