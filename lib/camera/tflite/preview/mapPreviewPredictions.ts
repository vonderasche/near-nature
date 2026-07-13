import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import type { PreviewModelId } from '@/lib/camera/tflite/preview/previewModelIds';
import { formatV14FamilyLabel } from '@/lib/camera/tflite/preview/v14FamilyDisplay';

type ClassificationRow = { label: string; confidence: number };

function formatPreviewConfidencePercent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
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
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  if (modelId === 'v14') {
    return mapV14PreviewPredictions(predictions);
  }

  throw new Error(`Unsupported preview model id: ${modelId}`);
}
