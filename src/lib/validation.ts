import { z } from 'zod';

// Every rule carries its own message: zod's defaults ("Too small: expected
// string to have >=1 characters") would otherwise render verbatim in the form.
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Add your name.').max(100, 'Keep your name under 100 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
  subject: z.string().trim().min(1, 'Add a subject.').max(120, 'Keep the subject under 120 characters.'),
  message: z.string().trim().min(1, 'Write a message.').max(5000, 'Keep the message under 5,000 characters.'),
});

export type ContactInput = z.infer<typeof contactSchema>;
