import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExploreErrorState } from '@/components/explore/explore-error-state';
import { ListDetailCard, listSectionSupportingStyles } from '@/components/screen/list-detail-card';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useExploreParkDetail } from '@/hooks/useExploreParkDetail';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { paramToString } from '@/lib/routing/searchParams';

export default function DiscoverParkDetailScreen() {
  const raw = useLocalSearchParams<{ parkId?: string | string[] }>().parkId;
  const parkId = paramToString(raw);
  const insets = useSafeAreaInsets();
  const { park, species, isLoading, error, refetch } = useExploreParkDetail(parkId);
  const { refreshControl } = useRefreshControl(refetch, { tintColor: authColors.text });

  if (!parkId) {
    return (
      <View style={styles.pad}>
        <Text style={listSectionSupportingStyles.muted}>Missing park id.</Text>
      </View>
    );
  }

  if (isLoading && !park) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={authColors.textMuted} />
      </View>
    );
  }

  if (error || !park) {
    return (
      <View style={styles.pad}>
        <ExploreErrorState message={error ?? 'Park not found.'} onRetry={() => void refetch()} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + authSpacing.lg }]}
      refreshControl={refreshControl}>
      <ListDetailCard
        title={park.name}
        subtitle={park.county}
        meta={park.description ?? `${park.totalSpecies} species on record`}
      />
      <Text style={[styles.sectionTitle, { color: authColors.textMuted }]}>Species at this park</Text>
      {species.length === 0 ? (
        <Text style={listSectionSupportingStyles.muted}>No species listed yet.</Text>
      ) : (
        species.map((row) => (
          <ListDetailCard
            key={`${row.latinName}-${row.category}`}
            title={row.commonName}
            subtitle={row.latinName}
            meta={`${row.category} · ${row.observationsCount.toLocaleString()} obs${row.isInExplore ? ' · In top list' : ''}`}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: authSpacing.lg,
    gap: authSpacing.sm,
  },
  pad: {
    padding: authSpacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.background,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: authSpacing.md,
    marginBottom: authSpacing.xs,
  },
});
