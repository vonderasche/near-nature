import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type SectionLabelProps = {
  label: string;
  /** Extra top margin (e.g. second section on a page). */
  spaced?: boolean;
  style?: TextStyle;
  containerStyle?: ViewStyle;
};

/**
 * Small caps / label style section heading (lists, results, settings blocks).
 */
export function SectionLabel({ label, spaced, style, containerStyle }: SectionLabelProps) {
  return (
    <View style={[spaced && styles.spaced, containerStyle]}>
      <Text style={[styles.text, style]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  spaced: {
    marginTop: authSpacing.lg,
  },
  text: {
    ...authTypography.label,
    color: authColors.text,
    marginBottom: authSpacing.sm,
  },
});
