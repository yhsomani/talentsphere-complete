/**
 * Error Classification System for Talentsphere
 * 
 * Provides structured error types to enable:
 * - Consistent error handling across services
 * - Proper retry logic based on error type
 * - Clear failure diagnostics
 * - Graceful degradation strategies
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  /** Critical - system cannot function */
  CRITICAL = 'critical',
  /** High - major feature broken */
  HIGH = 'high',
  /** Medium - feature degraded */
  MEDIUM = 'medium',
  /** Low - minor issue, non-critical feature affected */
  LOW = 'low',
  /** Info - informational only */
  INFO = 'info',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  /** Validation failed - client error, no retry */
  VALIDATION = 'validation',
  /** Authentication/authorization failed - no retry */
  AUTHENTICATION = 'authentication',
  /** Authorization failed - no retry */
  AUTHORIZATION = 'authorization',
  /** Network timeout - retry with backoff */
  TIMEOUT = 'timeout',
  /** Network error - retry with backoff */
  NETWORK = 'network',
  /** Database error - may retry depending on type */
  DATABASE = 'database',
  /** External service error - retry with circuit breaker */
  EXTERNAL_SERVICE = 'external_service',
  /** Configuration error - no retry, fix config */
  CONFIGURATION = 'configuration',
  /** Not found - no retry */
  NOT_FOUND = 'not_found',
  /** Conflict - no retry, user action needed */
  CONFLICT = 'conflict',
  /** Rate limit exceeded - retry after delay */
  RATE_LIMIT = 'rate_limit',
  /** Unknown/unexpected error - log and investigate */
  UNKNOWN = 'unknown',
  /** Service unavailable - retry with backoff */
  SERVICE_UNAVAILABLE = 'service_unavailable',
  /** Data integrity error - no retry, investigate */
  DATA_INTEGRITY = 'data_integrity',
}

/**
 * Retry strategy recommendations based on error category
 */
export enum RetryStrategy {
  /** Do not retry */
  NONE = 'none',
  /** Retry immediately (for transient issues) */
  IMMEDIATE = 'immediate',
  /** Retry with exponential backoff */
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  /** Retry after fixed delay */
  FIXED_DELAY = 'fixed_delay',
  /** Retry with circuit breaker pattern */
  CIRCUIT_BREAKER = 'circuit_breaker',
}

/**
 * Base application error with rich context
 */
export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly retryStrategy: RetryStrategy;
  public readonly context: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly timestamp: Date;
  public readonly code?: string;

  constructor(
    message: string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      retryStrategy?: RetryStrategy;
      context?: Record<string, unknown>;
      cause?: Error;
      code?: string;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.category = options.category ?? ErrorCategory.UNKNOWN;
    this.severity = options.severity ?? ErrorSeverity.MEDIUM;
    this.retryStrategy = options.retryStrategy ?? this.getDefaultRetryStrategy();
    this.context = options.context ?? {};
    this.cause = options.cause;
    this.code = options.code;
    this.timestamp = new Date();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultRetryStrategy(): RetryStrategy {
    switch (this.category) {
      case ErrorCategory.VALIDATION:
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.NOT_FOUND:
      case ErrorCategory.CONFLICT:
      case ErrorCategory.CONFIGURATION:
      case ErrorCategory.DATA_INTEGRITY:
        return RetryStrategy.NONE;
      
      case ErrorCategory.TIMEOUT:
      case ErrorCategory.NETWORK:
        return RetryStrategy.EXPONENTIAL_BACKOFF;
      
      case ErrorCategory.RATE_LIMIT:
        return RetryStrategy.FIXED_DELAY;
      
      case ErrorCategory.EXTERNAL_SERVICE:
      case ErrorCategory.SERVICE_UNAVAILABLE:
        return RetryStrategy.CIRCUIT_BREAKER;
      
      case ErrorCategory.DATABASE:
        return RetryStrategy.EXPONENTIAL_BACKOFF;
      
      default:
        return RetryStrategy.NONE;
    }
  }

  /**
   * Convert to JSON for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      retryStrategy: this.retryStrategy,
      context: this.context,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause?.message,
    };
  }

  /**
   * Convert to safe object for logging (no sensitive data)
   * @deprecated Use toJSON() instead - this method will be removed in next version
   */
  toSafeObject(): Record<string, unknown> {
    return this.toJSON();
  }

  /**
   * Create a new error with additional context
   */
  withContext(context: Record<string, unknown>): AppError {
    return new AppError(this.message, {
      category: this.category,
      severity: this.severity,
      retryStrategy: this.retryStrategy,
      context: { ...this.context, ...context },
      cause: this,
      code: this.code,
    });
  }
}

/**
 * Factory methods for common error types
 */
export const AppErrors = {
  validation: (message: string, context?: Record<string, unknown>) =>
    new AppError(message, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      context,
    }),

  authentication: (message: string, context?: Record<string, unknown>) =>
    new AppError(message, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context,
    }),

  authorization: (message: string, context?: Record<string, unknown>) =>
    new AppError(message, {
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.HIGH,
      context,
    }),

  notFound: (resource: string, id?: string | number, context?: Record<string, unknown>) =>
    new AppError(`${resource} not found${id ? `: ${id}` : ''}`, {
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.LOW,
      context: { resource, id, ...context },
    }),

  conflict: (message: string, context?: Record<string, unknown>) =>
    new AppError(message, {
      category: ErrorCategory.CONFLICT,
      severity: ErrorSeverity.MEDIUM,
      context,
    }),

  timeout: (operation: string, context?: Record<string, unknown>) =>
    new AppError(`Operation timed out: ${operation}`, {
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      context: { operation, ...context },
    }),

  network: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new AppError(message, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      context,
      cause,
    }),

  database: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new AppError(message, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      context,
      cause,
    }),

  externalService: (service: string, message: string, context?: Record<string, unknown>, cause?: Error) =>
    new AppError(`${service}: ${message}`, {
      category: ErrorCategory.EXTERNAL_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      retryStrategy: RetryStrategy.CIRCUIT_BREAKER,
      context: { service, ...context },
      cause,
    }),

  configuration: (message: string, context?: Record<string, unknown>) =>
    new AppError(message, {
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.CRITICAL,
      context,
    }),

  rateLimit: (service: string, retryAfter?: number, context?: Record<string, unknown>) =>
    new AppError(`Rate limit exceeded for ${service}`, {
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      retryStrategy: RetryStrategy.FIXED_DELAY,
      context: { service, retryAfter, ...context },
    }),

  serviceUnavailable: (service: string, message?: string, context?: Record<string, unknown>) =>
    new AppError(`${service} unavailable${message ? `: ${message}` : ''}`, {
      category: ErrorCategory.SERVICE_UNAVAILABLE,
      severity: ErrorSeverity.HIGH,
      retryStrategy: RetryStrategy.CIRCUIT_BREAKER,
      context: { service, message, ...context },
    }),

  dataIntegrity: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new AppError(message, {
      category: ErrorCategory.DATA_INTEGRITY,
      severity: ErrorSeverity.CRITICAL,
      context,
      cause,
    }),

  unknown: (message: string, context?: Record<string, unknown>, cause?: Error) =>
    new AppError(message, {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      context,
      cause,
    }),
};

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to AppError with context preservation
 */
export function toAppError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred',
  context?: Record<string, unknown>,
): AppError {
  if (isAppError(error)) {
    return context ? error.withContext(context) : error;
  }

  if (error instanceof Error) {
    return AppErrors.unknown(defaultMessage, context, error);
  }

  return AppErrors.unknown(
    typeof error === 'string' ? error : defaultMessage,
    { originalError: String(error), ...context },
  );
}

/**
 * Extract user-safe message from error (no sensitive details)
 */
export function getUserSafeMessage(error: unknown): string {
  if (isAppError(error)) {
    switch (error.category) {
      case ErrorCategory.VALIDATION:
      case ErrorCategory.NOT_FOUND:
      case ErrorCategory.CONFLICT:
        return error.message;
      case ErrorCategory.AUTHENTICATION:
        return 'Please sign in to continue';
      case ErrorCategory.AUTHORIZATION:
        return 'You do not have permission to perform this action';
      case ErrorCategory.TIMEOUT:
        return 'The request took too long. Please try again.';
      case ErrorCategory.NETWORK:
        return 'Network error. Please check your connection and try again.';
      case ErrorCategory.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}
