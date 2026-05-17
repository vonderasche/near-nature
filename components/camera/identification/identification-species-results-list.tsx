import { Text } from 'react-native';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { SpeciesResultCard } from '@/components/camera/identification/species-result-card';
import { listSectionSupportingStyles } from '@/components/shared/list-detail-card';
import type { Species } from '@/types';

import { IdentificationSpeciesWikiBody } from './identification-species-wiki-body';

type Props = {
  species: Species[];
  identifying: boolean;
  identifyError: string | null;
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
};

export function IdentificationSpeciesResultsList({
  species,
  identifying,
  identifyError,
  wikiByLatinName,
}: Props) {
  return (
    <>
      {!identifying && species.length === 0 && !identifyError ? (
        <Text style={listSectionSupportingStyles.muted}>No species returned.</Text>
      ) : null}

      {species.map((s) => (
        <SpeciesResultCard
          key={s.id}
          commonName={s.commonName}
          latinName={s.latinName}
          meta={`${s.taxonGroup} · ${s.status}`}>
          <IdentificationSpeciesWikiBody latinName={s.latinName} wikiByLatinName={wikiByLatinName} />
        </SpeciesResultCard>
      ))}
    </>
  );
}

