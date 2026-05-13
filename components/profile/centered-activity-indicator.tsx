import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { authSpacing } from '@/constants/auth-theme';

type CenteredActivityIndicatorProps = {
  color: string;
  accessibilityLabel?: string;
};

export function CenteredActivityIndicator({
  color,
  accessibilityLabel = 'Loading',
}: CenteredActivityIndicatorProps) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={color} accessibilityLabel={accessibilityLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: authSpacing.lg,
  },
});
