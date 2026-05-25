import type { ReactNode } from 'react';

import { ListDetailCard } from '@/components/shared/list-detail-card';

type SpeciesResultCardProps = {
  commonName: string;
  latinName: string;
  meta: string;
  onPress?: () => void;
  children?: ReactNode;
};

export function SpeciesResultCard({
  commonName,
  latinName,
  meta,
  onPress,
  children,
}: SpeciesResultCardProps) {
  return (
    <ListDetailCard
      title={commonName}
      subtitle={latinName}
      meta={meta}
      onPress={onPress}
      accessibilityLabel={`Open ${commonName} details`}>
      {children}
    </ListDetailCard>
  );
}
