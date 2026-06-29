import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { US_STATES, usStateLabel, type UsStateCode } from '@/constants/us-states';
import type { AppTheme } from '@/constants/themes';
import { detectUsStateFromLocation } from '@/lib/geo/detectUsStateFromLocation';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type Props = {
  value: UsStateCode | '';
  onChange: (code: UsStateCode) => void;
  disabled?: boolean;
};

function createUsStatePickerStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      gap: theme.spacing.xs,
    },
    label: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
    },
    hint: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.xs,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.field,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      backgroundColor: 'transparent',
    },
    selectorDisabled: {
      opacity: 0.5,
    },
    selectorPressed: {
      opacity: 0.9,
    },
    selectorText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    selectorPlaceholder: {
      color: theme.colors.textMuted,
    },
    chevron: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginLeft: theme.spacing.sm,
    },
    error: {
      ...theme.typography.subtitle,
      color: theme.colors.danger,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
      maxHeight: '70%',
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    sheetTitle: {
      ...theme.typography.title,
      fontSize: 20,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    list: {
      maxHeight: 360,
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radii.field,
    },
    optionSelected: {
      backgroundColor: theme.colors.primaryFill,
    },
    optionPressed: {
      opacity: 0.88,
    },
    optionText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    optionCode: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
    },
    optionTextSelected: {
      color: theme.colors.primaryOnFill,
    },
  });
}

export function UsStatePicker({ value, onChange, disabled }: Props) {
  const styles = useThemedStyles(createUsStatePickerStyles);
  const [modalOpen, setModalOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const useMyLocation = useCallback(async () => {
    setLocating(true);
    setLocateError(null);
    try {
      const result = await detectUsStateFromLocation();
      if (result.ok) {
        onChange(result.stateCode as UsStateCode);
        setModalOpen(false);
      } else {
        setLocateError(result.message);
      }
    } catch (e: unknown) {
      setLocateError(e instanceof Error ? e.message : 'Could not read location.');
    } finally {
      setLocating(false);
    }
  }, [onChange]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Home state (US)</Text>
      <Text style={styles.hint}>Used for native vs non-native species in your area.</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose US state"
        disabled={disabled}
        onPress={() => setModalOpen(true)}
        style={({ pressed }) => [
          styles.selector,
          disabled && styles.selectorDisabled,
          pressed && !disabled && styles.selectorPressed,
        ]}>
        <Text style={[styles.selectorText, !value && styles.selectorPlaceholder]}>
          {usStateLabel(value || null)}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <AuthButton
        variant="outline"
        title={locating ? 'Finding state…' : 'Use my location'}
        onPress={useMyLocation}
        loading={locating}
        disabled={disabled || locating}
      />

      {locateError ? <Text style={styles.error}>{locateError}</Text> : null}

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select your state</Text>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {US_STATES.map((state) => {
              const selected = value === state.code;
              return (
                <Pressable
                  key={state.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(state.code);
                    setModalOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {state.name}
                  </Text>
                  <Text style={[styles.optionCode, selected && styles.optionTextSelected]}>{state.code}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <AuthButton variant="outline" title="Close" onPress={() => setModalOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}
