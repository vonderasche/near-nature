import { spacing } from '@/constants/design-tokens';

/** Matches tab content screens: safe area + small breathing room (see identification results). */
export function contentInsetsPadding(insets: { top: number; bottom: number }) {
  return {
    paddingTop: insets.top + spacing.sm,
    paddingBottom: insets.bottom + spacing.sm,
  };
}

/** Bottom bar above home indicator; ensures at least `minPadding` when inset is zero. */
export function bottomToolbarPadding(insets: { bottom: number }, minPadding = spacing.md) {
  return { paddingBottom: Math.max(insets.bottom, minPadding) };
}
