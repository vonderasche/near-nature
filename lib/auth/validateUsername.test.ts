import { describe, expect, it } from 'vitest';

import {
  usernameComparisonKey,
  validateUsername,
} from '@/lib/auth/validateUsername';

describe('validateUsername', () => {
  it('accepts ExampleUserName style handles', () => {
    expect(validateUsername('ExampleUserName')).toEqual({ ok: true });
    expect(validateUsername('user_42')).toEqual({ ok: true });
  });

  it('rejects special characters and spaces', () => {
    expect(validateUsername('hello!')).toMatchObject({ ok: false });
    expect(validateUsername('hello world')).toMatchObject({ ok: false });
  });

  it('rejects reserved and blocked terms', () => {
    expect(validateUsername('admin')).toMatchObject({ ok: false });
    expect(validateUsername('xx_shit_xx')).toMatchObject({ ok: false });
  });

  it('uses case-insensitive comparison keys', () => {
    expect(usernameComparisonKey('ExampleUserName')).toBe(usernameComparisonKey('exampleusername'));
  });
});
