import { POST } from '@/app/api/convert-nepali/route';
import { NextRequest } from 'next/server';

jest.mock('preeti-to-unicode', () => ({
  convertFont: jest.fn((text: string, font: string) => {
    if (text === 'k|frLg') return 'प्राचीन';
    return text;
  }),
}));

const { convertFont } = require('preeti-to-unicode');

describe('POST /api/convert-nepali', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty string when no text provided', async () => {
    const req = new NextRequest('http://localhost/api/convert-nepali', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.converted).toBe('');
    expect(data.wasConverted).toBe(false);
  });

  it('converts Preeti text to Unicode', async () => {
    const req = new NextRequest('http://localhost/api/convert-nepali', {
      method: 'POST',
      body: JSON.stringify({ text: 'k|frLg', font: 'preeti' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.converted).toBe('प्राचीन');
    expect(data.wasConverted).toBe(true);
    expect(data.font).toBe('preeti');
  });

  it('uses preeti font by default', async () => {
    const req = new NextRequest('http://localhost/api/convert-nepali', {
      method: 'POST',
      body: JSON.stringify({ text: 'k|frLg' }),
      headers: { 'Content-Type': 'application/json' },
    });
    await POST(req);
    expect(convertFont).toHaveBeenCalledWith('k|frLg', 'preeti');
  });

  it('uses kantipur font when specified', async () => {
    const req = new NextRequest('http://localhost/api/convert-nepali', {
      method: 'POST',
      body: JSON.stringify({ text: 'some text', font: 'kantipur' }),
      headers: { 'Content-Type': 'application/json' },
    });
    await POST(req);
    expect(convertFont).toHaveBeenCalledWith('some text', 'kantipur');
  });

  it('returns wasConverted false when text is unchanged', async () => {
    const req = new NextRequest('http://localhost/api/convert-nepali', {
      method: 'POST',
      body: JSON.stringify({ text: 'already unicode', font: 'preeti' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.wasConverted).toBe(false);
  });
});
