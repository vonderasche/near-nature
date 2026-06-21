import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onClearSearch?: () => void;
  onClearFilter?: () => void;
  onShowAll?: () => void;
  showAllLabel?: string;
};

export function ListEmptyActions({
  onClearSearch,
  onClearFilter,
  onShowAll,
  showAllLabel = 'Show all',
}: Props) {
  const { theme } = useTheme();
  const actions = [
    onClearSearch ? { label: 'Clear search', onPress: onClearSearch } : null,
    onClearFilter ? { label: 'Clear filter', onPress: onClearFilter } : null,
    onShowAll ? { label: showAllLabel, onPress: onShowAll } : null,
  ].filter(Boolean) as { label: string; onPress: () => void }[];

  if (actions.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm, width: '100%' }}>
      {actions.map((action) => (
        <Button key={action.label} title={action.label} variant="outline" fillParent onPress={action.onPress} />
      ))}
    </View>
  );
}
