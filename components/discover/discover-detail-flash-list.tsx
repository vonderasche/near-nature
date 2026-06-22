import { FlashList } from '@shopify/flash-list';
import { useCallback, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { DISCOVER_FLASH_LIST_DRAW_DISTANCE } from '@/lib/discover/discoverFlashListLayout';

type Props<T> = {
  data: readonly T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  rowHeight: number;
  accessibilityLabel: string;
};

export function DiscoverDetailFlashList<T>({
  data,
  keyExtractor,
  renderItem,
  rowHeight,
  accessibilityLabel,
}: Props<T>) {
  const flashRenderItem = useCallback(
    ({ item }: { item: T }) => renderItem(item),
    [renderItem],
  );

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }) => {
      layout.size = rowHeight;
    },
    [rowHeight],
  );

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.listWrap}>
      <FlashList
        data={data as T[]}
        renderItem={flashRenderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        drawDistance={DISCOVER_FLASH_LIST_DRAW_DISTANCE}
        overrideItemLayout={overrideItemLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    minHeight: 2,
  },
});
