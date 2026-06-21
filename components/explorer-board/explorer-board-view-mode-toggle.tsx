import { HeroIcon } from '@/components/ui/hero-icon';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  explorerBoardLayoutLabel,
  type ExplorerBoardLayoutMode,
} from '@/lib/explorerBoard/explorerBoardLayout';

type Props = {
  value: ExplorerBoardLayoutMode;
  onChange: (mode: ExplorerBoardLayoutMode) => void;
};

/** Toggles ranked list cards vs member image grid. */
export function ExplorerBoardViewModeToggle({ value, onChange }: Props) {
  const { theme } = useTheme();
  const isGrid = value === 'grid';
  const next: ExplorerBoardLayoutMode = isGrid ? 'list' : 'grid';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Rankings layout, ${explorerBoardLayoutLabel(value)}`}
      accessibilityHint={`Switch to ${explorerBoardLayoutLabel(next)}`}
      hitSlop={10}
      onPress={() => onChange(next)}
      style={({ pressed }) => [
        styles.trigger,
        { padding: theme.spacing.xs },
        pressed && styles.triggerPressed,
      ]}>
      <HeroIcon
        name={isGrid ? 'list-bullet' : 'squares-2x2'}
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
