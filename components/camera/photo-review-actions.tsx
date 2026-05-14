import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { authSpacing, authTypography } from '@/constants/auth-theme';
import { screenColors, screenRadii } from '@/constants/screen-theme';

type PhotoReviewActionsProps = {
  secondaryLabel: string;
  onSecondary: () => void;
  primaryLabel: string;
  onPrimary: () => void;
};

function feedback(style: Haptics.ImpactFeedbackStyle) {
  try {
    void Haptics.impactAsync(style);
  } catch {
    /* unsupported on some platforms */
  }
}

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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={secondaryLabel}
        onPress={() => {
          feedback(Haptics.ImpactFeedbackStyle.Light);
          onSecondary();
        }}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <Text style={styles.secondaryText}>{secondaryLabel}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        onPress={() => {
          feedback(Haptics.ImpactFeedbackStyle.Medium);
          onPrimary();
        }}
        android_ripple={{ color: 'rgba(0,0,0,0.15)' }}
        style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}>
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
    paddingBottom: authSpacing.sm,
  },
  secondary: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: screenColors.onDark,
    borderRadius: screenRadii.button,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.sm,
    alignItems: 'center',
  },
  primary: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: screenColors.onDark,
    borderRadius: screenRadii.button,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.sm,
    alignItems: 'center',
  },
  pressed: {
    opacity: Platform.OS === 'ios' ? 0.88 : 1,
  },
  primaryPressed: {
    opacity: Platform.OS === 'ios' ? 0.92 : 1,
  },
  secondaryText: {
    ...authTypography.body,
    fontWeight: '600',
    color: screenColors.onDark,
  },
  primaryText: {
    ...authTypography.body,
    fontWeight: '600',
    color: screenColors.darkBackground,
  },
});
