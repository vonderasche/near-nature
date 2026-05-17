import { StyleSheet, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeading } from '@/components/screen/screen-heading';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { contentInsetsPadding } from '@/lib/screen/contentInsets';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const edge = contentInsetsPadding(insets);

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: edge.paddingTop,
          paddingBottom: edge.paddingBottom + tabBarHeight,
          paddingHorizontal: authSpacing.lg,
        },
      ]}>
      <ScreenHeading title="Discover" marginBottom={authSpacing.md} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
});
