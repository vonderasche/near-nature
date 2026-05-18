import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { legalUrls } from '@/constants/legal';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type AuthLegalConsentProps = {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  error?: string | null;
};

async function openLegalUrl(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

export function AuthLegalConsent({ accepted, onAcceptedChange, error }: AuthLegalConsentProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => onAcceptedChange(!accepted)}
        style={styles.row}>
        {accepted ? (
          <HeroIcon name="check-circle" size={22} color={authColors.text} />
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

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: authSpacing.sm,
  },
  copy: {
    ...authTypography.subtitle,
    color: authColors.text,
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
    color: authColors.text,
  },
  error: {
    ...authTypography.subtitle,
    color: authColors.danger,
  },
  checkboxEmpty: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: authColors.textMuted,
    borderRadius: 4,
  },
});
