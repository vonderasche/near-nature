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

/** Material Icons name for the current flash mode. */
export function photoFlashIconName(mode: PhotoFlashMode): 'flash-off' | 'flash-auto' | 'flash-on' {
  switch (mode) {
    case 'off':
      return 'flash-off';
    case 'auto':
      return 'flash-auto';
    case 'on':
      return 'flash-on';
  }
}
