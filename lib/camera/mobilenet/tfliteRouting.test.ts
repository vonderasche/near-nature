import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { ROUTING_PREVIEW_LABELS } from '@/lib/camera/mobilenet/top20PreviewLabels';
import {
  resolveSpecialistForPreviewLabel,
  TFLITE_ROUTING,
} from '@/lib/camera/mobilenet/tfliteRouting';

describe('tfliteRouting', () => {
  it('matches preview labels to app bundle preview metadata', () => {
    const labelsPath = join(
      process.cwd(),
      'assets/tflite/near_nature_app_bundle/routing_capture/mobilevit_routing/tflite/labels.json',
    );
    const labelsFile = JSON.parse(readFileSync(labelsPath, 'utf8')) as {
      labels: { index: number; name: string }[];
    };
    const labels = labelsFile.labels
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((row) => row.name);
    expect(TFLITE_ROUTING.preview_groups).toEqual(labels);
    expect(ROUTING_PREVIEW_LABELS).toEqual(labels);
  });

  it('routes bird preview to birds folder', () => {
    const resolved = resolveSpecialistForPreviewLabel('Bird');
    expect(resolved.routingId).toBe('birds');
    expect(resolved.assetFolder).toBe('birds');
    expect(resolved.inferenceMode).toBe('genus_direct');
    expect(resolved.displayName).toBe('Birds');
  });

  it('routes snake preview to herps genus model', () => {
    const resolved = resolveSpecialistForPreviewLabel('Snake');
    expect(resolved.routingId).toBe('herps');
    expect(resolved.assetFolder).toBe('herps');
    expect(resolved.inferenceMode).toBe('genus_direct');
  });

  it('returns null routing for non-organism preview', () => {
    expect(resolveSpecialistForPreviewLabel('No Plant or Animal').assetFolder).toBeNull();
  });
});
