import type { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

import { HeroIconFromSymbol, type IconSymbolName } from '@/components/ui/hero-icon';

export type { IconSymbolName };

/** Cross-platform icons (Heroicons). */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: string;
}) {
  return (
    <HeroIconFromSymbol
      name={name}
      size={size}
      color={typeof color === 'string' ? color : '#ffffff'}
      style={style}
    />
  );
}
