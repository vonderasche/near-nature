import { Redirect } from 'expo-router';

/** Default tab route — opens Camera. */
export default function TabsIndex() {
  return <Redirect href="/(tabs)/camera" />;
}
