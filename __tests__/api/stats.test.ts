import { GET } from '@/app/api/stats/route';

jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('@/models/Publication', () => ({
  __esModule: true,
  default: { countDocuments: jest.fn().mockResolvedValue(42) },
}));
jest.mock('@/models/User', () => ({
  __esModule: true,
  default: { countDocuments: jest.fn().mockResolvedValue(5) },
}));
jest.mock('@/models/Download', () => ({
  __esModule: true,
  default: { countDocuments: jest.fn().mockResolvedValue(1200) },
}));

describe('GET /api/stats', () => {
  it('returns counts for publications, users, and downloads', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.publications).toBe(42);
    expect(data.users).toBe(5);
    expect(data.downloads).toBe(1200);
  });

  it('returns zeros when DB throws', async () => {
    const Publication = require('@/models/Publication').default;
    Publication.countDocuments.mockRejectedValueOnce(new Error('DB down'));
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.publications).toBe(0);
    expect(data.users).toBe(0);
    expect(data.downloads).toBe(0);
  });
});
