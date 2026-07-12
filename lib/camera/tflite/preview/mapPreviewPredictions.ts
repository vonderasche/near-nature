import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { mapKingdomPreviewPredictions } from '@/lib/camera/tflite/preview/mapKingdomPreviewPredictions';
import { formatPreviewConfidencePercent } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';
import type { PreviewModelId } from '@/lib/camera/tflite/preview/previewModelIds';
import { getPreviewModelDefinition } from '@/lib/camera/tflite/preview/previewModelRegistry';
import type { KingdomPreviewDisplayState } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

type ClassificationRow = { label: string; confidence: number };

export function mapPreviewPredictions(
  modelId: PreviewModelId,
  predictions: ClassificationRow[],
  displayStateRef: { current: KingdomPreviewDisplayState },
  dominantOrganismRef?: { current: string | null },
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const kind = getPreviewModelDefinition(modelId).kind;

  if (kind === 'kingdom' || kind === 'kingdom_global') {
    return mapKingdomPreviewPredictions(predictions, displayStateRef, dominantOrganismRef);
  }

  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const topRows = sorted.slice(0, modelId === 'n1' ? 1 : 3);
  return {
    organismDetected: topRows.length > 0,
    predictions: topRows.map((row, classIndex) => {
      const pct = formatPreviewConfidencePercent(row.confidence);
      return {
        classIndex,
        label: row.label,
        confidence: row.confidence,
        detail: modelId === 'n1' ? `${pct} confident` : pct,
      };
    }),
  };
}
