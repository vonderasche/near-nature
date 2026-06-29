import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { legalUrls } from '@/constants/legal';
import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type AuthLegalConsentProps = {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  error?: string | null;
};

async function openLegalUrl(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

function createLegalConsentStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      gap: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    copy: {
      ...theme.typography.subtitle,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    link: {
      textDecorationLine: 'underline',
      color: theme.colors.textPrimary,
    },
    error: {
      ...theme.typography.subtitle,
      color: theme.colors.danger,
    },
    checkboxEmpty: {
      width: 22,
      height: 22,
      borderWidth: 1,
      borderColor: theme.colors.textMuted,
      borderRadius: 4,
    },
  });
}

export function AuthLegalConsent({ accepted, onAcceptedChange, error }: AuthLegalConsentProps) {
  const styles = useThemedStyles(createLegalConsentStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => onAcceptedChange(!accepted)}
        style={styles.row}>
        {accepted ? (
          <HeroIcon name="check-circle" size={22} color={theme.colors.textPrimary} />
        ) : (
          <View style={styles.checkboxEmpty} />
        )}
        <Text style={styles.copy}>
          I agree to the{' '}
          <Text style={styles.link} onPress={() => void openLegalUrl(legalUrls.terms)}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => void openLegalUrl(legalUrls.privacy)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
