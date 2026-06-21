import { Stack } from 'expo-router';

import { PublicGalleryProvider } from '@/context/PublicGalleryContext';

export default function PublicUserLayout() {
  return (
    <PublicGalleryProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PublicGalleryProvider>
  );
}
