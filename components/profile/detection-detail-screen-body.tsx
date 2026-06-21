import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { DetectionGalleryDetailContent } from '@/components/profile/detection-gallery-detail-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { clearStagedGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import { routePublicUserProfile } from '@/lib/routing/routes';
import { useDetectionDetail, type UseDetectionDetailOptions } from '@/hooks/useDetectionDetail';
import { useTheme } from '@/hooks/useTheme';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

type Props = {
  detectionId: string | undefined;
  deletable?: boolean;
  deletingId?: string | null;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  onDeleted?: () => void | Promise<void>;
  showMemberProfileLink?: boolean;
  doneLabel?: string;
  fetchOptions?: UseDetectionDetailOptions;
};

export function DetectionDetailScreenBody({
  detectionId,
  deletable = false,
  deletingId = null,
  onDeleteItem,
  onDeleted,
  showMemberProfileLink = false,
  doneLabel = 'Back to gallery',
  fetchOptions,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { item, isLoading, error } = useDetectionDetail(detectionId, fetchOptions);

  if (!detectionId) {
    return (
      <Screen>
        <StackScreenHeader title="Identification" />
        <Text variant="subtitle" color="secondary">
          This identification is no longer available. Go back and open it again from the gallery.
        </Text>
      </Screen>
    );
  }

  if (isLoading && !item) {
    return (
      <Screen>
        <StackScreenHeader title="Identification" />
        <View style={{ paddingVertical: theme.spacing.lg, alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.textPrimary} accessibilityLabel="Loading identification" />
        </View>
      </Screen>
    );
  }

  if (!item || error) {
    return (
      <Screen>
        <StackScreenHeader title="Identification" />
        <Text variant="subtitle" color="secondary">
          {error ?? 'This identification is no longer available. Go back and open it again from the gallery.'}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <StackScreenHeader title="Identification" />
      <DetectionGalleryDetailContent
        item={item}
        deletable={deletable}
        deleteBusy={deletingId === item.id}
        onRequestDelete={
          deletable && onDeleteItem
            ? async (row) => {
                const result = await onDeleteItem(row);
                if (result.ok) {
                  clearStagedGalleryItem(row.id);
                  await onDeleted?.();
                }
                return result;
              }
            : undefined
        }
        onDone={() => router.back()}
        doneLabel={doneLabel}
        onViewMemberProfile={
          showMemberProfileLink
            ? (userId) => router.push(routePublicUserProfile(userId) as unknown as Href)
            : undefined
        }
      />
    </Screen>
  );
}
