import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { SpeciesResultCard } from '@/components/camera/identification/species-result-card';
import { AuthButton } from '@/components/auth/auth-button';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useTheme } from '@/hooks/useTheme';
import { getSpeciesSubcategoryLabel } from '@/constants/species-subcategories';
import { mergeIdentificationSpecies } from '@/lib/identification/mergeIdentificationSpecies';
import type { ClassificationResult, Species } from '@/types';

import { IdentificationSpeciesWikiBody } from './identification-species-wiki-body';

type Props = {
  species: Species[];
  classifications: ClassificationResult[];
  speciesIdBase: number;
  identifying: boolean;
  identifyError: string | null;
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  alternatesEnriching: boolean;
  canReclassifyWithCloud: boolean;
  onReclassifyWithCloud: () => Promise<void>;
  /** When true, wiki copy lives in a parent About section; cards show names/meta only. */
  sectionedLayout?: boolean;
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
  classifications,
  speciesIdBase,
  identifying,
  identifyError,
  wikiByLatinName,
  selectedIndex,
  onSelectIndex,
  alternatesEnriching,
  canReclassifyWithCloud,
  onReclassifyWithCloud,
  sectionedLayout = false,
}: Props) {
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        primaryWrap: {
          gap: theme.spacing.sm,
        },
        alternatesWrap: {
          gap: theme.spacing.sm,
        },
        alternatesHeading: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.textPrimary,
        },
        alternatesHint: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.xs,
        },
        selectedMark: {
          ...theme.typography.label,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.xs,
        },
      }),
    [theme],
  );

  const [showAlternates, setShowAlternates] = useState(false);

  useEffect(() => {
    setShowAlternates(false);
  }, [classifications, speciesIdBase]);

  useEffect(() => {
    if (!canReclassifyWithCloud && classifications.length > 1) {
      setShowAlternates(true);
    }
  }, [canReclassifyWithCloud, classifications.length]);

  const handleReclassifyWithCloud = async () => {
    await onReclassifyWithCloud();
  };

  if (!identifying && classifications.length === 0 && !identifyError) {
    return <Text style={listSectionSupportingStyles.muted}>No species returned.</Text>;
  }

  if (classifications.length === 0) {
    return null;
  }

  const displaySpecies = mergeIdentificationSpecies(
    classifications,
    species,
    {},
    speciesIdBase,
  );

  const safeIndex = Math.min(Math.max(0, selectedIndex), classifications.length - 1);
  const primary = displaySpecies[safeIndex]!;
  const hasAlternateMatches = classifications.length > 1;

  if (showAlternates && hasAlternateMatches) {
    return (
      <View style={styles.alternatesWrap}>
        <Text style={styles.alternatesHeading}>Cloud identification</Text>
        <Text style={styles.alternatesHint}>Tap a species to use it when you save.</Text>
        {alternatesEnriching ? (
          <Text style={styles.alternatesHint}>Identifying with cloud AI…</Text>
        ) : null}
        {displaySpecies.map((s, index) => {
          const selected = index === safeIndex;
          return (
            <SpeciesResultCard
              key={s.id}
              commonName={s.commonName}
              latinName={s.latinName}
              description={sectionedLayout ? null : wikiDescription(s.latinName, wikiByLatinName)}
              meta={speciesMeta(s, index === 0)}
              surface={sectionedLayout}
              onPress={() => {
                onSelectIndex(index);
                setShowAlternates(false);
              }}>
              {selected ? <Text style={styles.selectedMark}>Selected for save</Text> : null}
              {index < 1 && !sectionedLayout ? (
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
        description={
          sectionedLayout ? null : wikiDescription(primary.latinName, wikiByLatinName)
        }
        meta={speciesMeta(primary, safeIndex === 0)}
        surface={sectionedLayout}>
        {sectionedLayout ? null : (
          <IdentificationSpeciesWikiBody
            latinName={primary.latinName}
            wikiByLatinName={wikiByLatinName}
            omitDescription
          />
        )}
      </SpeciesResultCard>

      {canReclassifyWithCloud ? (
        <AuthButton
          variant="outline"
          title={alternatesEnriching ? 'Identifying with cloud AI…' : 'Not this species? Identify with cloud AI'}
          onPress={() => void handleReclassifyWithCloud()}
          disabled={alternatesEnriching}
          fillParent
          accessibilityHint="Runs cloud species identification when the on-device match is wrong"
        />
      ) : null}
    </View>
  );
}
