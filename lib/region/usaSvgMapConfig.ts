/** Lower-48 focus: omit Alaska and Hawaii insets from @svg-maps/usa. */
export const USA_HIDDEN_STATE_IDS = new Set(['ak', 'hi']);

/**
 * ViewBox framing the lower 48 from @svg-maps/usa path bounds (16px padding).
 * Full map viewBox is `192 9 1028 746`, which leaves large AK/HI gutters.
 *
 * Bounds of visible states (excl. AK/HI): ~291×154 to ~1220×595.
 */
export const USA_CONUS_VIEW_BOX = {
  minX: 275,
  minY: 0,
  width: 960,
  height: 612,
} as const;

export const USA_CONUS_VIEW_BOX_STRING = `${USA_CONUS_VIEW_BOX.minX} ${USA_CONUS_VIEW_BOX.minY} ${USA_CONUS_VIEW_BOX.width} ${USA_CONUS_VIEW_BOX.height}`;

export const USA_CONUS_ASPECT_RATIO =
  USA_CONUS_VIEW_BOX.width / USA_CONUS_VIEW_BOX.height;
