import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

// Mock cookies API from next/headers
vi.mock('next/headers', () => ({
  cookies: async () => mockCookieStore,
}));

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCookieStore.delete.mockClear();
  });

  it('should successfully clear the token cookie and return success', async () => {
    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockCookieStore.delete).toHaveBeenCalledWith('token');
  });
});
