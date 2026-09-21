/**
 * Retry utilities with exponential backoff and circuit breaker patterns
 */

import { AppError, AppErrors, ErrorCategory, RetryStrategy } from './index';
import { toAppError } from './index';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds */
  maxDelayMs?: number;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
  /** Callback invoked before each retry */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  isRetryable: isRetryableError,
  onRetry: () => {},
};

/**
 * Determine if an error should be retried based on its type/category
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return (
      error.retryStrategy === RetryStrategy.EXPONENTIAL_BACKOFF ||
      error.retryStrategy === RetryStrategy.IMMEDIATE ||
      error.retryStrategy === RetryStrategy.CIRCUIT_BREAKER
    );
  }

  // Check for common transient errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('temporarily') ||
      message.includes('retry')
    );
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>,
): number {
  const exponentialDelay =
    options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);
  
  // Add jitter (±25% randomness) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.min(exponentialDelay + jitter, options.maxDelayMs);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic using exponential backoff
 * 
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Promise resolving to function result
 * @throws AppError with context about all failed attempts
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable or we've exhausted attempts
      if (!opts.isRetryable(error) || attempt === opts.maxAttempts) {
        throw createFinalError(error, attempt, opts.maxAttempts);
      }

      const delayMs = calculateDelay(attempt, opts);
      
      opts.onRetry(attempt, error, delayMs);
      
      await sleep(delayMs);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw createFinalError(lastError, opts.maxAttempts, opts.maxAttempts);
}

/**
 * Create a final error after all retries exhausted
 */
function createFinalError(
  error: unknown,
  attempt: number,
  maxAttempts: number,
): AppError {
  const appError = toAppError(
    error,
    'Operation failed after retries',
    { attempt, maxAttempts },
  );

  return appError.withContext({
    retryAttempts: attempt,
    maxAttempts,
    finalAttempt: true,
  });
}

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Failing fast
  HALF_OPEN = 'half_open', // Testing if service recovered
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold?: number;
  /** Time in ms before attempting recovery */
  resetTimeoutMs?: number;
  /** Number of successful calls in half-open state to close circuit */
  successThreshold?: number;
  /** Custom function to determine if error should count as failure */
  isFailure?: (error: unknown) => boolean;
  /** Callback when circuit opens */
  onOpen?: () => void;
  /** Callback when circuit closes */
  onClose?: () => void;
  /** Callback when circuit enters half-open state */
  onHalfOpen?: () => void;
}

const DEFAULT_CIRCUIT_BREAKER_OPTIONS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  resetTimeoutMs: 60000, // 1 minute
  successThreshold: 3,
  isFailure: () => true,
  onOpen: () => {},
  onClose: () => {},
  onHalfOpen: () => {},
};

/**
 * Circuit Breaker implementation for isolating failing external services
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions = {},
  ) {}

  private getOpts(): Required<CircuitBreakerOptions> {
    return { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...this.options };
  }

  /**
   * Execute a function through the circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const opts = this.getOpts();

    if (!this.canExecute()) {
      throw AppErrors.serviceUnavailable(
        this.name,
        `Circuit breaker is ${this.state}`,
        {
          circuitState: this.state,
          failureCount: this.failureCount,
        },
      );
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      if (opts.isFailure(error)) {
        this.onFailure();
      }
      throw error;
    }
  }

  /**
   * Check if circuit allows execution
   */
  private canExecute(): boolean {
    const opts = this.getOpts();

    switch (this.state) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        if (Date.now() >= (this.nextAttemptTime ?? 0)) {
          this.transitionTo(CircuitState.HALF_OPEN);
          opts.onHalfOpen();
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        return true;

      default:
        return false;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    const opts = this.getOpts();

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= opts.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        opts.onClose();
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const opts = this.getOpts();
    
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (
      this.failureCount >= opts.failureThreshold &&
      this.state !== CircuitState.OPEN
    ) {
      this.transitionTo(CircuitState.OPEN);
      this.nextAttemptTime = Date.now() + opts.resetTimeoutMs;
      opts.onOpen();
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    
    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
      this.nextAttemptTime = null;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }
  }

  /**
   * Get current circuit state and metrics
   */
  getState(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: Date | null;
    nextAttemptTime: Date | null;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime) : null,
      nextAttemptTime: this.nextAttemptTime ? new Date(this.nextAttemptTime) : null,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
  }
}

/**
 * Execute a function with both retry and circuit breaker
 */
export async function withResilience<T>(
  fn: () => Promise<T>,
  circuitBreaker: CircuitBreaker,
  retryOptions?: RetryOptions,
): Promise<T> {
  return circuitBreaker.execute(() => withRetry(fn, retryOptions));
}

/**
 * Timeout wrapper for operations
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  operationName?: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(AppErrors.timeout(operationName || 'unnamed operation', {
        timeoutMs,
      }));
    }, timeoutMs);

    fn()
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Combine timeout with retry
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions?: RetryOptions,
  operationName?: string,
): Promise<T> {
  return withRetry(
    () => withTimeout(fn, timeoutMs, operationName),
    retryOptions,
  );
}
