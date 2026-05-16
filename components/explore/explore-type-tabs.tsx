import { StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonRow, ButtonRowSlot } from '@/components/ui/button-row';
import { authSpacing } from '@/constants/auth-theme';
import { exploreTypeLabel, type ExploreSpeciesType } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  active: ExploreSpeciesType;
  onSelect: (type: ExploreSpeciesType) => void;
};

const TYPES: ExploreSpeciesType[] = ['animals', 'plants'];

export function ExploreTypeTabs({ active, onSelect }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      <ButtonRow>
        {TYPES.map((type) => {
          const selected = active === type;
          return (
            <ButtonRowSlot key={type}>
              <AuthButton
                title={exploreTypeLabel(type)}
                variant={selected ? 'primary' : 'outline'}
                fillParent
                onPress={() => onSelect(type)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={exploreTypeLabel(type)}
              />
            </ButtonRowSlot>
          );
        })}
      </ButtonRow>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: authSpacing.md,
  },
});
