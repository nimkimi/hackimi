import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { verifyRecaptcha } from '@/lib/captcha';

const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Build a minimal fetch mock that resolves to a Response-like object.
 * `ok` drives the `!res.ok` branch; `json` returns the parsed body.
 */
function mockFetch(response: { ok: boolean; body?: unknown }) {
  const fn = vi.fn(async () => ({
    ok: response.ok,
    json: async () => response.body ?? {},
  }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('verifyRecaptcha', () => {
  describe('no token', () => {
    it('returns false in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const fetchFn = mockFetch({ ok: true });
      await expect(verifyRecaptcha(null)).resolves.toBe(false);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('returns true in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const fetchFn = mockFetch({ ok: true });
      await expect(verifyRecaptcha(null)).resolves.toBe(true);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe('token present but no secret key', () => {
    beforeEach(() => {
      // Ensure the secret is unset for this group.
      vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    });

    it('returns false in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      const fetchFn = mockFetch({ ok: true });
      await expect(verifyRecaptcha('tok')).resolves.toBe(false);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('returns true in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      const fetchFn = mockFetch({ ok: true });
      await expect(verifyRecaptcha('tok')).resolves.toBe(true);
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });

  describe('token + secret present', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('RECAPTCHA_SECRET_KEY', 'test-secret');
    });

    it('returns true when google responds ok with success:true', async () => {
      mockFetch({ ok: true, body: { success: true } });
      await expect(verifyRecaptcha('tok')).resolves.toBe(true);
    });

    it('returns false when google responds ok with success:false', async () => {
      mockFetch({ ok: true, body: { success: false } });
      await expect(verifyRecaptcha('tok')).resolves.toBe(false);
    });

    it('returns false on non-ok response in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      mockFetch({ ok: false });
      await expect(verifyRecaptcha('tok')).resolves.toBe(false);
    });

    it('returns true on non-ok response in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      mockFetch({ ok: false });
      await expect(verifyRecaptcha('tok')).resolves.toBe(true);
    });

    it('posts to the siteverify URL with secret and response in the body', async () => {
      const fetchFn = mockFetch({ ok: true, body: { success: true } });
      await verifyRecaptcha('my-token');

      expect(fetchFn).toHaveBeenCalledTimes(1);
      const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe(SITEVERIFY_URL);
      expect(init.method).toBe('POST');

      const params = new URLSearchParams(init.body as string);
      expect(params.get('secret')).toBe('test-secret');
      expect(params.get('response')).toBe('my-token');
    });
  });
});
