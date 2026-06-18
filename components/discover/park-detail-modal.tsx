import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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

function SpeciesSection({ title, items }: { title: string; items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{items.join(' · ')}</Text>
    </View>
  );
}

export function ParkDetailModal({ visible, park, onClose }: Props) {
  const { height: windowHeight } = useWindowDimensions();

  const openParkPage = useCallback(async () => {
    if (!park?.parkPageUrl) return;
    await WebBrowser.openBrowserAsync(park.parkPageUrl);
  }, [park?.parkPageUrl]);

  if (!visible || !park) {
    return null;
  }

  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const scrollMaxHeight = Math.max(280, sheetMaxHeight - authSpacing.md * 2);
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

        <SpeciesSection title="Plants to look for" items={park.topPlants} />
        <SpeciesSection title="Wildlife to look for" items={park.topAnimals} />
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

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: authSpacing.sm,
    paddingBottom: authSpacing.sm,
  },
  title: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  description: {
    ...authTypography.body,
    color: authColors.text,
    lineHeight: 22,
  },
  section: {
    gap: authSpacing.xs,
    marginTop: authSpacing.xs,
  },
  sectionTitle: {
    ...authTypography.label,
    color: authColors.text,
  },
  sectionBody: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    lineHeight: 20,
  },
});
