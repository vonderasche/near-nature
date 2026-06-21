import { Redirect, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { StateEditForm } from '@/components/profile/state-edit-form';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { useAuthContext } from '@/context/AuthContext';
import { useProfileFieldSave } from '@/hooks/useProfileFieldSave';
import { useTheme } from '@/hooks/useTheme';
import { useUser } from '@/hooks/useUser';
import { routes } from '@/lib/routing/routes';

export default function EditStateScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { user, update } = useUser();
  const { saveState, saving } = useProfileFieldSave(update);

  if (!authLoading && !isAuthenticated) {
    return <Redirect href={routes.login} />;
  }

  if (!user) {
    return null;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title="Home state" />
        <StateEditForm
          initialState={user.state}
          onSave={saveState}
          saving={saving}
          onCancel={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}
