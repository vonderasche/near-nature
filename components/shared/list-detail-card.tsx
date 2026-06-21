import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

/** Shared empty / supporting copy for list sections (matches identification history). */
export function useListSectionSupportingStyles() {
  const { theme } = useTheme();
  return useMemo(
    () =>
      StyleSheet.create({
        muted: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        },
        centered: {
          paddingVertical: theme.spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme],
  );
}

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
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          position: 'relative',
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
        cardPressed: {
          opacity: 0.88,
        },
        cornerBadge: {
          position: 'absolute',
          top: theme.spacing.sm,
          right: theme.spacing.sm,
          zIndex: 1,
          ...theme.typography.label,
          color: theme.colors.textSecondary,
        },
        leaderRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        rowWithCornerBadge: {
          paddingRight: theme.spacing.lg,
        },
        leadingWrap: {
          flexShrink: 0,
        },
        bodyFlex: {
          flex: 1,
          minWidth: 0,
        },
        title: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.textPrimary,
        },
        subtitle: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          fontStyle: 'italic',
        },
        description: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        meta: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
      }),
    [theme],
  );

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
        backgroundColor: theme.colors.background,
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
