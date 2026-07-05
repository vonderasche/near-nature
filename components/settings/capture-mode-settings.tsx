import { Pressable, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { Text } from '@/components/ui/Text';
import type { CaptureMode } from '@/constants/identification-preferences';
import { useIdentificationPreferences } from '@/hooks/useIdentificationPreferences';
import { useTheme } from '@/hooks/useTheme';

const OPTIONS: { id: CaptureMode; label: string; hint: string }[] = [
  {
    id: 'regional',
    label: 'Regional models',
    hint: 'Uses specialists tuned for your region (downloaded after install).',
  },
  {
    id: 'global',
    label: 'Global models',
    hint: 'Uses the bundled national model pack — works offline without a regional download.',
  },
];

function ModeRow({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
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
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text variant="body" color={selected ? 'primary' : 'secondary'}>
          {label}
        </Text>
        <Text variant="caption" color="secondary">
          {hint}
        </Text>
      </View>
      <HeroIcon
        name={selected ? 'check-circle' : 'eye-slash'}
        size={22}
        color={selected ? theme.colors.accent : theme.colors.textMuted}
      />
    </Pressable>
  );
}

export function CaptureModeSettings() {
  const { theme } = useTheme();
  const { captureMode, setCaptureMode, ready } = useIdentificationPreferences();

  if (!ready) {
    return null;
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {OPTIONS.map((option) => (
        <ModeRow
          key={option.id}
          label={option.label}
          hint={option.hint}
          selected={captureMode === option.id}
          onPress={() => setCaptureMode(option.id)}
        />
      ))}
    </View>
  );
}
