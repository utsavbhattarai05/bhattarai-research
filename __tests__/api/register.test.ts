import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/lib/email', () => ({ sendVerificationEmail: jest.fn().mockResolvedValue(undefined) }));

const mockCreate  = jest.fn();
const mockFindOne = jest.fn();
jest.mock('@/models/User', () => ({
  __esModule: true,
  default: { create: (...a: any[]) => mockCreate(...a), findOne: (...a: any[]) => mockFindOne(...a) },
}));

// Set the admin secret env var
process.env.ADMIN_SECRET = 'test-secret';

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/register — public sign-up', () => {
  beforeEach(() => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'user123' });
  });

  it('returns 201 with valid fields', async () => {
    const res = await POST(makeRequest({
      name: 'Test User',
      email: 'new@example.com',
      phone: '+977-9800000000',
      password: 'password123',
    }));
    expect(res.status).toBe(201);
  });

  it('returns 400 when phone is missing', async () => {
    const res = await POST(makeRequest({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await POST(makeRequest({
      name: 'Test',
      email: 'test@example.com',
      phone: '+9779800000000',
      password: 'short',
    }));
    expect(res.status).toBe(400);
  });

  it('returns 409 when email already registered', async () => {
    mockFindOne.mockResolvedValue({ _id: 'existing' });
    const res = await POST(makeRequest({
      name: 'Test',
      email: 'exists@example.com',
      phone: '+9779800000000',
      password: 'password123',
    }));
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/register — admin creation', () => {
  beforeEach(() => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ _id: 'admin123' });
  });

  it('returns 201 with correct admin secret', async () => {
    const res = await POST(makeRequest({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'adminpass123',
      adminSecret: 'test-secret',
    }));
    expect(res.status).toBe(201);
  });

  it('returns 401 with wrong admin secret', async () => {
    const res = await POST(makeRequest({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'adminpass123',
      adminSecret: 'wrong-secret',
    }));
    expect(res.status).toBe(401);
  });
});
