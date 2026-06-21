import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { useTheme } from '@/hooks/useTheme';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';

type Props = {
  visible: boolean;
  entry: DiscoverSpeciesEntry | null;
  onClose: () => void;
};

export function SpeciesDetailModal({ visible, entry, onClose }: Props) {
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
        sectionTitle: {
          ...theme.typography.label,
          color: theme.colors.textPrimary,
          marginTop: theme.spacing.xs,
        },
        parkRow: {
          paddingVertical: 2,
        },
        parkName: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          lineHeight: 22,
        },
      }),
    [theme],
  );

  if (!visible || !entry) {
    return null;
  }

  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const scrollMaxHeight = Math.max(280, sheetMaxHeight - theme.spacing.md * 2);
  const kindLabel = entry.kind === 'plant' ? 'Plant' : 'Animal';

  return (
    <SheetModalShell visible onRequestClose={onClose} sheetStyle={{ maxHeight: sheetMaxHeight }}>
      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled">
        {entry.imageUrl ? (
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: entry.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`species-hero-${entry.kind}-${entry.name}`}
              transition={200}
              accessibilityLabel={`Photo of ${entry.name}`}
            />
          </View>
        ) : null}
        <Text style={styles.title}>{entry.name}</Text>
        <Text style={styles.meta}>
          {kindLabel} · featured at {entry.parkCount === 1 ? '1 park' : `${entry.parkCount} parks`}
        </Text>
        <Text style={styles.sectionTitle}>Look for it at</Text>
        {entry.parkNames.map((parkName) => (
          <View key={parkName} style={styles.parkRow}>
            <Text style={styles.parkName}>{`• ${parkName}`}</Text>
          </View>
        ))}
      </ScrollView>
      <ButtonStack>
        <AuthButton title="Close" variant="outline" fillParent onPress={onClose} />
      </ButtonStack>
    </SheetModalShell>
  );
}
