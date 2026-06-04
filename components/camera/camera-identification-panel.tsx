import { useCallback, useEffect, useState } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { IdentificationHistorySection } from '@/components/camera/identification/identification-history-section';
import { IdentificationRoutingBanner } from '@/components/camera/identification/identification-routing-banner';
import { IdentificationPhotoSection } from '@/components/camera/identification/identification-photo-section';
import { IdentificationSpeciesResultsList } from '@/components/camera/identification/identification-species-results-list';
import { UploadToDatabaseButton } from '@/components/camera/identification/upload-to-database-button';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { LoadingHintRow } from '@/components/shared/loading-hint-row';
import { ScreenHeading } from '@/components/shared/screen-heading';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useUserHomeState } from '@/hooks/useUserHomeState';
import { useIdentificationResultsState } from '@/hooks/useIdentificationResultsState';
import { useIdentifications } from '@/hooks/useIdentifications';
import { useOptimisticIdentificationSave } from '@/hooks/useOptimisticIdentificationSave';
import { useSpeciesIdentification } from '@/hooks/useSpeciesIdentification';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';
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
  const insets = useSafeAreaInsets();
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

  return (
    <>
      <View style={[styles.root, contentInsetsPadding(insets)]}>
        <ScreenHeading
          title="Identification"
          subtitle="Tap Save to keep this sighting—you'll return to the camera while it uploads."
          marginBottom={authSpacing.md}
        />

        {identifying ? <LoadingHintRow label="Running on-device models…" /> : null}

        <IdentificationRoutingBanner meta={tfliteMeta} identifying={identifying} />

        {identifyError ? <InlineFormError>{identifyError}</InlineFormError> : null}
        {historyError ? <InlineFormError>{historyError}</InlineFormError> : null}
        {wikiError ? <InlineFormError>{wikiError}</InlineFormError> : null}
        {reclassifyError ? <InlineFormError>{reclassifyError}</InlineFormError> : null}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <IdentificationPhotoSection photoUri={photoUri} />

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
          />

          <IdentificationHistorySection historyLoading={historyLoading} identifications={identifications} />
        </ScrollView>

        <View style={styles.footer}>
          {classifications.length > 0 && !identifying ? (
            <View style={styles.footerActions}>
              <View style={styles.footerHalf}>
                <AuthButton fillParent variant="outline" title="Retake" onPress={onRetake} />
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
            <AuthButton variant="outline" title="Retake" onPress={onRetake} />
          )}
          {classifications.length > 0 && !identifying && !userId ? (
            <Text style={styles.saveHint}>Sign in to save identifications to your account.</Text>
          ) : null}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
    paddingHorizontal: authSpacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: authSpacing.xl,
  },
  footerActions: {
    flexDirection: 'row',
    gap: authSpacing.sm,
  },
  footerHalf: {
    flex: 1,
    minWidth: 0,
  },
  saveHint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
  },
  footer: {
    marginTop: authSpacing.sm,
    paddingTop: authSpacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authColors.border,
    gap: authSpacing.sm,
  },
});
