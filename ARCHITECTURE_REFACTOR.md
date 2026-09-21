# Talentsphere Architecture Refactoring Plan

## Executive Summary

This document describes the architectural refactoring of Talentsphere to achieve:
- **Loose coupling** between modules
- **Fault isolation** to prevent cascading failures
- **Graceful degradation** for optional features
- **Testability** through dependency injection
- **Observability** with structured error handling

## Phase 1: Foundation (COMPLETED)

### 1.1 Error Classification System
**Location**: `src/lib/errors/index.ts`

**Purpose**: Provide consistent error handling across all services.

**Key Components**:
- `AppError` - Base error class with category, severity, and retry strategy
- `ErrorCategory` - Enum classifying error types (VALIDATION, DATABASE, NETWORK, etc.)
- `ErrorSeverity` - Enum indicating impact level (CRITICAL, HIGH, MEDIUM, LOW)
- `RetryStrategy` - Enum defining how to handle each error type
- `AppErrors` - Factory methods for common error scenarios
- `getUserSafeMessage()` - Extract user-appropriate messages without leaking sensitive data

**Benefits**:
- Consistent error handling patterns
- Automatic retry strategy selection based on error type
- Security through controlled error message exposure
- Rich context for debugging and observability

### 1.2 Retry and Circuit Breaker Patterns
**Location**: `src/lib/errors/retry.ts`

**Key Components**:
- `withRetry()` - Execute with exponential backoff
- `CircuitBreaker` - Isolate failing external services
- `withTimeout()` - Prevent hanging operations
- `withResilience()` - Combine retry + circuit breaker

**Configuration**:
```typescript
const breaker = new CircuitBreaker('supabase', {
  failureThreshold: 5,      // Open after 5 failures
  resetTimeoutMs: 60000,    // Try again after 1 minute
  successThreshold: 3,      // Close after 3 successes
});
```

### 1.3 Configuration Validation
**Location**: `src/lib/config/validation.ts`

**Purpose**: Fail fast on startup if required configuration is missing.

**Key Features**:
- Separation of required vs optional configuration
- Type-safe configuration schema
- Feature flag support for graceful degradation
- Environment validation (development, staging, production, test)

**Required Configuration**:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NODE_ENV`
- `APP_URL`

**Optional Configuration** (with graceful degradation):
- Stripe keys (payments disabled if missing)
- Resend API key (email notifications disabled)
- OAuth credentials (social auth disabled)
- Sentry/PostHog keys (monitoring disabled)

### 1.4 Database Adapter Pattern
**Location**: `src/lib/database/adapter.ts`

**Purpose**: Isolate Supabase SDK from business logic.

**Key Components**:
- `DatabaseAdapter` interface - Contract for all database operations
- `SupabaseAdapter` - Production implementation with resilience patterns
- `MockDatabaseAdapter` - In-memory implementation for testing

**Benefits**:
- Business logic doesn't depend on Supabase SDK directly
- Easy mocking for unit tests
- Future database migration without touching services
- Consistent error handling and retry logic
- Built-in circuit breaker for database isolation

## Phase 2: Service Layer Refactoring (IN PROGRESS)

### 2.1 Dependency Injection Pattern
Refactor services to accept dependencies via constructor rather than importing singletons.

**Before**:
```typescript
import { supabase } from '@/lib/supabase';

export const jobService = {
  async getJobs() {
    return await supabase.from('jobs').select();
  }
};
```

**After**:
```typescript
import { DatabaseAdapter } from '@/lib/database/adapter';

export class JobService {
  constructor(private db: DatabaseAdapter) {}
  
  async getJobs() {
    const result = await this.db.list<Job>('jobs');
    if (result.error) throw result.error;
    return result.data;
  }
}
```

### 2.2 Service Error Boundaries
Each service method should:
1. Catch infrastructure errors
2. Convert to appropriate `AppError`
3. Add contextual information
4. Let business errors propagate
5. Log with appropriate severity

## Phase 3: Observability

### 3.1 Structured Logging
Implement structured logging with:
- Correlation IDs for request tracing
- Context enrichment
- Severity-based log levels
- Sensitive data filtering

### 3.2 Health Checks
Implement health check endpoints:
- Database connectivity
- External service status
- Circuit breaker states
- Cache availability

## Phase 4: Testing Infrastructure

### 4.1 Unit Test Patterns
```typescript
describe('JobService', () => {
  let mockDb: MockDatabaseAdapter;
  let service: JobService;

  beforeEach(() => {
    mockDb = new MockDatabaseAdapter();
    service = new JobService(mockDb);
  });

  it('should fetch jobs', async () => {
    mockDb.seed('jobs', [{ id: '1', title: 'Engineer' }]);
    
    const jobs = await service.getJobs();
    
    expect(jobs).toHaveLength(1);
  });

  it('should handle database failure gracefully', async () => {
    // Simulate failure scenario
  });
});
```

### 4.2 Failure Isolation Tests
Test that failures in one module don't affect others:
```typescript
it('should continue working when notification service fails', async () => {
  mockNotificationService.send.mockRejectedValue(new Error('SMTP down'));
  
  await applicationService.submit(application);
  
  // Application should succeed even though notification failed
  expect(application.status).toBe('submitted');
});
```

## Failure Domain Analysis

### Core Domain (HIGH Criticality)
| Component | Dependencies | Failure Impact | Isolation Strategy |
|-----------|-------------|----------------|-------------------|
| Authentication | Supabase Auth | System unusable | Retry + fallback signin page |
| User Management | Database | Core feature broken | Transaction isolation |
| Job Board | Database | Primary value prop | Cached fallback, retry |
| Applications | Database, Auth | Core workflow broken | Activity log non-blocking |

### Secondary Domain (MEDIUM Criticality)
| Component | Dependencies | Failure Impact | Isolation Strategy |
|-----------|-------------|----------------|-------------------|
| Courses (LMS) | Database, Storage | Learning impaired | Continue without media |
| Challenges | Database | Practice impaired | Show catalog, disable submission |
| Candidate Profile | Database, Storage | Visibility reduced | Show available data |

### Optional Domain (LOW Criticality)
| Component | Dependencies | Failure Impact | Isolation Strategy |
|-----------|-------------|----------------|-------------------|
| Leaderboard | Database | Gamification unavailable | Return cached/seed data |
| Messages | Database, Realtime | Communication delayed | Queue messages |
| Notifications | Database, Email | Users not notified | Non-blocking, skip on failure |
| Analytics | External service | Metrics unavailable | Silent failure |

## Migration Strategy

### Step 1: Parallel Implementation
- Keep existing services working
- Create new adapter-based services alongside
- Gradually migrate consumers

### Step 2: Feature Flag Rollout
- Use feature flags to toggle new implementations
- Start with internal users
- Expand to production gradually

### Step 3: Deprecation
- Remove old service implementations
- Clean up unused imports
- Update documentation

## Testing Requirements

### Before Merge
- [ ] All existing tests pass
- [ ] New unit tests for error handling
- [ ] Failure isolation tests added
- [ ] Integration tests verify boundaries

### After Deployment
- [ ] Monitor error rates by category
- [ ] Track circuit breaker events
- [ ] Verify retry success rates
- [ ] Check latency impact

## Success Metrics

1. **Reduced Cascading Failures**: Measure incidents where one failure caused unrelated failures
2. **Improved MTTR**: Faster diagnosis with better error context
3. **Higher Availability**: Optional feature failures don't affect core functionality
4. **Better Test Coverage**: Service layer unit tests > 80%
5. **Faster Recovery**: Circuit breakers prevent prolonged outages

## Remaining Work

### High Priority
1. Refactor all services to use DatabaseAdapter
2. Add retry logic to all external API calls
3. Implement circuit breakers for third-party integrations
4. Add correlation ID tracking

### Medium Priority
1. Implement structured logging
2. Add health check endpoints
3. Create comprehensive test suite
4. Document all error scenarios

### Low Priority
1. Performance optimization of retry logic
2. Advanced circuit breaker metrics
3. Automated failure testing (Chaos Engineering)

