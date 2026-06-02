import { describe, expect, it } from 'vitest';

import { createEmptyContactValues, initialContactState } from '@/app/contact/state';

describe('createEmptyContactValues', () => {
  it('returns all-empty string values', () => {
    expect(createEmptyContactValues()).toEqual({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  });

  it('returns a fresh object each call', () => {
    expect(createEmptyContactValues()).not.toBe(createEmptyContactValues());
  });
});

describe('initialContactState', () => {
  it("has status 'idle' with empty values", () => {
    expect(initialContactState.status).toBe('idle');
    expect(initialContactState.values).toEqual({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  });
});
