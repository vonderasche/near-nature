/** Live kingdom preview: minimum top-1 probability for a confident "Looks like…" call. */
export const MVP_KINGDOM_TOP1_THRESHOLD = 0.78;

/** Top class must lead second place by at least this much (absolute probability). */
export const MVP_KINGDOM_TOP1_MARGIN = 0.15;

/** Soft signal — show "Might be a plant/animal" (aligned with scene-gate maybe tier). */
export const KINGDOM_PREVIEW_MAYBE_THRESHOLD = 0.45;

/** Hysteresis — keep maybe/confident latched across noisy frames. */
export const KINGDOM_PREVIEW_RELEASE_THRESHOLD = 0.35;

/** v6 capture kingdom gate (photo ID) — preview tiers are softer for live feedback. */
export { V6_KINGDOM_THRESHOLD } from '@/lib/camera/tflite/v6/v6Routing';
