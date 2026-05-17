import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthGate } from '@/components/layout/auth-gate';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  /** Start at auth (not tabs). `app/index` removed so we do not rely on a redirect. */
  initialRouteName: '(auth)',
};

/** Stack / header chrome: black surface, light text (matches `authColors`). */
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#0a7ea4',
    background: '#000000',
    card: '#000000',
    text: '#ffffff',
    border: '#3d3d3d',
    notification: '#0a7ea4',
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider value={navigationTheme}>
            <AuthGate>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="user/[userId]" options={{ title: 'Member' }} />
              </Stack>
            </AuthGate>
            <StatusBar style="light" />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
