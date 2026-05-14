import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { IdentificationHistorySection } from '@/components/identification/identification-history-section';
import { IdentificationPhotoSection } from '@/components/identification/identification-photo-section';
import { IdentificationSpeciesResultsList } from '@/components/identification/identification-species-results-list';
import { UploadToDatabaseButton } from '@/components/identification/upload-to-database-button';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { LoadingHintRow } from '@/components/screen/loading-hint-row';
import { MessageWithAction } from '@/components/screen/message-with-action';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useIdentificationRouteParams } from '@/hooks/useIdentificationRouteParams';
import { useIdentificationResultsState } from '@/hooks/useIdentificationResultsState';
import { useIdentifications } from '@/hooks/useIdentifications';
import { useSaveDetection } from '@/hooks/useSaveDetection';
import { useSpeciesIdentification } from '@/hooks/useSpeciesIdentification';
import { routes } from '@/lib/routing/routes';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

export default function IdentificationResultsScreen() {
  const insets = useSafeAreaInsets();
  const { photoUri, userState } = useIdentificationRouteParams();

  const { userId } = useAuthContext();
  const { identify, isLoading: identifying, error: identifyError } = useSpeciesIdentification();
  const {
    identifications,
    isLoading: historyLoading,
    error: historyError,
    refetch,
  } = useIdentifications({ userId: userId ?? undefined });
  const { save, saving, saveError, clearSaveError } = useSaveDetection();

  const { species, classifications, wikiByLatinName, wikiError, refreshHistory } =
    useIdentificationResultsState(photoUri, userState, identify, refetch);

  const goToCamera = useCallback(() => {
    router.replace(routes.camera);
  }, []);

  const handleSaveIdentification = useCallback(async () => {
    if (!photoUri || !userId || species.length === 0 || classifications.length === 0) return;
    clearSaveError();
    const primary = species[0];
    const wiki = wikiByLatinName[primary.latinName];
    const result = await save({
      localImageUri: photoUri,
      userId,
      species: primary,
      classification: classifications[0],
      stateCode: userState,
      description: wiki?.description ?? null,
    });
    if (result.ok) {
      Alert.alert('Saved', 'This identification was saved to your history.');
      refreshHistory();
    }
  }, [
    photoUri,
    userId,
    species,
    classifications,
    wikiByLatinName,
    userState,
    save,
    clearSaveError,
    refreshHistory,
  ]);

  if (!photoUri) {
    return (
      <View style={[styles.fill, contentInsetsPadding(insets)]}>
        <MessageWithAction
          message="Missing photo. Go back and capture again."
          actionLabel="Back to camera"
          onAction={goToCamera}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, contentInsetsPadding(insets)]}>
      <ScreenHeading
        title="Identification"
        subtitle="We analyze your photo here. Nothing is saved to your camera roll unless you choose Save."
        marginBottom={authSpacing.md}
      />

      {identifying ? <LoadingHintRow label="Identifying species…" /> : null}

      {identifyError ? <InlineFormError>{identifyError}</InlineFormError> : null}
      {historyError ? <InlineFormError>{historyError}</InlineFormError> : null}
      {saveError ? <InlineFormError>{saveError}</InlineFormError> : null}
      {wikiError ? <InlineFormError>{wikiError}</InlineFormError> : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <IdentificationPhotoSection photoUri={photoUri} />

        {species.length > 0 && !identifying ? (
          <View style={styles.saveRow}>
            <UploadToDatabaseButton
              onPress={handleSaveIdentification}
              disabled={!userId || saving}
              loading={saving}
            />
            {!userId ? (
              <Text style={styles.saveHint}>Sign in to upload identifications to your account.</Text>
            ) : null}
          </View>
        ) : null}

        <IdentificationSpeciesResultsList
          species={species}
          identifying={identifying}
          identifyError={identifyError}
          wikiByLatinName={wikiByLatinName}
        />

        <IdentificationHistorySection historyLoading={historyLoading} identifications={identifications} />
      </ScrollView>

      <View style={styles.footer}>
        <AuthButton variant="outline" title="Back to camera" onPress={goToCamera} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
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
  saveRow: {
    marginBottom: authSpacing.md,
    gap: authSpacing.sm,
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
