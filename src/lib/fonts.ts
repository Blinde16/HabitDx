import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
} from '@expo-google-fonts/public-sans';

/** Font assets for `useFonts` — register all weights used in the app. */
export const habitDxFonts = {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_600SemiBold,
};

/** React Native `fontFamily` names after loading (Expo Google Fonts). */
export const fontFamily = {
  manrope: 'Manrope_700Bold',
  manropeSemibold: 'Manrope_600SemiBold',
  manropeRegular: 'Manrope_400Regular',
  publicSans: 'PublicSans_400Regular',
  publicSansMedium: 'PublicSans_500Medium',
  publicSansSemibold: 'PublicSans_600SemiBold',
} as const;
