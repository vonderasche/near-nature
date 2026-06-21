import { useRouter, type Href } from 'expo-router';

import { DetectionGalleryDetailContent } from '@/components/profile/detection-gallery-detail-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { clearStagedGalleryItem, getStagedGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import { routePublicUserProfile } from '@/lib/routing/routes';
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
};

export function DetectionDetailScreenBody({
  detectionId,
  deletable = false,
  deletingId = null,
  onDeleteItem,
  onDeleted,
  showMemberProfileLink = false,
  doneLabel = 'Back to gallery',
}: Props) {
  const router = useRouter();
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
