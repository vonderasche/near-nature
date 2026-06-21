import {
  AuthButton,
  type AuthButtonProps,
  type AuthButtonVariant,
} from '@/components/auth/auth-button';

export type ButtonVariant = AuthButtonVariant;

export type ButtonProps = AuthButtonProps;

/** Theme-aware button — delegates to AuthButton until auth tokens migrate to useTheme. */
export function Button(props: ButtonProps) {
  return <AuthButton {...props} />;
}
