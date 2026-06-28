import type { LiveClassifierPrediction } from '@/lib/camera/liveClassifierTypes';
import { MVP_ORGANISM_LABEL } from '@/lib/camera/tflite/mvp/mvpCaptureConfig';
import {
  mvpSceneGateDisplayStateToLabel,
  resolveMvpSceneGateDisplayState,
  type MvpSceneGateDisplayState,
} from '@/lib/camera/tflite/mvp/mvpSceneGateDisplay';
import { mapKingdomPreviewPredictions } from '@/lib/camera/tflite/preview/mapKingdomPreviewPredictions';
import type { PreviewModelId } from '@/lib/camera/tflite/preview/previewModelIds';
import { getPreviewModelDefinition } from '@/lib/camera/tflite/preview/previewModelRegistry';

type ClassificationRow = { label: string; confidence: number };

export function mapPreviewPredictions(
  modelId: PreviewModelId,
  predictions: ClassificationRow[],
  sceneGateStateRef: { current: MvpSceneGateDisplayState },
): { predictions: LiveClassifierPrediction[]; organismDetected: boolean } {
  const kind = getPreviewModelDefinition(modelId).kind;

  if (kind === 'kingdom') {
    return mapKingdomPreviewPredictions(predictions);
  }

  if (kind === 'scene_gate') {
    const organismRow = predictions.find((row) => row.label === MVP_ORGANISM_LABEL);
    const organismConfidence = organismRow?.confidence ?? 0;
    const displayState = resolveMvpSceneGateDisplayState(
      organismConfidence,
      sceneGateStateRef.current,
    );
    sceneGateStateRef.current = displayState;

    return {
      organismDetected: displayState === 'found',
      predictions: [
        {
          classIndex: 0,
          label: mvpSceneGateDisplayStateToLabel(displayState),
          confidence: organismConfidence,
        },
      ],
    };
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
