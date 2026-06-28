import { ScrollView, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { UsRegionMap } from '@/components/profile/us-region-map';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { useAuthContext } from '@/context/AuthContext';
import { useRegionContext } from '@/context/RegionContext';
import { useTheme } from '@/hooks/useTheme';
import { routes } from '@/lib/routing/routes';
import { statesInRegion } from '@/constants/regions';
import { usStateLabel } from '@/constants/us-states';

export default function ProfileRegionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { activeRegion, setRegionManual, clearManualOverride } = useRegionContext();

  if (!authLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  const stateLabels = statesInRegion(activeRegion.regionId)
    .map((code) => usStateLabel(code))
    .join(', ');

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl, gap: theme.spacing.lg }}>
        <StackScreenHeader title="Region" />
        <Text variant="body" color="secondary">
          Your region sets which parks, species, and identification models load. Southeast is live
          for Florida testing; other regions are coming soon.
        </Text>
        <UsRegionMap activeRegionId={activeRegion.regionId} onSelectRegion={setRegionManual} />
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant="subtitle">Selected: {activeRegion.displayLabel}</Text>
          <Text variant="body" color="secondary">
            States: {stateLabels}
          </Text>
          {activeRegion.source === 'manual' ? (
            <Text variant="caption" color="secondary">
              Manually selected (overrides home state)
            </Text>
          ) : (
            <Text variant="caption" color="secondary">
              Based on your home state
            </Text>
          )}
        </View>
        <Button title="Use my home state" variant="outline" onPress={clearManualOverride} />
        <Button title="Done" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}
