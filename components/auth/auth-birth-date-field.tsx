import { StyleSheet, Text, View } from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import type { AppTheme } from '@/constants/themes';
import { ADULT_AGE_YEARS, MIN_SIGNUP_AGE_YEARS } from '@/lib/auth/validateBirthDate';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type Props = {
  month: string;
  day: string;
  year: string;
  onChangeMonth: (text: string) => void;
  onChangeDay: (text: string) => void;
  onChangeYear: (text: string) => void;
  error?: string | null;
  /** Shown when DOB is valid and the user is between min sign-up age and 18. */
  minorNotice?: string | null;
};

function digitsOnly(text: string, maxLen: number): string {
  return text.replace(/\D/g, '').slice(0, maxLen);
}

function createBirthDateFieldStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      gap: theme.spacing.xs,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
    },
    hint: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.xs,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    part: {
      flex: 1,
    },
    yearPart: {
      flex: 1.4,
    },
    error: {
      ...theme.typography.subtitle,
      color: theme.colors.danger,
    },
    minorNotice: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
    },
  });
}

export function AuthBirthDateField({
  month,
  day,
  year,
  onChangeMonth,
  onChangeDay,
  onChangeYear,
  error,
  minorNotice,
}: Props) {
  const styles = useThemedStyles(createBirthDateFieldStyles);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Date of birth</Text>
      <Text style={styles.hint}>
        You must be at least {MIN_SIGNUP_AGE_YEARS} years old to sign up. If you are under {ADULT_AGE_YEARS}, a
        parent or guardian should review our Terms with you.
      </Text>
      <View style={styles.row}>
        <View style={styles.part}>
          <AuthField
            label="Month"
            value={month}
            onChangeText={(t) => onChangeMonth(digitsOnly(t, 2))}
            placeholder="MM"
            keyboardType="number-pad"
            autoComplete="off"
          />
        </View>
        <View style={styles.part}>
          <AuthField
            label="Day"
            value={day}
            onChangeText={(t) => onChangeDay(digitsOnly(t, 2))}
            placeholder="DD"
            keyboardType="number-pad"
            autoComplete="off"
          />
        </View>
        <View style={styles.yearPart}>
          <AuthField
            label="Year"
            value={year}
            onChangeText={(t) => onChangeYear(digitsOnly(t, 4))}
            placeholder="YYYY"
            keyboardType="number-pad"
            autoComplete="off"
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {minorNotice ? <Text style={styles.minorNotice}>{minorNotice}</Text> : null}
    </View>
  );
}
