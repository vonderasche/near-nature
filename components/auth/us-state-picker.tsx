import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { US_STATES, usStateLabel, type UsStateCode } from '@/constants/us-states';
import { authColors, authRadii, authSpacing, authTypography } from '@/constants/auth-theme';
import { detectUsStateFromLocation } from '@/lib/geo/detectUsStateFromLocation';

type Props = {
  value: UsStateCode | '';
  onChange: (code: UsStateCode) => void;
  disabled?: boolean;
};

export function UsStatePicker({ value, onChange, disabled }: Props) {
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

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.xs,
  },
  label: {
    ...authTypography.label,
    color: authColors.text,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    marginBottom: authSpacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: authRadii.field,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    backgroundColor: authColors.fieldBackground,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorPressed: {
    opacity: 0.9,
  },
  selectorText: {
    ...authTypography.body,
    color: authColors.text,
    flex: 1,
  },
  selectorPlaceholder: {
    color: authColors.textMuted,
  },
  chevron: {
    color: authColors.textMuted,
    fontSize: 12,
    marginLeft: authSpacing.sm,
  },
  error: {
    ...authTypography.subtitle,
    color: authColors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: authColors.background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: authSpacing.lg,
    paddingTop: authSpacing.md,
    paddingBottom: authSpacing.lg,
    gap: authSpacing.sm,
  },
  sheetTitle: {
    ...authTypography.title,
    fontSize: 20,
    color: authColors.text,
    textAlign: 'center',
  },
  list: {
    maxHeight: 360,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: authSpacing.sm,
    paddingHorizontal: authSpacing.sm,
    borderRadius: authRadii.field,
  },
  optionSelected: {
    backgroundColor: authColors.primaryFill,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionText: {
    ...authTypography.body,
    color: authColors.text,
  },
  optionCode: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  optionTextSelected: {
    color: authColors.primaryOnFill,
  },
});
