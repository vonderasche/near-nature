import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

export type ScreenHeadingProps = {
  title: string;
  subtitle?: string;
  /** Space below the heading block. */
  marginBottom?: number;
  style?: ViewStyle;
};

/**
 * Title + optional subtitle using auth typography (shared by auth flows, camera flows, results, etc.).
 */
export function ScreenHeading({ title, subtitle, marginBottom = authSpacing.sm, style }: ScreenHeadingProps) {
  return (
    <View style={[styles.wrap, { marginBottom }, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.xs,
  },
  title: {
    ...authTypography.title,
    color: authColors.text,
  },
  subtitle: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
});
