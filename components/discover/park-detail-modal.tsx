import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import { useTheme } from '@/hooks/useTheme';
import {
  formatParkAccessLabel,
  formatParkAcreage,
  formatParkLocation,
} from '@/lib/parks/formatFloridaStatePark';
import { resolveParkListImageUrl } from '@/lib/parks/parkSpeciesHighlights';
import type { FloridaStatePark, ParkSpeciesHighlight } from '@/types/florida-state-park';

type Props = {
  visible: boolean;
  park: FloridaStatePark | null;
  onClose: () => void;
};

type SectionStyles = {
  section: object;
  sectionTitle: object;
  speciesRow: object;
  speciesName: object;
};

function SpeciesSection({
  title,
  items,
  styles,
}: {
  title: string;
  items: readonly ParkSpeciesHighlight[];
  styles: SectionStyles;
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item.name} style={styles.speciesRow}>
          <ListThumbnail uri={item.imageUrl} recyclingKey={`${title}-${item.name}`} />
          <Text style={styles.speciesName}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
}

export function ParkDetailModal({ visible, park, onClose }: Props) {
  const { theme } = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          flexGrow: 0,
        },
        scrollContent: {
          gap: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
        },
        heroWrap: {
          width: '100%',
          height: 180,
          marginBottom: theme.spacing.xs,
        },
        heroImage: {
          width: '100%',
          height: '100%',
          borderRadius: theme.radii.md,
          backgroundColor: 'rgba(255,255,255,0.06)',
        },
        title: {
          ...theme.typography.title,
          fontSize: 22,
          color: theme.colors.textPrimary,
        },
        meta: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
        },
        description: {
          ...theme.typography.body,
          color: theme.colors.textPrimary,
          lineHeight: 22,
        },
        section: {
          gap: theme.spacing.sm,
          marginTop: theme.spacing.xs,
        },
        sectionTitle: {
          ...theme.typography.label,
          color: theme.colors.textPrimary,
        },
        speciesRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
        },
        speciesName: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          flex: 1,
        },
        imageCredit: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          fontSize: 12,
        },
      }),
    [theme],
  );

  const openParkPage = useCallback(async () => {
    if (!park?.parkPageUrl) return;
    await WebBrowser.openBrowserAsync(park.parkPageUrl);
  }, [park?.parkPageUrl]);

  if (!visible || !park) {
    return null;
  }

  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const scrollMaxHeight = Math.max(280, sheetMaxHeight - theme.spacing.md * 2);
  const acreage = formatParkAcreage(park.acreage);
  const access = formatParkAccessLabel(park.publicAccess);
  const heroImageUrl = resolveParkListImageUrl(park);

  return (
    <SheetModalShell visible onRequestClose={onClose} sheetStyle={{ maxHeight: sheetMaxHeight }}>
      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled">
        {heroImageUrl ? (
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: heroImageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`park-hero-${park.parkId}`}
              transition={200}
              accessibilityLabel={`Photo from ${park.parkName}`}
            />
          </View>
        ) : null}
        <Text style={styles.title}>{park.parkName}</Text>
        <Text style={styles.meta}>{formatParkLocation(park)}</Text>
        {acreage ? <Text style={styles.meta}>{acreage}</Text> : null}
        {access ? <Text style={styles.meta}>{`Access: ${access}`}</Text> : null}
        {park.address ? <Text style={styles.meta}>{park.address}</Text> : null}
        {park.description ? <Text style={styles.description}>{park.description}</Text> : null}
        {park.imageAttribution.trim() ? (
          <Text style={styles.imageCredit}>{`Photo: ${park.imageAttribution.trim()}`}</Text>
        ) : null}

        <SpeciesSection title="Plants to look for" items={park.topPlants} styles={styles} />
        <SpeciesSection title="Wildlife to look for" items={park.topAnimals} styles={styles} />
      </ScrollView>

      <ButtonStack>
        {park.parkPageUrl ? (
          <AuthButton title="Open park page" fillParent onPress={() => void openParkPage()} />
        ) : null}
        <AuthButton title="Close" variant="outline" fillParent onPress={onClose} />
      </ButtonStack>
    </SheetModalShell>
  );
}
