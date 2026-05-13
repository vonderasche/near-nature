import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type AuthLinkRowProps = {
  /** Shown before the link (e.g. “Already have an account?”). */
  prompt?: string;
  href: Href;
  linkText: string;
};

export function AuthLinkRow({ prompt, href, linkText }: AuthLinkRowProps) {
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: authSpacing.xs,
    marginTop: authSpacing.md,
  },
  prompt: {
    ...authTypography.body,
    color: authColors.textMuted,
  },
  link: {
    ...authTypography.link,
    color: authColors.text,
    textDecorationLine: 'underline',
  },
});
