import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { UsStatePicker } from '@/components/auth/us-state-picker';
import { ButtonRow, ButtonRowSlot } from '@/components/ui/button-row';
import { normalizeUsStateCode, type UsStateCode } from '@/constants/us-states';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { UpdateUserResult } from '@/hooks/useUser';

export type StateEditModalProps = {
  visible: boolean;
  initialState: string | null | undefined;
  onClose: () => void;
  onSave: (stateCode: UsStateCode) => Promise<UpdateUserResult>;
  saving?: boolean;
};

export function StateEditModal({
  visible,
  initialState,
  onClose,
  onSave,
  saving = false,
}: StateEditModalProps) {
  const [draft, setDraft] = useState<UsStateCode | ''>('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(normalizeUsStateCode(initialState) ?? '');
      setSaveError(null);
    } else {
      setSaveError(null);
    }
  }, [visible, initialState]);

  async function handleSave() {
    const normalized = normalizeUsStateCode(draft);
    if (!normalized) {
      setSaveError('Select your US home state.');
      return;
    }
    const res = await onSave(normalized);
    if (!res.ok) {
      setSaveError(res.message);
      return;
    }
    onClose();
  }

  return (
    <>
      <SheetModalShell visible={visible} onRequestClose={onClose} keyboardAvoiding>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Text style={sheetModalShellStyles.sheetTitle}>Home state</Text>
          <Text style={styles.hint}>
            Used for native vs non-native species when you identify wildlife and plants.
          </Text>
          <UsStatePicker value={draft} onChange={setDraft} disabled={saving} />
        </ScrollView>

        <View style={styles.actions}>
          <ButtonRow>
            <ButtonRowSlot>
              <AuthButton
                title="Cancel"
                variant="outline"
                fillParent
                onPress={onClose}
                disabled={saving}
              />
            </ButtonRowSlot>
            <ButtonRowSlot>
              <AuthButton
                title="Save"
                fillParent
                onPress={() => void handleSave()}
                loading={saving}
                disabled={saving}
              />
            </ButtonRowSlot>
          </ButtonRow>
        </View>
      </SheetModalShell>

      <ThemedMessageModal
        visible={saveError !== null}
        title="Could not save state"
        message={saveError ?? ''}
        onDismiss={() => setSaveError(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: authSpacing.md,
    paddingBottom: authSpacing.xs,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  actions: {
    gap: authSpacing.sm,
  },
});
