import { GET, POST } from '@/app/api/publications/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

// Use factory to avoid hoisting reference errors
jest.mock('@/models/Publication', () => {
  const mockFind    = jest.fn().mockResolvedValue([{ _id: '1', title: { en: 'Test' }, year: 2025 }]);
  const mockCount   = jest.fn().mockResolvedValue(1);
  const mockFindOne = jest.fn().mockResolvedValue(null);
  const mockCreate  = jest.fn();

  return {
    __esModule: true,
    default: {
      find:           () => ({ sort: () => ({ skip: () => ({ limit: () => ({ lean: mockFind }) }) }) }),
      countDocuments: mockCount,
      findOne:        mockFindOne,
      create:         mockCreate,
      _mocks: { mockFind, mockCount, mockFindOne, mockCreate },
    },
  };
});

const { getServerSession } = require('next-auth');
const Publication = require('@/models/Publication').default;

describe('GET /api/publications', () => {
  it('returns 200 with publications array', async () => {
    const req = new NextRequest('http://localhost/api/publications');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.publications)).toBe(true);
  });

  it('includes pagination metadata', async () => {
    const req = new NextRequest('http://localhost/api/publications?page=1&limit=10');
    const res = await GET(req);
    const data = await res.json();
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('pages');
  });
});

describe('POST /api/publications', () => {
  const validBody = {
    title:    { en: 'A paper', ne: '' },
    abstract: { en: 'Abstract', ne: '' },
    authors:  ['D.P. Bhattarai'],
    year:     2025,
    type:     'journal',
    journal:  'Test Journal',
    slug:     'a-paper',
    fileUrl:  'publications/a-paper.pdf',
    fileName: 'a-paper.pdf',
  };

  it('returns 403 when not authenticated', async () => {
    getServerSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/publications', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });
    expect((await POST(req)).status).toBe(403);
  });

  it('returns 403 when authenticated as non-admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'user' } });
    const req = new NextRequest('http://localhost/api/publications', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });
    expect((await POST(req)).status).toBe(403);
  });

  it('returns 201 when admin submits valid publication', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'admin' } });
    Publication._mocks.mockFindOne.mockResolvedValueOnce(null);
    Publication._mocks.mockCreate.mockResolvedValueOnce({ ...validBody, _id: 'pub123', downloadCount: 0 });

    const req = new NextRequest('http://localhost/api/publications', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });
    expect((await POST(req)).status).toBe(201);
  });

  it('returns 409 when slug already exists', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'admin' } });
    Publication._mocks.mockFindOne.mockResolvedValueOnce({ _id: 'existing' });

    const req = new NextRequest('http://localhost/api/publications', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });
    expect((await POST(req)).status).toBe(409);
  });

  it('returns 400 for invalid year', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'admin' } });
    Publication._mocks.mockFindOne.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost/api/publications', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, year: 1800 }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect((await POST(req)).status).toBe(400);
  });
});
