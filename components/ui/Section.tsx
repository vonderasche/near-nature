import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';

type SectionProps = {
  title: string;
  children: ReactNode;
  /** Extra top margin before this section. */
  spaced?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Section({ title, children, spaced, style }: SectionProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          marginTop: spaced ? theme.spacing.xl : theme.spacing.lg,
          gap: theme.spacing.sm,
        },
        style,
      ]}>
      <Text variant="label">{title}</Text>
      {children}
    </View>
  );
}
