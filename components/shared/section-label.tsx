import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type SectionLabelProps = {
  label: string;
  /** Extra top margin (e.g. second section on a page). */
  spaced?: boolean;
  style?: TextStyle;
  containerStyle?: ViewStyle;
};

function createSectionLabelStyles(theme: AppTheme) {
  return StyleSheet.create({
    spaced: {
      marginTop: theme.spacing.lg,
    },
    text: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
  });
}

/**
 * Small caps / label style section heading (lists, results, settings blocks).
 */
export function SectionLabel({ label, spaced, style, containerStyle }: SectionLabelProps) {
  const styles = useThemedStyles(createSectionLabelStyles);

  return (
    <View style={[spaced && styles.spaced, containerStyle]}>
      <Text style={[styles.text, style]}>{label}</Text>
    </View>
  );
}
