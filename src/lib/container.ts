/**
 * Service Container for Dependency Injection
 * 
 * Provides:
 * - Centralized service registration
 * - Dependency injection for testability
 * - Lazy initialization to prevent import-time side effects
 * - Service lifecycle management
 * - Easy mocking for tests
 */

import { DatabaseAdapter, createDatabaseAdapter } from './database/adapter';
import { getConfig } from './config/validation';

/**
 * Service registry interface
 */
export interface ServiceRegistry {
  database: DatabaseAdapter;
  // Add other services as they are refactored
  // auth: AuthService;
  // job: JobService;
  // etc.
}

/**
 * Default implementations for services
 */
let _registry: Partial<ServiceRegistry> = {};
let _initialized = false;

/**
 * Initialize the service container with default implementations
 * Should be called once at application startup
 */
export function initializeServices(): ServiceRegistry {
  if (_initialized) {
    return getServices();
  }

  const config = getConfig();

  // Initialize database adapter with production settings
  _registry.database = createDatabaseAdapter({
    supabaseUrl: config.required.supabaseUrl,
    supabaseKey: config.required.supabaseAnonKey,
    timeoutMs: 30000,
    maxRetries: 3,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5,
    circuitBreakerResetMs: 60000,
  });

  _initialized = true;
  return getServices();
}

/**
 * Get all registered services
 */
export function getServices(): ServiceRegistry {
  if (!_registry.database) {
    throw new Error(
      'Services not initialized. Call initializeServices() first or use overrideServices() for testing.',
    );
  }

  return _registry as ServiceRegistry;
}

/**
 * Override services (useful for testing)
 * This allows injecting mock implementations
 */
export function overrideServices(overrides: Partial<ServiceRegistry>): void {
  _registry = { ..._registry, ...overrides };
  _initialized = true;
}

/**
 * Reset services to uninitialized state (for testing cleanup)
 */
export function resetServices(): void {
  _registry = {};
  _initialized = false;
}

/**
 * Get a specific service
 */
export function getService<K extends keyof ServiceRegistry>(service: K): ServiceRegistry[K] {
  const services = getServices();
  return services[service];
}

/**
 * Create a custom service container with specific dependencies
 * Useful for advanced scenarios or isolated service instances
 */
export function createServiceContainer(customRegistry: Partial<ServiceRegistry>): ServiceRegistry {
  return {
    database: customRegistry.database ?? (() => {
      const config = getConfig();
      return createDatabaseAdapter({
        supabaseUrl: config.required.supabaseUrl,
        supabaseKey: config.required.supabaseAnonKey,
      });
    })(),
    ...customRegistry,
  } as ServiceRegistry;
}
