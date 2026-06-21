import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { routes } from '@/lib/routing/routes';

/** Default tab: Explorer Board for guests, Camera when signed in. */
export default function TabsIndex() {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <CenteredActivityIndicator accessibilityLabel="Loading" />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
