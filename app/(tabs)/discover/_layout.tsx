import { Stack } from 'expo-router';

import { DiscoverSpeciesBrowseProvider } from '@/context/DiscoverSpeciesBrowseContext';

export default function DiscoverStackLayout() {
  return (
    <DiscoverSpeciesBrowseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="park/[parkId]" />
        <Stack.Screen name="species/[speciesSlug]" />
        <Stack.Screen name="species-filter" />
      </Stack>
    </DiscoverSpeciesBrowseProvider>
  );
}
