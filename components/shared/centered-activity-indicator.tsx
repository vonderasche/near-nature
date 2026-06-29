import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type CenteredActivityIndicatorProps = {
  color?: string;
  accessibilityLabel?: string;
};

function createCenteredActivityIndicatorStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
    },
  });
}

export function CenteredActivityIndicator({
  color,
  accessibilityLabel = 'Loading',
}: CenteredActivityIndicatorProps) {
  const styles = useThemedStyles(createCenteredActivityIndicatorStyles);
  const { theme } = useTheme();
  const spinnerColor = color ?? theme.colors.textPrimary;

  return (
    <View
      style={styles.wrap}
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={spinnerColor} accessibilityLabel={accessibilityLabel} />
    </View>
  );
}
