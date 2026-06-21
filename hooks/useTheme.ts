import { useContext } from 'react';

import { ThemeContext } from '@/context/ThemeContext';
import { defaultThemeName, themes } from '@/constants/themes';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  return {
    theme: themes[defaultThemeName],
    themeName: defaultThemeName,
    setThemeName: () => {},
    ready: true,
  };
}
