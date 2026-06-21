import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { SELECTABLE_THEME_NAMES, THEME_LABELS } from '@/constants/theme-preferences';
import { themes } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';

export function ThemePicker() {
  const { themeName, setThemeName } = useTheme();
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {SELECTABLE_THEME_NAMES.map((name) => {
        const selected = themeName === name;
        const preview = themes[name].colors;

        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${THEME_LABELS[name]} theme`}
            onPress={() => setThemeName(name)}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: preview.background,
                  borderWidth: 2,
                  borderColor: preview.accent,
                }}
              />
              <Text variant="body">{THEME_LABELS[name]}</Text>
            </View>
            {selected ? (
              <Text variant="caption" color="accent">
                Active
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
