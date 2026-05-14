import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { authSpacing } from '@/constants/auth-theme';

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
 * Bottom dual actions on dark backgrounds (preview: retake / done) — uses {@link AuthButton} theme.
 */
export function PhotoReviewActions({
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
}: PhotoReviewActionsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.half}>
        <AuthButton
          fillParent
          variant="outline"
          title={secondaryLabel}
          onPress={() => {
            feedback(Haptics.ImpactFeedbackStyle.Light);
            onSecondary();
          }}
        />
      </View>
      <View style={styles.half}>
        <AuthButton
          fillParent
          title={primaryLabel}
          onPress={() => {
            feedback(Haptics.ImpactFeedbackStyle.Medium);
            onPrimary();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
    paddingHorizontal: authSpacing.lg,
    paddingTop: authSpacing.md,
    paddingBottom: authSpacing.sm,
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
});
