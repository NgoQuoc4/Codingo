import { describe, it, expect, vi, beforeEach } from 'vitest';
import { helper, mockUsers } from './mockDb';

describe('helper.proxyFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should forward cookie token as Authorization Bearer header', async () => {
    const mockResponse = { ok: true, json: async () => ({ success: true }) };
    const globalFetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

    const request = new Request('http://localhost/api/users/profile', {
      headers: {
        'cookie': 'token=my-secret-token; otherCookie=value'
      }
    });

    const result = await helper.proxyFetch(request, '/api/users/profile');

    expect(globalFetchMock).toHaveBeenCalled();
    const calledUrl = globalFetchMock.mock.calls[0][0];
    const calledOptions = globalFetchMock.mock.calls[0][1];
    
    expect(calledUrl).toContain('/api/users/profile');
    
    const headers = calledOptions?.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer my-secret-token');
    expect(headers.get('content-type')).toBe('application/json');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ success: true });
  });

  it('should handle offline/failed backend fetch and return error status with isOffline: true', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Connection refused'));

    const request = new Request('http://localhost/api/users/profile');
    const result = await helper.proxyFetch(request, '/api/users/profile');

    expect(result.ok).toBe(false);
    expect(result.isOffline).toBe(true);
    expect(result.error).toBe('Connection refused');
  });

  it('should handle online non-ok response and return status code with isOffline: false', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized token' })
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

    const request = new Request('http://localhost/api/users/profile');
    const result = await helper.proxyFetch(request, '/api/users/profile');

    expect(result.ok).toBe(false);
    expect(result.isOffline).toBe(false);
    expect(result.status).toBe(401);
    expect(result.data).toEqual({ message: 'Unauthorized token' });
  });
});

describe('helper.authenticate', () => {
  it('should authenticate user from mock token', () => {
    const request = new Request('http://localhost/api/users/profile', {
      headers: {
        'cookie': 'token=mock-jwt-token-learner'
      }
    });

    const user = helper.authenticate(request);
    expect(user.username).toBe('learner');
  });

  it('should fallback to activeSessionUser when cookie or token is missing', () => {
    const request = new Request('http://localhost/api/users/profile');
    const user = helper.authenticate(request);
    expect(user).toBeDefined();
  });
});
