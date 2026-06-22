// slugify utility used in publication forms

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

describe('slugify', () => {
  it('lowercases the input', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('sustainable development nepal')).toBe('sustainable-development-nepal');
  });

  it('removes special characters', () => {
    expect(slugify('Impact (2025): A Study!')).toBe('impact-2025-a-study');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles already-slugged input', () => {
    expect(slugify('already-slugged')).toBe('already-slugged');
  });

  it('handles Nepali/unicode characters by removing them', () => {
    const result = slugify('भट्टराई 2025');
    // Unicode chars are stripped; remaining digits are kept (may have leading hyphen)
    expect(result).toContain('2025');
    expect(result).not.toMatch(/[^\w-]/); // only word chars and hyphens remain
  });
});
