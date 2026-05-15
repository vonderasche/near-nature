import { AuthButton } from '@/components/auth/auth-button';

type UploadToDatabaseButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Defaults to "Save". */
  title?: string;
  fillParent?: boolean;
};

export function UploadToDatabaseButton({
  onPress,
  disabled,
  loading,
  title = 'Save',
  fillParent = false,
}: UploadToDatabaseButtonProps) {
  return (
    <AuthButton
      title={title}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      variant="primary"
      fillParent={fillParent}
      testID="upload-detection-to-database"
    />
  );
}
