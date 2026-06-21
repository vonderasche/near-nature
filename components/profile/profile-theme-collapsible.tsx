import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemePicker } from '@/components/profile/theme-picker';
import { HeroIcon } from '@/components/ui/hero-icon';
import { THEME_LABELS } from '@/constants/theme-preferences';
import { useTheme } from '@/hooks/useTheme';
import { animateCollapsibleToggle } from '@/lib/ui/collapsibleAnimation';

export function ProfileThemeCollapsible() {
  const { theme, themeName } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const summary = useMemo(() => THEME_LABELS[themeName], [themeName]);

  const toggleExpanded = () => {
    animateCollapsibleToggle();
    setExpanded((open) => !open);
  };

  const collapse = () => {
    animateCollapsibleToggle();
    setExpanded(false);
  };

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
      <Pressable
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? 'Hide appearance options' : 'Show appearance options'}
        accessibilityHint={`Current theme: ${summary}`}
        style={({ pressed }) => [
          styles.trigger,
          { gap: theme.spacing.sm, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.xs },
          pressed && styles.triggerPressed,
        ]}>
        <View style={styles.triggerText}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Appearance</Text>
          <Text style={[styles.summary, { color: theme.colors.textPrimary }]}>{summary}</Text>
        </View>
        <View style={expanded ? styles.chevronExpanded : undefined}>
          <HeroIcon name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.panel}>
          <ThemePicker onThemeSelected={collapse} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerPressed: {
    opacity: 0.88,
  },
  triggerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    fontSize: 16,
    fontWeight: '400',
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  panel: {
    paddingTop: 4,
  },
});
