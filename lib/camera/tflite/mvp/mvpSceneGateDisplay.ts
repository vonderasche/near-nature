/** python/training/v3/experiments/cascades/mvp_capture.json */
export const MVP_SCENE_GATE_ORGANISM_MAYBE_THRESHOLD = 0.45;
export const MVP_SCENE_GATE_ORGANISM_THRESHOLD = 0.7;
/** Lower than maybe — keeps "Subject found" / "Maybe" latched across noisy frames. */
export const MVP_SCENE_GATE_ORGANISM_RELEASE_THRESHOLD = 0.35;

export type MvpSceneGateDisplayState = 'searching' | 'maybe' | 'found';

export function resolveMvpSceneGateDisplayState(
  organismConfidence: number,
  previous: MvpSceneGateDisplayState,
): MvpSceneGateDisplayState {
  if (organismConfidence >= MVP_SCENE_GATE_ORGANISM_THRESHOLD) {
    return 'found';
  }
  if (previous === 'found' && organismConfidence >= MVP_SCENE_GATE_ORGANISM_RELEASE_THRESHOLD) {
    return 'found';
  }
  if (organismConfidence >= MVP_SCENE_GATE_ORGANISM_MAYBE_THRESHOLD) {
    return 'maybe';
  }
  if (previous === 'maybe' && organismConfidence >= MVP_SCENE_GATE_ORGANISM_RELEASE_THRESHOLD) {
    return 'maybe';
  }
  return 'searching';
}

export function mvpSceneGateDisplayStateToLabel(state: MvpSceneGateDisplayState): string {
  switch (state) {
    case 'found':
      return 'Subject found';
    case 'maybe':
      return 'Maybe…';
    default:
      return 'Searching…';
  }
}

export function formatMvpSceneGatePreviewLabel(organismConfidence: number): string {
  return mvpSceneGateDisplayStateToLabel(
    resolveMvpSceneGateDisplayState(organismConfidence, 'searching'),
  );
}
