import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/r2', () => ({
  r2: {},
  R2_BUCKET: 'test-bucket',
  r2ObjectKey: jest.fn().mockReturnValue('publications/test-abc123.pdf'),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://r2.example.com/presigned-url'),
}));
jest.mock('@aws-sdk/client-s3', () => ({ PutObjectCommand: jest.fn() }));

const { getServerSession } = require('next-auth');

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/upload', () => {
  it('returns 403 when not authenticated', async () => {
    getServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ fileName: 'test.pdf', fileType: 'application/pdf' }));
    expect(res.status).toBe(403);
  });

  it('returns 403 for non-admin users', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'user' } });
    const res = await POST(makeRequest({ fileName: 'test.pdf', fileType: 'application/pdf' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 for disallowed file type', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'admin' } });
    const res = await POST(makeRequest({ fileName: 'image.jpg', fileType: 'image/jpeg' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when file exceeds 50MB', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'admin' } });
    const res = await POST(makeRequest({
      fileName: 'big.pdf',
      fileType: 'application/pdf',
      fileSize: 51 * 1024 * 1024,
    }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with uploadUrl and key for valid admin request', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'admin' } });
    const res = await POST(makeRequest({ fileName: 'paper.pdf', fileType: 'application/pdf', fileSize: 1024 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('uploadUrl');
    expect(data).toHaveProperty('key');
    expect(data).toHaveProperty('fileName');
  });
});
