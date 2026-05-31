import { useState } from 'react';
import { Text } from 'react-native';

import { SpeciesResultCard } from '@/components/camera/identification/species-result-card';
import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { SectionLabel } from '@/components/shared/section-label';
import { listSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import type { DetectionGalleryItem, Identification } from '@/types';

type Props = {
  historyLoading: boolean;
  identifications: Identification[];
};

export function IdentificationHistorySection({ historyLoading, identifications }: Props) {
  const [selected, setSelected] = useState<DetectionGalleryItem | null>(null);

  return (
    <>
      <SectionLabel label="Your identifications" spaced />
      {historyLoading ? (
        <CenteredActivityIndicator
          color={authColors.textMuted}
          accessibilityLabel="Loading identification history"
        />
      ) : identifications.length === 0 ? (
        <Text style={listSectionSupportingStyles.muted}>No saved identifications yet.</Text>
      ) : (
        identifications.map((row) => (
          <SpeciesResultCard
            key={row.id}
            commonName={row.species.commonName}
            latinName={row.species.latinName}
            meta={new Date(row.timestamp).toLocaleString()}
            onPress={row.galleryItem ? () => setSelected(row.galleryItem!) : undefined}
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

