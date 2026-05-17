import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import type { ReactElement } from 'react';
import type { RefreshControlProps } from 'react-native';

import { DiscoverFeaturedSection } from '@/components/discover/discover-featured-section';
import { DiscoverParksSection } from '@/components/discover/discover-parks-section';
import { DiscoverRegionsSection } from '@/components/discover/discover-regions-section';
import { ExploreErrorState } from '@/components/explore/explore-error-state';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { ExploreParkSummary } from '@/lib/explore/exploreParkTypes';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  stateName: string;
  featured: ExploreSpecies[];
  parkSummary: ExploreParkSummary | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function DiscoverHubContent({
  stateName,
  featured,
  parkSummary,
  isLoading,
  error,
  onRetry,
  refreshControl,
}: Props) {
  if (error) {
    return (
      <View style={styles.pad}>
        <ExploreErrorState message={error} onRetry={onRetry} retryLabel="Tap to retry" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}>
      {isLoading && featured.length === 0 ? (
        <ActivityIndicator color={authColors.textMuted} style={styles.loader} />
      ) : null}
      <DiscoverFeaturedSection
        items={featured}
        hintColor={authColors.textMuted}
        borderColor={authColors.border}
      />
      <DiscoverRegionsSection
        stateName={stateName}
        hintColor={authColors.textMuted}
        borderColor={authColors.border}
      />
      <DiscoverParksSection
        stateName={stateName}
        summary={parkSummary}
        hintColor={authColors.textMuted}
        borderColor={authColors.border}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: authSpacing.lg,
    paddingBottom: authSpacing.xl,
  },
  loader: {
    marginVertical: authSpacing.md,
  },
  pad: {
    paddingVertical: authSpacing.md,
  },
});
