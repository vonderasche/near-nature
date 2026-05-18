import { StyleSheet, Text, View } from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import { ADULT_AGE_YEARS, MIN_SIGNUP_AGE_YEARS } from '@/lib/auth/validateBirthDate';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

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

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.xs,
  },
  label: {
    ...authTypography.label,
    color: authColors.text,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: authSpacing.sm,
  },
  part: {
    flex: 1,
  },
  yearPart: {
    flex: 1.4,
  },
  error: {
    ...authTypography.subtitle,
    color: authColors.danger,
  },
  minorNotice: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
});
