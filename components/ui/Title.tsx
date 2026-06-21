import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

type TitleProps = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export function Title({ children, style }: TitleProps) {
  const { theme } = useTheme();

  return (
    <RNText style={[theme.typography.title, { color: theme.colors.textPrimary }, style]}>
      {children}
    </RNText>
  );
}
