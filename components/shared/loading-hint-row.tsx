import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type LoadingHintRowProps = {
  label: string;
  spinnerColor?: string;
};

function createLoadingHintRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    body: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
  });
}

export function LoadingHintRow({ label, spinnerColor }: LoadingHintRowProps) {
  const styles = useThemedStyles(createLoadingHintRowStyles);
  const { theme } = useTheme();
  const resolvedSpinnerColor = spinnerColor ?? theme.colors.textPrimary;

  return (
    <View style={styles.row}>
      <ActivityIndicator color={resolvedSpinnerColor} />
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}
