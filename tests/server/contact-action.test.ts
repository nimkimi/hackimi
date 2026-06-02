import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the server-only collaborators using the same specifiers the source uses.
vi.mock('@/lib/captcha', () => ({
  verifyRecaptcha: vi.fn(),
}));
vi.mock('@/lib/email', () => ({
  sendMail: vi.fn(),
}));

import { submitContact } from '@/app/contact/actions';
import { verifyRecaptcha } from '@/lib/captcha';
import { sendMail } from '@/lib/email';
import { initialContactState } from '@/app/contact/state';

const verifyRecaptchaMock = vi.mocked(verifyRecaptcha);
const sendMailMock = vi.mocked(sendMail);

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'A perfectly valid message.',
};

function buildFormData(
  fields: Record<string, string> = {},
  token: { key?: string; value?: string } = { key: 'g-recaptcha-response', value: 'tok' }
): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  if (token.key && token.value !== undefined) fd.set(token.key, token.value);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Silence the console.error emitted on the sendMail failure path.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitContact', () => {
  it('returns the robot error and preserves values when captcha fails', async () => {
    verifyRecaptchaMock.mockResolvedValue(false);

    const fd = buildFormData(VALID);
    const result = await submitContact(initialContactState, fd);

    expect(result.status).toBe('error');
    expect(result.message).toBe('Please confirm you are not a robot and try again.');
    expect(result.values).toEqual(VALID);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('returns field errors when captcha passes but fields are invalid', async () => {
    verifyRecaptchaMock.mockResolvedValue(true);

    // All fields empty -> zod min(1)/email failures across every key.
    const fd = buildFormData({ name: '', email: '', subject: '', message: '' });
    const result = await submitContact(initialContactState, fd);

    expect(result.status).toBe('error');
    expect(result.fieldErrors).toBeDefined();
    expect(Object.keys(result.fieldErrors ?? {}).sort()).toEqual([
      'email',
      'message',
      'name',
      'subject',
    ]);
    // No formErrors for these field-level issues -> falls back to default message.
    expect(result.message).toBe('Please correct the highlighted fields and resend your message.');
    expect(result.values).toEqual({ name: '', email: '', subject: '', message: '' });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('returns a send error when sendMail throws', async () => {
    verifyRecaptchaMock.mockResolvedValue(true);
    sendMailMock.mockRejectedValue(new Error('smtp down'));

    const fd = buildFormData(VALID);
    const result = await submitContact(initialContactState, fd);

    expect(result.status).toBe('error');
    expect(result.message).toBe('Could not send your message right now. Please try again.');
    expect(result.values).toEqual(VALID);
  });

  it('succeeds, sends both emails, and resets values on the happy path', async () => {
    verifyRecaptchaMock.mockResolvedValue(true);
    sendMailMock.mockResolvedValue(undefined as unknown as void);

    const fd = buildFormData(VALID);
    const result = await submitContact(initialContactState, fd);

    expect(result.status).toBe('success');
    expect(result.message?.startsWith('Thanks!')).toBe(true);
    expect(result.values).toEqual({ name: '', email: '', subject: '', message: '' });
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to recaptchaToken when g-recaptcha-response is absent', async () => {
    verifyRecaptchaMock.mockResolvedValue(false);

    const fd = buildFormData(VALID, { key: 'recaptchaToken', value: 'fallback-token' });
    await submitContact(initialContactState, fd);

    expect(verifyRecaptchaMock).toHaveBeenCalledWith('fallback-token');
  });

  it('prefers g-recaptcha-response over recaptchaToken', async () => {
    verifyRecaptchaMock.mockResolvedValue(false);

    const fd = new FormData();
    fd.set('g-recaptcha-response', 'primary');
    fd.set('recaptchaToken', 'secondary');
    await submitContact(initialContactState, fd);

    expect(verifyRecaptchaMock).toHaveBeenCalledWith('primary');
  });
});
