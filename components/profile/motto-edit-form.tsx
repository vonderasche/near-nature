import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ButtonRow, ButtonRowSlot } from '@/components/ui/button-row';
import { Text } from '@/components/ui/Text';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { useTheme } from '@/hooks/useTheme';
import type { UpdateUserResult } from '@/hooks/useUser';

const MAX_MOTTO_LENGTH = 280;

type Props = {
  initialMotto: string | null | undefined;
  onSave: (motto: string | null) => Promise<UpdateUserResult>;
  saving?: boolean;
  onCancel: () => void;
};

export function MottoEditForm({ initialMotto, onSave, saving = false, onCancel }: Props) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState(initialMotto?.trim() ?? '');
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = draft.trim();
    const motto = trimmed.length > 0 ? trimmed : null;
    const res = await onSave(motto);
    if (!res.ok) {
      setSaveError(res.message);
      return;
    }
    onCancel();
  }

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text variant="subtitle" color="secondary">
        Shown on your profile and the Explorer Board.
      </Text>

      <TextInput
        value={draft}
        onChangeText={(t) => setDraft(t.slice(0, MAX_MOTTO_LENGTH))}
        placeholder="Short line about you and nature"
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        maxLength={MAX_MOTTO_LENGTH}
        editable={!saving}
        accessibilityLabel="Motto text"
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.background,
            borderRadius: theme.radii.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
        ]}
      />
      <Text variant="caption" color="secondary" style={styles.counter}>
        {draft.length}/{MAX_MOTTO_LENGTH}
      </Text>

      {saveError ? <InlineFormError>{saveError}</InlineFormError> : null}

      <ButtonRow>
        <ButtonRowSlot>
          <Button title="Cancel" variant="outline" fillParent onPress={onCancel} disabled={saving} />
        </ButtonRowSlot>
        <ButtonRowSlot>
          <Button title="Save" fillParent onPress={() => void handleSave()} loading={saving} disabled={saving} />
        </ButtonRowSlot>
      </ButtonRow>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  counter: {
    alignSelf: 'flex-end',
  },
});
