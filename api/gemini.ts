import type { SpeciesClassification } from '@/types';

const GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function extractJsonArray(text: string): SpeciesClassification[] {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const payload = fence?.[1]?.trim() ?? trimmed;
  const start = payload.indexOf('[');
  const end = payload.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return a JSON array of species.');
  }
  const raw = payload.slice(start, end + 1);
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('Parsed species payload is not an array.');
  }
  return parsed.map((row, i) => {
    const r = row as Record<string, unknown>;
    const latinName = String(r.latinName ?? r.scientific_name ?? '').trim();
    const commonName = String(r.commonName ?? r.common_name ?? '').trim();
    const taxonGroup = String(r.taxonGroup ?? r.taxon_group ?? 'other').trim();
    if (!latinName) {
      throw new Error(`Invalid species entry at index ${i}`);
    }
    return { latinName, commonName: commonName || latinName, taxonGroup: taxonGroup || 'other' };
  });
}

/**
 * Sends an image (base64 + mime) to Gemini and expects a JSON array:
 * `[{ "latinName", "commonName", "taxonGroup" }]`
 */
export async function identifySpeciesInImage(
  base64: string,
  mimeType: string
): Promise<SpeciesClassification[]> {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY for species identification.');
  }

  const prompt =
    'You are a field biologist. Identify the main wild organism(s) in this image. ' +
    'Reply with ONLY a JSON array (no markdown), max 5 items, each object: ' +
    '{"latinName": string (scientific name), "commonName": string, "taxonGroup": one of plant|animal|fungus|other}. ' +
    'If unsure, give your best guess for the visible subject.';

  const url = `${GEMINI_API_URL}?key=${encodeURIComponent(key)}`;
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text =
    json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text.trim()) {
    throw new Error('Empty response from Gemini.');
  }
  return extractJsonArray(text);
}
