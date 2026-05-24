// Sends a base64 image for species identification via Supabase Edge Function (preferred)
// or direct Gemini API when EXPO_PUBLIC_GEMINI_API_KEY is set (local dev only).

import {
  IDENTIFICATION_PROMPT,
  parseIdentificationResponse,
  sanitizeClassifications,
} from '@/api/identificationShared';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import type { ClassificationResult } from '@/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-2.0-flash';
const DEV_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() ?? '';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

function geminiGenerateUrl(model: string): string {
  return `${GEMINI_API_BASE}/${model}:generateContent`;
}

export async function identifySpeciesInImage(
  photoBase64: string,
  mediaType: ImageMediaType = 'image/jpeg',
): Promise<ClassificationResult[]> {
  const viaEdge = await identifyViaEdgeFunction(photoBase64, mediaType);
  if (viaEdge !== null) return viaEdge;

  if (DEV_API_KEY) {
    devLog('[gemini] using dev direct API (remove EXPO_PUBLIC_GEMINI_API_KEY for friends builds)');
    return identifyViaDirectApi(photoBase64, mediaType);
  }

  throw new Error(
    'Species identification is not configured. Deploy the identify-species Edge Function and set GEMINI_API_KEY in Supabase, or add EXPO_PUBLIC_GEMINI_API_KEY for local dev only.',
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
    devLog('[gemini] edge invoke error', error.message);
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
  const response = await fetch(geminiGenerateUrl(MODEL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': DEV_API_KEY,
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
    const body = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = extractGeminiText(data);
  return parseIdentificationResponse(text, 'Gemini');
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
