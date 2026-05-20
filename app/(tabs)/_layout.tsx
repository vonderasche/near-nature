import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import type { EventArg } from '@react-navigation/native';

import { HapticTab } from '@/components/layout/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/lib/routing/routes';

type TabPressEvent = EventArg<'tabPress', true, undefined>;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  const requireAuthOnTabPress = (event: TabPressEvent) => {
    if (!isAuthenticated) {
      event.preventDefault();
      router.push(routes.login);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: '#3d3d3d',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="camera"
        listeners={{
          tabPress: requireAuthOnTabPress,
        }}
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explorer-board"
        options={{
          title: 'Explorer Board',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: requireAuthOnTabPress,
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
