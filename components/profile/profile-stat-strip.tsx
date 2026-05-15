import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing, authTypography } from '@/constants/auth-theme';

export type ProfileStatStripProps = {
  currentStreak: number;
  longestStreak: number;
  /** Shown as middle column (all saves for owner, public-only for others). */
  detectionCount: number;
  /** Distinct species (latin_name) matching detectionCount scope. */
  speciesCount: number;
  /** e.g. "All identifications" vs "Public gallery" */
  detectionCaption?: string;
  mutedColor: string;
  accentColor: string;
};

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function StatCell({
  value,
  label,
  sublabel,
  mutedColor,
  accentColor,
}: {
  value: string;
  label: string;
  sublabel?: string;
  mutedColor: string;
  accentColor: string;
}) {
  return (
    <View style={styles.cell}>
      <ThemedText type="defaultSemiBold" style={[styles.value, { color: accentColor }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.label, { color: mutedColor }]}>{label}</ThemedText>
      {sublabel ? (
        <ThemedText style={[styles.sublabel, { color: mutedColor }]} numberOfLines={1}>
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
  detectionCount,
  speciesCount,
  detectionCaption,
  mutedColor,
  accentColor,
}: ProfileStatStripProps) {
  return (
    <View style={styles.row}>
      <StatCell
        value={formatCount(currentStreak)}
        label="Streak"
        sublabel={longestStreak > 0 ? `Best ${formatCount(longestStreak)}` : undefined}
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
      <View style={styles.divider} />
      <StatCell
        value={formatCount(detectionCount)}
        label="Detections"
        sublabel={detectionCaption}
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
      <View style={styles.divider} />
      <StatCell
        value={formatCount(speciesCount)}
        label="Species"
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
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
    marginTop: authSpacing.md,
    paddingVertical: authSpacing.sm,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: authSpacing.xs,
  },
});
