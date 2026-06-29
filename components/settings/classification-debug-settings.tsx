import { Pressable, View } from 'react-native';

import { HeroIcon } from '@/components/ui/hero-icon';
import { Text } from '@/components/ui/Text';
import { useClassificationDebugPreference } from '@/hooks/useClassificationDebugPreference';
import { useTheme } from '@/hooks/useTheme';

function ToggleRow({
  label,
  hint,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      accessibilityHint={hint}
      disabled={disabled}
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
          opacity: disabled ? 0.5 : 1,
        },
        pressed && !disabled && { opacity: 0.85 },
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

export function ClassificationDebugSettings() {
  const { theme } = useTheme();
  const { optIn, setOptIn, thumbnails, setThumbnails, ready } = useClassificationDebugPreference();

  if (!ready) {
    return null;
  }

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <ToggleRow
        label="Share classification feedback"
        hint="Send anonymized identify / reclassify events to help improve on-device models."
        selected={optIn}
        onPress={() => setOptIn(!optIn)}
      />
      <ToggleRow
        label="Include debug thumbnails"
        hint="Attach a low-res photo to capture events (requires ml-telemetry storage bucket)."
        selected={thumbnails}
        disabled={!optIn}
        onPress={() => setThumbnails(!thumbnails)}
      />
    </View>
  );
}
