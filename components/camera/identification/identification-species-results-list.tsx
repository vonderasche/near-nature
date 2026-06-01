import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { SpeciesResultCard } from '@/components/camera/identification/species-result-card';
import { AuthButton } from '@/components/auth/auth-button';
import { listSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { getSpeciesSubcategoryLabel } from '@/constants/species-subcategories';
import type { Species } from '@/types';

import { IdentificationSpeciesWikiBody } from './identification-species-wiki-body';

type Props = {
  species: Species[];
  identifying: boolean;
  identifyError: string | null;
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

function wikiDescription(
  latinName: string,
  wikiByLatinName: Record<string, SpeciesWikiData | null>,
): string | null {
  const text = wikiByLatinName[latinName]?.description?.trim();
  return text && text.length > 0 ? text : null;
}

function speciesMeta(s: Species, isTopMatch: boolean): string {
  const group = getSpeciesSubcategoryLabel(s.taxonGroup);
  if (isTopMatch) {
    return `Top match · ${group} · ${s.status}`;
  }
  return `${group} · ${s.status}`;
}

export function IdentificationSpeciesResultsList({
  species,
  identifying,
  identifyError,
  wikiByLatinName,
  selectedIndex,
  onSelectIndex,
}: Props) {
  const [showAlternates, setShowAlternates] = useState(false);

  useEffect(() => {
    setShowAlternates(false);
  }, [species]);

  if (!identifying && species.length === 0 && !identifyError) {
    return <Text style={listSectionSupportingStyles.muted}>No species returned.</Text>;
  }

  if (species.length === 0) {
    return null;
  }

  const safeIndex = Math.min(Math.max(0, selectedIndex), species.length - 1);
  const primary = species[safeIndex]!;
  const hasAlternates = species.length > 1;

  if (showAlternates && hasAlternates) {
    return (
      <View style={styles.alternatesWrap}>
        <Text style={styles.alternatesHeading}>Other matches</Text>
        <Text style={styles.alternatesHint}>Tap a species to use it when you save.</Text>
        {species.map((s, index) => {
          const selected = index === safeIndex;
          return (
            <SpeciesResultCard
              key={s.id}
              commonName={s.commonName}
              latinName={s.latinName}
              description={wikiDescription(s.latinName, wikiByLatinName)}
              meta={speciesMeta(s, index === 0)}
              onPress={() => {
                onSelectIndex(index);
                setShowAlternates(false);
              }}>
              {selected ? <Text style={styles.selectedMark}>Selected for save</Text> : null}
              {index < 1 ? (
                <IdentificationSpeciesWikiBody
                  latinName={s.latinName}
                  wikiByLatinName={wikiByLatinName}
                  omitDescription
                />
              ) : null}
            </SpeciesResultCard>
          );
        })}
        <AuthButton
          variant="outline"
          title="Back to top match"
          onPress={() => {
            onSelectIndex(0);
            setShowAlternates(false);
          }}
          fillParent
        />
      </View>
    );
  }

  return (
    <View style={styles.primaryWrap}>
      <SpeciesResultCard
        commonName={primary.commonName}
        latinName={primary.latinName}
        description={wikiDescription(primary.latinName, wikiByLatinName)}
        meta={speciesMeta(primary, safeIndex === 0)}>
        <IdentificationSpeciesWikiBody
          latinName={primary.latinName}
          wikiByLatinName={wikiByLatinName}
          omitDescription
        />
      </SpeciesResultCard>

      {hasAlternates ? (
        <AuthButton
          variant="outline"
          title="Not this species? Choose another"
          onPress={() => setShowAlternates(true)}
          fillParent
          accessibilityHint="Shows other model matches so you can pick one before saving"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  primaryWrap: {
    gap: authSpacing.sm,
  },
  alternatesWrap: {
    gap: authSpacing.sm,
  },
  alternatesHeading: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  alternatesHint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.xs,
  },
  selectedMark: {
    ...authTypography.label,
    color: authColors.text,
    marginTop: authSpacing.xs,
  },
});
