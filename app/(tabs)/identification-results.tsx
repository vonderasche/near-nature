import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { fetchSpeciesWikiData } from '@/api/wikipedia';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useIdentifications } from '@/hooks/useIdentifications';
import { useSpeciesIdentification } from '@/hooks/useSpeciesIdentification';
import type { Species } from '@/types';

const DEFAULT_USER_STATE = process.env.EXPO_PUBLIC_USER_STATE ?? 'FL';

function paramToString(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function normalizePhotoUri(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

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

  const [species, setSpecies] = useState<Species[]>([]);
  const [wikiByLatinName, setWikiByLatinName] = useState<Record<string, SpeciesWikiData | null>>(
    {}
  );
  const [wikiError, setWikiError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUri) return;
    let cancelled = false;
    (async () => {
      const results = await identify(photoUri, userState);
      if (!cancelled) {
        setSpecies(results);
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
      // Keep it basic: fetch wiki for top few results only.
      const toFetch = species
        .slice(0, 3)
        .map((s) => ({ latinName: s.latinName, commonName: s.commonName }))
        .filter((s) => Boolean(s.latinName));
      const entries = await Promise.all(
        toFetch.map(async ({ latinName, commonName }) => {
          try {
            // Try latin name first, then fall back to common name.
            const data = (await fetchSpeciesWikiData(latinName)) ?? (commonName ? await fetchSpeciesWikiData(commonName) : null);
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

  if (!photoUri) {
    return (
      <View style={[styles.centered, padInsets(insets)]}>
        <Text style={styles.body}>Missing photo. Go back and capture again.</Text>
        <Pressable accessibilityRole="button" onPress={goToCamera} style={styles.btn}>
          <Text style={styles.btnText}>Back to camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, padInsets(insets)]}>
      <Text style={styles.title}>Identification</Text>
      <Text style={styles.subtitle}>Results are not saved to your photo library.</Text>

      {identifying && (
        <View style={styles.row}>
          <ActivityIndicator color={authColors.text} />
          <Text style={styles.body}>Calling identification APIs…</Text>
        </View>
      )}

      {identifyError ? <Text style={styles.error}>{identifyError}</Text> : null}
      {historyError ? <Text style={styles.error}>{historyError}</Text> : null}
      {wikiError ? <Text style={styles.error}>{wikiError}</Text> : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.section}>This photo</Text>
        <View style={styles.photoFrame}>
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="contain"
          />
        </View>

        {!identifying && species.length === 0 && !identifyError ? (
          <Text style={styles.muted}>No species returned.</Text>
        ) : null}
        {species.map((s) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.common}>{s.commonName}</Text>
            <Text style={styles.latin}>{s.latinName}</Text>
            <Text style={styles.meta}>
              {s.taxonGroup} · {s.status}
            </Text>
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
          </View>
        ))}

        <Text style={[styles.section, styles.sectionSpaced]}>Your identifications</Text>
        {historyLoading ? (
          <ActivityIndicator color={authColors.textMuted} />
        ) : identifications.length === 0 ? (
          <Text style={styles.muted}>No saved history yet (hook is stubbed).</Text>
        ) : (
          identifications.map((row) => (
            <View key={row.id} style={styles.card}>
              <Text style={styles.common}>{row.species.commonName}</Text>
              <Text style={styles.latin}>{row.species.latinName}</Text>
              <Text style={styles.meta}>{new Date(row.timestamp).toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable accessibilityRole="button" onPress={goToCamera} style={styles.footerBtn}>
        <Text style={styles.footerBtnText}>Back to camera</Text>
      </Pressable>
    </View>
  );
}

function padInsets(insets: { top: number; bottom: number }) {
  return { paddingTop: insets.top + authSpacing.sm, paddingBottom: insets.bottom + authSpacing.sm };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
    paddingHorizontal: authSpacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: authColors.background,
    paddingHorizontal: authSpacing.lg,
  },
  title: {
    ...authTypography.title,
    color: authColors.text,
    marginBottom: authSpacing.xs,
  },
  subtitle: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
    marginBottom: authSpacing.sm,
  },
  body: {
    ...authTypography.body,
    color: authColors.text,
    textAlign: 'center',
  },
  error: {
    ...authTypography.body,
    color: authColors.text,
    marginBottom: authSpacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: authSpacing.xl,
  },
  section: {
    ...authTypography.label,
    color: authColors.text,
    marginBottom: authSpacing.sm,
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
  sectionSpaced: {
    marginTop: authSpacing.lg,
  },
  muted: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
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
  common: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  latin: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginTop: authSpacing.xs,
  },
  btn: {
    marginTop: authSpacing.md,
    borderWidth: 1,
    borderColor: authColors.border,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.lg,
  },
  btnText: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
  footerBtn: {
    marginTop: authSpacing.sm,
    paddingVertical: authSpacing.md,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authColors.border,
  },
  footerBtnText: {
    ...authTypography.link,
    color: authColors.text,
    fontWeight: '600',
  },
});
