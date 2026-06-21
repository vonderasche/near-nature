import { View } from 'react-native';
import { useState } from 'react';

import { UsStatePicker } from '@/components/auth/us-state-picker';
import { Button } from '@/components/ui/Button';
import { ButtonRow, ButtonRowSlot } from '@/components/ui/button-row';
import { Text } from '@/components/ui/Text';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { normalizeUsStateCode, type UsStateCode } from '@/constants/us-states';
import { useTheme } from '@/hooks/useTheme';
import type { UpdateUserResult } from '@/hooks/useUser';

type Props = {
  initialState: string | null | undefined;
  onSave: (stateCode: UsStateCode) => Promise<UpdateUserResult>;
  saving?: boolean;
  onCancel: () => void;
};

export function StateEditForm({ initialState, onSave, saving = false, onCancel }: Props) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState<UsStateCode | ''>(normalizeUsStateCode(initialState) ?? '');
  const [saveError, setSaveError] = useState<string | null>(null);

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
    onCancel();
  }

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text variant="subtitle" color="secondary">
        Used for native vs non-native species when you identify wildlife and plants.
      </Text>
      <UsStatePicker value={draft} onChange={setDraft} disabled={saving} />
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
