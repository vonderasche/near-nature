import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { SpeciesSubcategoryFilterContent } from '@/components/profile/species-subcategory-filter-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { useGalleryCategoryFilter } from '@/context/GalleryCategoryFilterContext';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onDone?: () => void;
};

export function GalleryFilterScreenBody({ onDone }: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { categoryFilter, setCategoryFilter } = useGalleryCategoryFilter();

  const handleDone = onDone ?? (() => router.back());

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title="Filter gallery" subtitle="Category" />
        <SpeciesSubcategoryFilterContent
          value={categoryFilter}
          onChange={setCategoryFilter}
          onDone={handleDone}
        />
      </ScrollView>
    </Screen>
  );
}
