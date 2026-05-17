import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export type ListDetailCardProps = {
  /** Primary line (e.g. common name or username). */
  title: string;
  /** Secondary line, italic muted (e.g. Latin name or motto). */
  subtitle?: string | null;
  /** Tertiary line, muted (e.g. timestamp or detection count). */
  meta?: string | null;
  /** Renders to the left of the text block (e.g. leaderboard avatar). */
  leading?: ReactNode;
  /** Top-right badge (e.g. explorer board rank). */
  cornerBadge?: string | null;
  children?: ReactNode;
};

/**
 * Bordered list row used by identification results and other stacked summaries
 * (same look as the original {@link SpeciesResultCard}).
 */
export function ListDetailCard({ title, subtitle, meta, leading, cornerBadge, children }: ListDetailCardProps) {
  const subtitleTrimmed = subtitle?.trim();
  const metaTrimmed = meta?.trim();
  const body = (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitleTrimmed ? <Text style={styles.subtitle}>{subtitleTrimmed}</Text> : null}
      {metaTrimmed ? <Text style={styles.meta}>{metaTrimmed}</Text> : null}
      {children}
    </>
  );

  const cornerTrimmed = cornerBadge?.trim();

  return (
    <View style={styles.card}>
      {cornerTrimmed ? <Text style={styles.cornerBadge}>{cornerTrimmed}</Text> : null}
      {leading ? (
        <View style={[styles.leaderRow, cornerTrimmed && styles.rowWithCornerBadge]}>
          <View style={styles.leadingWrap}>{leading}</View>
          <View style={styles.bodyFlex}>{body}</View>
        </View>
      ) : (
        <View style={cornerTrimmed ? styles.rowWithCornerBadge : undefined}>{body}</View>
      )}
    </View>
  );
}

/** Shared empty / supporting copy for list sections (matches identification history). */
export const listSectionSupportingStyles = StyleSheet.create({
  muted: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.sm,
  },
  centered: {
    paddingVertical: authSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    marginBottom: authSpacing.sm,
  },
  cornerBadge: {
    position: 'absolute',
    top: authSpacing.sm,
    right: authSpacing.sm,
    zIndex: 1,
    ...authTypography.label,
    color: authColors.textMuted,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.md,
  },
  rowWithCornerBadge: {
    paddingRight: authSpacing.lg,
  },
  leadingWrap: {
    flexShrink: 0,
  },
  bodyFlex: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  subtitle: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginTop: authSpacing.xs,
  },
});
