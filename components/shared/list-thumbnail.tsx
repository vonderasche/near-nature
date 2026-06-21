import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export const LIST_THUMB_SIZE = 56;

type Props = {
  uri?: string | null;
  recyclingKey?: string;
};

export function ListThumbnail({ uri, recyclingKey }: Props) {
  const { theme } = useTheme();
  const trimmed = uri?.trim();

  return (
    <View style={styles.wrap}>
      {trimmed ? (
        <Image
          source={{ uri: trimmed }}
          style={[
            styles.thumb,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
          ]}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey ?? trimmed}
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.thumb,
            styles.placeholder,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: LIST_THUMB_SIZE,
    height: LIST_THUMB_SIZE,
    flexShrink: 0,
  },
  thumb: {
    width: LIST_THUMB_SIZE,
    height: LIST_THUMB_SIZE,
    borderWidth: 1,
  },
  placeholder: {
    opacity: 0.35,
  },
});
