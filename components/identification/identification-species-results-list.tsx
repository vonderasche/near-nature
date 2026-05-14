import { StyleSheet, Text } from 'react-native';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { SpeciesResultCard } from '@/components/identification/species-result-card';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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
        <Text style={styles.muted}>No species returned.</Text>
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

const styles = StyleSheet.create({
  muted: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.sm,
  },
});
