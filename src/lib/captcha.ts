import 'server-only';

export type RecaptchaVerifyResult = {
  'success': boolean;
  'challenge_ts'?: string;
  'hostname'?: string;
  'error-codes'?: string[];
  'score'?: number;
  'action'?: string;
};

export async function verifyRecaptcha(token: string | null): Promise<boolean> {
  const isProd = process.env.NODE_ENV === 'production';
  if (!token) return !isProd;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return !isProd;

  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    cache: 'no-store',
  });
  if (!res.ok) return !isProd;
  const data = (await res.json()) as RecaptchaVerifyResult;
  return Boolean(data.success);
}
