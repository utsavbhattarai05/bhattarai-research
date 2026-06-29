import { POST } from '@/app/api/translate/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/translate', () => ({
  fillBilingual: jest.fn(),
}));

const { fillBilingual } = require('@/lib/translate');

describe('POST /api/translate', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 when texts is not an array', async () => {
    const req = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts: 'hello', target: 'ne' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when target is missing', async () => {
    const req = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts: ['hello'] }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('translates en→ne and returns translations array', async () => {
    fillBilingual.mockResolvedValue({ en: 'hello', ne: 'नमस्ते' });
    const req = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts: ['hello'], source: 'en', target: 'ne' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.translations).toEqual(['नमस्ते']);
  });

  it('translates ne→en and returns english text', async () => {
    fillBilingual.mockResolvedValue({ en: 'research', ne: 'अनुसन्धान' });
    const req = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts: ['अनुसन्धान'], source: 'ne', target: 'en' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.translations).toEqual(['research']);
  });

  it('handles multiple texts in one request', async () => {
    fillBilingual
      .mockResolvedValueOnce({ en: 'hello', ne: 'नमस्ते' })
      .mockResolvedValueOnce({ en: 'research', ne: 'अनुसन्धान' });
    const req = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts: ['hello', 'research'], source: 'en', target: 'ne' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.translations).toHaveLength(2);
    expect(data.translations).toEqual(['नमस्ते', 'अनुसन्धान']);
  });

  it('defaults source to en when not provided', async () => {
    fillBilingual.mockResolvedValue({ en: 'hello', ne: 'नमस्ते' });
    const req = new NextRequest('http://localhost/api/translate', {
      method: 'POST',
      body: JSON.stringify({ texts: ['hello'], target: 'ne' }),
      headers: { 'Content-Type': 'application/json' },
    });
    await POST(req);
    expect(fillBilingual).toHaveBeenCalledWith({ en: 'hello', ne: '' });
  });
});
