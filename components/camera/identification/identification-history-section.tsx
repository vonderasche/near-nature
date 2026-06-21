import { useRouter, type Href } from 'expo-router';

import { DetectionGalleryListItem } from '@/components/profile/detection-gallery-list-item';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { SectionLabel } from '@/components/shared/section-label';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { stageGalleryItem } from '@/lib/gallery/galleryItemRouteCache';
import { routeCameraDetection } from '@/lib/routing/routes';
import type { DetectionGalleryItem, Identification } from '@/types';

type Props = {
  historyLoading: boolean;
  identifications: Identification[];
  /** When true, omit the built-in section label (parent Section provides the title). */
  hideLabel?: boolean;
};

export function IdentificationHistorySection({
  historyLoading,
  identifications,
  hideLabel = false,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();

  const openItem = (item: DetectionGalleryItem) => {
    stageGalleryItem(item);
    router.push(routeCameraDetection({ detectionId: item.id }) as unknown as Href);
  };

  return (
    <>
      {hideLabel ? null : <SectionLabel label="Your identifications" spaced />}
      {historyLoading ? (
        <CenteredActivityIndicator
          color={theme.colors.textSecondary}
          accessibilityLabel="Loading identification history"
        />
      ) : identifications.length === 0 ? (
        <Text style={listSectionSupportingStyles.muted}>No saved identifications yet.</Text>
      ) : (
        identifications
          .filter((row): row is typeof row & { galleryItem: DetectionGalleryItem } =>
            Boolean(row.galleryItem),
          )
          .map((row) => (
            <DetectionGalleryListItem
              key={row.id}
              item={row.galleryItem}
              onPress={() => openItem(row.galleryItem)}
            />
          ))
      )}
    </>
  );
}
