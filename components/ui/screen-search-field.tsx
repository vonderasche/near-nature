import { useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** When true, no outline (e.g. inline toolbar next to icon buttons). */
  borderless?: boolean;
  /** Merged onto the outer row (e.g. `{ flex: 1 }` in a toolbar). */
  containerStyle?: StyleProp<ViewStyle>;
};

export function ScreenSearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  accessibilityHint = 'Filters the list below',
  borderless = false,
  containerStyle,
}: Props) {
  const { theme } = useTheme();
  const showClear = value.trim().length > 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: borderless ? 0 : 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.field,
          backgroundColor: borderless ? 'transparent' : theme.colors.fieldBackground,
          marginBottom: borderless ? 0 : theme.spacing.md,
          minHeight: 44,
        },
        leadingIcon: {
          marginLeft: theme.spacing.sm,
        },
        input: {
          ...theme.typography.body,
          flex: 1,
          color: theme.colors.textPrimary,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.sm,
          fontSize: 16,
        },
        clear: {
          padding: theme.spacing.sm,
        },
        clearPressed: {
          opacity: 0.75,
        },
      }),
    [borderless, theme],
  );

  return (
    <View style={[styles.wrap, containerStyle]} accessibilityLabel={accessibilityLabel}>
      <HeroIcon
        name="magnifying-glass"
        size={20}
        color={theme.colors.textSecondary}
        style={styles.leadingIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        style={styles.input}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
      {showClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clear, pressed && styles.clearPressed]}>
          <HeroIcon name="x-mark" size={18} color={theme.colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}
