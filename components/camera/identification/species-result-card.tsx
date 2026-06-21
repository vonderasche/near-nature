import type { ReactNode } from 'react';

import { ListDetailCard } from '@/components/shared/list-detail-card';
import { galleryListItemTextFields } from '@/lib/detections/galleryListItemText';

type SpeciesResultCardProps = {
  commonName: string;
  latinName: string;
  description?: string | null;
  meta: string;
  surface?: boolean;
  onPress?: () => void;
  children?: ReactNode;
};

export function SpeciesResultCard({
  commonName,
  latinName,
  description,
  meta,
  surface = false,
  onPress,
  children,
}: SpeciesResultCardProps) {
  const { title, subtitle, description: bodyDescription } = galleryListItemTextFields({
    commonName,
    latinName,
    description,
  });

  return (
    <ListDetailCard
      title={title}
      subtitle={subtitle}
      description={bodyDescription}
      meta={meta}
      surface={surface}
      onPress={onPress}
      accessibilityLabel={`Open ${title} details`}>
      {children}
    </ListDetailCard>
  );
}
