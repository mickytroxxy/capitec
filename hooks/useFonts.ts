import { useFonts as useExpoFonts } from 'expo-font';

export function useFonts() {
  const [fontsLoaded] = useExpoFonts({
    'Inter-Light': require('../assets/fonts/fonnts.com-Bernino_Sans_Light.otf'),
    'Inter-Bold': require('../assets/fonts/fonnts.com-Bernino_Sans_Narrow_Bold.otf'),
    'Inter-Regular': require('../assets/fonts/fonnts.com-Bernino_Sans.otf'),
    'Inter-Medium': require('../assets/fonts/fonnts.com-Bernino_Sans_Semibold.otf'),
    'Inter-SemiBold': require('../assets/fonts/fonnts.com-Bernino_Sans_Semibold.otf'),

  });

  return fontsLoaded;
}
