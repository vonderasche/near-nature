/** Keep a popover fully on screen, preferring horizontal center on its anchor. */
export function clampPopoverLeft(
  anchorX: number,
  anchorWidth: number,
  popoverWidth: number,
  windowWidth: number,
  inset = 8,
): number {
  const centered = anchorX + anchorWidth / 2 - popoverWidth / 2;
  const maxLeft = windowWidth - popoverWidth - inset;
  return Math.max(inset, Math.min(centered, maxLeft));
}
