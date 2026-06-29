import { authSpacing } from '@/constants/auth-theme';

/** Fixed colors for camera chrome over the live preview (not tied to app theme). */
export const cameraControlColors = {
  icon: '#000000',
  iconDisabled: 'rgba(0,0,0,0.35)',
  label: '#000000',
  labelDisabled: 'rgba(0,0,0,0.35)',
  shutterRing: '#ffffff',
  shutterFill: '#ffffff',
} as const;

/** Approximate height of `CameraBottomToolbar` (shutter row + padding, excluding home indicator). */
export const CAMERA_BOTTOM_TOOLBAR_BODY_HEIGHT = 104;

/** Bottom offset for zoom chips so they sit above the toolbar. */
export function cameraZoomChipsBottomOffset(safeAreaBottom: number): number {
  return safeAreaBottom + CAMERA_BOTTOM_TOOLBAR_BODY_HEIGHT + authSpacing.sm;
}

/** Approximate height of the zoom chip row (padding + chip). */
export const CAMERA_ZOOM_CHIPS_ROW_HEIGHT = 44;

/** Bottom offset for live classifier overlay — sits above zoom chips. */
export function cameraLivePredictionsBottomOffset(safeAreaBottom: number): number {
  return (
    cameraZoomChipsBottomOffset(safeAreaBottom) + CAMERA_ZOOM_CHIPS_ROW_HEIGHT + authSpacing.lg
  );
}
