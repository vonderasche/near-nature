import { StyleSheet, View } from 'react-native';

import { AppGuideButton } from '@/components/shared/app-guide-button';
import { ProfileSettingsButton } from '@/components/profile/profile-settings-button';

export function ProfileHeaderActions() {
  return (
    <View style={styles.row}>
      <AppGuideButton />
      <ProfileSettingsButton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
