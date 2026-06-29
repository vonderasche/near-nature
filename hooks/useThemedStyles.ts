import { useMemo } from 'react';

import type { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/useTheme';

/** Build StyleSheet styles from the active theme (recomputed when appearance changes). */
export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme]);
}
