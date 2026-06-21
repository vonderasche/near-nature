import { useLocalSearchParams, useRouter } from 'expo-router';

import { DetectionGalleryDetailContent } from '@/components/profile/detection-gallery-detail-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { getStagedGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import { routePublicUserProfile } from '@/lib/routing/routes';
import { paramToString } from '@/lib/routing/searchParams';
import type { Href } from 'expo-router';

export default function PublicUserDetectionDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ userId?: string | string[]; detectionId?: string | string[] }>();
  const userId = paramToString(params.userId);
  const detectionId = paramToString(params.detectionId);
  const item = detectionId ? getStagedGalleryItem(detectionId) : undefined;

  if (!detectionId || !item) {
    return (
      <Screen>
        <StackScreenHeader title="Identification" />
        <Text variant="subtitle" color="secondary">
          This identification is no longer available. Go back and open it again from the gallery.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <StackScreenHeader title="Identification" />
      <DetectionGalleryDetailContent
        item={item}
        onDone={() => router.back()}
        doneLabel="Back to gallery"
        onViewMemberProfile={
          userId
            ? (memberId) => router.push(routePublicUserProfile(memberId) as unknown as Href)
            : undefined
        }
      />
    </Screen>
  );
}
