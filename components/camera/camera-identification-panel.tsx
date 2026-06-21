import { useCallback, useEffect, useState } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { IdentificationHeroImage } from '@/components/camera/identification/identification-hero-image';
import { IdentificationHistorySection } from '@/components/camera/identification/identification-history-section';
import { IdentificationResultHeader } from '@/components/camera/identification/identification-result-header';
import { IdentificationSpeciesResultsList } from '@/components/camera/identification/identification-species-results-list';
import { IdentificationSpeciesWikiBody } from '@/components/camera/identification/identification-species-wiki-body';
import { UploadToDatabaseButton } from '@/components/camera/identification/upload-to-database-button';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useUserHomeState } from '@/hooks/useUserHomeState';
import { useIdentificationResultsState } from '@/hooks/useIdentificationResultsState';
import { useIdentifications } from '@/hooks/useIdentifications';
import { useOptimisticIdentificationSave } from '@/hooks/useOptimisticIdentificationSave';
import { useSpeciesIdentification } from '@/hooks/useSpeciesIdentification';
import { mergeIdentificationSpecies } from '@/lib/identification/mergeIdentificationSpecies';

type Props = {
  photoUri: string;
  /** Return to the live camera (retake flow). */
  onRetake: () => void;
  /** Shown on the camera screen if a background save fails after leaving this view. */
  onBackgroundSaveError?: (message: string) => void;
};

export function CameraIdentificationPanel({
  photoUri,
  onRetake,
  onBackgroundSaveError,
}: Props) {
  const { theme } = useTheme();
  const { stateCode: userState } = useUserHomeState();

  const { userId } = useAuthContext();
  const { identify, isLoading: identifying, error: identifyError } = useSpeciesIdentification();
  const {
    identifications,
    isLoading: historyLoading,
    error: historyError,
    refetch,
  } = useIdentifications({ userId: userId ?? undefined, limit: 10 });
  const { saveIdentification } = useOptimisticIdentificationSave({
    userId: userId ?? undefined,
    photoUri,
    userState,
    onRetake,
    onBackgroundSaveError,
    refetchHistory: refetch,
  });

  const {
    species,
    classifications,
    wikiByLatinName,
    wikiError,
    tfliteMeta,
    alternatesEnriching,
    reclassifyError,
    canReclassifyWithCloud,
    reclassifyWithCloud,
    speciesIdBase,
  } = useIdentificationResultsState(photoUri, userState, userId ?? undefined, identify);

  const [selectedSpeciesIndex, setSelectedSpeciesIndex] = useState(0);

  useEffect(() => {
    setSelectedSpeciesIndex(0);
  }, [photoUri, classifications]);

  const handleSaveIdentification = useCallback(() => {
    saveIdentification({
      species,
      classifications,
      wikiByLatinName,
      primaryIndex: selectedSpeciesIndex,
    });
  }, [classifications, saveIdentification, selectedSpeciesIndex, species, wikiByLatinName]);

  const safeIndex =
    classifications.length > 0
      ? Math.min(Math.max(0, selectedSpeciesIndex), classifications.length - 1)
      : 0;
  const displaySpecies =
    classifications.length > 0
      ? mergeIdentificationSpecies(classifications, species, {}, speciesIdBase)
      : [];
  const primaryLatinName = displaySpecies[safeIndex]?.latinName ?? classifications[safeIndex]?.latinName;
  const showAboutSection = Boolean(primaryLatinName) && classifications.length > 0 && !identifying;
  const showDetailsSection = classifications.length > 0 || identifying || identifyError;

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <IdentificationHeroImage photoUri={photoUri} />

        <IdentificationResultHeader
          identifying={identifying}
          classifications={classifications}
          tfliteMeta={tfliteMeta}
        />

        {identifyError ? <InlineFormError>{identifyError}</InlineFormError> : null}
        {historyError ? <InlineFormError>{historyError}</InlineFormError> : null}
        {wikiError ? <InlineFormError>{wikiError}</InlineFormError> : null}
        {reclassifyError ? <InlineFormError>{reclassifyError}</InlineFormError> : null}

        {showAboutSection && primaryLatinName ? (
          <Section title="About">
            <IdentificationSpeciesWikiBody
              latinName={primaryLatinName}
              wikiByLatinName={wikiByLatinName}
            />
          </Section>
        ) : null}

        {showDetailsSection ? (
          <Section title="Details" spaced>
            <IdentificationSpeciesResultsList
              species={species}
              classifications={classifications}
              speciesIdBase={speciesIdBase}
              identifying={identifying}
              identifyError={identifyError}
              wikiByLatinName={wikiByLatinName}
              selectedIndex={selectedSpeciesIndex}
              onSelectIndex={setSelectedSpeciesIndex}
              alternatesEnriching={alternatesEnriching}
              canReclassifyWithCloud={canReclassifyWithCloud}
              onReclassifyWithCloud={reclassifyWithCloud}
              sectionedLayout
            />
          </Section>
        ) : null}

        <Section title="Your identifications" spaced>
          <IdentificationHistorySection
            historyLoading={historyLoading}
            identifications={identifications}
            hideLabel
          />
        </Section>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}>
        {classifications.length > 0 && !identifying ? (
          <View style={[styles.footerActions, { gap: theme.spacing.sm }]}>
            <View style={styles.footerHalf}>
              <Button fillParent variant="outline" title="Retake" onPress={onRetake} />
            </View>
            <View style={styles.footerHalf}>
              <UploadToDatabaseButton
                fillParent
                onPress={handleSaveIdentification}
                disabled={!userId}
              />
            </View>
          </View>
        ) : (
          <Button variant="outline" title="Retake" onPress={onRetake} />
        )}
        {classifications.length > 0 && !identifying && !userId ? (
          <Text variant="subtitle" color="secondary" style={styles.saveHint}>
            Sign in to save identifications to your account.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  footerActions: {
    flexDirection: 'row',
  },
  footerHalf: {
    flex: 1,
    minWidth: 0,
  },
  saveHint: {
    textAlign: 'center',
  },
  footer: {},
});
