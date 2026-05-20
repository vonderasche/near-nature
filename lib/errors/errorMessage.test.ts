import { describe, expect, it } from 'vitest';

import { errorMessageFromUnknown, formatSupabaseError } from './errorMessage';

describe('formatSupabaseError', () => {
  it('joins message and hint from plain postgrest-shaped objects', () => {
    expect(
      formatSupabaseError({
        message: 'function check_category_milestones(uuid) does not exist',
        hint: 'Run sql/check_category_milestones.sql',
        code: '42883',
      }),
    ).toBe(
      'function check_category_milestones(uuid) does not exist — Run sql/check_category_milestones.sql',
    );
  });
});

describe('errorMessageFromUnknown', () => {
  it('uses Error.message when present', () => {
    expect(errorMessageFromUnknown(new Error('Network failed'), 'fallback')).toBe('Network failed');
  });

  it('falls back when value has no usable fields', () => {
    expect(errorMessageFromUnknown({}, 'fallback')).toBe('fallback');
  });
});
