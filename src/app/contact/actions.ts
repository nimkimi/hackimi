'use server';

import { sendMail } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/captcha';
import { contactSchema, type ContactInput } from '@/lib/validation';
import { createEmptyContactValues, type ContactFormState } from './state';

function readValues(formData: FormData): ContactInput {
  return {
    name: (formData.get('name') ?? '').toString(),
    email: (formData.get('email') ?? '').toString(),
    subject: (formData.get('subject') ?? '').toString(),
    message: (formData.get('message') ?? '').toString(),
  };
}

function errorState(
  message: string,
  values: ContactInput,
  fieldErrors: Partial<Record<keyof ContactInput, string[]>> = {}
): ContactFormState {
  return {
    status: 'error',
    message,
    fieldErrors,
    values,
  };
}

export async function submitContact(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const values = readValues(formData);
  const token = (formData.get('g-recaptcha-response') ?? formData.get('recaptchaToken') ?? null) as string | null;

  const isHuman = await verifyRecaptcha(token);
  if (!isHuman) {
    return errorState('Please confirm you are not a robot and try again.', values);
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors, formErrors } = parsed.error.flatten();
    return errorState(
      formErrors[0] ?? 'Please correct the highlighted fields and resend your message.',
      values,
      fieldErrors
    );
  }

  const { name, email, subject, message } = parsed.data;
  const body = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

  try {
    await sendMail(
      `Svar til ${name}`,
      email,
      `Hei ${name},\n\nTakk for din henvendelse. Jeg vil svare deg så snart som mulig.\n\nMed vennlig hilsen,\nNima Hakimi`
    );
    await sendMail(subject || 'Kontakt via hackimi.dev', 'nima@hackimi.dev', body);
  } catch (error) {
    console.error('Contact form sendMail failed', error);
    return errorState('Could not send your message right now. Please try again.', values);
  }

  return {
    status: 'success',
    message: 'Thanks! I’ll get back to you soon.',
    values: createEmptyContactValues(),
  };
}
