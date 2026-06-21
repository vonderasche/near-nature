import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';

export type ProfileStatStripProps = {
  currentStreak: number;
  longestStreak: number;
  /** Shown as middle column — sum of detection points (all saves for owner, public-only for others). */
  pointsTotal: number;
  /** Distinct species (latin_name) matching points scope. */
  speciesCount: number;
  /** e.g. "All saves" vs "Public saves" */
  pointsCaption?: string;
};

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function StatCell({
  value,
  label,
  sublabel,
}: {
  value: string;
  label: string;
  sublabel?: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.cell, { gap: 2, paddingHorizontal: theme.spacing.xs }]}>
      <ThemedText type="defaultSemiBold" style={[styles.value, { color: theme.colors.textPrimary }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</ThemedText>
      {sublabel ? (
        <ThemedText style={[styles.sublabel, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {sublabel}
        </ThemedText>
      ) : null}
    </View>
  );
}

/**
 * Instagram-style stat row: bold number, muted label (optional sublabel under streak).
 */
export function ProfileStatStrip({
  currentStreak,
  longestStreak,
  pointsTotal,
  speciesCount,
  pointsCaption,
}: ProfileStatStripProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          marginTop: theme.spacing.xs,
          marginBottom: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        },
      ]}>
      <StatCell
        value={formatCount(currentStreak)}
        label="Streak"
        sublabel={longestStreak > 0 ? `Best ${formatCount(longestStreak)}` : undefined}
      />
      <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: theme.spacing.xs }]} />
      <StatCell value={formatCount(pointsTotal)} label="Points" sublabel={pointsCaption} />
      <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: theme.spacing.xs }]} />
      <StatCell value={formatCount(speciesCount)} label="Species" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sublabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
