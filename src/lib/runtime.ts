import { Platform } from 'react-native';

/** True when the app runs in Expo web (browser). Local/push habit reminders are not supported here. */
export const isExpoWeb = Platform.OS === 'web';
