import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import {
  buildKingdomPreviewFeedback,
  dominantOrganismLabel,
  type KingdomPreviewDisplayState,
} from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

export { isKingdomPreviewConfident } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

type ClassificationRow = { label: string; confidence: number };

export function mapKingdomPreviewPredictions(
  predictions: readonly ClassificationRow[],
  displayStateRef?: { current: KingdomPreviewDisplayState },
  dominantOrganismRef?: { current: string | null },
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const previous = displayStateRef?.current ?? 'searching';
  const previousOrganism = dominantOrganismRef?.current ?? null;
  const feedback = buildKingdomPreviewFeedback(predictions, previous, previousOrganism);

  if (displayStateRef) {
    displayStateRef.current = feedback.tier;
  }

  if (dominantOrganismRef) {
    const probs = Object.fromEntries(predictions.map((row) => [row.label, row.confidence]));
    dominantOrganismRef.current = dominantOrganismLabel(probs);
  }

  return {
    organismDetected: feedback.organismDetected,
    predictions: [
      {
        classIndex: 0,
        label: feedback.headline,
        confidence: feedback.confidence,
        detail: feedback.detail || undefined,
      },
    ],
  };
}
