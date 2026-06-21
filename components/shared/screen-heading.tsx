import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export type ScreenHeadingProps = {
  title: string;
  subtitle?: string;
  /** Space below the heading block. */
  marginBottom?: number;
  style?: ViewStyle;
};

/**
 * Title + optional subtitle for tab screens and flows.
 */
export function ScreenHeading({ title, subtitle, marginBottom, style }: ScreenHeadingProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrap, { gap: theme.spacing.xs, marginBottom }, style]}>
      <Text style={[styles.title, theme.typography.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[styles.subtitle, theme.typography.subtitle, { color: theme.colors.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
});
