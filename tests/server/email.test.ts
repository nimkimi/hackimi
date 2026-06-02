import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A fresh fake transporter is created per test so call counts are isolated.
let sendMailMock: ReturnType<typeof vi.fn>;
let verifyMock: ReturnType<typeof vi.fn>;
let createTransportMock: ReturnType<typeof vi.fn>;

vi.mock('nodemailer', () => {
  // The factory is hoisted; it reads the per-test mocks via closure at call
  // time (createTransport is invoked lazily inside getTransporter()).
  return {
    default: {
      createTransport: (...args: unknown[]) => (createTransportMock as (...a: unknown[]) => unknown)(...args),
    },
  };
});

// Import the module fresh each time so its module-level `transporter` cache
// (and the nodemailer mock state) start clean.
async function loadEmail() {
  return import('@/lib/email');
}

beforeEach(() => {
  sendMailMock = vi.fn().mockResolvedValue({ messageId: 'x' });
  verifyMock = vi.fn().mockResolvedValue(true);
  createTransportMock = vi.fn(() => ({ sendMail: sendMailMock, verify: verifyMock }));
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('sendMail', () => {
  it('throws when NODEMAILER_EMAIL is missing', async () => {
    // No env stubbed -> assertEnv('NODEMAILER_EMAIL') fires first.
    vi.stubEnv('NODEMAILER_EMAIL', '');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');
    const { sendMail } = await loadEmail();
    await expect(sendMail('subj', 'to@example.com', 'body')).rejects.toThrow(
      'Missing required env var: NODEMAILER_EMAIL',
    );
  });

  it('throws when NODEMAILER_PASSWORD is missing (email present)', async () => {
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', '');
    const { sendMail } = await loadEmail();
    await expect(sendMail('subj', 'to@example.com', 'body')).rejects.toThrow(
      'Missing required env var: NODEMAILER_PASSWORD',
    );
  });

  it('creates the transporter with host/port/secure defaults', async () => {
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');
    // Override host/port to empty so the `|| default` fallbacks engage.
    // NODEMAILER_SECURE is intentionally NOT stubbed: secure is derived from
    // `?? port === 465`, which only yields the documented `true` default when
    // the var is genuinely absent (see the empty-string edge-case test below).
    vi.stubEnv('NODEMAILER_HOST', '');
    vi.stubEnv('NODEMAILER_PORT', '');

    const { sendMail } = await loadEmail();
    await sendMail('subj', 'to@example.com', 'body');

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: { user: 'sender@example.com', pass: 'pw' },
    });
  });

  it('respects NODEMAILER_HOST/PORT/SECURE overrides', async () => {
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');
    vi.stubEnv('NODEMAILER_HOST', 'smtp.custom.test');
    vi.stubEnv('NODEMAILER_PORT', '587');
    vi.stubEnv('NODEMAILER_SECURE', 'false');

    const { sendMail } = await loadEmail();
    await sendMail('subj', 'to@example.com', 'body');

    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.custom.test',
      port: 587,
      secure: false,
      auth: { user: 'sender@example.com', pass: 'pw' },
    });
  });

  it('treats an empty NODEMAILER_SECURE as false even on port 465 (edge case)', async () => {
    // CHARACTERIZATION: `??` only falls back on null/undefined, so an empty
    // string passes through and `''.toLowerCase() === 'true'` is false. This
    // means a defined-but-empty NODEMAILER_SECURE silently disables TLS on the
    // 465 default port, contrary to the "default true on 465" expectation.
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');
    vi.stubEnv('NODEMAILER_SECURE', '');

    const { sendMail } = await loadEmail();
    await sendMail('subj', 'to@example.com', 'body');

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: false }),
    );
  });

  it('forwards from/to/subject/text/html to transporter.sendMail', async () => {
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');
    vi.stubEnv('NODEMAILER_NAME', 'Custom Name');

    const { sendMail } = await loadEmail();
    const info = await sendMail('Hello', 'to@example.com', 'plain', '<b>rich</b>');

    expect(info).toEqual({ messageId: 'x' });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: { address: 'sender@example.com', name: 'Custom Name' },
      to: 'to@example.com',
      subject: 'Hello',
      text: 'plain',
      html: '<b>rich</b>',
    });
  });

  it("defaults the sender name to 'Portfolio' when NODEMAILER_NAME is absent", async () => {
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');
    vi.stubEnv('NODEMAILER_NAME', '');

    const { sendMail } = await loadEmail();
    await sendMail('Hello', 'to@example.com', 'plain');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { address: 'sender@example.com', name: 'Portfolio' },
        html: undefined,
      }),
    );
  });

  it('caches the transporter across multiple sendMail calls', async () => {
    vi.stubEnv('NODEMAILER_EMAIL', 'sender@example.com');
    vi.stubEnv('NODEMAILER_PASSWORD', 'pw');

    const { sendMail } = await loadEmail();
    await sendMail('a', 'to@example.com', 'one');
    await sendMail('b', 'to@example.com', 'two');

    expect(createTransportMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });
});
