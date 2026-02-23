import { Platform } from 'react-native';

// Web-safe logger: uses console on web/browser, winston on native/Node
// Winston's File transport requires Node.js `fs` which is unavailable in browsers.

type LogMeta = Record<string, any>;

type Logger = {
  error: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  debug: (message: string, meta?: LogMeta) => void;
};

function createConsoleLogger(): Logger {
  const fmt = (level: string, message: string, meta?: LogMeta) => {
    const ts = new Date().toISOString();
    const base = `${ts} [${level}]: ${message}`;
    return meta && Object.keys(meta).length > 0 ? `${base} ${JSON.stringify(meta)}` : base;
  };
  return {
    error: (msg, meta) => console.error(fmt('error', msg, meta)),
    warn: (msg, meta) => console.warn(fmt('warn', msg, meta)),
    info: (msg, meta) => console.info(fmt('info', msg, meta)),
    debug: (msg, meta) => console.debug(fmt('debug', msg, meta)),
  };
}

function createWinstonLogger(): Logger {
  // Dynamically required so Metro doesn't try to bundle it for web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const winston = require('winston');
  const { combine, timestamp, json, printf, colorize, errors } = winston.format;

  const consoleFormat = printf(({ level, message, timestamp, ...metadata }: any) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) msg += ` ${JSON.stringify(metadata)}`;
    return msg;
  });

  const instance = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
    defaultMeta: { service: 'habitdx-app', environment: process.env.NODE_ENV || 'development' },
    transports: [
      new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880, maxFiles: 5 }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880, maxFiles: 5 }),
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    instance.add(new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat),
    }));
  }

  return {
    error: (msg, meta) => instance.error(msg, meta),
    warn: (msg, meta) => instance.warn(msg, meta),
    info: (msg, meta) => instance.info(msg, meta),
    debug: (msg, meta) => instance.debug(msg, meta),
  };
}

const logger: Logger = Platform.OS === 'web' ? createConsoleLogger() : createWinstonLogger();

// Helper functions for common logging patterns

/**
 * Log authentication events
 */
export const logAuth = {
  signUpAttempt: (email: string) => {
    logger.info('User signup attempt', { email, event: 'auth.signup.attempt' });
  },
  signUpSuccess: (userId: string, email: string) => {
    logger.info('User signup successful', { userId, email, event: 'auth.signup.success' });
  },
  signUpError: (email: string, error: Error) => {
    logger.error('User signup failed', { email, error: error.message, stack: error.stack, event: 'auth.signup.error' });
  },
  signInAttempt: (email: string) => {
    logger.info('User signin attempt', { email, event: 'auth.signin.attempt' });
  },
  signInSuccess: (userId: string, email: string) => {
    logger.info('User signin successful', { userId, email, event: 'auth.signin.success' });
  },
  signInError: (email: string, error: Error) => {
    logger.error('User signin failed', { email, error: error.message, stack: error.stack, event: 'auth.signin.error' });
  },
  signOut: (userId: string) => {
    logger.info('User signed out', { userId, event: 'auth.signout' });
  },
};

/**
 * Log database operations
 */
export const logDatabase = {
  queryStart: (table: string, operation: string, params?: Record<string, any>) => {
    logger.debug('Database query started', { table, operation, params, event: 'db.query.start' });
  },
  querySuccess: (table: string, operation: string, rowCount?: number, duration?: number) => {
    logger.info('Database query successful', { table, operation, rowCount, duration, event: 'db.query.success' });
  },
  queryError: (table: string, operation: string, error: Error) => {
    logger.error('Database query failed', { table, operation, error: error.message, stack: error.stack, event: 'db.query.error' });
  },
  connectionError: (error: Error) => {
    logger.error('Database connection failed', { error: error.message, stack: error.stack, event: 'db.connection.error' });
  },
};

/**
 * Log onboarding flow
 */
export const logOnboarding = {
  started: (userId: string) => {
    logger.info('Onboarding started', { userId, event: 'onboarding.started' });
  },
  screenCompleted: (userId: string, screen: string, duration?: number) => {
    logger.info('Onboarding screen completed', { userId, screen, duration, event: 'onboarding.screen.completed' });
  },
  completed: (userId: string, totalDuration?: number) => {
    logger.info('Onboarding completed', { userId, totalDuration, event: 'onboarding.completed' });
  },
  abandoned: (userId: string, lastScreen: string) => {
    logger.warn('Onboarding abandoned', { userId, lastScreen, event: 'onboarding.abandoned' });
  },
  error: (userId: string, screen: string, error: Error) => {
    logger.error('Onboarding error', { userId, screen, error: error.message, stack: error.stack, event: 'onboarding.error' });
  },
};

/**
 * Log habit tracking
 */
export const logHabit = {
  checkInSuccess: (userId: string, habitId: string, completed: boolean, obstacle?: string) => {
    logger.info('Habit check-in recorded', { userId, habitId, completed, obstacle, event: 'habit.checkin.success' });
  },
  checkInError: (userId: string, habitId: string, error: Error) => {
    logger.error('Habit check-in failed', { userId, habitId, error: error.message, stack: error.stack, event: 'habit.checkin.error' });
  },
  created: (userId: string, habitId: string, habitName: string) => {
    logger.info('Habit created', { userId, habitId, habitName, event: 'habit.created' });
  },
  updated: (userId: string, habitId: string, changes: Record<string, any>) => {
    logger.info('Habit updated', { userId, habitId, changes, event: 'habit.updated' });
  },
  deleted: (userId: string, habitId: string) => {
    logger.info('Habit deleted', { userId, habitId, event: 'habit.deleted' });
  },
};

/**
 * Log AI interactions
 */
export const logAI = {
  requestStart: (userId: string, operation: string, inputSize?: number) => {
    logger.info('AI request started', { userId, operation, inputSize, event: 'ai.request.start' });
  },
  requestSuccess: (userId: string, operation: string, tokensUsed?: number, duration?: number) => {
    logger.info('AI request successful', { userId, operation, tokensUsed, duration, event: 'ai.request.success' });
  },
  requestError: (userId: string, operation: string, error: Error) => {
    logger.error('AI request failed', { userId, operation, error: error.message, stack: error.stack, event: 'ai.request.error' });
  },
  rateLimitHit: (userId: string, operation: string) => {
    logger.warn('AI rate limit hit', { userId, operation, event: 'ai.ratelimit' });
  },
};

/**
 * Log application performance
 */
export const logPerformance = {
  screenLoadTime: (screen: string, duration: number) => {
    logger.info('Screen load time', { screen, duration, event: 'performance.screen.load' });
  },
  apiResponseTime: (endpoint: string, duration: number, statusCode?: number) => {
    logger.info('API response time', { endpoint, duration, statusCode, event: 'performance.api.response' });
  },
  slowQuery: (table: string, duration: number, query: string) => {
    logger.warn('Slow database query', { table, duration, query, event: 'performance.query.slow' });
  },
};

/**
 * Log errors with context
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context,
    event: 'app.error',
  });
};

/**
 * Log warnings
 */
export const logWarning = (message: string, context?: Record<string, any>) => {
  logger.warn(message, { ...context, event: 'app.warning' });
};

/**
 * Log info messages
 */
export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, { ...context, event: 'app.info' });
};

/**
 * Log debug messages
 */
export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, { ...context, event: 'app.debug' });
};

export default logger;
