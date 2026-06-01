/** Title, subtitle, and description lines for gallery / identification list rows. */
export function galleryListItemTextFields(item: {
  commonName: string;
  latinName: string;
  description?: string | null;
}): {
  title: string;
  subtitle: string | null;
  description: string | null;
} {
  const common = item.commonName?.trim() ?? '';
  const latin = item.latinName?.trim() ?? '';
  const description = item.description?.trim() ?? '';

  const title = common || latin || 'Unknown';
  const subtitle =
    latin.length > 0 && latin.toLowerCase() !== title.toLowerCase() ? latin : null;

  return {
    title,
    subtitle,
    description: description.length > 0 ? description : null,
  };
}
