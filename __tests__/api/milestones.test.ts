import { GET, POST, PUT, DELETE } from '@/app/api/milestones/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));

jest.mock('@/models/Milestone', () => {
  const stub = {
    _id: 'ms1', year: 2010,
    title: { en: 'Started PhD', ne: '' },
    description: { en: 'Began doctoral research', ne: '' },
    category: 'education', isCurrent: false, sortOrder: 1,
  };
  const mockFind   = jest.fn().mockResolvedValue([stub]);
  const mockCreate = jest.fn().mockResolvedValue(stub);
  const mockUpdate = jest.fn().mockResolvedValue(stub);
  const mockDelete = jest.fn().mockResolvedValue(stub);

  return {
    __esModule: true,
    default: {
      find:              () => ({ sort: () => ({ lean: mockFind }) }),
      create:            mockCreate,
      findByIdAndUpdate: mockUpdate,
      findByIdAndDelete: mockDelete,
      _mocks: { mockFind, mockCreate, mockUpdate, mockDelete },
    },
  };
});

const { getServerSession } = require('next-auth');
const Milestone = require('@/models/Milestone').default;

const adminSession = { user: { role: 'admin' } };

describe('GET /api/milestones', () => {
  it('returns 200 with milestones array', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.milestones)).toBe(true);
    expect(data.milestones[0].title.en).toBe('Started PhD');
  });
});

describe('POST /api/milestones', () => {
  it('returns 403 when not authenticated', async () => {
    getServerSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/milestones', {
      method: 'POST',
      body: JSON.stringify({ year: 2010, title: { en: 'Test' }, description: { en: 'Desc' }, category: 'education' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    getServerSession.mockResolvedValue(adminSession);
    const req = new NextRequest('http://localhost/api/milestones', {
      method: 'POST',
      body: JSON.stringify({ year: 2010 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 201 with created milestone for admin', async () => {
    getServerSession.mockResolvedValue(adminSession);
    const req = new NextRequest('http://localhost/api/milestones', {
      method: 'POST',
      body: JSON.stringify({ year: 2010, title: { en: 'Started PhD' }, description: { en: 'Began research' }, category: 'education' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.milestone).toBeDefined();
  });
});

describe('PUT /api/milestones', () => {
  it('returns 403 when not admin', async () => {
    getServerSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/milestones', {
      method: 'PUT',
      body: JSON.stringify({ id: 'ms1', year: 2011 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await PUT(req);
    expect(res.status).toBe(403);
  });

  it('returns 200 with updated milestone for admin', async () => {
    getServerSession.mockResolvedValue(adminSession);
    const req = new NextRequest('http://localhost/api/milestones', {
      method: 'PUT',
      body: JSON.stringify({ id: 'ms1', year: 2011 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
  });

  it('returns 404 when milestone not found', async () => {
    getServerSession.mockResolvedValue(adminSession);
    Milestone._mocks.mockUpdate.mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/milestones', {
      method: 'PUT',
      body: JSON.stringify({ id: 'nonexistent' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/milestones', () => {
  it('returns 403 when not admin', async () => {
    getServerSession.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/milestones?id=ms1', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 when no id provided', async () => {
    getServerSession.mockResolvedValue(adminSession);
    const req = new NextRequest('http://localhost/api/milestones', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 on successful delete', async () => {
    getServerSession.mockResolvedValue(adminSession);
    const req = new NextRequest('http://localhost/api/milestones?id=ms1', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe('Milestone deleted');
  });

  it('returns 404 when milestone not found', async () => {
    getServerSession.mockResolvedValue(adminSession);
    Milestone._mocks.mockDelete.mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/milestones?id=gone', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });
});
