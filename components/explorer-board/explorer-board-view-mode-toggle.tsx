import { HeroIcon } from '@/components/ui/hero-icon';
import { Pressable, StyleSheet } from 'react-native';

import { authSpacing } from '@/constants/auth-theme';
import {
  explorerBoardLayoutLabel,
  type ExplorerBoardLayoutMode,
} from '@/lib/explorerBoard/explorerBoardLayout';

type Props = {
  value: ExplorerBoardLayoutMode;
  onChange: (mode: ExplorerBoardLayoutMode) => void;
  mutedColor: string;
};

/** Toggles ranked list cards vs member image grid. */
export function ExplorerBoardViewModeToggle({ value, onChange, mutedColor }: Props) {
  const isGrid = value === 'grid';
  const next: ExplorerBoardLayoutMode = isGrid ? 'list' : 'grid';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Explorer Board layout, ${explorerBoardLayoutLabel(value)}`}
      accessibilityHint={`Switch to ${explorerBoardLayoutLabel(next)}`}
      hitSlop={10}
      onPress={() => onChange(next)}
      style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
      <HeroIcon name={isGrid ? 'list-bullet' : 'squares-2x2'} size={22} color={mutedColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: authSpacing.xs,
  },
  triggerPressed: {
    opacity: 0.75,
  },
});
