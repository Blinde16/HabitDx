import winston from 'winston';

/**
 * Structured Logger Configuration for HabitDx
 * 
 * Philosophy: Use structured logging instead of console.log for better debugging and AI-assisted troubleshooting.
 * 
 * Log Levels:
 * - error: Application errors that need immediate attention
 * - warn: Warning conditions that should be reviewed
 * - info: General informational messages about app flow
 * - http: HTTP request/response logging
 * - debug: Detailed debugging information
 * 
 * Features:
 * - JSON formatting for machine readability
 * - File transport for persistent logs
 * - Console transport for development
 * - Metadata support for context
 */

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Custom format for console output (human-readable)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Log stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json() // JSON format for file logs
  ),
  defaultMeta: {
    service: 'habitdx-app',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write error logs to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
    })
  );
}

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
