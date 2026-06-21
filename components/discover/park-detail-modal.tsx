import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { useTheme } from '@/hooks/useTheme';
import {
  formatParkAccessLabel,
  formatParkAcreage,
  formatParkLocation,
} from '@/lib/parks/formatFloridaStatePark';
import type { FloridaStatePark } from '@/types/florida-state-park';

type Props = {
  visible: boolean;
  park: FloridaStatePark | null;
  onClose: () => void;
};

type SectionStyles = {
  section: object;
  sectionTitle: object;
  sectionBody: object;
};

function SpeciesSection({
  title,
  items,
  styles,
}: {
  title: string;
  items: readonly string[];
  styles: SectionStyles;
}) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{items.join(' · ')}</Text>
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
          gap: theme.spacing.xs,
          marginTop: theme.spacing.xs,
        },
        sectionTitle: {
          ...theme.typography.label,
          color: theme.colors.textPrimary,
        },
        sectionBody: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          lineHeight: 20,
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

  return (
    <SheetModalShell visible onRequestClose={onClose} sheetStyle={{ maxHeight: sheetMaxHeight }}>
      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{park.parkName}</Text>
        <Text style={styles.meta}>{formatParkLocation(park)}</Text>
        {acreage ? <Text style={styles.meta}>{acreage}</Text> : null}
        {access ? <Text style={styles.meta}>{`Access: ${access}`}</Text> : null}
        {park.address ? <Text style={styles.meta}>{park.address}</Text> : null}
        {park.description ? <Text style={styles.description}>{park.description}</Text> : null}

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
