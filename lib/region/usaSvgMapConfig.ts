/** Lower-48 focus: omit Alaska and Hawaii insets from @svg-maps/usa. */
export const USA_HIDDEN_STATE_IDS = new Set(['ak', 'hi']);

/**
 * ViewBox that frames the lower 48 from @svg-maps/usa path bounds (8px padding).
 * Full map viewBox is `192 9 1028 746`, which leaves large AK/HI gutters.
 */
export const USA_CONUS_VIEW_BOX = {
  minX: 283,
  minY: 2,
  width: 945,
  height: 600,
} as const;

export const USA_CONUS_VIEW_BOX_STRING = `${USA_CONUS_VIEW_BOX.minX} ${USA_CONUS_VIEW_BOX.minY} ${USA_CONUS_VIEW_BOX.width} ${USA_CONUS_VIEW_BOX.height}`;

export const USA_CONUS_ASPECT_RATIO =
  USA_CONUS_VIEW_BOX.width / USA_CONUS_VIEW_BOX.height;
