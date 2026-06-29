import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type AuthTextLinkProps = {
  href: Href;
  children: string;
  variant?: 'default' | 'muted';
  style?: ViewStyle;
};

function createAuthTextLinkStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      alignSelf: 'flex-start',
    },
    textDefault: {
      ...theme.typography.link,
      color: theme.colors.textPrimary,
      textDecorationLine: 'underline',
    },
    textMuted: {
      ...theme.typography.link,
      color: theme.colors.textMuted,
      textDecorationLine: 'underline',
    },
  });
}

export function AuthTextLink({ href, children, variant = 'default', style }: AuthTextLinkProps) {
  const styles = useThemedStyles(createAuthTextLinkStyles);
  const textStyle = variant === 'muted' ? styles.textMuted : styles.textDefault;

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={[styles.wrap, style]}>
        <Text style={textStyle}>{children}</Text>
      </Pressable>
    </Link>
  );
}
