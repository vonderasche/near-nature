import { Stack } from 'expo-router';

import { GalleryCategoryFilterProvider } from '@/context/GalleryCategoryFilterContext';

export default function PublicUserLayout() {
  return (
    <GalleryCategoryFilterProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GalleryCategoryFilterProvider>
  );
}
