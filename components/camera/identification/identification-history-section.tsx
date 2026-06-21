import { useState } from 'react';
import { Text } from 'react-native';

import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import { DetectionGalleryListItem } from '@/components/profile/detection-gallery-list-item';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { SectionLabel } from '@/components/shared/section-label';
import { listSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { authColors } from '@/constants/auth-theme';
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
  const [selected, setSelected] = useState<DetectionGalleryItem | null>(null);

  return (
    <>
      {hideLabel ? null : <SectionLabel label="Your identifications" spaced />}
      {historyLoading ? (
        <CenteredActivityIndicator
          color={authColors.textMuted}
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
              onPress={() => setSelected(row.galleryItem)}
            />
          ))
      )}
      <DetectionGalleryDetailModal
        visible={selected !== null}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

