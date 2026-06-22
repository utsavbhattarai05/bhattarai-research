// Test the citation generators extracted from CiteModal.tsx

function formatAuthorsAPA(authors: string[]): string {
  return authors
    .map((a) => {
      const parts = a.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      const last = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
      return `${last}, ${initials}`;
    })
    .join(', ');
}

function formatAuthorsHarvard(authors: string[]): string {
  return authors
    .map((a, i) => {
      const parts = a.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      const last = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join('');
      const formatted = `${last}, ${initials}`;
      if (authors.length > 1 && i === authors.length - 1) return `and ${formatted}`;
      return formatted;
    })
    .join(', ');
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return '';
  if (authors.length === 1) return authors[0];
  const parts = authors[0].trim().split(/\s+/);
  const firstLast = parts[parts.length - 1];
  const firstRest = parts.slice(0, -1).join(' ');
  const first = `${firstLast}, ${firstRest}`;
  if (authors.length === 2) return `${first}, and ${authors[1]}`;
  return `${first}, et al.`;
}

describe('formatAuthorsAPA', () => {
  it('formats single author correctly', () => {
    expect(formatAuthorsAPA(['Dhruba Prasad Bhattarai'])).toBe('Bhattarai, D. P.');
  });

  it('formats multiple authors', () => {
    const result = formatAuthorsAPA(['Dhruba Bhattarai', 'Sita Sharma']);
    expect(result).toBe('Bhattarai, D., Sharma, S.');
  });

  it('handles single-word author name', () => {
    expect(formatAuthorsAPA(['Aristotle'])).toBe('Aristotle');
  });
});

describe('formatAuthorsHarvard', () => {
  it('formats single author correctly', () => {
    expect(formatAuthorsHarvard(['Dhruba Bhattarai'])).toBe('Bhattarai, D.');
  });

  it('adds "and" before last author with multiple', () => {
    const result = formatAuthorsHarvard(['Dhruba Bhattarai', 'Sita Sharma']);
    expect(result).toContain('and Sharma, S.');
  });

  it('handles single-word author name', () => {
    expect(formatAuthorsHarvard(['Aristotle'])).toBe('Aristotle');
  });
});

describe('formatAuthorsMLA', () => {
  it('returns empty string for no authors', () => {
    expect(formatAuthorsMLA([])).toBe('');
  });

  it('returns name as-is for single author', () => {
    expect(formatAuthorsMLA(['Dhruba Bhattarai'])).toBe('Dhruba Bhattarai');
  });

  it('formats two authors with "and"', () => {
    const result = formatAuthorsMLA(['Dhruba Bhattarai', 'Sita Sharma']);
    expect(result).toBe('Bhattarai, Dhruba, and Sita Sharma');
  });

  it('uses "et al." for three or more authors', () => {
    const result = formatAuthorsMLA(['Dhruba Bhattarai', 'Sita Sharma', 'Ram Thapa']);
    expect(result).toContain('et al.');
  });
});
