import { StyleSheet, Text, View } from 'react-native';

import type { SpeciesWikiData } from '@/api/wikipedia';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type Props = {
  latinName: string;
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
};

export function IdentificationSpeciesWikiBody({ latinName, wikiByLatinName }: Props) {
  if (!Object.prototype.hasOwnProperty.call(wikiByLatinName, latinName)) {
    return null;
  }

  const wiki = wikiByLatinName[latinName];
  if (wiki) {
    return (
      <View style={styles.wikiWrap}>
        <Text style={styles.wikiDesc}>{wiki.description}</Text>
        {wiki.funFacts?.length ? (
          <View style={styles.facts}>
            {wiki.funFacts.map((fact) => (
              <Text key={fact} style={styles.fact}>
                - {fact}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wikiWrap}>
      <Text style={styles.wikiDesc}>No Wikipedia article found.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wikiWrap: {
    marginTop: authSpacing.sm,
    gap: authSpacing.xs,
  },
  wikiDesc: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  facts: {
    gap: authSpacing.xs,
  },
  fact: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
});
