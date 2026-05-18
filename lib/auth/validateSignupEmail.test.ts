import { describe, expect, it } from 'vitest';

import { isEmailReadyForAvailabilityCheck, validateSignupEmail } from '@/lib/auth/validateSignupEmail';

describe('validateSignupEmail', () => {
  it('accepts a normal address', () => {
    expect(validateSignupEmail('you@example.com').ok).toBe(true);
  });

  it('rejects empty and malformed', () => {
    expect(validateSignupEmail('').ok).toBe(false);
    expect(validateSignupEmail('bad').ok).toBe(false);
    expect(validateSignupEmail('a@b').ok).toBe(false);
    expect(validateSignupEmail('missing-at.com').ok).toBe(false);
  });

  it('gates availability checks', () => {
    expect(isEmailReadyForAvailabilityCheck('you@example.com')).toBe(true);
    expect(isEmailReadyForAvailabilityCheck('x@y')).toBe(false);
  });
});
