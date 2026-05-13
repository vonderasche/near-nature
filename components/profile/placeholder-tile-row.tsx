import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { authSpacing } from '@/constants/auth-theme';

type PlaceholderTileRowProps = {
  count: number;
  borderColor: string;
  iconColor: string;
  accessibilityLabelPrefix?: string;
};

export function PlaceholderTileRow({
  count,
  borderColor,
  iconColor,
  accessibilityLabelPrefix = 'Gallery placeholder',
}: PlaceholderTileRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="Gallery image placeholders">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.tile, { borderColor }]}
          accessibilityLabel={`${accessibilityLabelPrefix} ${i + 1} of ${count}`}
          accessibilityRole="image">
          <MaterialIcons name="image" size={32} color={iconColor} importantForAccessibility="no" />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  tile: {
    width: 104,
    height: 104,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
