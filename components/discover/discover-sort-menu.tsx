import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DiscoverAnchorMenu } from '@/components/discover/discover-anchor-menu';
import {
  EXPLORE_SPECIES_SORT_MENU_TITLE,
  EXPLORE_SPECIES_SORT_OPTIONS,
  exploreSpeciesSortLabel,
  type ExploreSpeciesSortMode,
} from '@/lib/explore/exploreSpeciesSort';

type Props = {
  value: ExploreSpeciesSortMode;
  onChange: (mode: ExploreSpeciesSortMode) => void;
  mutedColor: string;
  borderColor: string;
};

/** Sort icon opening rank / observations / name menu. */
export function DiscoverSortMenu({ value, onChange, mutedColor, borderColor }: Props) {
  return (
    <DiscoverAnchorMenu
      value={value}
      onChange={onChange}
      mutedColor={mutedColor}
      borderColor={borderColor}
      menuTitle={EXPLORE_SPECIES_SORT_MENU_TITLE}
      triggerAccessibilityLabel={`Sort species, ${exploreSpeciesSortLabel(value)}`}
      triggerIcon={<MaterialIcons name="sort" size={22} color={mutedColor} />}
      options={EXPLORE_SPECIES_SORT_OPTIONS.map((mode) => ({
        value: mode,
        label: exploreSpeciesSortLabel(mode),
      }))}
    />
  );
}
