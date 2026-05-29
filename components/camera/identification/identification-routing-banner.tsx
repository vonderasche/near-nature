import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';

type Props = {
  meta: TfliteIdentificationMeta | null;
  identifying: boolean;
};

function formatPercent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function IdentificationRoutingBanner({ meta, identifying }: Props) {
  if (identifying && !meta) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>On-device AI</Text>
        <Text style={styles.body}>Running preview model…</Text>
      </View>
    );
  }

  if (!meta) return null;

  const topPreview = meta.previewTop[0];
  const topGenus = meta.genusTop[0];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>On-device AI</Text>

      {topPreview ? (
        <Text style={styles.body}>
          Preview: {topPreview.label} ({formatPercent(topPreview.confidence)})
        </Text>
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
