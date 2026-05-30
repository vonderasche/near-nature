import { describe, expect, it } from 'vitest';

import { routes } from '@/lib/routing/routes';
import { resolveAuthGateRedirect } from '@/lib/routing/resolveAuthGateRedirect';

const signedInWithProfile = {
  isAuthenticated: true,
  isPasswordRecovery: false,
  profileGateResolved: true,
  hasProfile: true,
} as const;

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

  it('sends signed-in user with profile away from login to tabs', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(auth)', 'login'],
        ...signedInWithProfile,
      }),
    ).toBe(routes.tabs);
  });

  it('sends signed-in user with profile away from signup to tabs', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(auth)', 'signup'],
        ...signedInWithProfile,
      }),
    ).toBe(routes.tabs);
  });

  it('sends password recovery away from login to reset-password', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(auth)', 'login'],
        isAuthenticated: true,
        isPasswordRecovery: true,
        profileGateResolved: true,
        hasProfile: true,
      }),
    ).toBe(routes.resetPassword);
  });

  it('keeps signed-in user with profile on tabs', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(tabs)', 'camera'],
        ...signedInWithProfile,
      }),
    ).toBeNull();
  });

  it('waits while profile gate is unresolved', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(auth)', 'login'],
        isAuthenticated: true,
        isPasswordRecovery: false,
        profileGateResolved: false,
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

  it('allows guest on explorer board', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(tabs)', 'explorer-board'],
        isAuthenticated: false,
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBeNull();
  });

  it('allows guest on login screen', () => {
    expect(
      resolveAuthGateRedirect({
        segments: ['(auth)', 'login'],
        isAuthenticated: false,
        isPasswordRecovery: false,
        profileGateResolved: true,
        hasProfile: false,
      }),
    ).toBeNull();
  });
});
