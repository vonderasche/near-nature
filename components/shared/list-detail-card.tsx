import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useTheme } from '@/hooks/useTheme';

export type ListDetailCardProps = {
  /** Primary line (e.g. common name or username). */
  title: string;
  /** Secondary line, italic muted (e.g. Latin name or motto). */
  subtitle?: string | null;
  /** Optional body copy (e.g. saved description or Wikipedia summary). */
  description?: string | null;
  /** Tertiary line, muted (e.g. timestamp or detection count). */
  meta?: string | null;
  /** Renders to the left of the text block (e.g. Explorer Board avatar). */
  leading?: ReactNode;
  /** Top-right badge (e.g. Explorer Board rank). */
  cornerBadge?: string | null;
  /** Borderless elevated surface (identification results). */
  surface?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  children?: ReactNode;
};

/**
 * List row used by identification results and other stacked summaries.
 * Default keeps a bordered look for legacy screens; pass `surface` for borderless cards.
 */
export function ListDetailCard({
  title,
  subtitle,
  description,
  meta,
  leading,
  cornerBadge,
  surface = false,
  onPress,
  onLongPress,
  delayLongPress,
  accessibilityHint,
  accessibilityLabel,
  children,
}: ListDetailCardProps) {
  const { theme } = useTheme();
  const subtitleTrimmed = subtitle?.trim();
  const descriptionTrimmed = description?.trim();
  const metaTrimmed = meta?.trim();
  const body = (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitleTrimmed ? <Text style={styles.subtitle}>{subtitleTrimmed}</Text> : null}
      {descriptionTrimmed ? (
        <Text style={styles.description} numberOfLines={3}>
          {descriptionTrimmed}
        </Text>
      ) : null}
      {metaTrimmed ? <Text style={styles.meta}>{metaTrimmed}</Text> : null}
      {children}
    </>
  );

  const cornerTrimmed = cornerBadge?.trim();

  const cardStyle = surface
    ? {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
      }
    : styles.card;

  const content = (
    <>
      {cornerTrimmed ? <Text style={styles.cornerBadge}>{cornerTrimmed}</Text> : null}
      {leading ? (
        <View style={[styles.leaderRow, cornerTrimmed && styles.rowWithCornerBadge]}>
          <View style={styles.leadingWrap}>{leading}</View>
          <View style={styles.bodyFlex}>{body}</View>
        </View>
      ) : (
        <View style={cornerTrimmed ? styles.rowWithCornerBadge : undefined}>{body}</View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={delayLongPress}
        style={({ pressed }) => [cardStyle, pressed && styles.cardPressed]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {content}
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
  cardPressed: {
    opacity: 0.88,
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
  description: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginTop: authSpacing.xs,
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginTop: authSpacing.xs,
  },
});
