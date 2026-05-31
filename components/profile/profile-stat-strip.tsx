import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

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
  return (
    <View style={styles.cell}>
      <ThemedText type="defaultSemiBold" style={styles.value}>
        {value}
      </ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {sublabel ? (
        <ThemedText style={styles.sublabel} numberOfLines={1}>
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
  return (
    <View style={styles.row}>
      <StatCell
        value={formatCount(currentStreak)}
        label="Streak"
        sublabel={longestStreak > 0 ? `Best ${formatCount(longestStreak)}` : undefined}
      />
      <View style={styles.divider} />
      <StatCell value={formatCount(pointsTotal)} label="Points" sublabel={pointsCaption} />
      <View style={styles.divider} />
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
    marginTop: authSpacing.xs,
    marginBottom: authSpacing.xs,
    paddingVertical: authSpacing.xs,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: authSpacing.xs,
  },
  value: {
    ...authTypography.body,
    fontSize: 20,
    fontWeight: '700',
    color: authColors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: authColors.textMuted,
  },
  sublabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
    color: authColors.textMuted,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: authColors.border,
    marginVertical: authSpacing.xs,
  },
});
