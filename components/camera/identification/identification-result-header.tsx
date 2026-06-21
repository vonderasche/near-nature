import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { Title } from '@/components/ui/Title';
import { LoadingHintRow } from '@/components/shared/loading-hint-row';
import { useTheme } from '@/hooks/useTheme';
import type { ClassificationResult } from '@/types';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';

type Props = {
  identifying: boolean;
  classifications: ClassificationResult[];
  tfliteMeta: TfliteIdentificationMeta | null;
};

function formatTopMatchName(classification: ClassificationResult): string {
  const common = classification.commonName?.trim();
  if (common) return common;
  return classification.latinName.trim();
}

export function IdentificationResultHeader({
  identifying,
  classifications,
  tfliteMeta,
}: Props) {
  const { theme } = useTheme();

  if (identifying) {
    return (
      <View style={{ marginBottom: theme.spacing.lg }}>
        <LoadingHintRow label="Running on-device models…" />
      </View>
    );
  }

  if (classifications.length === 0) {
    return null;
  }

  const top = classifications[0]!;
  const category = tfliteMeta?.specialistDisplayName?.trim();
  const pct = Math.round(top.confidence * 100);
  const matchName = formatTopMatchName(top);

  return (
    <View style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
      <Title>Found something!</Title>
      {category ? (
        <Text variant="subtitle" color="secondary">
          {category}
        </Text>
      ) : null}
      <Text variant="body">
        Top match: {matchName} ({pct}%)
      </Text>
    </View>
  );
}
