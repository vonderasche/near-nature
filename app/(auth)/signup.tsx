import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { AuthBirthDateField } from '@/components/auth/auth-birth-date-field';
import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { AuthLegalConsent } from '@/components/auth/auth-legal-consent';
import { AuthLinkRow } from '@/components/auth/auth-link-row';
import { AuthMarketingOptIn } from '@/components/auth/auth-marketing-opt-in';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthScreenHeader } from '@/components/auth/auth-screen-header';
import { UsStatePicker } from '@/components/auth/us-state-picker';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { normalizeUsStateCode, type UsStateCode } from '@/constants/us-states';
import {
  SIGNUP_EMAIL_TAKEN_MESSAGE,
  SIGNUP_USERNAME_TAKEN_MESSAGE,
  useSignupAvailability,
} from '@/hooks/useSignupAvailability';
import { signUpWithEmail } from '@/lib/auth/email-auth';
import {
  SIGNUP_PASSWORD_HINT,
  validateSignupPassword,
  validateSignupPasswordConfirm,
} from '@/lib/auth/signupPassword';
import { isSignupMinor, validateBirthDateParts } from '@/lib/auth/validateBirthDate';
import { validateSignupEmail } from '@/lib/auth/validateSignupEmail';
import { sanitizeUsernameInput, validateUsername } from '@/lib/auth/validateUsername';
import { routes } from '@/lib/routing/routes';

type InfoDialog = { title: string; message: string; goToLoginOnDismiss?: boolean } | null;

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motto, setMotto] = useState('I like nature.');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [stateCode, setStateCode] = useState<UsStateCode | ''>('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [termsTouched, setTermsTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<InfoDialog>(null);

  const {
    emailTaken,
    usernameTaken,
    emailMessage,
    usernameMessage,
    checkError,
    availabilityBlocked,
    availabilityChecking,
  } = useSignupAvailability(email, username);

  const emailValidation = useMemo(() => validateSignupEmail(email), [email]);
  const emailFormatError =
    email.length > 0 && !emailValidation.ok ? emailValidation.message : null;

  const birthDateValidation = useMemo(
    () => validateBirthDateParts(birthMonth, birthDay, birthYear),
    [birthMonth, birthDay, birthYear],
  );
  const birthTouched = birthMonth.length > 0 || birthDay.length > 0 || birthYear.length > 0;
  const birthDateError = birthTouched && !birthDateValidation.ok ? birthDateValidation.message : null;
  const birthDateBlocked = !birthDateValidation.ok;
  const minorNotice =
    birthDateValidation.ok && isSignupMinor(birthDateValidation.isoDate)
      ? 'Have a parent or guardian review our Terms with you before creating your account.'
      : null;

  const showRequiredHints = email.trim().length > 0;
  const firstNameError =
    showRequiredHints && !firstName.trim() ? 'First name is required.' : null;
  const lastNameError = showRequiredHints && !lastName.trim() ? 'Last name is required.' : null;

  const passwordValidation = useMemo(() => validateSignupPassword(password), [password]);
  const passwordError =
    password.length > 0 && !passwordValidation.ok ? passwordValidation.message : null;
  const passwordHelper =
    passwordError ?? (password.length === 0 ? SIGNUP_PASSWORD_HINT : null);

  const confirmValidation = useMemo(
    () => validateSignupPasswordConfirm(password, confirm),
    [password, confirm],
  );
  const confirmError =
    confirm.length > 0 && !confirmValidation.ok ? confirmValidation.message : null;

  const stateMissing = stateCode === '';
  const termsError =
    termsTouched && !termsAccepted ? 'Accept the Terms and Privacy Policy to continue.' : null;

  const formBlocked =
    !emailValidation.ok ||
    emailTaken ||
    availabilityBlocked ||
    availabilityChecking ||
    !firstName.trim() ||
    !lastName.trim() ||
    birthDateBlocked ||
    !passwordValidation.ok ||
    !confirmValidation.ok ||
    stateMissing ||
    !termsAccepted;

  function dismissInfo() {
    const goLogin = info?.goToLoginOnDismiss;
    setInfo(null);
    if (goLogin) {
      router.replace(routes.login);
    }
  }

  async function onSubmit() {
    setTermsTouched(true);

    if (!emailValidation.ok) {
      setInfo({ title: 'Sign up', message: emailValidation.message });
      return;
    }
    if (emailTaken) {
      setInfo({ title: 'Sign up', message: SIGNUP_EMAIL_TAKEN_MESSAGE });
      return;
    }
    const usernameRules = validateUsername(username);
    if (!usernameRules.ok) {
      setInfo({ title: 'Sign up', message: usernameRules.message });
      return;
    }
    if (usernameTaken) {
      setInfo({ title: 'Sign up', message: SIGNUP_USERNAME_TAKEN_MESSAGE });
      return;
    }
    if (availabilityChecking) {
      setInfo({ title: 'Sign up', message: 'Still checking email and username. Wait a moment.' });
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setInfo({ title: 'Sign up', message: 'First and last name are required.' });
      return;
    }
    if (!confirmValidation.ok) {
      setInfo({ title: 'Sign up', message: confirmValidation.message });
      return;
    }
    if (!birthDateValidation.ok) {
      setInfo({ title: 'Sign up', message: birthDateValidation.message });
      return;
    }
    const state = normalizeUsStateCode(stateCode);
    if (!state) {
      setInfo({ title: 'Sign up', message: 'Select your US home state.' });
      return;
    }
    if (!termsAccepted) {
      setInfo({ title: 'Sign up', message: 'Accept the Terms of Service and Privacy Policy to continue.' });
      return;
    }

    setBusy(true);
    try {
      const result = await signUpWithEmail(
        email,
        password,
        {
          username,
          first_name: firstName,
          last_name: lastName,
          motto,
          state,
          date_of_birth: birthDateValidation.isoDate,
          marketing_opt_in: marketingOptIn,
        },
        { termsAccepted },
      );
      if (!result.ok) {
        setInfo({ title: 'Sign up', message: result.message });
        return;
      }
      if (result.needsEmailConfirmation) {
        setInfo({
          title: 'Check your email',
          message:
            'If email confirmation is enabled in Supabase, you should receive a confirmation link. ' +
            'If nothing arrives after a few minutes, check spam, and in the Supabase dashboard under ' +
            'Authentication → Providers → Email confirm that SMTP / rate limits are OK. ' +
            'If confirmations are disabled, you can log in immediately after this screen.',
          goToLoginOnDismiss: true,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  const emailHelper =
    emailMessage ??
    emailFormatError ??
    (email.length === 0 ? 'Use an address you can access for confirmations.' : null);
  const emailHelperTone =
    emailMessage || emailFormatError
      ? emailMessage?.startsWith('Checking')
        ? 'muted'
        : 'error'
      : 'muted';

  return (
    <AuthScreen>
      <AuthScreenHeader title="Create account" subtitle="Email and password." />

      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        helperText={emailHelper}
        helperTone={emailHelperTone}
      />
      <AuthField
        label="Username"
        value={username}
        onChangeText={(text) => setUsername(sanitizeUsernameInput(text))}
        placeholder="Letters, numbers, underscores"
        autoComplete="off"
        autoCapitalize="none"
        textContentType="username"
        helperText={
          usernameMessage ??
          (username.length === 0
            ? '3–24 characters. Not case-sensitive — ExampleUserName matches exampleusername.'
            : null)
        }
        helperTone={usernameMessage && !usernameMessage.startsWith('Checking') ? 'error' : 'muted'}
      />
      {checkError ? <InlineFormError>{checkError}</InlineFormError> : null}
      <AuthField
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Given name"
        autoCapitalize="words"
        helperText={firstNameError}
        helperTone={firstNameError ? 'error' : 'muted'}
      />
      <AuthField
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Family name"
        autoCapitalize="words"
        helperText={lastNameError}
        helperTone={lastNameError ? 'error' : 'muted'}
      />
      <AuthField label="Short motto" value={motto} onChangeText={setMotto} placeholder="Shown on Explorer board" />

      <AuthBirthDateField
        month={birthMonth}
        day={birthDay}
        year={birthYear}
        onChangeMonth={setBirthMonth}
        onChangeDay={setBirthDay}
        onChangeYear={setBirthYear}
        error={birthDateError}
        minorNotice={minorNotice}
      />

      <UsStatePicker value={stateCode} onChange={setStateCode} />

      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder={SIGNUP_PASSWORD_HINT}
        secureTextEntry
        allowShowPassword
        autoComplete="new-password"
        textContentType="newPassword"
        helperText={passwordHelper}
        helperTone={passwordError ? 'error' : 'muted'}
      />
      <AuthField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat password"
        secureTextEntry
        allowShowPassword
        autoComplete="new-password"
        textContentType="newPassword"
        helperText={confirmError}
        helperTone={confirmError ? 'error' : 'muted'}
      />

      <AuthLegalConsent
        accepted={termsAccepted}
        onAcceptedChange={(value) => {
          setTermsAccepted(value);
          setTermsTouched(true);
        }}
        error={termsError}
      />
      <AuthMarketingOptIn optedIn={marketingOptIn} onOptedInChange={setMarketingOptIn} />

      <AuthButton
        title="Create account"
        onPress={onSubmit}
        loading={busy}
        disabled={busy || formBlocked}
      />

      <AuthLinkRow prompt="Already have an account?" href={routes.login} linkText="Log in" />

      <ThemedMessageModal
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onDismiss={dismissInfo}
      />
    </AuthScreen>
  );
}
