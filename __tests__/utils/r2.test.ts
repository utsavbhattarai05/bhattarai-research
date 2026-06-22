import { r2ObjectKey } from '@/lib/r2';

describe('r2ObjectKey', () => {
  it('generates a key inside publications/ folder', () => {
    const key = r2ObjectKey('my-paper.pdf');
    expect(key).toMatch(/^publications\//);
  });

  it('preserves the file extension', () => {
    expect(r2ObjectKey('thesis.pdf')).toMatch(/\.pdf$/);
    expect(r2ObjectKey('report.docx')).toMatch(/\.docx$/);
  });

  it('slugifies the filename — no spaces or special chars', () => {
    const key = r2ObjectKey('My Paper (2025).pdf');
    // Only lowercase letters, numbers, hyphens and the extension
    expect(key).toMatch(/^publications\/[a-z0-9-]+-[a-z0-9]+\.pdf$/);
  });

  it('truncates very long filenames to keep keys manageable', () => {
    const longName = 'a'.repeat(200) + '.pdf';
    const key = r2ObjectKey(longName);
    // slug part should be at most 60 chars + dash + 6-char random + .pdf
    const slug = key.replace('publications/', '').replace(/\.[^/.]+$/, '');
    const slugWithoutRandom = slug.replace(/-[a-z0-9]{6}$/, '');
    expect(slugWithoutRandom.length).toBeLessThanOrEqual(60);
  });

  it('produces unique keys for the same filename', () => {
    const key1 = r2ObjectKey('paper.pdf');
    const key2 = r2ObjectKey('paper.pdf');
    expect(key1).not.toBe(key2);
  });
});
