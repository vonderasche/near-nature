import { describe, expect, it } from 'vitest';

import { routes } from '@/lib/routing/routes';
import { resolvePostAuthRoute } from '@/lib/routing/resolvePostAuthRoute';

describe('resolvePostAuthRoute', () => {
  it('waits until profile gate resolves', () => {
    expect(
      resolvePostAuthRoute({
        isPasswordRecovery: false,
        profileGateResolved: false,
        hasProfile: true,
      }),
    ).toBeNull();
  });

  it('sends password recovery to reset-password', () => {
    expect(
      resolvePostAuthRoute({
        isPasswordRecovery: true,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBe(routes.resetPassword);
  });

  it('sends signed-in user without profile to needs-profile', () => {
    expect(
      resolvePostAuthRoute({
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBe(routes.needsProfile);
  });

  it('sends signed-in user with profile to tabs', () => {
    expect(
      resolvePostAuthRoute({
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: true,
      }),
    ).toBe(routes.tabs);
  });
});
