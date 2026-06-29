import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type AuthScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
};

function createAuthScreenStyles(theme: AppTheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
  });
}

export function AuthScreen({ children, style }: AuthScreenProps) {
  const styles = useThemedStyles(createAuthScreenStyles);

  return (
    <SafeAreaView style={[styles.safe, style]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
