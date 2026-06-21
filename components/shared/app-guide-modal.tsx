import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { APP_GUIDE_STEPS } from '@/constants/app-guide';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AppGuideModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        scroll: {
          flexGrow: 0,
        },
        scrollContent: {
          gap: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        },
        title: {
          ...theme.typography.title,
          fontSize: 22,
          color: theme.colors.textPrimary,
        },
        intro: {
          ...theme.typography.subtitle,
          color: theme.colors.textSecondary,
          lineHeight: 20,
        },
        step: {
          gap: theme.spacing.xs,
        },
        stepTitle: {
          ...theme.typography.label,
          color: theme.colors.textPrimary,
        },
        stepBody: {
          ...theme.typography.body,
          color: theme.colors.textSecondary,
          lineHeight: 22,
        },
      }),
    [theme],
  );

  if (!visible) {
    return null;
  }

  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const scrollMaxHeight = Math.max(280, sheetMaxHeight - theme.spacing.md * 2);

  return (
    <SheetModalShell visible onRequestClose={onClose} sheetStyle={{ maxHeight: sheetMaxHeight }}>
      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>How to use Near Nature</Text>
        <Text style={styles.intro}>
          A quick tour of the main tabs and what you can do in each one.
        </Text>
        {APP_GUIDE_STEPS.map((step) => (
          <View key={step.title} style={styles.step}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
          </View>
        ))}
      </ScrollView>
      <ButtonStack>
        <AuthButton title="Got it" fillParent onPress={onClose} />
      </ButtonStack>
    </SheetModalShell>
  );
}
