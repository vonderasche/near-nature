import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { IdentificationHistorySection } from '@/components/identification/identification-history-section';
import { IdentificationPhotoSection } from '@/components/identification/identification-photo-section';
import { IdentificationSpeciesResultsList } from '@/components/identification/identification-species-results-list';
import { UploadToDatabaseButton } from '@/components/identification/upload-to-database-button';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { LoadingHintRow } from '@/components/screen/loading-hint-row';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { DEFAULT_USER_STATE } from '@/hooks/useIdentificationRouteParams';
import { useIdentificationResultsState } from '@/hooks/useIdentificationResultsState';
import { useIdentifications } from '@/hooks/useIdentifications';
import { useSaveDetection } from '@/hooks/useSaveDetection';
import { useSpeciesIdentification } from '@/hooks/useSpeciesIdentification';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

type Props = {
  photoUri: string;
  onRetake: () => void;
};

export function CameraIdentificationPanel({ photoUri, onRetake }: Props) {
  const insets = useSafeAreaInsets();
  const userState = DEFAULT_USER_STATE;
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

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

  const handleSaveIdentification = useCallback(async () => {
    if (!userId || species.length === 0 || classifications.length === 0) return;
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
      setSaveNotice('This identification was saved to your history.');
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

  return (
    <>
      <View style={[styles.root, contentInsetsPadding(insets)]}>
        <ScreenHeading
          title="Identification"
          subtitle="We analyze your photo here. Nothing is saved unless you choose Save."
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

          <IdentificationSpeciesResultsList
            species={species}
            identifying={identifying}
            identifyError={identifyError}
            wikiByLatinName={wikiByLatinName}
          />

          <IdentificationHistorySection historyLoading={historyLoading} identifications={identifications} />
        </ScrollView>

        <View style={styles.footer}>
          {species.length > 0 && !identifying ? (
            <View style={styles.footerActions}>
              <View style={styles.footerHalf}>
                <AuthButton fillParent variant="outline" title="Retake" onPress={onRetake} />
              </View>
              <View style={styles.footerHalf}>
                <UploadToDatabaseButton
                  fillParent
                  onPress={handleSaveIdentification}
                  disabled={!userId || saving}
                  loading={saving}
                />
              </View>
            </View>
          ) : (
            <AuthButton variant="outline" title="Retake" onPress={onRetake} />
          )}
          {species.length > 0 && !identifying && !userId ? (
            <Text style={styles.saveHint}>Sign in to save identifications to your account.</Text>
          ) : null}
        </View>
      </View>
      <ThemedMessageModal
        visible={saveNotice !== null}
        title="Saved"
        message={saveNotice ?? ''}
        onDismiss={() => setSaveNotice(null)}
      />
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
