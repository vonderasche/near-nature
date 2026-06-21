import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';

type Props = {
  meta: TfliteIdentificationMeta | null;
  identifying: boolean;
};

const KINGDOM_LABELS = new Set(['plantae', 'animalia', 'fungi', 'uncertain']);
const SCENE_LABELS = new Set(['organism', 'not_organism']);

function formatPercent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function formatKingdomLabel(label: string): string {
  if (label === 'plantae') return 'Plant';
  if (label === 'animalia') return 'Animal';
  if (label === 'fungi') return 'Fungi';
  if (label === 'uncertain') return 'Uncertain';
  return label;
}

function formatRouterGroupLabel(label: string): string {
  return label.replace(/_/g, ' ');
}

export function IdentificationRoutingBanner({ meta, identifying }: Props) {
  if (identifying && !meta) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>On-device AI</Text>
        <Text style={styles.body}>Running on-device models…</Text>
      </View>
    );
  }

  if (!meta) return null;

  const kingdomStep = meta.previewTop.find((row) => KINGDOM_LABELS.has(row.label));
  const sceneStep = meta.previewTop.find((row) => SCENE_LABELS.has(row.label));
  const routerStep = meta.previewTop.find(
    (row) => !KINGDOM_LABELS.has(row.label) && !SCENE_LABELS.has(row.label),
  );
  const topGenus = meta.genusTop[0];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>On-device AI</Text>

      {sceneStep ? (
        <Text style={styles.body}>
          Scene: {sceneStep.label === 'organism' ? 'Organism' : 'No organism'} (
          {formatPercent(sceneStep.confidence)})
        </Text>
      ) : null}

      {kingdomStep ? (
        <Text style={styles.body}>
          Kingdom: {formatKingdomLabel(kingdomStep.label)} ({formatPercent(kingdomStep.confidence)})
        </Text>
      ) : null}

      {routerStep ? (
        <Text style={styles.body}>
          Router: {formatRouterGroupLabel(routerStep.label)} ({formatPercent(routerStep.confidence)})
        </Text>
      ) : null}

      {meta.routedPreviewLabel ? (
        <Text style={styles.body}>Route: {meta.routedPreviewLabel.replace(/_/g, ' ')}</Text>
      ) : null}

      {meta.usedSpecialist && meta.specialistDisplayName ? (
        <Text style={styles.body}>Specialist: {meta.specialistDisplayName}</Text>
      ) : null}

      {meta.usedSpecialist && topGenus ? (
        <Text style={styles.emphasis}>
          Top genus: {topGenus.genus} ({formatPercent(topGenus.confidence)})
        </Text>
      ) : null}

      {meta.notice ? <Text style={styles.notice}>{meta.notice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: authColors.fieldBackground,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authColors.border,
    padding: authSpacing.md,
    gap: authSpacing.xs,
    marginBottom: authSpacing.md,
  },
  title: {
    ...authTypography.subtitle,
    color: authColors.text,
    fontWeight: '600',
  },
  body: {
    ...authTypography.body,
    color: authColors.textMuted,
  },
  emphasis: {
    ...authTypography.body,
    color: authColors.text,
  },
  notice: {
    ...authTypography.body,
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
});
