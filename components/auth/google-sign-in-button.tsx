import { AuthButton } from '@/components/auth/auth-button';

type Props = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function GoogleSignInButton({ onPress, loading = false, disabled = false }: Props) {
  return (
    <AuthButton
      title="Continue with Google"
      variant="outline"
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      accessibilityLabel="Continue with Google"
    />
  );
}
