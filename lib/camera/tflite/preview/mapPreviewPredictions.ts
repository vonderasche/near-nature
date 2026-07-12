import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { mapKingdomPreviewPredictions } from '@/lib/camera/tflite/preview/mapKingdomPreviewPredictions';
import { formatPreviewConfidencePercent } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';
import type { PreviewModelId } from '@/lib/camera/tflite/preview/previewModelIds';
import { getPreviewModelDefinition } from '@/lib/camera/tflite/preview/previewModelRegistry';
import type { KingdomPreviewDisplayState } from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';
import { formatV14FamilyLabel } from '@/lib/camera/tflite/preview/v14FamilyDisplay';

type ClassificationRow = { label: string; confidence: number };

function mapPlainPreviewPredictions(
  modelId: PreviewModelId,
  predictions: ClassificationRow[],
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
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

function mapV14PreviewPredictions(
  predictions: ClassificationRow[],
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const topRows = sorted.slice(0, 3);
  return {
    organismDetected: topRows.length > 0 && topRows[0]?.label !== 'negative',
    predictions: topRows.map((row, classIndex) => ({
      classIndex,
      label: formatV14FamilyLabel(row.label),
      confidence: row.confidence,
      detail: formatPreviewConfidencePercent(row.confidence),
    })),
  };
}

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

  if (modelId === 'v14') {
    return mapV14PreviewPredictions(predictions);
  }

  return mapPlainPreviewPredictions(modelId, predictions);
}
