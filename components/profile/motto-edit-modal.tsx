import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
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
 * Centered sheet modal (same shell as gallery detail) for editing profile motto.
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
      {visible ? (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
          <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            pointerEvents="box-none">
            <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
            <View style={styles.sheet} accessibilityViewIsModal>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Edit motto</Text>
                <Text style={styles.hint}>Shown on your profile and the leaderboard.</Text>

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
                <View style={styles.actionRow}>
                  <View style={styles.actionHalf}>
                    <AuthButton title="Cancel" variant="outline" onPress={onClose} disabled={saving} />
                  </View>
                  <View style={styles.actionHalf}>
                    <AuthButton title="Save" onPress={() => void handleSave()} loading={saving} disabled={saving} />
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      ) : null}
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
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: authSpacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    gap: authSpacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1,
  },
  scrollContent: {
    gap: authSpacing.sm,
    paddingBottom: authSpacing.xs,
  },
  title: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
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
    backgroundColor: authColors.fieldBackground,
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
  actionRow: {
    flexDirection: 'row',
    gap: authSpacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
});
