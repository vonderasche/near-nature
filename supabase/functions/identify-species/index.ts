import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-4-6';

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

function parseClaudeResponse(text: string): unknown[] {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array from Claude, got: ${typeof parsed}`);
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

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY not configured on server' }, 500);
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

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
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
    const errText = await response.text();
    console.error('identify-species: Claude error', response.status, errText.slice(0, 300));
    return jsonResponse({ error: `Identification failed (${response.status})` }, 502);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text ?? '[]';

  try {
    const classifications = parseClaudeResponse(text);
    return jsonResponse({ classifications });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Parse error';
    console.error('identify-species: parse', msg);
    return jsonResponse({ error: msg }, 502);
  }
});
