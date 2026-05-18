import {
  animalSubcategoryIdsForPrompt,
  plantSubcategoryIdsForPrompt,
} from '@/constants/species-subcategories';
import type { ClassificationResult, VisionTaxonGroup } from '@/types';

const ANIMAL_SUBCATEGORIES = animalSubcategoryIdsForPrompt();
const PLANT_SUBCATEGORIES = plantSubcategoryIdsForPrompt();

export const IDENTIFICATION_PROMPT = `
Identify every plant, animal, fungus, and bird that is clearly visible in this image.

Return ONLY a JSON array. No markdown, no explanation, no code fences. Just the raw JSON.

Each item in the array must have exactly these fields:
{
  "latinName":   "Genus species",
  "commonName":  "Common English name",
  "confidence":  0.95,
  "taxonGroup":  "plants" | "animals" | "fungi" | "birds",
  "subcategory": "<see rules below>",
  "boundingBox": { "x": 10, "y": 20, "width": 40, "height": 50 }
}

boundingBox values are percentages of the image dimensions (0–100).
confidence is a number between 0 and 1.
taxonGroup must be one of exactly: plants, animals, fungi, birds.

subcategory rules (required for plants, animals, and birds; omit or use "other" for fungi):
- When taxonGroup is "animals" or "birds", subcategory must be one of: ${ANIMAL_SUBCATEGORIES}
- When taxonGroup is "plants", subcategory must be one of: ${PLANT_SUBCATEGORIES}
- Pick the single best match (e.g. hawk → raptors, oak → trees, frog → frogs_toads).

If no species are identifiable, return an empty array: []
`.trim();

const VALID_TAXON_GROUPS: VisionTaxonGroup[] = ['animals', 'plants', 'fungi', 'birds'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isValidClassification(item: unknown): item is {
  latinName: string;
  commonName: string;
  confidence: number;
  taxonGroup: VisionTaxonGroup;
  subcategory?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
} {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.latinName === 'string' &&
    obj.latinName.trim().length > 0 &&
    typeof obj.commonName === 'string' &&
    typeof obj.confidence === 'number' &&
    VALID_TAXON_GROUPS.includes(obj.taxonGroup as VisionTaxonGroup)
  );
}

export function sanitizeClassifications(parsed: unknown[]): ClassificationResult[] {
  return parsed
    .filter(isValidClassification)
    .map((item) => ({
      latinName: String(item.latinName).trim(),
      commonName: String(item.commonName).trim(),
      confidence: clamp(Number(item.confidence), 0, 1),
      taxonGroup: item.taxonGroup as VisionTaxonGroup,
      subcategory:
        typeof item.subcategory === 'string' && item.subcategory.trim()
          ? item.subcategory.trim()
          : undefined,
      boundingBox: item.boundingBox
        ? {
            x: clamp(Number(item.boundingBox.x), 0, 100),
            y: clamp(Number(item.boundingBox.y), 0, 100),
            width: clamp(Number(item.boundingBox.width), 0, 100),
            height: clamp(Number(item.boundingBox.height), 0, 100),
          }
        : undefined,
    }));
}

export function parseIdentificationResponse(text: string, providerLabel: string): ClassificationResult[] {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  const payload =
    start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error(`${providerLabel} returned non-JSON response: ${text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array from ${providerLabel}, got: ${typeof parsed}`);
  }
  return sanitizeClassifications(parsed);
}
