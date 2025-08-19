'use server';
import { contactSchema } from '@/lib/validation';
import { sendMail } from '@/lib/email';
import { redirect } from 'next/navigation';
import { verifyRecaptcha } from '@/lib/captcha';

export async function handleMail(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const token = raw['g-recaptcha-response'] || raw['recaptchaToken'] || null;
  const human = await verifyRecaptcha(token);
  if (!human) {
    throw new Error('Captcha failed');
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Invalid form');
  }
  const { name, email, subject, message } = parsed.data;
  const body = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
  await sendMail(
    `Svar til ${name}`,
    email,
    `Hei ${name},\n\nTakk for din henvendelse. Jeg vil svare deg så snart som mulig.\n\nMed vennlig hilsen,\nNima Hakimi`
  );
  await sendMail(subject, 'nima@hackimi.dev', body);
}

export async function submitAndRedirect(formData: FormData) {
  try {
    await handleMail(formData);
  } catch (error) {
    console.error(error);
    redirect('/contact?error=1');
  }
  redirect('/contact?sent=1');
}
