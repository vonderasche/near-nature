import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthGate } from '@/components/layout/auth-gate';
import { FirstLoginWelcomeModal } from '@/components/welcome/first-login-welcome-modal';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  /** Guests land on Explorer Board; signed-in users are routed to Camera via tabs index. */
  initialRouteName: '(tabs)',
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
            <FirstLoginWelcomeModal />
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
