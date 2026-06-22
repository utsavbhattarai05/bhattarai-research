import { POST } from '@/app/api/contact/route';
import { NextRequest } from 'next/server';

// Mock DB and model
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/models/Message', () => ({
  __esModule: true,
  default: { create: jest.fn().mockResolvedValue({ _id: 'msg123' }) },
}));

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/contact', () => {
  it('returns 201 with valid fields', async () => {
    const req = makeRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Hello',
      message: 'This is a test message.',
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.message).toBe('Message sent successfully');
  });

  it('returns 400 when a required field is missing', async () => {
    const req = makeRequest({ name: 'Test', email: 'test@example.com' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const req = makeRequest({
      name: 'Test',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'Hello',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message exceeds 5000 characters', async () => {
    const req = makeRequest({
      name: 'Test',
      email: 'test@example.com',
      subject: 'Hi',
      message: 'x'.repeat(5001),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
