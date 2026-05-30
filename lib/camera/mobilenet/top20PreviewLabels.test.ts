import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { MOBILENET_TOP20_PREVIEW_LABELS } from '@/lib/camera/mobilenet/top20PreviewLabels';

type LabelsFile = {
  labels: { index: number; name: string }[];
};

describe('MOBILENET_TOP20_PREVIEW_LABELS', () => {
  it('matches the bundled TFLite labels metadata', () => {
    const labelsPath = join(
      process.cwd(),
      'assets/tflite/near_nature_app_bundle/preview/labels.json',
    );
    const labelsFile = JSON.parse(readFileSync(labelsPath, 'utf8')) as LabelsFile;
    const labels = labelsFile.labels
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((label) => label.name);

    expect(labels).toEqual([...MOBILENET_TOP20_PREVIEW_LABELS]);
  });
});
