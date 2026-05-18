import { authSpacing } from '@/constants/auth-theme';

/** Approximate height of `CameraBottomToolbar` (shutter row + padding, excluding home indicator). */
export const CAMERA_BOTTOM_TOOLBAR_BODY_HEIGHT = 104;

/** Bottom offset for zoom chips so they sit above the toolbar. */
export function cameraZoomChipsBottomOffset(safeAreaBottom: number): number {
  return safeAreaBottom + CAMERA_BOTTOM_TOOLBAR_BODY_HEIGHT + authSpacing.sm;
}
