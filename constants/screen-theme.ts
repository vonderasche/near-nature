/**
 * Full-screen and camera UI tokens. Auth screens keep using `auth-theme`; these are for immersive
 * dark surfaces (camera, preview) so hex values are not scattered across feature components.
 */
export const screenColors = {
  darkBackground: '#000000',
  /** Scrim behind bottom camera controls */
  darkToolbar: 'rgba(0,0,0,0.45)',
  onDark: '#ffffff',
} as const;
