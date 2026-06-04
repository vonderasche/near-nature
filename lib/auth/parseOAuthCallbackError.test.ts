import { describe, expect, it } from 'vitest';

import { parseOAuthCallbackError } from '@/lib/auth/parseOAuthCallbackError';

describe('parseOAuthCallbackError', () => {
  it('returns null when no error params', () => {
    expect(parseOAuthCallbackError('nearnature://auth/callback?code=abc')).toBeNull();
  });

  it('reads error_description from hash', () => {
    expect(
      parseOAuthCallbackError(
        'nearnature://auth/callback#error=server_error&error_description=Provider%20misconfigured',
      ),
    ).toBe('Provider misconfigured');
  });

  it('maps access_denied', () => {
    expect(parseOAuthCallbackError('nearnature://auth/callback?error=access_denied')).toBe(
      'Google sign-in was declined.',
    );
  });
});
