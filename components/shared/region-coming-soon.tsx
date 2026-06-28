import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenCenter } from '@/components/shared/screen-center';
import { Text } from '@/components/ui/Text';
import { Title } from '@/components/ui/Title';
import { useActiveRegion, useRegionDownloadState } from '@/context/RegionContext';
import { useTheme } from '@/hooks/useTheme';
import {
  regionUnavailableMessage,
  regionUnavailableTitle,
  type RegionFeature,
} from '@/lib/region/regionReadiness';
import { routes } from '@/lib/routing/routes';

type Props = {
  feature?: RegionFeature;
  title?: string;
  message?: string;
  showProfileAction?: boolean;
};

export function RegionComingSoon({
  feature = 'discover',
  title,
  message,
  showProfileAction = true,
}: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  const { regionId } = useActiveRegion();
  const { downloadState, downloadProgress, retryDownload } = useRegionDownloadState();

  const resolvedTitle = title ?? regionUnavailableTitle(regionId, feature, downloadState);
  const resolvedMessage =
    message ?? regionUnavailableMessage(regionId, downloadState, downloadProgress);

  return (
    <ScreenCenter paddingHorizontal={theme.spacing.lg}>
      <View style={{ gap: theme.spacing.md, maxWidth: 420, alignItems: 'center' }}>
        <Title>{resolvedTitle}</Title>
        <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
          {resolvedMessage}
        </Text>
        {downloadState === 'error' ? (
          <Button title="Retry download" variant="primary" onPress={retryDownload} />
        ) : null}
        {showProfileAction ? (
          <Button
            title="Change region"
            variant="outline"
            onPress={() => router.push(routes.profileRegion as Href)}
          />
        ) : null}
      </View>
    </ScreenCenter>
  );
}
