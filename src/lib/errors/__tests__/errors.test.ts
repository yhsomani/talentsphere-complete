/**
 * Unit tests for Error Classification System
 */

import { describe, it, expect } from '../../testing/expect';
import {
  AppError,
  AppErrors,
  ErrorCategory,
  ErrorSeverity,
  RetryStrategy,
  isAppError,
  toAppError,
  getUserSafeMessage,
} from '../index';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');

      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test error');
      expect(error.category).toBe(ErrorCategory.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.retryStrategy).toBe(RetryStrategy.NONE);
      expect(error.context).toEqual({});
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create error with custom options', () => {
      const context = { userId: '123', action: 'delete' };
      const error = new AppError('Custom error', {
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.LOW,
        retryStrategy: RetryStrategy.NONE,
        context,
        code: 'VALIDATION_ERROR',
      });

      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.retryStrategy).toBe(RetryStrategy.NONE);
      expect(error.context).toEqual(context);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Stack test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('getDefaultRetryStrategy', () => {
    it('should return NONE for validation errors', () => {
      const error = new AppError('Validation failed', {
        category: ErrorCategory.VALIDATION,
      });
      expect(error.retryStrategy).toBe(RetryStrategy.NONE);
    });

    it('should return EXPONENTIAL_BACKOFF for timeout errors', () => {
      const error = new AppError('Timeout', {
        category: ErrorCategory.TIMEOUT,
      });
      expect(error.retryStrategy).toBe(RetryStrategy.EXPONENTIAL_BACKOFF);
    });

    it('should return CIRCUIT_BREAKER for external service errors', () => {
      const error = new AppError('Service down', {
        category: ErrorCategory.EXTERNAL_SERVICE,
      });
      expect(error.retryStrategy).toBe(RetryStrategy.CIRCUIT_BREAKER);
    });

    it('should return FIXED_DELAY for rate limit errors', () => {
      const error = new AppError('Rate limited', {
        category: ErrorCategory.RATE_LIMIT,
      });
      expect(error.retryStrategy).toBe(RetryStrategy.FIXED_DELAY);
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new AppError('Serialize me', {
        category: ErrorCategory.DATABASE,
        context: { table: 'users' },
        code: 'DB_ERROR',
      });

      const json = error.toJSON();

      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Serialize me');
      expect(json.category).toBe(ErrorCategory.DATABASE);
      expect(json.context).toEqual({ table: 'users' });
      expect(json.code).toBe('DB_ERROR');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('withContext', () => {
    it('should create new error with merged context', () => {
      const original = new AppError('Original', {
        context: { userId: '123' },
      });

      const enriched = original.withContext({ action: 'delete' });

      expect(enriched.message).toBe('Original');
      expect(enriched.context).toEqual({ userId: '123', action: 'delete' });
      expect(enriched.cause).toBe(original);
    });
  });
});

describe('AppErrors factory', () => {
  it('should create validation error', () => {
    const error = AppErrors.validation('Email required', { field: 'email' });

    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.retryStrategy).toBe(RetryStrategy.NONE);
  });

  it('should create authentication error', () => {
    const error = AppErrors.authentication('Invalid credentials');

    expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
    expect(error.severity).toBe(ErrorSeverity.HIGH);
  });

  it('should create not found error', () => {
    const error = AppErrors.notFound('User', '123');

    expect(error.category).toBe(ErrorCategory.NOT_FOUND);
    expect(error.message).toContain('User not found');
    expect(error.context).toEqual({ resource: 'User', id: '123' });
  });

  it('should create database error with cause', () => {
    const cause = new Error('Connection refused');
    const error = AppErrors.database('Query failed', { query: 'SELECT *' }, cause);

    expect(error.category).toBe(ErrorCategory.DATABASE);
    expect(error.cause).toBe(cause);
    expect(error.retryStrategy).toBe(RetryStrategy.EXPONENTIAL_BACKOFF);
  });

  it('should create external service error', () => {
    const error = AppErrors.externalService('Stripe', 'Payment failed');

    expect(error.category).toBe(ErrorCategory.EXTERNAL_SERVICE);
    expect(error.message).toContain('Stripe');
    expect(error.retryStrategy).toBe(RetryStrategy.CIRCUIT_BREAKER);
  });

  it('should create configuration error', () => {
    const error = AppErrors.configuration('Missing API key');

    expect(error.category).toBe(ErrorCategory.CONFIGURATION);
    expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    expect(error.retryStrategy).toBe(RetryStrategy.NONE);
  });

  it('should create rate limit error', () => {
    const error = AppErrors.rateLimit('API', 60);

    expect(error.category).toBe(ErrorCategory.RATE_LIMIT);
    expect(error.context).toEqual({ service: 'API', retryAfter: 60 });
    expect(error.retryStrategy).toBe(RetryStrategy.FIXED_DELAY);
  });

  it('should create service unavailable error', () => {
    const error = AppErrors.serviceUnavailable('Database', 'Connection pool exhausted');

    expect(error.category).toBe(ErrorCategory.SERVICE_UNAVAILABLE);
    expect(error.retryStrategy).toBe(RetryStrategy.CIRCUIT_BREAKER);
  });

  it('should create data integrity error', () => {
    const error = AppErrors.dataIntegrity('Foreign key violation');

    expect(error.category).toBe(ErrorCategory.DATA_INTEGRITY);
    expect(error.severity).toBe(ErrorSeverity.CRITICAL);
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    const error = new AppError('Test');
    expect(isAppError(error)).toBe(true);
  });

  it('should return false for regular errors', () => {
    const error = new Error('Regular error');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error objects', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('string')).toBe(false);
    expect(isAppError({})).toBe(false);
  });
});

describe('toAppError', () => {
  it('should return AppError as-is', () => {
    const appError = AppErrors.validation('Test');
    const result = toAppError(appError);
    expect(result).toBe(appError);
  });

  it('should convert regular Error to AppError', () => {
    const error = new Error('Regular error');
    const result = toAppError(error, 'Converted');

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Converted');
    expect(result.cause).toBe(error);
  });

  it('should convert string to AppError', () => {
    const result = toAppError('Error message');

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Error message');
  });

  it('should handle unknown types', () => {
    const result = toAppError(null, 'Default message');

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Default message');
  });

  it('should add context when provided', () => {
    const error = new Error('Original');
    const result = toAppError(error, 'Converted', { key: 'value' });

    expect(result.context).toEqual({ key: 'value' });
  });
});

describe('getUserSafeMessage', () => {
  it('should return original message for validation errors', () => {
    const error = AppErrors.validation('Email is required');
    expect(getUserSafeMessage(error)).toBe('Email is required');
  });

  it('should return safe message for authentication errors', () => {
    const error = AppErrors.authentication('Invalid token');
    expect(getUserSafeMessage(error)).toBe('Please sign in to continue');
  });

  it('should return safe message for authorization errors', () => {
    const error = AppErrors.authorization('Admin only');
    expect(getUserSafeMessage(error)).toBe(
      'You do not have permission to perform this action'
    );
  });

  it('should return safe message for timeout errors', () => {
    const error = AppErrors.timeout('api_call');
    expect(getUserSafeMessage(error)).toBe(
      'The request took too long. Please try again.'
    );
  });

  it('should return safe message for network errors', () => {
    const error = AppErrors.network('Connection failed');
    expect(getUserSafeMessage(error)).toBe(
      'Network error. Please check your connection and try again.'
    );
  });

  it('should return safe message for service unavailable', () => {
    const error = AppErrors.serviceUnavailable('Database');
    expect(getUserSafeMessage(error)).toBe(
      'Service temporarily unavailable. Please try again later.'
    );
  });

  it('should return generic message for unknown errors', () => {
    const error = AppErrors.unknown('Something weird happened');
    expect(getUserSafeMessage(error)).toBe('Something went wrong. Please try again.');
  });

  it('should return generic message for non-AppError', () => {
    const error = new Error('Regular error');
    expect(getUserSafeMessage(error)).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});
