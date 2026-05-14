import { describe, expect, it } from 'vitest';

import { normalizePhotoUri, paramToString } from '@/lib/routing/searchParams';

describe('paramToString', () => {
  it('returns the string as-is', () => {
    expect(paramToString('hello')).toBe('hello');
  });

  it('returns the first array element', () => {
    expect(paramToString(['a', 'b'])).toBe('a');
  });

  it('returns undefined for undefined', () => {
    expect(paramToString(undefined)).toBeUndefined();
  });
});

describe('normalizePhotoUri', () => {
  it('returns undefined for empty input', () => {
    expect(normalizePhotoUri(undefined)).toBeUndefined();
    expect(normalizePhotoUri('')).toBeUndefined();
  });

  it('decodes percent-encoded segments', () => {
    expect(normalizePhotoUri('file%3A%2F%2Fphoto.jpg')).toBe('file://photo.jpg');
  });

  it('returns the original string if decoding throws', () => {
    const bad = '%';
    expect(normalizePhotoUri(bad)).toBe(bad);
  });
});
