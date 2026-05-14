import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authSpacing, authTypography } from '@/constants/auth-theme';
import { screenColors } from '@/constants/screen-theme';

type PhotoReviewActionsProps = {
  secondaryLabel: string;
  onSecondary: () => void;
  primaryLabel: string;
  onPrimary: () => void;
};

/**
 * Bottom dual actions on dark backgrounds (preview: retake / done).
 */
export function PhotoReviewActions({
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
}: PhotoReviewActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={onSecondary} style={styles.secondary}>
        <Text style={styles.secondaryText}>{secondaryLabel}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onPrimary} style={styles.primary}>
        <Text style={styles.primaryText}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: authSpacing.md,
    paddingHorizontal: authSpacing.lg,
    paddingTop: authSpacing.md,
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: screenColors.onDark,
    paddingVertical: authSpacing.sm,
    alignItems: 'center',
  },
  secondaryText: {
    ...authTypography.body,
    fontWeight: '600',
    color: screenColors.onDark,
  },
  primary: {
    flex: 1,
    backgroundColor: screenColors.onDark,
    paddingVertical: authSpacing.sm,
    alignItems: 'center',
  },
  primaryText: {
    ...authTypography.body,
    fontWeight: '600',
    color: screenColors.darkBackground,
  },
});
