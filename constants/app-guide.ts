export type AppGuideStep = {
  title: string;
  body: string;
};

export const APP_GUIDE_STEPS: AppGuideStep[] = [
  {
    title: 'Camera',
    body: 'Open the Camera tab, point at a plant or animal, and capture a photo. Near Nature identifies it on your device and shows species details you can save.',
  },
  {
    title: 'Save identifications',
    body: 'After identifying, save the photo to your gallery. Your profile keeps every save, with search and filters to browse what you have found.',
  },
  {
    title: 'Profile & badges',
    body: 'The Profile tab tracks your discoveries, native-species progress, and earned badges. Tap your motto or home state to personalize your public profile.',
  },
  {
    title: 'Discover',
    body: 'Browse Florida state parks, then switch to Plants or Animals to explore featured species you can look for—similar to the park list, with photos and park locations.',
  },
  {
    title: 'Rankings',
    body: 'See who is discovering the most native species. Search the community gallery for public identifications from other members.',
  },
];
