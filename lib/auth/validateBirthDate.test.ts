import { describe, expect, it } from 'vitest';

import {
  MIN_SIGNUP_AGE_YEARS,
  isSignupMinor,
  validateBirthDateIso,
  validateBirthDateParts,
} from '@/lib/auth/validateBirthDate';

describe('validateBirthDateParts', () => {
  it('accepts someone old enough', () => {
    const result = validateBirthDateParts('1', '15', '1990');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.isoDate).toBe('1990-01-15');
  });

  it('rejects under minimum age', () => {
    const year = String(new Date().getFullYear() - (MIN_SIGNUP_AGE_YEARS - 1));
    const result = validateBirthDateParts('6', '1', year);
    expect(result.ok).toBe(false);
  });

  it('rejects invalid dates', () => {
    expect(validateBirthDateParts('2', '30', '2000').ok).toBe(false);
  });

  it('validates ISO strings', () => {
    expect(validateBirthDateIso('1990-01-15').ok).toBe(true);
    expect(validateBirthDateIso('not-a-date').ok).toBe(false);
  });

  it('detects minors for parental notice', () => {
    const year = String(new Date().getFullYear() - 15);
    const result = validateBirthDateParts('6', '1', year);
    expect(result.ok).toBe(true);
    if (result.ok) expect(isSignupMinor(result.isoDate)).toBe(true);
  });
});
