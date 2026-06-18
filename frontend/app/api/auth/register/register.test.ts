import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { helper, mockUsers } from '../../mockDb';

const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

// Mock cookies API from next/headers
vi.mock('next/headers', () => ({
  cookies: async () => mockCookieStore,
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCookieStore.set.mockClear();
    mockCookieStore.get.mockClear();
    mockCookieStore.delete.mockClear();
  });

  it('should successfully register a new user and set cookie when backend proxy succeeds', async () => {
    const mockUserData = { id: 'u2', username: 'newuser', email: 'new@example.com', role: 'user' };
    const mockToken = 'backend-token-new';

    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: true,
      data: { user: mockUserData, token: mockToken }
    });

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'newuser', email: 'new@example.com', password: 'password123' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user).toEqual(mockUserData);
    expect(mockCookieStore.set).toHaveBeenCalledWith('token', mockToken, expect.any(Object));
  });

  it('should fallback to mock database and create user if backend proxy fails', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      error: 'Backend offline'
    });

    const email = 'new-mock-user@codingo.com';
    const username = 'newmockuser';

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password: 'password123' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.username).toBe(username);
    expect(json.user.email).toBe(email);
    expect(mockCookieStore.set).toHaveBeenCalledWith('token', `mock-jwt-token-${username}`, expect.any(Object));

    // Verify user is in mock db
    const userInDb = mockUsers.find(u => u.email === email);
    expect(userInDb).toBeDefined();
  });

  it('should return 400 if fields are missing in fallback mode', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      error: 'Backend offline'
    });

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'incomplete@codingo.com', password: '123' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toContain('Vui lòng điền đầy đủ thông tin');
  });

  it('should return 400 if email already exists in fallback mode', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      error: 'Backend offline'
    });

    // mockUsers[0] is learner (email: user@codingo.com)
    const existingUser = mockUsers[0];

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: 'uniqueName', email: existingUser.email, password: 'password123' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toContain('Email đã được đăng ký');
  });
});
