import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { SpeciesSubcategoryFilterContent } from '@/components/profile/species-subcategory-filter-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { useProfileGalleryPrefs } from '@/context/ProfileGalleryContext';
import { useTheme } from '@/hooks/useTheme';

export default function ProfileGalleryFilterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { categoryFilter, setCategoryFilter } = useProfileGalleryPrefs();

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
