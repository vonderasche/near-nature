import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';
import type { ReactNode } from 'react';

type ScreenSectionProps = {
  title: string;
  hint?: string;
  hintColor: string;
  /** Renders in the top-right of the section header (e.g. gallery grid menu). */
  titleAccessory?: ReactNode;
  children?: ReactNode;
};

export function ScreenSection({ title, hint, hintColor, titleAccessory, children }: ScreenSectionProps) {
  return (
    <View>
      <View style={styles.titleRow}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {titleAccessory}
      </View>
      {hint ? (
        <ThemedText style={[styles.hint, { color: hintColor }]}>{hint}</ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    marginBottom: authSpacing.xs,
  },
  title: {
    flex: 1,
    marginBottom: 0,
  },
  hint: {
    fontSize: 14,
    marginBottom: authSpacing.sm,
  },
});
