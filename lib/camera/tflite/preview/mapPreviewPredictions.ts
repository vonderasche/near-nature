import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { mapKingdomPreviewPredictions } from '@/lib/camera/tflite/preview/mapKingdomPreviewPredictions';
import type { PreviewModelId } from '@/lib/camera/tflite/preview/previewModelIds';
import { getPreviewModelDefinition } from '@/lib/camera/tflite/preview/previewModelRegistry';
import type { KingdomPreviewDisplayState } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

type ClassificationRow = { label: string; confidence: number };

export function mapPreviewPredictions(
  modelId: PreviewModelId,
  predictions: ClassificationRow[],
  displayStateRef: { current: KingdomPreviewDisplayState },
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const kind = getPreviewModelDefinition(modelId).kind;

  if (kind === 'kingdom' || kind === 'kingdom_global') {
    return mapKingdomPreviewPredictions(predictions, displayStateRef);
  }

  const topRows = predictions.slice(0, 3);
  return {
    organismDetected: topRows.length > 0,
    predictions: topRows.map((row, classIndex) => ({
      classIndex,
      label: row.label,
      confidence: row.confidence,
    })),
  };
}
