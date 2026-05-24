import { describe, expect, it } from 'vitest';

import {
  parseIdentificationResponse,
  repairTruncatedJsonArray,
  stripTrailingCommasInJson,
} from '@/api/identificationShared';

describe('stripTrailingCommasInJson', () => {
  it('removes trailing comma before closing brace', () => {
    expect(stripTrailingCommasInJson('{"confidence": 0.98,}')).toBe('{"confidence": 0.98}');
  });
});

describe('repairTruncatedJsonArray', () => {
  it('closes a cut-off array', () => {
    const raw = `[
  {
    "latinName": "Felis catus",
    "commonName": "Domestic cat",
    "confidence": 0.98,
    "taxonGroup": "animals",
    "subcategory": "carnivores"`;
    const repaired = repairTruncatedJsonArray(raw);
    const parsed = JSON.parse(repaired);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });
});

describe('parseIdentificationResponse', () => {
  it('parses array with trailing commas', () => {
    const text = `[
  {
    "latinName": "Felis catus",
    "commonName": "Domestic cat",
    "confidence": 0.98,
    "taxonGroup": "animals",
    "subcategory": "carnivores",
  },
]`;
    const results = parseIdentificationResponse(text, 'Gemini');
    expect(results).toHaveLength(1);
    expect(results[0]?.latinName).toBe('Felis catus');
  });
});
