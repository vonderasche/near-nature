import { Redirect } from 'expo-router';

/** Default tab route — opens Explorer Board. */
export default function TabsIndex() {
  return <Redirect href="/(tabs)/explorer-board" />;
}
