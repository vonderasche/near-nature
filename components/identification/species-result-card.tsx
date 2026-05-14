import type { ReactNode } from 'react';

import { ListDetailCard } from '@/components/screen/list-detail-card';

type SpeciesResultCardProps = {
  commonName: string;
  latinName: string;
  meta: string;
  children?: ReactNode;
};

export function SpeciesResultCard({ commonName, latinName, meta, children }: SpeciesResultCardProps) {
  return (
    <ListDetailCard title={commonName} subtitle={latinName} meta={meta}>
      {children}
    </ListDetailCard>
  );
}
