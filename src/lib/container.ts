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
import { logger } from './observability/index';
import { JobService } from '../services/jobs.service';
import { ApplicationService } from '../services/application.service';
import { CandidateService } from '../services/candidate.service';
import { CourseService } from '../services/course.service';
import { ChallengeService } from '../services/challenge.service';
import { MessageService } from '../services/message.service';
import { NotificationService } from '../services/notification.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { NetworkService } from '../services/network.service';

/**
 * Service registry interface
 */
export interface ServiceRegistry {
  database: DatabaseAdapter;
  jobs: JobService;
  applications: ApplicationService;
  candidates: CandidateService;
  courses: CourseService;
  challenges: ChallengeService;
  messages: MessageService;
  notifications: NotificationService;
  leaderboard: LeaderboardService;
  network: NetworkService;
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
  const db = createDatabaseAdapter({
    supabaseUrl: config.required.supabaseUrl,
    supabaseKey: config.required.supabaseAnonKey,
    timeoutMs: 30000,
    maxRetries: 3,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 5,
    circuitBreakerResetMs: 60000,
  });

  _registry.database = db;
  _registry.jobs = new JobService(db);
  _registry.applications = new ApplicationService(db);
  _registry.candidates = new CandidateService(db);
  _registry.courses = new CourseService(db);
  _registry.challenges = new ChallengeService(db);
  _registry.messages = new MessageService(db);
  _registry.notifications = new NotificationService(db);
  _registry.leaderboard = new LeaderboardService(db);
  _registry.network = new NetworkService(db);

  _initialized = true;
  logger.info('[ServiceContainer] Production services initialized', {
    serviceCount: Object.keys(_registry).length,
  });
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
  logger.debug('[ServiceContainer] Overriding services in container', {
    overriddenKeys: Object.keys(overrides),
  });
}

/**
 * Reset services to uninitialized state (for testing cleanup)
 */
export function resetServices(): void {
  _registry = {};
  _initialized = false;
  logger.debug('[ServiceContainer] Services reset to uninitialized state');
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
  const db = customRegistry.database ?? (() => {
    const config = getConfig();
    return createDatabaseAdapter({
      supabaseUrl: config.required.supabaseUrl,
      supabaseKey: config.required.supabaseAnonKey,
    });
  })();

  return {
    database: db,
    jobs: customRegistry.jobs ?? new JobService(db),
    applications: customRegistry.applications ?? new ApplicationService(db),
    candidates: customRegistry.candidates ?? new CandidateService(db),
    courses: customRegistry.courses ?? new CourseService(db),
    challenges: customRegistry.challenges ?? new ChallengeService(db),
    messages: customRegistry.messages ?? new MessageService(db),
    notifications: customRegistry.notifications ?? new NotificationService(db),
    leaderboard: customRegistry.leaderboard ?? new LeaderboardService(db),
    network: customRegistry.network ?? new NetworkService(db),
  };
}
