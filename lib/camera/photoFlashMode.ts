export type PhotoFlashMode = 'off' | 'auto' | 'on';

const CYCLE_ORDER: PhotoFlashMode[] = ['off', 'auto', 'on'];

export function cyclePhotoFlashMode(current: PhotoFlashMode): PhotoFlashMode {
  const index = CYCLE_ORDER.indexOf(current);
  return CYCLE_ORDER[(index + 1) % CYCLE_ORDER.length];
}

export function photoFlashAccessibilityLabel(mode: PhotoFlashMode): string {
  switch (mode) {
    case 'off':
      return 'Flash off';
    case 'auto':
      return 'Flash auto';
    case 'on':
      return 'Flash on';
  }
}

export function photoFlashCaption(mode: PhotoFlashMode): string {
  switch (mode) {
    case 'off':
      return 'Off';
    case 'auto':
      return 'Auto';
    case 'on':
      return 'On';
  }
}

import type { HeroIconName } from '@/components/ui/hero-icon';

/** Heroicon name for the current flash mode. */
export function photoFlashIconName(mode: PhotoFlashMode): HeroIconName {
  switch (mode) {
    case 'off':
      return 'bolt-slash';
    case 'auto':
      return 'bolt';
    case 'on':
      return 'bolt';
  }
}
