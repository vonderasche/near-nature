import type { ScreenHeadingProps } from '@/components/screen/screen-heading';
import { ScreenHeading } from '@/components/screen/screen-heading';

/** Auth flows use the shared {@link ScreenHeading} typography. */
export function AuthScreenHeader(props: Pick<ScreenHeadingProps, 'title' | 'subtitle'>) {
  return <ScreenHeading {...props} />;
}
