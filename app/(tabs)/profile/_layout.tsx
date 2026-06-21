import { Stack } from 'expo-router';

import {
  GalleryCategoryFilterProvider,
  PROFILE_GALLERY_FILTER_STORAGE_KEY,
} from '@/context/GalleryCategoryFilterContext';

export default function ProfileStackLayout() {
  return (
    <GalleryCategoryFilterProvider persistKey={PROFILE_GALLERY_FILTER_STORAGE_KEY}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="edit-motto" />
        <Stack.Screen name="edit-state" />
        <Stack.Screen name="gallery-filter" />
        <Stack.Screen name="detection/[detectionId]" />
      </Stack>
    </GalleryCategoryFilterProvider>
  );
}
