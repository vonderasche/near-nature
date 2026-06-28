import { Pressable, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { Text } from '@/components/ui/Text';
import { SELECTABLE_THEME_NAMES, THEME_LABELS } from '@/constants/theme-preferences';
import { themes, type ThemeName } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';

export function ThemePicker() {
  const { theme, themeName, setThemeName } = useTheme();

  function selectTheme(name: ThemeName) {
    setThemeName(name);
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {SELECTABLE_THEME_NAMES.map((name) => {
        const selected = themeName === name;
        const preview = themes[name].colors;

        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={
              selected ? `${THEME_LABELS[name]} theme, selected` : `${THEME_LABELS[name]} theme`
            }
            accessibilityHint={selected ? undefined : 'Apply this appearance theme'}
            onPress={() => selectTheme(name)}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.spacing.md,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radii.md,
                backgroundColor: selected ? theme.colors.surfaceRaised : 'transparent',
              },
              pressed && { opacity: 0.85 },
            ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: preview.background,
                  borderWidth: 1,
                  borderColor: preview.border,
                }}
              />
              <Text variant="body" color={selected ? 'primary' : 'secondary'}>
                {THEME_LABELS[name]}
              </Text>
            </View>
            {selected ? <HeroIcon name="check" size={20} color={theme.colors.textPrimary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
