import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverExploreGate } from '@/components/discover/discover-explore-gate';
import { ExploreErrorState } from '@/components/explore/explore-error-state';
import { ListDetailCard, listSectionSupportingStyles } from '@/components/screen/list-detail-card';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useDiscoverExploreState } from '@/hooks/useDiscoverExploreState';
import { useExploreParks } from '@/hooks/useExploreParks';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { routeDiscoverPark } from '@/lib/routing/routes';

export default function DiscoverParksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    exploreStateName,
    isSignedIn,
    stateLoading,
    needsHomeState,
    isGuestPreview,
    canLoadExploreContent,
  } = useDiscoverExploreState();
  const { parks, isLoading, error, refetch } = useExploreParks(
    canLoadExploreContent ? exploreStateName : null,
  );
  const { refreshControl } = useRefreshControl(refetch, { tintColor: authColors.text });

  return (
    <DiscoverExploreGate
      isSignedIn={isSignedIn}
      stateLoading={stateLoading}
      needsHomeState={needsHomeState}
      isGuestPreview={isGuestPreview}
      stateName={exploreStateName}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + authSpacing.lg }]}
        refreshControl={refreshControl}>
        {error ? <ExploreErrorState message={error} onRetry={() => void refetch()} /> : null}
        {isLoading && parks.length === 0 ? (
          <ActivityIndicator color={authColors.textMuted} />
        ) : null}
        {parks.length === 0 && !isLoading && !error ? (
          <Text style={listSectionSupportingStyles.muted}>No parks listed for this state yet.</Text>
        ) : null}
        {parks.map((park) => (
          <Pressable
            key={park.id}
            onPress={() => router.push(routeDiscoverPark(park.id))}
            style={({ pressed }) => pressed && styles.pressed}>
            <ListDetailCard
              title={park.name}
              subtitle={park.county}
              meta={`${park.totalSpecies} species · ${park.birdCount} birds · ${park.mammalCount} mammals`}
            />
          </Pressable>
        ))}
      </ScrollView>
    </DiscoverExploreGate>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: authSpacing.lg,
    gap: authSpacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
});
