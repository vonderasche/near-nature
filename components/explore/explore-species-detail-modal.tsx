import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import {
  exploreSpeciesMeta,
  exploreSpeciesSubtitle,
  exploreSpeciesTitle,
} from '@/lib/explore/formatExploreSpeciesDisplay';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  species: ExploreSpecies | null;
  onClose: () => void;
};

export function ExploreSpeciesDetailModal({ species, onClose }: Props) {
  const { height: windowHeight } = useWindowDimensions();

  if (!species) return null;

  const imageUri = species.wikiImageUrl ?? species.imageUrl;
  const summary = species.wikiSummary?.trim();
  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const scrollMaxHeight = Math.max(280, sheetMaxHeight - authSpacing.md * 2);

  return (
    <SheetModalShell visible onRequestClose={onClose} sheetStyle={{ maxHeight: sheetMaxHeight }}>
      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled">
        {imageUri ? (
          <View style={styles.imageFrame}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imageFill}
              contentFit="contain"
              transition={200}
              accessibilityLabel={`Photo of ${species.commonName}`}
            />
          </View>
        ) : null}

        <Text style={styles.commonName}>{exploreSpeciesTitle(species)}</Text>
        <Text style={styles.latinName}>{exploreSpeciesSubtitle(species)}</Text>
        <Text style={styles.meta}>{exploreSpeciesMeta(species)}</Text>
        {summary ? (
          <Text style={styles.description} accessibilityRole="text">
            {summary}
          </Text>
        ) : null}

        <ButtonStack>
          {species.wikipediaUrl ? (
            <AuthButton
              title="Read on Wikipedia"
              variant="outline"
              fillParent
              onPress={() => void WebBrowser.openBrowserAsync(species.wikipediaUrl!)}
            />
          ) : null}
          <AuthButton title="Close" variant="outline" fillParent onPress={onClose} />
        </ButtonStack>
      </ScrollView>
    </SheetModalShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: authSpacing.md,
    paddingBottom: authSpacing.md,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  commonName: {
    ...authTypography.title,
    fontSize: 22,
    lineHeight: 30,
    color: authColors.text,
    textAlign: 'center',
  },
  latinName: {
    ...authTypography.subtitle,
    lineHeight: 22,
    color: authColors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  meta: {
    ...authTypography.subtitle,
    lineHeight: 22,
    color: authColors.textMuted,
    textAlign: 'center',
  },
  description: {
    ...authTypography.body,
    lineHeight: 22,
    color: authColors.text,
    textAlign: 'left',
  },
});
