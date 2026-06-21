import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { SpeciesSubcategoryFilterContent } from '@/components/profile/species-subcategory-filter-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { usePublicGalleryPrefs } from '@/context/PublicGalleryContext';
import { useTheme } from '@/hooks/useTheme';

export default function PublicUserGalleryFilterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { categoryFilter, setCategoryFilter } = usePublicGalleryPrefs();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title="Filter gallery" subtitle="Category" />
        <SpeciesSubcategoryFilterContent
          value={categoryFilter}
          onChange={setCategoryFilter}
          onDone={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}
