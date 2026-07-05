import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import {
  buildKingdomPreviewFeedback,
  type KingdomPreviewDisplayState,
} from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

export { isKingdomPreviewConfident } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

type ClassificationRow = { label: string; confidence: number };

export function mapKingdomPreviewPredictions(
  predictions: readonly ClassificationRow[],
  displayStateRef?: { current: KingdomPreviewDisplayState },
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const previous = displayStateRef?.current ?? 'searching';
  const feedback = buildKingdomPreviewFeedback(predictions, previous);

  if (displayStateRef) {
    displayStateRef.current = feedback.tier;
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
