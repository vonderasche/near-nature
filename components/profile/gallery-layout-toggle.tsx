import { HeroIcon } from '@/components/ui/hero-icon';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  galleryLayoutAccessibilityLabel,
  type GalleryLayoutMode,
} from '@/lib/detections/galleryLayoutMode';

type Props = {
  value: GalleryLayoutMode;
  onChange: (mode: GalleryLayoutMode) => void;
};

/** Toggles photo grid vs bordered list rows in profile / public galleries. */
export function GalleryLayoutToggle({ value, onChange }: Props) {
  const { theme } = useTheme();
  const isList = value === 'list';
  const next: GalleryLayoutMode = isList ? 'grid' : 'list';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Gallery layout, ${galleryLayoutAccessibilityLabel(value)}`}
      accessibilityHint={`Switch to ${galleryLayoutAccessibilityLabel(next)}`}
      hitSlop={10}
      onPress={() => onChange(next)}
      style={({ pressed }) => [
        styles.trigger,
        { padding: theme.spacing.xs },
        pressed && styles.triggerPressed,
      ]}>
      <HeroIcon
        name={isList ? 'squares-2x2' : 'list-bullet'}
        size={22}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {},
  triggerPressed: {
    opacity: 0.75,
  },
});
