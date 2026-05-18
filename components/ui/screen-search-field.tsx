import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
};

export function ScreenSearchField({ value, onChangeText, placeholder, accessibilityLabel }: Props) {
  const showClear = value.trim().length > 0;

  return (
    <View style={styles.wrap} accessibilityLabel={accessibilityLabel}>
      <HeroIcon name="magnifying-glass" size={20} color={authColors.textMuted} style={styles.leadingIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={authColors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        style={styles.input}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Filters the list below"
      />
      {showClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clear, pressed && styles.clearPressed]}>
          <HeroIcon name="x-mark" size={18} color={authColors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 0,
    backgroundColor: authColors.background,
    marginBottom: authSpacing.md,
    minHeight: 44,
  },
  leadingIcon: {
    marginLeft: authSpacing.sm,
  },
  input: {
    ...authTypography.body,
    flex: 1,
    color: authColors.text,
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.sm,
    fontSize: 16,
  },
  clear: {
    padding: authSpacing.sm,
  },
  clearPressed: {
    opacity: 0.75,
  },
});
