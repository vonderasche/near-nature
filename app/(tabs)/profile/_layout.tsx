import { Stack } from 'expo-router';

import { ProfileGalleryProvider } from '@/context/ProfileGalleryContext';

export default function ProfileStackLayout() {
  return (
    <ProfileGalleryProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="edit-motto" />
        <Stack.Screen name="edit-state" />
        <Stack.Screen name="gallery-filter" />
        <Stack.Screen name="detection/[detectionId]" />
      </Stack>
    </ProfileGalleryProvider>
  );
}
