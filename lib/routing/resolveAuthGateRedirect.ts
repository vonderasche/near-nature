import type { Href } from 'expo-router';

import { routes } from '@/lib/routing/routes';

const GUEST_TAB = 'explorer-board';
const AUTH_REQUIRED_TABS = new Set(['camera', 'profile']);

function isGuestAllowedSegments(segs: readonly string[]): boolean {
  if (segs[0] === 'user') return true;
  if (segs[0] === '(tabs)') {
    const tab = segs[1];
    if (!tab || tab === 'index' || tab === GUEST_TAB) return true;
  }
  if (segs[0] === '(auth)' && !segs.includes('needs-profile')) return true;
  return false;
}

export type AuthGateRedirectInput = {
  segments: readonly string[];
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
  profileGateResolved: boolean;
  hasProfile: boolean;
};

/** Target route when auth gate should redirect, or null to render current screen. */
export function resolveAuthGateRedirect(input: AuthGateRedirectInput): Href | null {
  const { segments, isAuthenticated, isPasswordRecovery, profileGateResolved, hasProfile } =
    input;
  if (segments.length === 0) return null;

  const inAuth = segments[0] === '(auth)';
  const tab = segments[1];
  const onResetPassword = segments.includes('reset-password');
  const onNeedsProfile = segments.includes('needs-profile');

  if (isPasswordRecovery && isAuthenticated && !onResetPassword) {
    return routes.resetPassword;
  }

  if (!isAuthenticated) {
    if (onNeedsProfile) return routes.login;
    if (segments[0] === '(tabs)' && tab && AUTH_REQUIRED_TABS.has(tab)) {
      return routes.login;
    }
    if (isGuestAllowedSegments(segments)) return null;
    if (!inAuth) return routes.explorerBoardTab;
    return null;
  }

  if (isAuthenticated && !isPasswordRecovery) {
    if (!profileGateResolved) return null;
    if (!hasProfile && !onNeedsProfile) return routes.needsProfile;
    return null;
  }

  if (isAuthenticated && hasProfile && inAuth && !onResetPassword && !onNeedsProfile) {
    return routes.tabs;
  }

  return null;
}
