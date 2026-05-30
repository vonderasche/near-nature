import { TFLITE_ROUTING } from '@/lib/camera/mobilenet/tfliteRouting';

/** Preview class names aligned with app bundle routing.json / preview_classifier.tflite. */
export const MOBILENET_TOP20_PREVIEW_LABELS = TFLITE_ROUTING.preview_groups;

export function getMobileNetTop20PreviewLabel(classIndex: number): string {
  return MOBILENET_TOP20_PREVIEW_LABELS[classIndex] ?? `Class ${classIndex}`;
}
