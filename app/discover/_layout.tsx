import { Stack } from 'expo-router';

export default function DiscoverStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#000000' },
      }}>
      <Stack.Screen name="species" options={{ title: 'Top species' }} />
      <Stack.Screen name="ecosystems" options={{ title: 'Regional guide' }} />
      <Stack.Screen name="parks" options={{ title: 'Parks' }} />
      <Stack.Screen name="park/[parkId]" options={{ title: 'Park' }} />
    </Stack>
  );
}
