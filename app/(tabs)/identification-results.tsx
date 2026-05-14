import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { fetchSpeciesWikiData } from '@/api/wikipedia';
import { AuthButton } from '@/components/auth/auth-button';
import { UploadToDatabaseButton } from '@/components/identification/upload-to-database-button';
import { SpeciesResultCard } from '@/components/identification/species-result-card';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { LoadingHintRow } from '@/components/screen/loading-hint-row';
import { MessageWithAction } from '@/components/screen/message-with-action';
import { ScreenHeading } from '@/components/screen/screen-heading';
import { SectionLabel } from '@/components/screen/section-label';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useIdentifications } from '@/hooks/useIdentifications';
import { useSaveDetection } from '@/hooks/useSaveDetection';
import { useSpeciesIdentification } from '@/hooks/useSpeciesIdentification';
import { normalizePhotoUri, paramToString } from '@/lib/routing/searchParams';
import type { ClassificationResult, Species } from '@/types';

const DEFAULT_USER_STATE = process.env.EXPO_PUBLIC_USER_STATE ?? 'FL';

export default function IdentificationResultsScreen() {
  const insets = useSafeAreaInsets();
  const { uri, userState: userStateParam } = useLocalSearchParams<{
    uri?: string | string[];
    userState?: string | string[];
  }>();
  const photoUri = normalizePhotoUri(paramToString(uri));
  const userState = paramToString(userStateParam) ?? DEFAULT_USER_STATE;

  const { userId } = useAuthContext();
  const { identify, isLoading: identifying, error: identifyError } = useSpeciesIdentification();
  const {
    identifications,
    isLoading: historyLoading,
    error: historyError,
    refetch,
  } = useIdentifications({ userId: userId ?? undefined });
  const { save, saving, saveError, clearSaveError } = useSaveDetection();

  const [species, setSpecies] = useState<Species[]>([]);
  const [classifications, setClassifications] = useState<ClassificationResult[]>([]);
  const [wikiByLatinName, setWikiByLatinName] = useState<Record<string, SpeciesWikiData | null>>({});
  const [wikiError, setWikiError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUri) return;
    let cancelled = false;
    (async () => {
      const results = await identify(photoUri, userState);
      if (!cancelled) {
        setSpecies(results.species);
        setClassifications(results.classifications);
        refetch();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [photoUri, userState, identify, refetch]);

  useEffect(() => {
    if (species.length === 0) return;
    let cancelled = false;

    (async () => {
      if (__DEV__) console.log('[results] wiki fetch begin', species.map((s) => s.latinName));
      const toFetch = species
        .slice(0, 3)
        .map((s) => ({ latinName: s.latinName, commonName: s.commonName }))
        .filter((s) => Boolean(s.latinName));
      const entries = await Promise.all(
        toFetch.map(async ({ latinName, commonName }) => {
          try {
            const data =
              (await fetchSpeciesWikiData(latinName)) ??
              (commonName ? await fetchSpeciesWikiData(commonName) : null);
            if (__DEV__)
              console.log('[results] wiki item', { latinName, commonName, hasData: Boolean(data) });
            return [latinName, data] as const;
          } catch (e: unknown) {
            if (__DEV__) console.log('[results] wiki item error', { latinName, error: e });
            setWikiError(e instanceof Error ? e.message : 'Wikipedia request failed.');
            return [latinName, null] as const;
          }
        })
      );

      if (cancelled) return;
      setWikiError(null);
      setWikiByLatinName((prev) => {
        const next = { ...prev };
        for (const [latinName, data] of entries) next[latinName] = data;
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [species]);

  const goToCamera = useCallback(() => {
    router.replace('/camera');
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
      refetch();
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
    refetch,
  ]);

  if (!photoUri) {
    return (
      <View style={[styles.fill, padInsets(insets)]}>
        <MessageWithAction
          message="Missing photo. Go back and capture again."
          actionLabel="Back to camera"
          onAction={goToCamera}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, padInsets(insets)]}>
      <ScreenHeading
        title="Identification"
        subtitle="Results are not saved to your photo library."
        marginBottom={authSpacing.md}
      />

      {identifying ? <LoadingHintRow label="Calling identification APIs…" /> : null}

      {identifyError ? <InlineFormError>{identifyError}</InlineFormError> : null}
      {historyError ? <InlineFormError>{historyError}</InlineFormError> : null}
      {saveError ? <InlineFormError>{saveError}</InlineFormError> : null}
      {wikiError ? <InlineFormError>{wikiError}</InlineFormError> : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <SectionLabel label="This photo" />
        <View style={styles.photoFrame}>
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
          />
        </View>

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

        {!identifying && species.length === 0 && !identifyError ? (
          <Text style={styles.muted}>No species returned.</Text>
        ) : null}

        {species.map((s) => (
          <SpeciesResultCard
            key={s.id}
            commonName={s.commonName}
            latinName={s.latinName}
            meta={`${s.taxonGroup} · ${s.status}`}>
            {Object.prototype.hasOwnProperty.call(wikiByLatinName, s.latinName) ? (
              wikiByLatinName[s.latinName] ? (
                <View style={styles.wikiWrap}>
                  <Text style={styles.wikiDesc}>{wikiByLatinName[s.latinName]?.description}</Text>
                  {wikiByLatinName[s.latinName]?.funFacts?.length ? (
                    <View style={styles.facts}>
                      {wikiByLatinName[s.latinName]!.funFacts.map((fact) => (
                        <Text key={fact} style={styles.fact}>
                          - {fact}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={styles.wikiWrap}>
                  <Text style={styles.wikiDesc}>No Wikipedia article found.</Text>
                </View>
              )
            ) : null}
          </SpeciesResultCard>
        ))}

        <SectionLabel label="Your identifications" spaced />
        {historyLoading ? (
          <ActivityIndicator color={authColors.textMuted} />
        ) : identifications.length === 0 ? (
          <Text style={styles.muted}>No saved identifications yet.</Text>
        ) : (
          identifications.map((row) => (
            <SpeciesResultCard
              key={row.id}
              commonName={row.species.commonName}
              latinName={row.species.latinName}
              meta={new Date(row.timestamp).toLocaleString()}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AuthButton variant="outline" title="Back to camera" onPress={goToCamera} />
      </View>
    </View>
  );
}

function padInsets(insets: { top: number; bottom: number }) {
  return { paddingTop: insets.top + authSpacing.sm, paddingBottom: insets.bottom + authSpacing.sm };
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
  photoFrame: {
    width: '100%',
    aspectRatio: 4 / 3,
    marginBottom: authSpacing.md,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  muted: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.sm,
  },
  wikiWrap: {
    marginTop: authSpacing.sm,
    gap: authSpacing.xs,
  },
  wikiDesc: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  facts: {
    gap: authSpacing.xs,
  },
  fact: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  footer: {
    marginTop: authSpacing.sm,
    paddingTop: authSpacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authColors.border,
    gap: authSpacing.sm,
  },
});
