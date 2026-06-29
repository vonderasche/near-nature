import { StyleSheet, Text } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type InlineFormErrorProps = {
  children: string;
};

function createInlineFormErrorStyles(theme: AppTheme) {
  return StyleSheet.create({
    error: {
      ...theme.typography.body,
      color: theme.colors.danger,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
  });
}

export function InlineFormError({ children }: InlineFormErrorProps) {
  const styles = useThemedStyles(createInlineFormErrorStyles);

  return <Text style={styles.error}>{children}</Text>;
}
