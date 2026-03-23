import appConfig from './appConfig';
import { logError, logInfo } from './logger';

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

const sanitizeProperties = (properties: AnalyticsProperties): Record<string, string | number | boolean | null> => {
  return Object.entries(properties).reduce<Record<string, string | number | boolean | null>>(
    (accumulator, [key, value]) => {
      if (value !== undefined) {
        accumulator[key] = value;
      }

      return accumulator;
    },
    {}
  );
};

export async function track(event: string, properties: AnalyticsProperties = {}): Promise<void> {
  try {
    if (!appConfig.analyticsEnabled) {
      return;
    }

    logInfo('Analytics event captured', {
      analyticsEvent: event,
      analyticsProvider: appConfig.analyticsProvider,
      ...sanitizeProperties(properties),
    });
  } catch (error) {
    logError(error as Error, { context: 'analytics.track', event });
  }
}

export async function identifyUser(
  userId: string,
  traits: AnalyticsProperties = {}
): Promise<void> {
  try {
    if (!appConfig.analyticsEnabled) {
      return;
    }

    logInfo('Analytics user identified', {
      analyticsProvider: appConfig.analyticsProvider,
      userId,
      ...sanitizeProperties(traits),
    });
  } catch (error) {
    logError(error as Error, { context: 'analytics.identify', userId });
  }
}

export async function resetAnalyticsIdentity(): Promise<void> {
  try {
    if (!appConfig.analyticsEnabled) {
      return;
    }

    logInfo('Analytics identity reset', {
      analyticsProvider: appConfig.analyticsProvider,
    });
  } catch (error) {
    logError(error as Error, { context: 'analytics.reset' });
  }
}
