import { describe, expect, it } from 'vitest';

import {
  MIN_SIGNUP_PASSWORD_LENGTH,
  validateSignupPassword,
  validateSignupPasswordConfirm,
} from '@/lib/auth/signupPassword';

describe('signupPassword', () => {
  it('requires minimum length', () => {
    expect(validateSignupPassword('short').ok).toBe(false);
    expect(validateSignupPassword('a'.repeat(MIN_SIGNUP_PASSWORD_LENGTH)).ok).toBe(true);
  });

  it('requires matching confirm', () => {
    const pw = 'a'.repeat(MIN_SIGNUP_PASSWORD_LENGTH);
    expect(validateSignupPasswordConfirm(pw, pw).ok).toBe(true);
    expect(validateSignupPasswordConfirm(pw, 'different').ok).toBe(false);
  });
});
