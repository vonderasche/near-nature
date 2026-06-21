import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  trailing?: ReactNode;
};

/** Profile / Discover / Rankings search row with optional filter and layout controls. */
export function ListSearchToolbar({
  searchQuery,
  onSearchQueryChange,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
  trailing,
}: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      <ScreenSearchField
        borderless
        containerStyle={styles.searchField}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
  },
});
