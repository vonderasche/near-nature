import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import {
  MVP_KINGDOM_TOP1_MARGIN,
  MVP_KINGDOM_TOP1_THRESHOLD,
} from '@/lib/camera/tflite/preview/kingdomPreviewThresholds';
import { formatV3KingdomPreviewLabel } from '@/lib/camera/tflite/v3/v3Taxonomy';

type ClassificationRow = { label: string; confidence: number };

export function isKingdomPreviewConfident(
  predictions: readonly ClassificationRow[],
): boolean {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];
  if (!top || top.label === 'uncertain') {
    return false;
  }
  if (top.confidence < MVP_KINGDOM_TOP1_THRESHOLD) {
    return false;
  }
  const second = sorted[1];
  const margin = second ? top.confidence - second.confidence : top.confidence;
  return margin >= MVP_KINGDOM_TOP1_MARGIN;
}

export function mapKingdomPreviewPredictions(
  predictions: readonly ClassificationRow[],
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];
  if (!top) {
    return { predictions: [], organismDetected: false };
  }

  const confident = isKingdomPreviewConfident(predictions);

  if (!confident) {
    return {
      organismDetected: false,
      predictions: [
        {
          classIndex: 0,
          label: formatV3KingdomPreviewLabel('uncertain'),
          confidence: top.confidence,
        },
      ],
    };
  }

  return {
    organismDetected: true,
    predictions: [
      {
        classIndex: 0,
        label: formatV3KingdomPreviewLabel(top.label),
        confidence: top.confidence,
      },
    ],
  };
}
