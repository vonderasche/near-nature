// Sends a base64 image for species identification via Supabase Edge Function (preferred)
// or direct Anthropic API when EXPO_PUBLIC_ANTHROPIC_API_KEY is set (local dev only).

import {
  IDENTIFICATION_PROMPT,
  parseIdentificationResponse,
  sanitizeClassifications,
} from '@/api/identificationShared';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import type { ClassificationResult } from '@/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
const DEV_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY?.trim() ?? '';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

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
  return parseIdentificationResponse(text, 'Claude');
}
