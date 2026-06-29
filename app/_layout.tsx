import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

import { AuthGate } from '@/components/layout/auth-gate';
import { ClassificationDebugPreferenceBootstrap } from '@/components/layout/classification-debug-preference-bootstrap';
import { LocalDatabaseErrorBanner } from '@/components/layout/local-database-error-banner';
import { NavigationThemeBridge } from '@/components/layout/navigation-theme-bridge';
import { FirstLoginWelcomeModal } from '@/components/welcome/first-login-welcome-modal';
import { AuthProvider } from '@/context/AuthContext';
import { LocalDatabaseProvider } from '@/context/LocalDatabaseContext';
import { RegionProvider } from '@/context/RegionContext';
import { AppThemeProvider } from '@/context/ThemeContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <ClassificationDebugPreferenceBootstrap />
          <LocalDatabaseProvider>
            <AppThemeProvider>
              <RegionProvider>
                <NavigationThemeBridge>
                  <AuthGate>
                    <LocalDatabaseErrorBanner />
                    <Stack>
                      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="user" options={{ headerShown: false }} />
                    </Stack>
                  </AuthGate>
                  <FirstLoginWelcomeModal />
                </NavigationThemeBridge>
              </RegionProvider>
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
