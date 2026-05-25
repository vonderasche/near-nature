export const MOBILENET_TOP16_GROUP_LABELS = [
  'Flowering Plant',
  'Bird',
  'Dragonfly/Damselfly',
  'Butterfly/Moth',
  'Cactus',
  'Legume',
  'Tree/Shrub',
  'Snake',
  'Bee/Wasp',
  'Conifer',
  'Fern',
  'Beetle',
  'Frog',
  'Lizard',
  'Palm',
  'Grass',
] as const;

export function getMobileNetTop16GroupLabel(classIndex: number): string {
  return MOBILENET_TOP16_GROUP_LABELS[classIndex] ?? `Class ${classIndex}`;
}
