import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ButtonRow, ButtonRowSlot } from '@/components/ui/button-row';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authRadii, authSpacing, authTypography } from '@/constants/auth-theme';
import type { UpdateUserResult } from '@/hooks/useUser';

const MAX_MOTTO_LENGTH = 280;

export type MottoEditModalProps = {
  visible: boolean;
  initialMotto: string | null | undefined;
  onClose: () => void;
  /** Persist trimmed motto, or `null` when cleared. */
  onSave: (motto: string | null) => Promise<UpdateUserResult>;
  saving?: boolean;
};

/**
 * Centered sheet modal for editing profile motto (shared shell with other sheets).
 */
export function MottoEditModal({
  visible,
  initialMotto,
  onClose,
  onSave,
  saving = false,
}: MottoEditModalProps) {
  const [draft, setDraft] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(initialMotto?.trim() ?? '');
      setSaveError(null);
    } else {
      setSaveError(null);
    }
  }, [visible, initialMotto]);

  async function handleSave() {
    const trimmed = draft.trim();
    const motto = trimmed.length > 0 ? trimmed : null;
    const res = await onSave(motto);
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
          <Text style={sheetModalShellStyles.sheetTitle}>Edit motto</Text>
          <Text style={styles.hint}>Shown on your profile and the Explorer Board.</Text>

          <TextInput
            value={draft}
            onChangeText={(t) => setDraft(t.slice(0, MAX_MOTTO_LENGTH))}
            placeholder="Short line about you and nature"
            placeholderTextColor={authColors.textMuted}
            multiline
            maxLength={MAX_MOTTO_LENGTH}
            editable={!saving}
            accessibilityLabel="Motto text"
            style={styles.input}
          />
          <Text style={styles.counter}>
            {draft.length}/{MAX_MOTTO_LENGTH}
          </Text>
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
        title="Could not save motto"
        message={saveError ?? ''}
        onDismiss={() => setSaveError(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: authSpacing.sm,
    paddingBottom: authSpacing.xs,
  },
  hint: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  input: {
    ...authTypography.body,
    color: authColors.text,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: authRadii.field,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    backgroundColor: authColors.background,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counter: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    alignSelf: 'flex-end',
  },
  actions: {
    gap: authSpacing.sm,
  },
});
