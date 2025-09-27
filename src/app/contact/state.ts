import type { ContactInput } from '@/lib/validation';

export type ContactFormStatus = 'idle' | 'success' | 'error';

export type ContactFormState = {
  status: ContactFormStatus;
  message?: string;
  fieldErrors?: Partial<Record<keyof ContactInput, string[]>>;
  values: ContactInput;
};

export function createEmptyContactValues(): ContactInput {
  return {
    name: '',
    email: '',
    subject: '',
    message: '',
  };
}

export const initialContactState: ContactFormState = {
  status: 'idle',
  values: createEmptyContactValues(),
};
