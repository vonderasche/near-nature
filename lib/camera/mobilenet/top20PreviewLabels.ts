export const MOBILENET_TOP20_PREVIEW_LABELS = [
  'Tree',
  'Shrub / Bush',
  'Wildflower',
  'Grass / Sedge',
  'Fern',
  'Cactus / Succulent',
  'Bird',
  'Reptile / Lizard',
  'Snake',
  'Turtle',
  'Frog / Amphibian',
  'Butterfly / Moth',
  'Insect (other)',
  'Freshwater Fish',
  'Spider / Arachnid',
  'Dog',
  'Cat',
  'Horse / Livestock',
  'Fungi / Mushroom',
  'No Plant or Animal',
] as const;

export function getMobileNetTop20PreviewLabel(classIndex: number): string {
  return MOBILENET_TOP20_PREVIEW_LABELS[classIndex] ?? `Class ${classIndex}`;
}
