import { AuthButton } from '@/components/auth/auth-button';

type UploadToDatabaseButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Defaults to "Save to database". */
  title?: string;
};

export function UploadToDatabaseButton({
  onPress,
  disabled,
  loading,
  title = 'Save to database',
}: UploadToDatabaseButtonProps) {
  return (
    <AuthButton
      title={title}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      variant="primary"
      testID="upload-detection-to-database"
    />
  );
}
