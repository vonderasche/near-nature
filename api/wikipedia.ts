// ─────────────────────────────────────────────────────────────
// src/api/wikipedia.ts
//
// Fetches species descriptions and facts from Wikipedia.
//
// Free — no API key required.
//
// FLOW:
//   1. Fetch the page summary (short description + thumbnail)
//   2. Fetch the intro section (fuller description for detail page)
//   3. Extract fun facts from structured sections
// ─────────────────────────────────────────────────────────────

import { devLog } from '@/lib/devLog';

const WIKIPEDIA_REST = 'https://en.wikipedia.org/api/rest_v1';
const WIKIPEDIA_API  = 'https://en.wikipedia.org/w/api.php';

const DEFAULT_USER_AGENT =
  process.env.EXPO_PUBLIC_WIKI_USER_AGENT ??
  'near_nature/0.1 (Expo; https://example.invalid; contact: dev@example.invalid)';

function wikiHeaders(extra?: Record<string, string>): Record<string, string> {
  // Wikimedia requires a descriptive User-Agent. Some RN environments may block setting
  // the actual User-Agent header, so we set both.
  return {
    Accept: 'application/json',
    'User-Agent': DEFAULT_USER_AGENT,
    'Api-User-Agent': DEFAULT_USER_AGENT,
    ...extra,
  };
}

// ── Types ─────────────────────────────────────────────────────

export interface SpeciesWikiData {
  description:     string;         // Short 1-2 sentence summary
  fullDescription: string;         // Full intro paragraph(s)
  imageUrl:        string | null;  // Thumbnail from Wikipedia
  funFacts:        string[];       // Pulled from the intro text
  pageUrl:         string;         // Link to full Wikipedia article
}

// ── Main export ───────────────────────────────────────────────

/**
 * Fetch description and facts for a species from Wikipedia.
 *
 * @param latinName - Scientific name e.g. "Danaus plexippus"
 * @returns         - Wiki data, or null if no article found
 */
export async function fetchSpeciesWikiData(
  latinName: string,
): Promise<SpeciesWikiData | null> {
  devLog('[wiki] fetch start', { latinName });

  const query = latinName.trim();
  if (!query) return null;

  // Run summary and full intro fetch in parallel
  const [summary, fullIntro] = await Promise.all([
    fetchSummaryWithFallback(query),
    fetchFullIntroWithFallback(query),
  ]);

  if (!summary) {
    devLog('[wiki] no article', { latinName });
    return null;
  }

  const result = {
    description:     summary.description,
    fullDescription: fullIntro ?? summary.description,
    imageUrl:        summary.imageUrl,
    funFacts:        extractFunFacts(fullIntro ?? summary.description),
    pageUrl:         `https://en.wikipedia.org/wiki/${encodeURIComponent(latinName.replace(/ /g, '_'))}`,
  };
  devLog('[wiki] fetch ok', {
    latinName,
    hasImage: Boolean(result.imageUrl),
    descChars: result.description.length,
    fullChars: result.fullDescription.length,
    funFacts: result.funFacts.length,
  });
  return result;
}

// ── Step 1: Summary (short description + thumbnail) ───────────

interface WikiSummary {
  description: string;
  imageUrl:    string | null;
}

async function fetchSummary(latinName: string): Promise<WikiSummary | null> {
  const title    = latinName.replace(/ /g, '_');
  const url      = `${WIKIPEDIA_REST}/page/summary/${encodeURIComponent(title)}`;
  devLog('[wiki] summary request', { latinName, url });
  const response = await fetch(url, { headers: wikiHeaders() });

  devLog('[wiki] summary response', { latinName, status: response.status, ok: response.ok });

  // 404 means no Wikipedia article — not an error worth throwing
  if (response.status === 404) {
    devLog('[wiki] summary 404', { latinName });
    return null;
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    devLog('[wiki] summary non-200', { latinName, status: response.status, body: body.slice(0, 300) });
    throw new Error(`Wikipedia summary fetch failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    description: data.extract ?? '',
    imageUrl:    data.thumbnail?.source ?? data.originalimage?.source ?? null,
  };
}

async function fetchSummaryWithFallback(query: string): Promise<WikiSummary | null> {
  const direct = await fetchSummary(query);
  if (direct) return direct;

  const bestTitle = await searchBestTitle(query);
  devLog('[wiki] search bestTitle', { query, bestTitle });
  if (!bestTitle) return null;
  devLog('[wiki] summary fallback title', { query, bestTitle });
  return fetchSummary(bestTitle);
}

// ── Step 2: Full intro section ────────────────────────────────

async function fetchFullIntro(latinName: string): Promise<string | null> {
  const params = new URLSearchParams({
    action:       'query',
    titles:       latinName,
    prop:         'extracts',
    exintro:      '1',      // intro section only (before first heading)
    explaintext:  '1',      // plain text, no HTML
    exsectionformat: 'plain',
    format:       'json',
    origin:       '*',      // required for CORS on mobile
  });

  const url      = `${WIKIPEDIA_API}?${params.toString()}`;
  devLog('[wiki] intro request', { latinName, url });
  const response = await fetch(url, { headers: wikiHeaders() });

  devLog('[wiki] intro response', { latinName, status: response.status, ok: response.ok });
  if (!response.ok) return null;

  const data = await response.json();
  const pages = data.query?.pages as Record<string, { extract?: string }> | undefined;
  if (!pages) return null;

  // Wikipedia returns pages as an object keyed by page ID
  const page = Object.values(pages)[0];
  const extract = page?.extract?.trim() ?? null;

  // Wikipedia returns "-1" key if page not found
  if (!extract || extract.length < 10) return null;

  return extract;
}

async function fetchFullIntroWithFallback(query: string): Promise<string | null> {
  const direct = await fetchFullIntro(query);
  if (direct) return direct;

  const bestTitle = await searchBestTitle(query);
  devLog('[wiki] search bestTitle (intro)', { query, bestTitle });
  if (!bestTitle) return null;
  devLog('[wiki] intro fallback title', { query, bestTitle });
  return fetchFullIntro(bestTitle);
}

// ── Search helper (used when direct title 404s) ─────────────────

async function searchBestTitle(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '1',
    format: 'json',
    origin: '*',
  });
  const url = `${WIKIPEDIA_API}?${params.toString()}`;
  devLog('[wiki] search request', { query, url });

  const response = await fetch(url, { headers: wikiHeaders() });
  devLog('[wiki] search response', { query, status: response.status, ok: response.ok });
  if (!response.ok) return null;
  const data = await response.json();
  const title: unknown = data?.query?.search?.[0]?.title;
  devLog('[wiki] search top result', { query, title });
  return typeof title === 'string' && title.trim().length ? title : null;
}

// ── Step 3: Fun fact extraction ───────────────────────────────

/**
 * Extracts interesting sentences from a description to use as
 * "fun facts" on the species detail screen.
 *
 * Strategy: looks for sentences containing signal words that
 * tend to precede interesting facts about species.
 */
function extractFunFacts(text: string): string[] {
  if (!text) return [];

  const SIGNAL_WORDS = [
    'can', 'only', 'unique', 'largest', 'smallest', 'fastest',
    'known for', 'remarkable', 'migrate', 'wingspan', 'lifespan',
    'endemic', 'endangered', 'threatened', 'record', 'average',
    'typically', 'usually', 'found in', 'lives', 'feeds on',
  ];

  // Split into sentences (handles . ? !)
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 300);  // skip very short/long ones

  const facts = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();
    return SIGNAL_WORDS.some((word) => lower.includes(word));
  });

  // Return up to 4 facts, deduplicated
  return [...new Set(facts)].slice(0, 4);
}
