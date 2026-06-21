import { StyleSheet, View } from 'react-native';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import { getWikiRowDisplayState } from '@/lib/identification/wikiRowDisplay';

type Props = {
  latinName: string;
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  /** When true, only fun facts render (description is shown on the list card). */
  omitDescription?: boolean;
};

export function IdentificationSpeciesWikiBody({
  latinName,
  wikiByLatinName,
  omitDescription = false,
}: Props) {
  const row = getWikiRowDisplayState(latinName, wikiByLatinName);

  switch (row.kind) {
    case 'pending':
      return null;
    case 'empty':
      return (
        <View style={styles.wikiWrap}>
          <Text variant="subtitle" color="secondary">
            No Wikipedia article found.
          </Text>
        </View>
      );
    case 'ready':
      return <WikiArticleBody wiki={row.data} omitDescription={omitDescription} />;
    default: {
      const _exhaustive: never = row;
      return _exhaustive;
    }
  }
}

function WikiArticleBody({
  wiki,
  omitDescription,
}: {
  wiki: SpeciesWikiData;
  omitDescription: boolean;
}) {
  const { theme } = useTheme();
  const showDescription = !omitDescription && wiki.description?.trim();
  const facts = wiki.funFacts?.filter(Boolean) ?? [];

  if (!showDescription && facts.length === 0) {
    return null;
  }

  return (
    <View style={[styles.wikiWrap, { gap: theme.spacing.xs }]}>
      {showDescription ? (
        <Text variant="subtitle" color="secondary">
          {wiki.description}
        </Text>
      ) : null}
      {facts.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          {facts.map((fact) => (
            <Text key={fact} variant="subtitle" color="secondary">
              - {fact}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wikiWrap: {},
});
