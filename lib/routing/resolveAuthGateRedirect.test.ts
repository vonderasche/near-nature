import { describe, expect, it } from 'vitest';

import { routes } from '@/lib/routing/routes';
import { resolveAuthGateRedirect } from '@/lib/routing/resolveAuthGateRedirect';

describe('resolveAuthGateRedirect', () => {
  it('sends signed-in user without profile to needs-profile', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(tabs)', 'camera'],
        isAuthenticated: true,
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBe(routes.needsProfile);
  });

  it('keeps user on needs-profile when profile missing', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(auth)', 'needs-profile'],
        isAuthenticated: true,
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBeNull();
  });

  it('sends guest away from camera tab to login', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(tabs)', 'camera'],
        isAuthenticated: false,
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBe(routes.login);
  });
});
