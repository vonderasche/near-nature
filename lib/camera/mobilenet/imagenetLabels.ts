import labels from '@/assets/tflite/imagenet_labels.json';

/** ImageNet label for a model output index (includes background at 0). */
export function getImageNetLabel(classIndex: number): string {
  const row = labels[classIndex];
  if (typeof row === 'string' && row.trim()) return row.trim();
  return `class ${classIndex}`;
}
