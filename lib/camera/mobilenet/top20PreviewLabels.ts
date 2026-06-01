import { TFLITE_ROUTING } from '@/lib/camera/mobilenet/tfliteRouting';

/** Preview/routing class names aligned with the routing model label order. */
export const ROUTING_PREVIEW_LABELS = TFLITE_ROUTING.preview_groups;

export function getRoutingPreviewLabel(classIndex: number): string {
  return ROUTING_PREVIEW_LABELS[classIndex] ?? `Class ${classIndex}`;
}
