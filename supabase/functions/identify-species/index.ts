import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';

// Keep in sync with constants/naturalist-subcategory-prompts.ts
const PLANT_SUBCATEGORIES =
  'wildflowers | trees_shrubs | ferns_mosses | aquatic_plants | cacti_succulents';
const BIRD_SUBCATEGORIES =
  'songbirds | raptors | wading_birds | waterfowl | shorebirds';
const ANIMAL_SUBCATEGORIES =
  'lizards | snakes | frogs_toads | turtles_tortoises | salamanders | small_mammals | deer_hoofed | bats | marine_mammals | carnivores';

const IDENTIFICATION_PROMPT = `
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

subcategory rules (required for plants, animals, and birds; omit for fungi):
- When taxonGroup is "plants", subcategory must be one of: ${PLANT_SUBCATEGORIES}
- When taxonGroup is "birds", subcategory must be one of: ${BIRD_SUBCATEGORIES}
- When taxonGroup is "animals", subcategory must be one of: ${ANIMAL_SUBCATEGORIES}
- Pick the single best match (e.g. hawk → raptors, oak → trees_shrubs, frog → frogs_toads).

If no species are identifiable, return an empty array: []
`.trim();

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const VALID_TAXON_GROUPS = ['animals', 'plants', 'fungi', 'birds'] as const;

function parseGeminiResponse(text: string): unknown[] {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  const payload = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const parsed = JSON.parse(payload);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array from Gemini, got: ${typeof parsed}`);
  }
  return parsed.filter((item) => {
    if (typeof item !== 'object' || item === null) return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.latinName === 'string' &&
      obj.latinName.trim().length > 0 &&
      typeof obj.commonName === 'string' &&
      typeof obj.confidence === 'number' &&
      VALID_TAXON_GROUPS.includes(obj.taxonGroup as (typeof VALID_TAXON_GROUPS)[number])
    );
  }).map((item) => {
    const obj = item as Record<string, unknown>;
    const bb = obj.boundingBox as Record<string, unknown> | undefined;
    return {
      latinName: String(obj.latinName).trim(),
      commonName: String(obj.commonName).trim(),
      confidence: clamp(Number(obj.confidence), 0, 1),
      taxonGroup: obj.taxonGroup,
      subcategory:
        typeof obj.subcategory === 'string' && obj.subcategory.trim()
          ? obj.subcategory.trim()
          : undefined,
      boundingBox: bb
        ? {
            x: clamp(Number(bb.x), 0, 100),
            y: clamp(Number(bb.y), 0, 100),
            width: clamp(Number(bb.width), 0, 100),
            height: clamp(Number(bb.height), 0, 100),
          }
        : undefined,
    };
  });
}

function extractGeminiText(data: unknown): string {
  if (!data || typeof data !== 'object') return '[]';
  const candidates = (data as { candidates?: unknown[] }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return '[]';
  const parts = (candidates[0] as { content?: { parts?: unknown[] } })?.content?.parts;
  if (!Array.isArray(parts)) return '[]';
  const text = parts
    .map((p) => (p && typeof p === 'object' && 'text' in p ? String((p as { text: unknown }).text) : ''))
    .join('')
    .trim();
  return text || '[]';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'GEMINI_API_KEY not configured on server' }, 500);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: 'Server misconfiguration' }, 500);
  }

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseUser.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: { photoBase64?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const photoBase64 = body.photoBase64?.trim();
  if (!photoBase64) {
    return jsonResponse({ error: 'photoBase64 is required' }, 400);
  }

  const mediaType = (body.mediaType?.trim() || 'image/jpeg') as ImageMediaType;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mediaType)) {
    return jsonResponse({ error: 'Unsupported mediaType' }, 400);
  }

  const response = await fetch(`${GEMINI_API_BASE}/${MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { inline_data: { mime_type: mediaType, data: photoBase64 } },
            { text: IDENTIFICATION_PROMPT },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('identify-species: Gemini error', response.status, errText.slice(0, 300));
    return jsonResponse({ error: `Identification failed (${response.status})` }, 502);
  }

  const data = await response.json();
  const text = extractGeminiText(data);

  try {
    const classifications = parseGeminiResponse(text);
    return jsonResponse({ classifications });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error';
    console.error('identify-species: parse', msg);
    return jsonResponse({ error: msg }, 502);
  }
});
