import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { DiscoverExploreGate } from '@/components/discover/discover-explore-gate';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useDiscoverExploreState } from '@/hooks/useDiscoverExploreState';
import { ecosystemsForState } from '@/lib/explore/stateEcosystemGuides';
import { routes } from '@/lib/routing/routes';

export default function DiscoverEcosystemsScreen() {
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
  const ecosystems = canLoadExploreContent ? ecosystemsForState(exploreStateName) : [];

  return (
    <DiscoverExploreGate
      isSignedIn={isSignedIn}
      stateLoading={stateLoading}
      needsHomeState={needsHomeState}
      isGuestPreview={isGuestPreview}
      stateName={exploreStateName}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + authSpacing.lg }]}
        showsVerticalScrollIndicator>
        <Text style={[styles.kicker, { color: authColors.textMuted }]}>Regional guide</Text>
        <Text style={styles.title}>{exploreStateName} ecosystems</Text>
        {ecosystems.map((eco) => (
          <View key={eco.id} style={[styles.card, { borderColor: authColors.border }]}>
            <Text style={[styles.code, { color: authColors.textMuted }]}>{eco.code}</Text>
            <Text style={styles.cardTitle}>{eco.title}</Text>
            <Text style={[styles.cardBody, { color: authColors.textMuted }]}>{eco.description}</Text>
            <AuthButton
              title="Explore species"
              variant="outline"
              onPress={() => router.push(routes.discoverSpecies)}
            />
          </View>
        ))}
      </ScrollView>
    </DiscoverExploreGate>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: authSpacing.lg,
    gap: authSpacing.md,
  },
  kicker: {
    ...authTypography.label,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  title: {
    ...authTypography.title,
    fontSize: 24,
    color: authColors.text,
    marginBottom: authSpacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: 0,
    padding: authSpacing.md,
    gap: authSpacing.sm,
    backgroundColor: authColors.background,
  },
  code: {
    ...authTypography.label,
    fontSize: 12,
  },
  cardTitle: {
    ...authTypography.body,
    fontSize: 18,
    fontWeight: '700',
    color: authColors.text,
  },
  cardBody: {
    ...authTypography.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
