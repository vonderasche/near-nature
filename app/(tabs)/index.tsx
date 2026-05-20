import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { authColors } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { routes } from '@/lib/routing/routes';

/** Default tab: Explorer Board for guests, Camera when signed in. */
export default function TabsIndex() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={authColors.text} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={routes.cameraTab} />;
  }

  return <Redirect href={routes.explorerBoardTab} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: authColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
