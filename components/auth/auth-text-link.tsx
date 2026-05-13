import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { authColors, authTypography } from '@/constants/auth-theme';

type AuthTextLinkProps = {
  href: Href;
  children: string;
  variant?: 'default' | 'muted';
  style?: ViewStyle;
};

export function AuthTextLink({ href, children, variant = 'default', style }: AuthTextLinkProps) {
  const textStyle = variant === 'muted' ? styles.textMuted : styles.textDefault;
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={[styles.wrap, style]}>
        <Text style={textStyle}>{children}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
  textDefault: {
    ...authTypography.link,
    color: authColors.text,
    textDecorationLine: 'underline',
  },
  textMuted: {
    ...authTypography.link,
    color: authColors.textMuted,
    textDecorationLine: 'underline',
  },
});
