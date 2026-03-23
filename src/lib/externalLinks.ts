import { Linking } from 'react-native';
import { logError, logInfo } from './logger';

export async function openExternalUrl(url: string): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return false;
    }

    await Linking.openURL(url);
    logInfo('Opened external URL', { url });
    return true;
  } catch (error) {
    logError(error as Error, { context: 'externalLinks.openUrl', url });
    return false;
  }
}

export async function openSupportEmail(email: string, subject?: string): Promise<boolean> {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const mailtoUrl = `mailto:${email}${query}`;
  return openExternalUrl(mailtoUrl);
}
