import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';
import type { ReactNode } from 'react';

type ScreenSectionProps = {
  title: string;
  hint?: string;
  hintColor: string;
  children?: ReactNode;
};

export function ScreenSection({ title, hint, hintColor, children }: ScreenSectionProps) {
  return (
    <View>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {hint ? (
        <ThemedText style={[styles.hint, { color: hintColor }]}>{hint}</ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: authSpacing.xs,
  },
  hint: {
    fontSize: 14,
    marginBottom: authSpacing.sm,
  },
});
