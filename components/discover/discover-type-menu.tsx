import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

import { DiscoverAnchorMenu } from '@/components/discover/discover-anchor-menu';
import {
  exploreSpeciesCategoryLabel,
  exploreSpeciesCategoryMenuTitle,
  EXPLORE_SPECIES_CATEGORY_OPTIONS,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';

type Props = {
  value: ExploreSpeciesCategory;
  onChange: (category: ExploreSpeciesCategory) => void;
  mutedColor: string;
  borderColor: string;
};

function categoryIcon(category: ExploreSpeciesCategory): ComponentProps<typeof MaterialIcons>['name'] {
  if (category === 'all') return 'category';
  return category === 'plants' ? 'local-florist' : 'pets';
}

/** Category icon opening All / Animals / Plants menu. */
export function DiscoverTypeMenu({ value, onChange, mutedColor, borderColor }: Props) {
  return (
    <DiscoverAnchorMenu
      value={value}
      onChange={onChange}
      mutedColor={mutedColor}
      borderColor={borderColor}
      menuTitle={exploreSpeciesCategoryMenuTitle()}
      triggerAccessibilityLabel={`Species category, ${exploreSpeciesCategoryLabel(value)}`}
      triggerIcon={<MaterialIcons name={categoryIcon(value)} size={22} color={mutedColor} />}
      options={EXPLORE_SPECIES_CATEGORY_OPTIONS.map((category) => ({
        value: category,
        label: exploreSpeciesCategoryLabel(category),
        icon: (
          <MaterialIcons name={categoryIcon(category)} size={20} color={mutedColor} />
        ),
      }))}
    />
  );
}
