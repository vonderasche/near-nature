import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import type { EventArg } from '@react-navigation/native';

import { HapticTab } from '@/components/layout/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authColors, tint } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { routes } from '@/lib/routing/routes';

type TabPressEvent = EventArg<'tabPress', true, undefined>;
type AuthRequiredTab = 'camera' | 'profile';

const AUTH_TAB_MESSAGES: Record<AuthRequiredTab, string> = {
  camera: 'Sign in to identify and save species with the camera.',
  profile: 'Sign in to view your profile, gallery, and badges.',
};

export default function TabLayout() {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  const requireAuthOnTabPress = (tab: AuthRequiredTab) => (event: TabPressEvent) => {
    if (isAuthenticated) return;

    event.preventDefault();
    Alert.alert('Sign in required', AUTH_TAB_MESSAGES[tab], [
      { text: 'Not now', style: 'cancel' },
      { text: 'Log in', onPress: () => router.push(routes.login) },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: authColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: authColors.background,
          borderTopColor: authColors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="camera"
        listeners={{
          tabPress: requireAuthOnTabPress('camera'),
        }}
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
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
          tabPress: requireAuthOnTabPress('profile'),
        }}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
