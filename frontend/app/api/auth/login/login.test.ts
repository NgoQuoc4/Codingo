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

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCookieStore.set.mockClear();
    mockCookieStore.get.mockClear();
    mockCookieStore.delete.mockClear();
  });

  it('should successfully login and set cookie when backend proxy succeeds', async () => {
    const mockUserData = { id: 'u1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'backend-token-xyz';
    
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: true,
      data: { user: mockUserData, token: mockToken }
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user).toEqual(mockUserData);
    expect(mockCookieStore.set).toHaveBeenCalledWith('token', mockToken, expect.any(Object));
  });

  it('should fallback to mock database if backend proxy fails due to offline backend', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      isOffline: true,
      error: 'Backend offline'
    });

    // We use mockUsers[0] which is learner (email: user@codingo.com)
    const mockUser = mockUsers[0];

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: mockUser.email, password: 'any-password' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.email).toBe(mockUser.email);
    expect(mockCookieStore.set).toHaveBeenCalledWith('token', `mock-jwt-token-${mockUser.username}`, expect.any(Object));
  });

  it('should return 400 if email or password is missing in fallback mode', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      isOffline: true,
      error: 'Backend offline'
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toContain('Vui lòng cung cấp email và mật khẩu');
  });

  it('should return 401 if user email does not exist in mockUsers during fallback mode', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      isOffline: true,
      error: 'Backend offline'
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'pass' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.message).toContain('Tài khoản không tồn tại');
  });

  it('should forward backend 401 error directly if backend is online but returns 401', async () => {
    vi.spyOn(helper, 'proxyFetch').mockResolvedValue({
      ok: false,
      isOffline: false,
      status: 401,
      data: { message: 'Mật khẩu không chính xác' }
    });

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.message).toBe('Mật khẩu không chính xác');
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });
});
