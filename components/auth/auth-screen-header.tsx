import type { ScreenHeadingProps } from '@/components/shared/screen-heading';
import { ScreenHeading } from '@/components/shared/screen-heading';

/** Auth flows use the shared {@link ScreenHeading} typography. */
export function AuthScreenHeader(props: Pick<ScreenHeadingProps, 'title' | 'subtitle'>) {
  return <ScreenHeading {...props} />;
}
