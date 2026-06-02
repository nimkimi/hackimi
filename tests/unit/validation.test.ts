import { describe, it, expect } from 'vitest';
import { contactSchema } from '../../src/lib/validation';

const validInput = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello there',
  message: 'I would like to discuss a collaboration.',
};

describe('contactSchema', () => {
  it('parses a fully valid input and returns matching data', () => {
    const result = contactSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  it('trims surrounding whitespace on all string fields', () => {
    const result = contactSchema.safeParse({
      name: '  Ada  ',
      email: '  ada@example.com  ',
      subject: '  Hi  ',
      message: '  hello  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'Ada',
        email: 'ada@example.com',
        subject: 'Hi',
        message: 'hello',
      });
    }
  });

  describe('min(1) rejects empty / whitespace-only', () => {
    for (const field of ['name', 'subject', 'message'] as const) {
      it(`rejects empty string for ${field}`, () => {
        const result = contactSchema.safeParse({ ...validInput, [field]: '' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.flatten().fieldErrors[field]).toBeTruthy();
        }
      });

      it(`rejects whitespace-only string for ${field}`, () => {
        const result = contactSchema.safeParse({ ...validInput, [field]: '   ' });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.flatten().fieldErrors[field]).toBeTruthy();
        }
      });
    }
  });

  describe('max boundaries', () => {
    const cases = [
      { field: 'name', ok: 100, fail: 101 },
      { field: 'subject', ok: 120, fail: 121 },
      { field: 'message', ok: 5000, fail: 5001 },
    ] as const;

    for (const { field, ok, fail } of cases) {
      it(`accepts ${field} at max length (${ok})`, () => {
        const result = contactSchema.safeParse({ ...validInput, [field]: 'a'.repeat(ok) });
        expect(result.success).toBe(true);
      });

      it(`rejects ${field} over max length (${fail})`, () => {
        const result = contactSchema.safeParse({ ...validInput, [field]: 'a'.repeat(fail) });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.flatten().fieldErrors[field]).toBeTruthy();
        }
      });
    }
  });

  describe('email', () => {
    it('rejects an invalid email', () => {
      const result = contactSchema.safeParse({ ...validInput, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeTruthy();
      }
    });

    it('accepts a valid email', () => {
      const result = contactSchema.safeParse({ ...validInput, email: 'user.name+tag@sub.example.co' });
      expect(result.success).toBe(true);
    });
  });

  it('reports all invalid fields in error.flatten().fieldErrors', () => {
    const result = contactSchema.safeParse({
      name: '',
      email: 'bad',
      subject: '',
      message: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(Object.keys(fieldErrors).sort()).toEqual(['email', 'message', 'name', 'subject']);
    }
  });
});
