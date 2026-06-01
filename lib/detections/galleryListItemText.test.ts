import { describe, expect, it } from 'vitest';

import { galleryListItemTextFields } from '@/lib/detections/galleryListItemText';

describe('galleryListItemTextFields', () => {
  it('uses common name as title and latin as subtitle when both differ', () => {
    const fields = galleryListItemTextFields({
      commonName: 'Northern Cardinal',
      latinName: 'Cardinalis cardinalis',
      description: 'A red songbird.',
    });
    expect(fields.title).toBe('Northern Cardinal');
    expect(fields.subtitle).toBe('Cardinalis cardinalis');
    expect(fields.description).toBe('A red songbird.');
  });

  it('omits duplicate subtitle when common and latin match', () => {
    const fields = galleryListItemTextFields({
      commonName: 'Anolis',
      latinName: 'Anolis',
      description: 'A genus of lizards.',
    });
    expect(fields.title).toBe('Anolis');
    expect(fields.subtitle).toBeNull();
    expect(fields.description).toBe('A genus of lizards.');
  });
});
