import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

import { AuthGate } from '@/components/layout/auth-gate';
import { LocalDatabaseErrorBanner } from '@/components/layout/local-database-error-banner';
import { FirstLoginWelcomeModal } from '@/components/welcome/first-login-welcome-modal';
import { AuthProvider } from '@/context/AuthContext';
import { LocalDatabaseProvider } from '@/context/LocalDatabaseContext';
import { AppThemeProvider } from '@/context/ThemeContext';

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
          <LocalDatabaseProvider>
            <AppThemeProvider>
            <ThemeProvider value={navigationTheme}>
              <AuthGate>
                <LocalDatabaseErrorBanner />
                <Stack>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="user/[userId]" options={{ title: 'Member' }} />
                </Stack>
              </AuthGate>
              <FirstLoginWelcomeModal />
              <StatusBar style="light" />
            </ThemeProvider>
            </AppThemeProvider>
          </LocalDatabaseProvider>
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
