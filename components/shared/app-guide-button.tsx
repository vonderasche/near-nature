import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppGuideModal } from '@/components/shared/app-guide-modal';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  accessibilityLabel?: string;
};

export function AppGuideButton({
  accessibilityLabel = 'How to use Near Nature',
}: Props) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Opens a short guide to the app tabs and features"
        hitSlop={12}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        <HeroIcon name="light-bulb" size={22} color={theme.colors.textPrimary} />
      </Pressable>
      <AppGuideModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.75,
  },
});
