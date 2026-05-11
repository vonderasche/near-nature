// ─────────────────────────────────────────────────────────────
// src/api/claude.ts
//
// Sends a base64 image to the Claude API and returns a list of
// identified species with bounding boxes.
//
// SETUP:
//   Create a .env file in the project root:
//   EXPO_PUBLIC_ANTHROPIC_API_KEY=your-key-here
//
// ⚠️  IMPORTANT — API KEY SECURITY:
//   Putting an API key in a mobile app means it can be extracted
//   from the bundle. This is fine for development and testing.
//   Before releasing to the App Store / Play Store, move this
//   call to a backend (e.g. a simple Express server or Firebase
//   Cloud Function) so the key stays server-side.
// ─────────────────────────────────────────────────────────────

import type { ClassificationResult, VisionTaxonGroup } from '@/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
// Override in .env if desired:
// EXPO_PUBLIC_ANTHROPIC_MODEL=claude-sonnet-4-6
const MODEL          = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
const API_KEY        = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

function devLog(...args: unknown[]) {
  if (__DEV__) console.log(...args);
}

// ── Main export ───────────────────────────────────────────────

/**
 * Identify all plants, animals, fungi, and birds in a photo.
 *
 * @param photoBase64 - Base64-encoded image string (no data URI prefix)
 * @param mediaType   - MIME type of the image
 * @returns           - Array of classification results, empty if nothing found
 */
export async function identifySpeciesInImage(
  photoBase64: string,
  mediaType: ImageMediaType = 'image/jpeg',
): Promise<ClassificationResult[]> {

  if (!API_KEY) {
    throw new Error(
      'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Add it to your .env file.',
    );
  }

  devLog('[claude] request', {
    url: CLAUDE_API_URL,
    model: MODEL,
    mediaType,
    imageBytes: photoBase64.length,
  });

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: mediaType, data: photoBase64 },
          },
          {
            type: 'text',
            text: IDENTIFICATION_PROMPT,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    devLog('[claude] error', { status: response.status, body: body.slice(0, 300) });
    throw new Error(`Claude API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '[]';

  devLog('[claude] rawText', text.slice(0, 300));
  const parsed = parseClaudeResponse(text);
  devLog('[claude] parsed', { count: parsed.length, sample: parsed[0] ?? null });
  return parsed;
}

// ── Prompt ────────────────────────────────────────────────────

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

// ── Response parser ───────────────────────────────────────────

function parseClaudeResponse(text: string): ClassificationResult[] {
  // Strip markdown code fences if Claude adds them despite the prompt
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g,      '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Claude returned non-JSON response: ${text.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array from Claude, got: ${typeof parsed}`);
  }

  // Validate and sanitise each item
  return parsed
    .filter(isValidClassification)
    .map((item) => ({
      latinName:   String(item.latinName).trim(),
      commonName:  String(item.commonName).trim(),
      confidence:  clamp(Number(item.confidence), 0, 1),
      taxonGroup:  item.taxonGroup as VisionTaxonGroup,
      boundingBox: item.boundingBox
        ? {
            x:      clamp(Number(item.boundingBox.x),      0, 100),
            y:      clamp(Number(item.boundingBox.y),      0, 100),
            width:  clamp(Number(item.boundingBox.width),  0, 100),
            height: clamp(Number(item.boundingBox.height), 0, 100),
          }
        : undefined,
    }));
}

// ── Helpers ───────────────────────────────────────────────────

const VALID_TAXON_GROUPS: VisionTaxonGroup[] = ['animals', 'plants', 'fungi', 'birds'];

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
    typeof obj.latinName  === 'string' && obj.latinName.trim().length > 0 &&
    typeof obj.commonName === 'string' &&
    typeof obj.confidence === 'number' &&
    VALID_TAXON_GROUPS.includes(obj.taxonGroup as VisionTaxonGroup)
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
