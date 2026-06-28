import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ScreenCenter } from '@/components/shared/screen-center';
import { Text } from '@/components/ui/Text';
import { Title } from '@/components/ui/Title';
import { useActiveRegion } from '@/context/RegionContext';
import { useTheme } from '@/hooks/useTheme';
import { routes } from '@/lib/routing/routes';

type Props = {
  title?: string;
  message?: string;
  showProfileAction?: boolean;
};

export function RegionComingSoon({
  title,
  message,
  showProfileAction = true,
}: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  const { displayLabel } = useActiveRegion();

  return (
    <ScreenCenter paddingHorizontal={theme.spacing.lg}>
      <View style={{ gap: theme.spacing.md, maxWidth: 420, alignItems: 'center' }}>
        <Title>{title ?? 'Coming soon'}</Title>
        <Text variant="body" color="secondary" style={{ textAlign: 'center' }}>
          {message ??
            `${displayLabel} parks, species, and identification models are not available yet. Change your region in Profile when Southeast is live for Florida.`}
        </Text>
        {showProfileAction ? (
          <Button
            title="Open Profile"
            variant="outline"
            onPress={() => router.push(routes.profileRegion as Href)}
          />
        ) : null}
      </View>
    </ScreenCenter>
  );
}
