import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type AuthLinkRowProps = {
  /** Shown before the link (e.g. “Already have an account?”). */
  prompt?: string;
  href: Href;
  linkText: string;
};

function createAuthLinkRowStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
    prompt: {
      ...theme.typography.body,
      color: theme.colors.textMuted,
    },
    link: {
      ...theme.typography.link,
      color: theme.colors.textPrimary,
      textDecorationLine: 'underline',
    },
  });
}

export function AuthLinkRow({ prompt, href, linkText }: AuthLinkRowProps) {
  const styles = useThemedStyles(createAuthLinkRowStyles);

  return (
    <View style={styles.row}>
      {prompt ? <Text style={styles.prompt}>{prompt}</Text> : null}
      <Link href={href} asChild>
        <Pressable accessibilityRole="link">
          <Text style={styles.link}>{linkText}</Text>
        </Pressable>
      </Link>
    </View>
  );
}
