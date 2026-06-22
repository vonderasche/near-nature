import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { DiscoverGridTile } from '@/components/discover/discover-grid-tile';
import type { DiscoverGridRowEntry } from '@/lib/discover/buildDiscoverGridRows';

type Props = {
  row: DiscoverGridRowEntry;
  tileSize: number;
  tileGap: number;
  rowHeight: number;
};

function DiscoverGridRowComponent({ row, tileSize, tileGap, rowHeight }: Props) {
  return (
    <View style={[styles.row, { gap: tileGap, marginBottom: tileGap, height: rowHeight }]}>
      {row.items.map((item) => (
        <DiscoverGridTile key={item.key} item={item} tileSize={tileSize} />
      ))}
    </View>
  );
}

export const DiscoverGridRow = memo(DiscoverGridRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});
