import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet } from 'react-native';

import { authSpacing } from '@/constants/auth-theme';
import type { ExploreDiscoverLayoutMode } from '@/lib/explore/exploreDiscoverLayout';
import { exploreDiscoverLayoutLabel } from '@/lib/explore/exploreDiscoverLayout';

type Props = {
  value: ExploreDiscoverLayoutMode;
  onChange: (mode: ExploreDiscoverLayoutMode) => void;
  mutedColor: string;
};

/**
 * Toggles list cards vs image grid (grid size uses {@link GridLayoutMenu} when grid is active).
 */
export function DiscoverViewModeToggle({ value, onChange, mutedColor }: Props) {
  const isGrid = value === 'grid';
  const next: ExploreDiscoverLayoutMode = isGrid ? 'list' : 'grid';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View layout, ${exploreDiscoverLayoutLabel(value)}`}
      accessibilityHint={`Switch to ${exploreDiscoverLayoutLabel(next)}`}
      hitSlop={10}
      onPress={() => onChange(next)}
      style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
      <MaterialIcons name={isGrid ? 'view-list' : 'grid-view'} size={22} color={mutedColor} />
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
