# Talentsphere Error Handling Module

This module provides a comprehensive error handling system for the Talentsphere application.

## Features

- **Error Classification**: Categorize errors by type and severity
- **Retry Strategies**: Automatic retry with exponential backoff for transient failures
- **Circuit Breaker**: Isolate failing external services to prevent cascading failures
- **User-Safe Messages**: Extract appropriate messages for end users without leaking sensitive details

## Usage

### Creating Errors

```typescript
import { AppErrors } from '@/lib/errors';

// Validation error (no retry)
throw AppErrors.validation('Email is required', { field: 'email' });

// Database error (will retry)
throw AppErrors.database('Failed to save user', { userId: '123' }, originalError);

// External service error (circuit breaker)
throw AppErrors.externalService('Stripe', 'Payment failed', { amount: 99.99 });
```

### Using Retry Logic

```typescript
import { withRetry, CircuitBreaker } from '@/lib/errors/retry';

// Simple retry with exponential backoff
const result = await withRetry(
  () => fetchUserData(userId),
  { maxAttempts: 3, initialDelayMs: 1000 }
);

// With circuit breaker for external services
const breaker = new CircuitBreaker('payment-service');
const result = await breaker.execute(() => processPayment(paymentData));
```

### Error Classification

```typescript
import { ErrorCategory, RetryStrategy } from '@/lib/errors';

// Errors are automatically classified with appropriate retry strategies:
// - VALIDATION, AUTHENTICATION, NOT_FOUND → No retry
// - TIMEOUT, NETWORK, DATABASE → Exponential backoff
// - RATE_LIMIT → Fixed delay
// - EXTERNAL_SERVICE, SERVICE_UNAVAILABLE → Circuit breaker
```

### Converting Unknown Errors

```typescript
import { toAppError, isAppError } from '@/lib/errors';

try {
  await someOperation();
} catch (error) {
  const appError = toAppError(error, 'Operation failed', { context: 'details' });
  
  if (isAppError(error)) {
    console.log('Category:', error.category);
    console.log('Should retry:', error.retryStrategy);
  }
}
```

### User-Safe Messages

```typescript
import { getUserSafeMessage } from '@/lib/errors';

try {
  await sensitiveOperation();
} catch (error) {
  // Log full error internally
  logger.error(error);
  
  // Show safe message to user
  alert(getUserSafeMessage(error));
  // "Something went wrong. Please try again."
}
```

## Error Categories

| Category | Retry Strategy | Severity | Description |
|----------|---------------|----------|-------------|
| `VALIDATION` | None | Low | Client-side validation failure |
| `AUTHENTICATION` | None | High | User not authenticated |
| `AUTHORIZATION` | None | High | User lacks permission |
| `NOT_FOUND` | None | Low | Resource doesn't exist |
| `CONFLICT` | None | Medium | Resource conflict (e.g., duplicate) |
| `TIMEOUT` | Exponential Backoff | Medium | Operation timed out |
| `NETWORK` | Exponential Backoff | High | Network connectivity issue |
| `DATABASE` | Exponential Backoff | High | Database operation failed |
| `EXTERNAL_SERVICE` | Circuit Breaker | Medium | Third-party service error |
| `RATE_LIMIT` | Fixed Delay | Medium | Rate limit exceeded |
| `SERVICE_UNAVAILABLE` | Circuit Breaker | High | Service temporarily down |
| `CONFIGURATION` | None | Critical | Missing/invalid configuration |
| `DATA_INTEGRITY` | None | Critical | Data constraint violation |

## Architecture Benefits

1. **Isolation**: Errors are contained within their failure domain
2. **Observability**: Rich context for debugging and monitoring
3. **Resilience**: Automatic recovery from transient failures
4. **Security**: Sensitive details never leak to end users
5. **Testability**: Easy to mock and test error scenarios
