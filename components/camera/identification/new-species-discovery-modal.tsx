import { HeroIcon } from '@/components/ui/hero-icon';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { NewSpeciesDiscovery } from '@/types/species-discovery';

type Props = {
  visible: boolean;
  discovery: NewSpeciesDiscovery | null;
  onDismiss: () => void;
};

export function NewSpeciesDiscoveryModal({ visible, discovery, onDismiss }: Props) {
  useEffect(() => {
    if (!visible || !discovery) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [visible, discovery]);

  if (!discovery) return null;

  const bonusLabel =
    discovery.bonusPoints === 1
      ? '+1 bonus point'
      : `+${discovery.bonusPoints} bonus points`;

  return (
    <SheetModalShell visible={visible} onRequestClose={onDismiss} onBackdropPress={onDismiss}>
      <View style={styles.iconWrap}>
        <HeroIcon name="trophy" size={40} color={authColors.text} variant="solid" />
      </View>
      <Text style={sheetModalShellStyles.sheetTitle}>New species discovery</Text>
      <Text style={styles.speciesName}>{discovery.commonName}</Text>
      <Text style={styles.latinName}>{discovery.latinName}</Text>
      <Text style={sheetModalShellStyles.sheetMessage}>
        {`First time you've logged this species. ${bonusLabel} added to this sighting.`}
      </Text>
      <AuthButton title="Nice!" fillParent onPress={onDismiss} />
    </SheetModalShell>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: authSpacing.xs,
  },
  speciesName: {
    ...authTypography.title,
    fontSize: 22,
    lineHeight: 28,
    color: authColors.text,
    textAlign: 'center',
  },
  latinName: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: authSpacing.sm,
  },
});
