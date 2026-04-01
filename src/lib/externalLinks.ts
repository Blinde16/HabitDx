import { Linking } from 'react-native';
import { logError, logInfo } from './logger';

/**
 * Opens a URL in the system browser or handler (mailto:, https:, etc.).
 * Uses openURL directly — pre-checking with canOpenURL often returns false on iOS
 * for valid https URLs, which blocked Settings beta links for testers.
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  try {
    await Linking.openURL(trimmed);
    logInfo('Opened external URL', { url: trimmed });
    return true;
  } catch (error) {
    logError(error as Error, { context: 'externalLinks.openUrl', url: trimmed });
    return false;
  }
}

export async function openSupportEmail(email: string, subject?: string): Promise<boolean> {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const mailtoUrl = `mailto:${email}${query}`;
  return openExternalUrl(mailtoUrl);
}
