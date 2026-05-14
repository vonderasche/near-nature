import { authSpacing } from '@/constants/auth-theme';

/** Matches tab content screens: safe area + small breathing room (see identification results). */
export function contentInsetsPadding(insets: { top: number; bottom: number }) {
  return {
    paddingTop: insets.top + authSpacing.sm,
    paddingBottom: insets.bottom + authSpacing.sm,
  };
}

/** Bottom bar above home indicator; ensures at least `minPadding` when inset is zero. */
export function bottomToolbarPadding(insets: { bottom: number }, minPadding = authSpacing.md) {
  return { paddingBottom: Math.max(insets.bottom, minPadding) };
}
