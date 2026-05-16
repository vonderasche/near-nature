// Sends a base64 image for species identification via Supabase Edge Function (preferred)
// or direct Anthropic API when EXPO_PUBLIC_ANTHROPIC_API_KEY is set (local dev only).

import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import type { ClassificationResult, VisionTaxonGroup } from '@/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
const DEV_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY?.trim() ?? '';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

const IDENTIFICATION_PROMPT = `
Identify every plant, animal, fungus, and bird that is clearly visible in this image.

Return ONLY a JSON array. No markdown, no explanation, no code fences. Just the raw JSON.

Each item in the array must have exactly these fields:
{
  "latinName":   "Genus species",
  "commonName":  "Common English name",
  "confidence":  0.95,
  "taxonGroup":  "plants" | "animals" | "fungi" | "birds",
  "boundingBox": { "x": 10, "y": 20, "width": 40, "height": 50 }
}

boundingBox values are percentages of the image dimensions (0–100).
confidence is a number between 0 and 1.
taxonGroup must be one of exactly: plants, animals, fungi, birds.

If no species are identifiable, return an empty array: []
`.trim();

export async function identifySpeciesInImage(
  photoBase64: string,
  mediaType: ImageMediaType = 'image/jpeg',
): Promise<ClassificationResult[]> {
  const viaEdge = await identifyViaEdgeFunction(photoBase64, mediaType);
  if (viaEdge !== null) return viaEdge;

  if (DEV_API_KEY) {
    devLog('[claude] using dev direct API (remove EXPO_PUBLIC_ANTHROPIC_API_KEY for friends builds)');
    return identifyViaDirectApi(photoBase64, mediaType);
  }

  throw new Error(
    'Species identification is not configured. Deploy the identify-species Edge Function and set ANTHROPIC_API_KEY in Supabase, or add EXPO_PUBLIC_ANTHROPIC_API_KEY for local dev only.',
  );
}

async function identifyViaEdgeFunction(
  photoBase64: string,
  mediaType: ImageMediaType,
): Promise<ClassificationResult[] | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  const { data, error } = await supabase.functions.invoke('identify-species', {
    body: { photoBase64, mediaType },
  });

  if (error) {
    devLog('[claude] edge invoke error', error.message);
    return null;
  }

  if (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string') {
    throw new Error((data as { error: string }).error);
  }

  if (!data || typeof data !== 'object' || !Array.isArray((data as { classifications?: unknown }).classifications)) {
    return null;
  }

  return sanitizeClassifications((data as { classifications: unknown[] }).classifications);
}

async function identifyViaDirectApi(
  photoBase64: string,
  mediaType: ImageMediaType,
): Promise<ClassificationResult[]> {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DEV_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: photoBase64 } },
            { type: 'text', text: IDENTIFICATION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '[]';
  return parseClaudeResponse(text);
}

function parseClaudeResponse(text: string): ClassificationResult[] {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude returned non-JSON response: ${text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array from Claude, got: ${typeof parsed}`);
  }
  return sanitizeClassifications(parsed);
}

const VALID_TAXON_GROUPS: VisionTaxonGroup[] = ['animals', 'plants', 'fungi', 'birds'];

function sanitizeClassifications(parsed: unknown[]): ClassificationResult[] {
  return parsed
    .filter(isValidClassification)
    .map((item) => ({
      latinName: String(item.latinName).trim(),
      commonName: String(item.commonName).trim(),
      confidence: clamp(Number(item.confidence), 0, 1),
      taxonGroup: item.taxonGroup as VisionTaxonGroup,
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

function isValidClassification(item: unknown): item is {
  latinName: string;
  commonName: string;
  confidence: number;
  taxonGroup: VisionTaxonGroup;
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
