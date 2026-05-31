import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type UserProfileSummaryProps = {
  /** Rendered below the identity block (e.g. stat strip). */
  statsSlot?: ReactNode;
};

export function UserProfileSummary({ statsSlot }: UserProfileSummaryProps) {
  if (!statsSlot) return null;

  return (
    <View style={styles.block}>
      <View style={styles.statsSlot}>{statsSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  statsSlot: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
