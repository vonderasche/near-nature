import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ScreenSection } from '@/components/profile/screen-section';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { ExploreParkSummary } from '@/lib/explore/exploreParkTypes';
import { routes } from '@/lib/routing/routes';

type Props = {
  stateName: string;
  summary: ExploreParkSummary | null;
  hintColor: string;
  borderColor: string;
};

function StatCell({ value, label, borderColor }: { value: string; label: string; borderColor: string }) {
  return (
    <View style={[styles.statCell, { borderColor }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function DiscoverParksSection({ stateName, summary, hintColor, borderColor }: Props) {
  const router = useRouter();
  const parkCount = summary?.parkCount ?? 0;
  const near = summary?.nearbyCount;
  const sightings = summary?.speciesSightings ?? 0;

  return (
    <ScreenSection
      title="Find a spot"
      hint={`Parks and preserves across ${stateName}.`}
      hintColor={hintColor}>
      <View style={[styles.mapPlaceholder, { borderColor }]}>
        <Text style={[styles.mapHint, { color: hintColor }]}>
          {parkCount > 0
            ? `${parkCount.toLocaleString()} parks in the database`
            : 'Park data will appear after import.'}
        </Text>
        <AuthButton
          title="View all parks"
          variant="outline"
          onPress={() => router.push(routes.discoverParks)}
          fillParent
        />
      </View>
      <View style={styles.statGrid}>
        <StatCell value={String(parkCount)} label="Active parks" borderColor={borderColor} />
        <StatCell
          value={near != null ? String(near) : '—'}
          label="Near you"
          borderColor={borderColor}
        />
        <StatCell
          value={sightings >= 1000 ? `${(sightings / 1000).toFixed(1)}k` : String(sightings)}
          label="Species records"
          borderColor={borderColor}
        />
        <StatCell value="—" label="Avg rating" borderColor={borderColor} />
      </View>
    </ScreenSection>
  );
}

const styles = StyleSheet.create({
  mapPlaceholder: {
    borderWidth: 1,
    borderRadius: 0,
    padding: authSpacing.md,
    gap: authSpacing.md,
    marginBottom: authSpacing.sm,
    backgroundColor: authColors.background,
    minHeight: 120,
    justifyContent: 'center',
  },
  mapHint: {
    ...authTypography.subtitle,
    fontSize: 14,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '50%',
    borderWidth: 1,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.sm,
    alignItems: 'center',
    backgroundColor: authColors.background,
  },
  statValue: {
    ...authTypography.body,
    fontSize: 18,
    fontWeight: '700',
    color: authColors.text,
  },
  statLabel: {
    ...authTypography.label,
    fontSize: 11,
    color: authColors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },
});
