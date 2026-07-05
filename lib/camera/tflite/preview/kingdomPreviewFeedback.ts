import {
  MVP_KINGDOM_TOP1_MARGIN,
  MVP_KINGDOM_TOP1_THRESHOLD,
  KINGDOM_PREVIEW_MAYBE_THRESHOLD,
  KINGDOM_PREVIEW_RELEASE_THRESHOLD,
} from '@/lib/camera/tflite/preview/kingdomPreviewThresholds';

type ClassificationRow = { label: string; confidence: number };

export type KingdomPreviewDisplayState = 'searching' | 'maybe' | 'confident';

export type KingdomPreviewFeedback = {
  headline: string;
  detail: string;
  tier: KingdomPreviewDisplayState;
  organismDetected: boolean;
  topLabel: string;
  confidence: number;
};

const ORGANISM_LABELS = ['plantae', 'animalia', 'fungi'] as const;

const CONFIDENT_HEADLINE: Readonly<Record<string, string>> = {
  plantae: 'Looks like a plant',
  animalia: 'Looks like an animal',
  fungi: 'Looks like a fungus',
};

const MAYBE_HEADLINE: Readonly<Record<string, string>> = {
  plantae: 'Might be a plant',
  animalia: 'Might be an animal',
  fungi: 'Might be a fungus',
};

export function formatPreviewConfidencePercent(confidence: number): string {
  return `${Math.round(Math.min(1, Math.max(0, confidence)) * 100)}%`;
}

export function isKingdomPreviewConfident(
  predictions: readonly ClassificationRow[],
): boolean {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];
  if (!top || top.label === 'uncertain' || top.label === 'not_organism') {
    return false;
  }
  if (top.confidence < MVP_KINGDOM_TOP1_THRESHOLD) {
    return false;
  }
  const second = sorted[1];
  const margin = second ? top.confidence - second.confidence : top.confidence;
  return margin >= MVP_KINGDOM_TOP1_MARGIN;
}

function maxOrganismConfidence(predictions: readonly ClassificationRow[]): number {
  let max = 0;
  for (const row of predictions) {
    if ((ORGANISM_LABELS as readonly string[]).includes(row.label)) {
      max = Math.max(max, row.confidence);
    }
  }
  return max;
}

export function resolveKingdomPreviewDisplayState(
  organismConfidence: number,
  confidentCall: boolean,
  previous: KingdomPreviewDisplayState,
): KingdomPreviewDisplayState {
  if (confidentCall) {
    return 'confident';
  }
  if (previous === 'confident' && organismConfidence >= KINGDOM_PREVIEW_RELEASE_THRESHOLD) {
    return 'confident';
  }
  if (organismConfidence >= KINGDOM_PREVIEW_MAYBE_THRESHOLD) {
    return 'maybe';
  }
  if (previous === 'maybe' && organismConfidence >= KINGDOM_PREVIEW_RELEASE_THRESHOLD) {
    return 'maybe';
  }
  return 'searching';
}

function confidenceByLabel(
  predictions: readonly ClassificationRow[],
): Readonly<Record<string, number>> {
  return Object.fromEntries(predictions.map((row) => [row.label, row.confidence]));
}

function buildSearchingDetail(probs: Readonly<Record<string, number>>): string {
  const hints: string[] = [];
  if ((probs.plantae ?? 0) >= 0.12) {
    hints.push(`Plant ${formatPreviewConfidencePercent(probs.plantae ?? 0)}`);
  }
  if ((probs.animalia ?? 0) >= 0.12) {
    hints.push(`Animal ${formatPreviewConfidencePercent(probs.animalia ?? 0)}`);
  }
  if ((probs.fungi ?? 0) >= 0.12) {
    hints.push(`Fungi ${formatPreviewConfidencePercent(probs.fungi ?? 0)}`);
  }
  if (hints.length > 0) {
    return hints.join(' · ');
  }
  return 'Point at a plant or animal';
}

export function buildKingdomPreviewFeedback(
  predictions: readonly ClassificationRow[],
  previousState: KingdomPreviewDisplayState,
): KingdomPreviewFeedback {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];
  if (!top) {
    return {
      headline: 'Point camera at a subject…',
      detail: '',
      tier: 'searching',
      organismDetected: false,
      topLabel: '',
      confidence: 0,
    };
  }

  const probs = confidenceByLabel(predictions);
  const organismConfidence = maxOrganismConfidence(predictions);
  const confident = isKingdomPreviewConfident(predictions);
  const tier = resolveKingdomPreviewDisplayState(
    organismConfidence,
    confident,
    previousState,
  );
  const pct = formatPreviewConfidencePercent(top.confidence);

  if (top.label === 'not_organism' && top.confidence >= 0.6) {
    return {
      headline: 'No subject found',
      detail: 'Move closer to a plant or animal',
      tier: 'searching',
      organismDetected: false,
      topLabel: top.label,
      confidence: top.confidence,
    };
  }

  if (tier === 'confident' && CONFIDENT_HEADLINE[top.label]) {
    return {
      headline: CONFIDENT_HEADLINE[top.label]!,
      detail: `${pct} confident`,
      tier: 'confident',
      organismDetected: true,
      topLabel: top.label,
      confidence: top.confidence,
    };
  }

  if (tier === 'maybe' && MAYBE_HEADLINE[top.label]) {
    return {
      headline: MAYBE_HEADLINE[top.label]!,
      detail: `${pct} — hold steady`,
      tier: 'maybe',
      organismDetected: false,
      topLabel: top.label,
      confidence: top.confidence,
    };
  }

  if (top.label === 'uncertain') {
    return {
      headline: 'Keep searching',
      detail: `${pct} uncertain · ${buildSearchingDetail(probs)}`,
      tier: 'searching',
      organismDetected: false,
      topLabel: top.label,
      confidence: top.confidence,
    };
  }

  return {
    headline: 'Keep searching',
    detail: buildSearchingDetail(probs),
    tier: 'searching',
    organismDetected: false,
    topLabel: top.label,
    confidence: top.confidence,
  };
}
