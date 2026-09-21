/**
 * Database Adapter Interface for Talentsphere
 * 
 * This abstraction layer:
 * - Isolates Supabase SDK from business logic
 * - Enables mocking for tests
 * - Provides consistent error handling
 * - Allows future database migration without touching services
 * 
 * Design: Supports both simple CRUD operations and complex chainable queries
 * to handle the full range of Supabase query patterns used in services.
 */

import { AppError, AppErrors } from '../errors';
import { withRetry, withTimeout, CircuitBreaker } from '../errors/retry';

/**
 * Generic query result type matching Supabase pattern
 */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Generic list result type matching Supabase pattern
 */
export interface ListResult<T> {
  data: T[];
  error: Error | null;
  count: number | null;
  status: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
}

/**
 * Filter operators for where clauses
 */
export type FilterOperator = 
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'is'
  | 'or'
  | 'and';

/**
 * Filter condition
 */
export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Order direction
 */
export type OrderDirection = 'asc' | 'desc' | 'ascending' | 'descending';

/**
 * Chainable query builder interface - mirrors Supabase's PostgrestBuilder
 * This allows complex queries with joins, filters, and relations
 * 
 * Type parameter T is the row type (e.g., Job, User, etc.)
 * Results can be single T or T[] depending on method used
 */
export interface QueryBuilder<T> {
  /**
   * Select columns or relations
   * @param columns - Column selection string (e.g., '*, jobs(*)')
   */
  select(columns?: string): QueryBuilder<T>;

  /**
   * Filter where column equals value
   */
  eq(column: string, value: unknown): QueryBuilder<T>;

  /**
   * Filter where column not equals value
   */
  neq(column: string, value: unknown): QueryBuilder<T>;

  /**
   * Filter where column greater than value
   */
  gt(column: string, value: unknown): QueryBuilder<T>;

  /**
   * Filter where column greater than or equal value
   */
  gte(column: string, value: unknown): QueryBuilder<T>;

  /**
   * Filter where column less than value
   */
  lt(column: string, value: unknown): QueryBuilder<T>;

  /**
   * Filter where column less than or equal value
   */
  lte(column: string, value: unknown): QueryBuilder<T>;

  /**
   * Filter where column matches pattern
   */
  like(column: string, pattern: string): QueryBuilder<T>;

  /**
   * Filter where column matches pattern (case-insensitive)
   */
  ilike(column: string, pattern: string): QueryBuilder<T>;

  /**
   * Filter where column in array of values
   */
  in(column: string, values: unknown[]): QueryBuilder<T>;

  /**
   * Filter where column is null or not null
   */
  is(column: string, value: boolean): QueryBuilder<T>;

  /**
   * Combine filters with OR logic
   */
  or(filters: string): QueryBuilder<T>;

  /**
   * Order results by column
   */
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilder<T>;

  /**
   * Limit number of results
   */
  limit(count: number): QueryBuilder<T>;

  /**
   * Set offset for pagination
   */
  range(from: number, to: number): QueryBuilder<T>;

  /**
   * Return single record (throws if multiple)
   * Result type is T (single item)
   */
  single(): Promise<{ data: T | null; error: Error | null }>;

  /**
   * Return single record or null if not found
   * Result type is T (single item)
   */
  maybeSingle(): Promise<{ data: T | null; error: Error | null }>;

  /**
   * Execute query and return all matching records
   * Result type is T[] (array)
   * Note: This is the terminal method that executes the query
   */
  execute(): Promise<{ data: T[] | null; error: Error | null }>;

  /**
   * Get count of matching records
   */
  count(options?: { foreignTable?: string; head?: boolean }): Promise<{ count: number | null; error: Error | null }>;

  /**
   * Thenable interface for async/await support
   * Returns array of results (T[])
   * This enables: await db.from('table').select('*').eq('id', id)
   */
  then<TResult1 = { data: T[] | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: (value: { data: T[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2>;
}

/**
 * Table operation interface - entry point for table-based queries
 */
export interface TableOperations<T = unknown> {
  /**
   * Start a select query
   */
  select(columns?: string): QueryBuilder<T[]>;

  /**
   * Insert a new record
   */
  insert(data: Record<string, unknown>): QueryBuilder<T>;

  /**
   * Update matching records
   */
  update(data: Record<string, unknown>): QueryBuilder<T>;

  /**
   * Delete matching records
   */
  delete(): QueryBuilder<null>;
}

/**
 * Auth operations interface
 */
export interface AuthOperations {
  /**
   * Get current user session
   */
  getUser(): Promise<{ data: { user: { id: string; email: string; [key: string]: unknown } | null } | null; error: Error | null }>;

  /**
   * Sign in with email/password
   */
  signIn(email: string, password: string): Promise<{ data: { user: unknown } | null; error: Error | null }>;

  /**
   * Sign up with email/password
   */
  signUp(email: string, password: string): Promise<{ data: { user: unknown } | null; error: Error | null }>;

  /**
   * Sign out current user
   */
  signOut(): Promise<{ error: Error | null }>;
}

/**
 * Storage operations interface
 */
export interface StorageOperations {
  /**
   * Upload a file
   */
  upload(bucket: string, path: string, file: File | Blob): Promise<{ data: { path: string } | null; error: Error | null }>;

  /**
   * Download a file
   */
  download(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }>;

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): { data: { publicUrl: string }; error: Error | null };

  /**
   * Delete a file
   */
  remove(bucket: string, paths: string[]): Promise<{ data: unknown | null; error: Error | null }>;
}

/**
 * Database adapter interface - defines contract for all database operations
 * 
 * Usage pattern:
 *   const result = await db.from('users').select('*').eq('id', userId).single();
 */
export interface DatabaseAdapter {
  /**
   * Get table operations for a specific table
   * @param table - Table name
   */
  from<T = unknown>(table: string): TableOperations<T>;

  /**
   * Execute within a transaction
   */
  transaction<T>(fn: () => Promise<T>): Promise<T>;

  /**
   * Check if adapter is healthy/connected
   */
  healthCheck(): Promise<boolean>;

  /**
   * Auth operations namespace
   */
  auth: AuthOperations;

  /**
   * Storage operations namespace
   */
  storage: StorageOperations;

  // Legacy methods for backward compatibility during migration
  // These will be deprecated once all services migrate to chainable API
  
  /**
   * Get single record by ID (legacy - use from().select().eq().single() instead)
   * @deprecated Use chainable query builder
   */
  getById<T>(table: string, id: string): Promise<QueryResult<T>>;

  /**
   * List records with optional filters (legacy - use from().select() instead)
   * @deprecated Use chainable query builder
   */
  list<T>(
    table: string,
    options?: {
      filters?: Record<string, unknown>;
      pagination?: PaginationParams;
    },
  ): Promise<ListResult<T>>;

  /**
   * Insert record (legacy - use from().insert() instead)
   * @deprecated Use chainable query builder
   */
  insert<T>(table: string, data: Record<string, unknown>): Promise<QueryResult<T>>;

  /**
   * Update record (legacy - use from().update() instead)
   * @deprecated Use chainable query builder
   */
  update<T>(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<QueryResult<T>>;

  /**
   * Delete record (legacy - use from().delete() instead)
   * @deprecated Use chainable query builder
   */
  delete<T>(table: string, id: string): Promise<QueryResult<T>>;

  /**
   * Execute raw query (legacy - not fully supported)
   * @deprecated Use Supabase RPC functions instead
   */
  query<T>(sql: string, params?: unknown[]): Promise<ListResult<T>>;
}

/**
 * Options for Supabase adapter
 */
export interface SupabaseAdapterOptions {
  supabaseUrl: string;
  supabaseKey: string;
  timeoutMs?: number;
  maxRetries?: number;
  enableCircuitBreaker?: boolean;
  circuitBreakerThreshold?: number;
  circuitBreakerResetMs?: number;
}

/**
 * Internal query builder state
 */
interface QueryState {
  table: string;
  selectColumns?: string;
  filters: Array<{ column: string; operator: string; value: unknown }>;
  orderBy?: { column: string; ascending: boolean; nullsFirst?: boolean };
  limitCount?: number;
  rangeFrom?: number;
  rangeTo?: number;
  operation: 'select' | 'insert' | 'update' | 'delete';
  insertData?: Record<string, unknown>;
  updateData?: Record<string, unknown>;
}

/**
 * QueryBuilder implementation - wraps Supabase queries with chainable API
 */
class SupabaseQueryBuilder<T> implements QueryBuilder<T> {
  private _state: QueryState;
  private _supabase: any;

  constructor(supabase: any, state: QueryState) {
    this._supabase = supabase;
    this._state = state;
  }

  select(columns?: string): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      selectColumns: columns || '*',
    });
  }

  eq(column: string, value: unknown): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'eq', value }],
    });
  }

  neq(column: string, value: unknown): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'neq', value }],
    });
  }

  gt(column: string, value: unknown): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'gt', value }],
    });
  }

  gte(column: string, value: unknown): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'gte', value }],
    });
  }

  lt(column: string, value: unknown): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'lt', value }],
    });
  }

  lte(column: string, value: unknown): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'lte', value }],
    });
  }

  like(column: string, pattern: string): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'like', value: pattern }],
    });
  }

  ilike(column: string, pattern: string): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'ilike', value: pattern }],
    });
  }

  in(column: string, values: unknown[]): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'in', value: values }],
    });
  }

  is(column: string, value: boolean): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column, operator: 'is', value }],
    });
  }

  or(filters: string): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      filters: [...this._state.filters, { column: '_or', operator: 'or', value: filters }],
    });
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      orderBy: { column, ascending: options?.ascending ?? true, nullsFirst: options?.nullsFirst },
    });
  }

  limit(count: number): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      limitCount: count,
    });
  }

  range(from: number, to: number): QueryBuilder<T> {
    return new SupabaseQueryBuilder(this._supabase, {
      ...this._state,
      rangeFrom: from,
      rangeTo: to,
    });
  }

  async single(): Promise<{ data: T | null; error: Error | null }> {
    const client = this._supabase.from(this._state.table);
    let query: any;

    if (this._state.operation === 'select') {
      query = client.select(this._state.selectColumns || '*');
    } else if (this._state.operation === 'insert') {
      query = client.insert(this._state.insertData!).select();
    } else if (this._state.operation === 'update') {
      query = client.update(this._state.updateData!).select();
    } else if (this._state.operation === 'delete') {
      query = client.delete().select();
    }

    // Apply filters
    this._state.filters.forEach(filter => {
      if (filter.operator === 'or') {
        query = query.or(filter.value as string);
      } else if (filter.operator === 'in') {
        query = query.in(filter.column, filter.value as unknown[]);
      } else if (filter.operator === 'is') {
        query = query.is(filter.column, filter.value as boolean);
      } else {
        query = query[filter.operator](filter.column, filter.value);
      }
    });

    // Apply ordering
    if (this._state.orderBy) {
      query = query.order(this._state.orderBy.column, {
        ascending: this._state.orderBy.ascending,
        nullsFirst: this._state.orderBy.nullsFirst,
      });
    }

    // Apply limit
    if (this._state.limitCount) {
      query = query.limit(this._state.limitCount);
    }

    // Apply range
    if (this._state.rangeFrom !== undefined && this._state.rangeTo !== undefined) {
      query = query.range(this._state.rangeFrom, this._state.rangeTo);
    }

    const response = await query.single();
    return { data: response.data, error: response.error };
  }

  async maybeSingle(): Promise<{ data: T | null; error: Error | null }> {
    try {
      const result = await this.single();
      // Supabase returns PGRST116 error when no rows found - treat as null
      if ((result.error as any)?.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return result;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async execute(): Promise<{ data: T[] | null; error: Error | null }> {
    const client = this._supabase.from(this._state.table);
    let query: any;

    if (this._state.operation === 'select') {
      query = client.select(this._state.selectColumns || '*');
    } else if (this._state.operation === 'insert') {
      query = client.insert(this._state.insertData!).select();
    } else if (this._state.operation === 'update') {
      query = client.update(this._state.updateData!).select();
    } else if (this._state.operation === 'delete') {
      query = client.delete().select();
    }

    // Apply filters
    this._state.filters.forEach(filter => {
      if (filter.operator === 'or') {
        query = query.or(filter.value as string);
      } else if (filter.operator === 'in') {
        query = query.in(filter.column, filter.value as unknown[]);
      } else if (filter.operator === 'is') {
        query = query.is(filter.column, filter.value as boolean);
      } else {
        query = query[filter.operator](filter.column, filter.value);
      }
    });

    // Apply ordering
    if (this._state.orderBy) {
      query = query.order(this._state.orderBy.column, {
        ascending: this._state.orderBy.ascending,
        nullsFirst: this._state.orderBy.nullsFirst,
      });
    }

    // Apply limit
    if (this._state.limitCount) {
      query = query.limit(this._state.limitCount);
    }

    // Apply range
    if (this._state.rangeFrom !== undefined && this._state.rangeTo !== undefined) {
      query = query.range(this._state.rangeFrom, this._state.rangeTo);
    }

    const response = await query;
    return { data: response.data, error: response.error };
  }

  async count(options?: { foreignTable?: string; head?: boolean }): Promise<{ count: number | null; error: Error | null }> {
    const client = this._supabase.from(this._state.table);
    let query = client.select('*', { count: 'exact', head: options?.head ?? false });

    // Apply filters
    this._state.filters.forEach(filter => {
      if (filter.operator === 'or') {
        query = query.or(filter.value as string);
      } else if (filter.operator === 'in') {
        query = query.in(filter.column, filter.value as unknown[]);
      } else if (filter.operator === 'is') {
        query = query.is(filter.column, filter.value as boolean);
      } else {
        query = query[filter.operator](filter.column, filter.value);
      }
    });

    const response = await query;
    return { count: response.count, error: response.error };
  }

  /**
   * Thenable interface for async/await support
   * Allows: await db.from('table').select('*').eq('id', id)
   */
  then<TResult1 = { data: T[] | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: (value: { data: T[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

/**
 * TableOperations implementation for Supabase
 */
class SupabaseTableOperations<T> implements TableOperations<T> {
  private _supabase: any;
  private _tableName: string;

  constructor(supabase: any, tableName: string) {
    this._supabase = supabase;
    this._tableName = tableName;
  }

  select(columns?: string): QueryBuilder<T[]> {
    const state: QueryState = {
      table: this._tableName,
      selectColumns: columns,
      filters: [],
      operation: 'select',
    };
    return new SupabaseQueryBuilder<T[]>(this._supabase, state);
  }

  insert(data: Record<string, unknown>): QueryBuilder<T> {
    const state: QueryState = {
      table: this._tableName,
      filters: [],
      operation: 'insert',
      insertData: data,
    };
    return new SupabaseQueryBuilder<T>(this._supabase, state);
  }

  update(data: Record<string, unknown>): QueryBuilder<T> {
    const state: QueryState = {
      table: this._tableName,
      filters: [],
      operation: 'update',
      updateData: data,
    };
    return new SupabaseQueryBuilder<T>(this._supabase, state);
  }

  delete(): QueryBuilder<null> {
    const state: QueryState = {
      table: this._tableName,
      filters: [],
      operation: 'delete',
    };
    return new SupabaseQueryBuilder<null>(this._supabase, state);
  }
}

/**
 * Auth operations implementation for Supabase
 */
class SupabaseAuthOperations implements AuthOperations {
  private _supabase: any;

  constructor(supabase: any) {
    this._supabase = supabase;
  }

  async getUser(): Promise<{ data: { user: { id: string; email: string; [key: string]: unknown } | null } | null; error: Error | null }> {
    try {
      const response = await this._supabase.auth.getUser();
      return response;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async signIn(email: string, password: string): Promise<{ data: { user: unknown } | null; error: Error | null }> {
    try {
      const response = await this._supabase.auth.signInWithPassword({ email, password });
      return response;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async signUp(email: string, password: string): Promise<{ data: { user: unknown } | null; error: Error | null }> {
    try {
      const response = await this._supabase.auth.signUp({ email, password });
      return response;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const response = await this._supabase.auth.signOut();
      return { error: response.error };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

/**
 * Storage operations implementation for Supabase
 */
class SupabaseStorageOperations implements StorageOperations {
  private _supabase: any;

  constructor(supabase: any) {
    this._supabase = supabase;
  }

  async upload(bucket: string, path: string, file: File | Blob): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      const response = await this._supabase.storage.from(bucket).upload(path, file);
      return response;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async download(bucket: string, path: string): Promise<{ data: Blob | null; error: Error | null }> {
    try {
      const response = await this._supabase.storage.from(bucket).download(path);
      return response;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  getPublicUrl(bucket: string, path: string): { data: { publicUrl: string }; error: Error | null } {
    try {
      const response = this._supabase.storage.from(bucket).getPublicUrl(path);
      return response;
    } catch (error) {
      return { data: { publicUrl: '' }, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async remove(bucket: string, paths: string[]): Promise<{ data: unknown | null; error: Error | null }> {
    try {
      const response = await this._supabase.storage.from(bucket).remove(paths);
      return response;
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

/**
 * Supabase implementation of DatabaseAdapter
 * 
 * Features:
 * - Retry logic with exponential backoff
 * - Timeout protection
 * - Circuit breaker for external service isolation
 * - Consistent error handling
 * - Type-safe operations
 * - Chainable query builder matching Supabase API
 */
export class SupabaseAdapter implements DatabaseAdapter {
  private supabase: any; // SupabaseClient - lazy loaded
  private circuitBreaker?: CircuitBreaker;
  private timeoutMs: number;
  private maxRetries: number;
  private readonly _options: SupabaseAdapterOptions;
  public auth: AuthOperations;
  public storage: StorageOperations;

  constructor(options: SupabaseAdapterOptions) {
    this._options = options;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;

    // Initialize circuit breaker if enabled
    if (options.enableCircuitBreaker !== false) {
      this.circuitBreaker = new CircuitBreaker('supabase', {
        failureThreshold: options.circuitBreakerThreshold ?? 5,
        resetTimeoutMs: options.circuitBreakerResetMs ?? 60000,
        onOpen: () => {
          console.warn('[SupabaseAdapter] Circuit breaker opened - Supabase may be unavailable');
        },
        onClose: () => {
          console.info('[SupabaseAdapter] Circuit breaker closed - Supabase recovered');
        },
      });
    }

    // Lazy load Supabase client to avoid import-time side effects
    this.supabase = null;
    
    // Initialize auth and storage operations (will be created when supabase is initialized)
    this.auth = null as any;
    this.storage = null as any;
  }

  /**
   * Get or create Supabase client (lazy initialization)
   */
  private async getSupabase(): Promise<ReturnType<typeof import('@supabase/supabase-js').createClient>> {
    if (!this.supabase) {
      try {
        // Dynamic import to avoid circular dependencies and enable lazy loading
        const { createClient } = await import('@supabase/supabase-js');
        this.supabase = createClient(this._options.supabaseUrl, this._options.supabaseKey);
        
        // Initialize auth and storage operations now that we have the client
        this.auth = new SupabaseAuthOperations(this.supabase);
        this.storage = new SupabaseStorageOperations(this.supabase);
      } catch (error) {
        const cause = error instanceof Error ? { cause: error } : {};
        throw AppErrors.configuration(
          'Failed to initialize Supabase client. Is @supabase/supabase-js installed?',
          { url: this._options.supabaseUrl, ...cause },
        );
      }
    }
    return this.supabase;
  }

  /**
   * Get table operations for chainable queries
   */
  from<T = unknown>(table: string): TableOperations<T> {
    // We need to get the client synchronously here
    // If not initialized, create it synchronously (will throw if config is invalid)
    if (!this.supabase) {
      try {
        // Dynamic import to avoid circular dependencies and enable lazy loading
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createClient } = require('@supabase/supabase-js');
        this.supabase = createClient(this._options.supabaseUrl, this._options.supabaseKey);
        
        // Initialize auth and storage operations now that we have the client
        this.auth = new SupabaseAuthOperations(this.supabase);
        this.storage = new SupabaseStorageOperations(this.supabase);
      } catch (error) {
        const cause = error instanceof Error ? { cause: error } : {};
        throw AppErrors.configuration(
          'Failed to initialize Supabase client. Is @supabase/supabase-js installed?',
          { url: this._options.supabaseUrl, ...cause },
        );
      }
    }
    return new SupabaseTableOperations<T>(this.supabase, table);
  }

  /**
   * Execute operation with resilience patterns
   */
  private async executeWithResilience<T>(operation: () => Promise<T>): Promise<T> {
    const op = async () => {
      return withTimeout(
        operation,
        this.timeoutMs,
        'database_operation',
      );
    };

    if (this.circuitBreaker) {
      return this.circuitBreaker.execute(() => 
        withRetry(op, { maxAttempts: this.maxRetries })
      );
    }

    return withRetry(op, { maxAttempts: this.maxRetries });
  }

  /**
   * Convert Supabase response to standard QueryResult
   */
  private toQueryResult<T>(response: any): QueryResult<T> {
    const { data, error, status } = response;

    if (error) {
      return {
        data: null,
        error: this.toAppError(error),
        status: status || 500,
      };
    }

    return {
      data: data as T,
      error: null,
      status: status || 200,
    };
  }

  /**
   * Convert Supabase response to standard ListResult
   */
  private toListResult<T>(response: any): ListResult<T> {
    const { data, error, count, status } = response;

    if (error) {
      return {
        data: [],
        error: this.toAppError(error),
        count: null,
        status: status || 500,
      };
    }

    return {
      data: (data as T[]) || [],
      error: null,
      count: count ?? null,
      status: status || 200,
    };
  }

  /**
   * Convert Supabase error to AppError
   */
  private toAppError(error: any): AppError {
    // Handle Supabase-specific errors
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('timeout') || message.includes('time out')) {
        return AppErrors.timeout('database_query', { originalError: error.message });
      }
      
      if (message.includes('network') || message.includes('fetch')) {
        return AppErrors.network('Database connection failed', {}, error);
      }
      
      if (message.includes('not found') || message.includes('404')) {
        return AppErrors.notFound('resource', undefined, { originalError: error.message });
      }
      
      if (message.includes('duplicate') || message.includes('unique') || message.includes('conflict')) {
        return AppErrors.conflict('Resource already exists', { originalError: error.message });
      }
      
      if (message.includes('foreign key') || message.includes('violates')) {
        return AppErrors.dataIntegrity('Database constraint violation', {}, error);
      }
    }

    return AppErrors.database(
      'Database operation failed',
      { originalError: error?.message || String(error) },
      error instanceof Error ? error : undefined,
    );
  }

  async getById<T>(table: string, id: string): Promise<QueryResult<T>> {
    return this.executeWithResilience(async () => {
      const client = await this.getSupabase();
      const response = await client
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      return this.toQueryResult<T>(response);
    });
  }

  async list<T>(
    table: string,
    options?: {
      filters?: Record<string, unknown>;
      pagination?: PaginationParams;
    },
  ): Promise<ListResult<T>> {
    return this.executeWithResilience(async () => {
      const client = await this.getSupabase();
      let query = client.from(table).select('*', { count: 'exact' });

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value as string);
          }
        });
      }

      // Apply pagination
      if (options?.pagination) {
        const { page = 1, pageSize = 20, orderBy, ascending = true } = options.pagination;
        
        if (orderBy) {
          query = query.order(orderBy, { ascending });
        }

        const offset = (page - 1) * pageSize;
        query = query.range(offset, offset + pageSize - 1);
      }

      const response = await query;
      return this.toListResult<T>(response);
    });
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<QueryResult<T>> {
    return this.executeWithResilience(async () => {
      const client = await this.getSupabase();
      const response = await client.from(table).insert(data as any).select().single();
      return this.toQueryResult<T>(response);
    });
  }

  async update<T>(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<QueryResult<T>> {
    return this.executeWithResilience(async () => {
      const client = await this.getSupabase();
      const response = await (client as any)
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      return this.toQueryResult<T>(response);
    });
  }

  async delete<T>(table: string, id: string): Promise<QueryResult<T>> {
    return this.executeWithResilience(async () => {
      const client = await this.getSupabase();
      const response = await client
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .single();
      return this.toQueryResult<T>(response);
    });
  }

  async query<T>(sql: string, params?: unknown[]): Promise<ListResult<T>> {
    // Note: Supabase doesn't support raw SQL directly
    // This would need to be implemented via RPC functions or a different approach
    return {
      data: [],
      error: AppErrors.unknown('Raw SQL queries not supported. Use Supabase RPC functions instead.'),
      count: null,
      status: 501,
    };
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    // Note: Supabase has limited transaction support
    // For now, we just execute the function
    // Consider using Supabase RPC for complex transactions
    return fn();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getSupabase();
      // Try a simple query to check connectivity
      const response = await client.from('users').select('id', { count: 'exact', head: true });
      return !response.error;
    } catch {
      return false;
    }
  }

  /**
   * Get circuit breaker state (for observability)
   */
  getCircuitBreakerState() {
    return this.circuitBreaker?.getState();
  }

  /**
   * Reset circuit breaker (for recovery testing)
   */
  resetCircuitBreaker() {
    this.circuitBreaker?.reset();
  }
}

/**
 * Factory function to create database adapter instance
 */
export function createDatabaseAdapter(options: SupabaseAdapterOptions): DatabaseAdapter {
  return new SupabaseAdapter(options);
}

/**
 * Mock adapter for testing
 */
export class MockDatabaseAdapter implements DatabaseAdapter {
  private store: Map<string, Map<string, any>> = new Map();
  public auth: AuthOperations;
  public storage: StorageOperations;

  constructor() {
    // Mock auth and storage operations
    this.auth = {
      async getUser() { return { data: null, error: null }; },
      async signIn() { return { data: null, error: null }; },
      async signUp() { return { data: null, error: null }; },
      async signOut() { return { error: null }; },
    };
    this.storage = {
      async upload() { return { data: null, error: null }; },
      async download() { return { data: null, error: null }; },
      getPublicUrl() { return { data: { publicUrl: '' }, error: null }; },
      async remove() { return { data: null, error: null }; },
    };
  }

  from<T = unknown>(table: string): TableOperations<T> {
    return new MockTableOperations<T>(this.store, table);
  }

  async getById<T>(table: string, id: string): Promise<QueryResult<T>> {
    const tableData = this.store.get(table);
    const data = tableData?.get(id) || null;
    return { data, error: null, status: data ? 200 : 404 };
  }

  async list<T>(
    table: string,
    options?: { filters?: Record<string, unknown>; pagination?: PaginationParams },
  ): Promise<ListResult<T>> {
    const tableData = this.store.get(table) || new Map();
    let data = Array.from(tableData.values());

    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        data = data.filter(item => item[key] === value);
      });
    }

    // Apply pagination
    if (options?.pagination) {
      const { page = 1, pageSize = 20 } = options.pagination;
      const start = (page - 1) * pageSize;
      data = data.slice(start, start + pageSize);
    }

    return { data, error: null, count: data.length, status: 200 };
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<QueryResult<T>> {
    const id = (data.id as string) || crypto.randomUUID();
    const record = { ...data, id };
    
    if (!this.store.has(table)) {
      this.store.set(table, new Map());
    }
    this.store.get(table)!.set(id, record);

    return { data: record as T, error: null, status: 201 };
  }

  async update<T>(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<QueryResult<T>> {
    const tableData = this.store.get(table);
    const existing = tableData?.get(id);
    
    if (!existing) {
      return { data: null, error: new Error('Not found'), status: 404 };
    }

    const updated = { ...existing, ...data, id };
    tableData!.set(id, updated);

    return { data: updated as T, error: null, status: 200 };
  }

  async delete<T>(table: string, id: string): Promise<QueryResult<T>> {
    const tableData = this.store.get(table);
    const deleted = tableData?.get(id);
    
    if (!deleted) {
      return { data: null, error: new Error('Not found'), status: 404 };
    }

    tableData!.delete(id);
    return { data: deleted as T, error: null, status: 200 };
  }

  async query<T>(sql: string, params?: unknown[]): Promise<ListResult<T>> {
    return { data: [], error: new Error('Not implemented in mock'), count: null, status: 501 };
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Seed test data
   */
  seed(table: string, records: Array<{ id?: string } & Record<string, unknown>>) {
    if (!this.store.has(table)) {
      this.store.set(table, new Map());
    }
    const tableData = this.store.get(table)!;
    
    records.forEach(record => {
      const id = record.id || crypto.randomUUID();
      tableData.set(id, { ...record, id });
    });
  }

  /**
   * Clear all data (for test cleanup)
   */
  clear() {
    this.store.clear();
  }
}

/**
 * Mock table operations for chainable queries
 */
class MockTableOperations<T> implements TableOperations<T> {
  private _store: Map<string, Map<string, any>>;
  private _tableName: string;

  constructor(store: Map<string, Map<string, any>>, tableName: string) {
    this._store = store;
    this._tableName = tableName;
  }

  select(columns?: string): QueryBuilder<T[]> {
    return new MockQueryBuilder<T[]>(this._store, this._tableName, 'select', columns) as unknown as QueryBuilder<T[]>;
  }

  insert(data: Record<string, unknown>): QueryBuilder<T> {
    return new MockQueryBuilder<T>(this._store, this._tableName, 'insert', undefined, data) as unknown as QueryBuilder<T>;
  }

  update(data: Record<string, unknown>): QueryBuilder<T> {
    return new MockQueryBuilder<T>(this._store, this._tableName, 'update', undefined, undefined, data) as unknown as QueryBuilder<T>;
  }

  delete(): QueryBuilder<null> {
    return new MockQueryBuilder<null>(this._store, this._tableName, 'delete') as unknown as QueryBuilder<null>;
  }
}

/**
 * Mock query builder for testing chainable queries
 */
class MockQueryBuilder<T> implements QueryBuilder<T> {
  private _store: Map<string, Map<string, any>>;
  private _tableName: string;
  private _operation: string;
  private _columns?: string;
  private _insertData?: Record<string, unknown>;
  private _updateData?: Record<string, unknown>;
  private _filters: Array<{ column: string; operator: string; value: unknown }> = [];
  private _orderBy?: { column: string; ascending: boolean };
  private _limitCount?: number;

  constructor(
    store: Map<string, Map<string, any>>,
    tableName: string,
    operation: string,
    columns?: string,
    insertData?: Record<string, unknown>,
    updateData?: Record<string, unknown>,
  ) {
    this._store = store;
    this._tableName = tableName;
    this._operation = operation;
    this._columns = columns;
    this._insertData = insertData;
    this._updateData = updateData;
  }

  select(columns?: string): QueryBuilder<T> {
    return new MockQueryBuilder<T>(this._store, this._tableName, this._operation, this._columns, this._insertData, this._updateData);
  }

  eq(column: string, value: unknown): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'eq', value });
    return clone;
  }

  neq(column: string, value: unknown): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'neq', value });
    return clone;
  }

  gt(column: string, value: unknown): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'gt', value });
    return clone;
  }

  gte(column: string, value: unknown): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'gte', value });
    return clone;
  }

  lt(column: string, value: unknown): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'lt', value });
    return clone;
  }

  lte(column: string, value: unknown): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'lte', value });
    return clone;
  }

  like(column: string, pattern: string): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'like', value: pattern });
    return clone;
  }

  ilike(column: string, pattern: string): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'ilike', value: pattern });
    return clone;
  }

  in(column: string, values: unknown[]): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'in', value: values });
    return clone;
  }

  is(column: string, value: boolean): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column, operator: 'is', value });
    return clone;
  }

  or(filters: string): QueryBuilder<T> {
    const clone = this._clone();
    clone._filters.push({ column: '_or', operator: 'or', value: filters });
    return clone;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T> {
    const clone = this._clone();
    clone._orderBy = { column, ascending: options?.ascending ?? true };
    return clone;
  }

  limit(count: number): QueryBuilder<T> {
    const clone = this._clone();
    clone._limitCount = count;
    return clone;
  }

  range(from: number, to: number): QueryBuilder<T> {
    const clone = this._clone();
    // Simplified - just apply as limit
    clone._limitCount = to - from + 1;
    return clone;
  }

  private _clone(): MockQueryBuilder<T> {
    const cloned = new MockQueryBuilder<T>(
      this._store,
      this._tableName,
      this._operation,
      this._columns,
      this._insertData,
      this._updateData
    );
    cloned._filters = [...this._filters];
    cloned._orderBy = this._orderBy;
    cloned._limitCount = this._limitCount;
    return cloned;
  }

  private async _executeQuery(): Promise<{ data: T[] | null; error: Error | null }> {
    const tableData = this._store.get(this._tableName) || new Map();
    let data = Array.from(tableData.values()) as T[];

    // Apply filters
    data = data.filter(item => {
      return this._filters.every(filter => {
        const itemValue = (item as Record<string, unknown>)[filter.column];
        switch (filter.operator) {
          case 'eq': return itemValue === filter.value;
          case 'neq': return itemValue !== filter.value;
          case 'gt': return (itemValue as number) > (filter.value as number);
          case 'gte': return (itemValue as number) >= (filter.value as number);
          case 'lt': return (itemValue as number) < (filter.value as number);
          case 'lte': return (itemValue as number) <= (filter.value as number);
          case 'like': return String(itemValue).includes(String(filter.value));
          case 'ilike': return String(itemValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in': return (filter.value as unknown[]).includes(itemValue);
          case 'is': return (filter.value === true && itemValue === null) || (filter.value === false && itemValue !== null);
          default: return true;
        }
      });
    });

    // Apply ordering
    if (this._orderBy) {
      data.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[this._orderBy!.column] as unknown as number | string;
        const bVal = (b as Record<string, unknown>)[this._orderBy!.column] as unknown as number | string;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this._orderBy!.ascending ? cmp : -cmp;
      });
    }

    // Apply limit
    if (this._limitCount) {
      data = data.slice(0, this._limitCount);
    }

    // Handle different operations
    if (this._operation === 'insert' && this._insertData) {
      const id = ((this._insertData as Record<string, unknown>).id as string) || crypto.randomUUID();
      const record = { ...(this._insertData as Record<string, unknown>), id } as unknown as T;
      if (!this._store.has(this._tableName)) {
        this._store.set(this._tableName, new Map());
      }
      this._store.get(this._tableName)!.set(id, record as Record<string, unknown>);
      return { data: [record], error: null };
    }

    if (this._operation === 'update' && this._updateData) {
      // Update all matching records
      const updated = data.map(item => {
        const id = (item as Record<string, unknown>).id as string;
        const updatedRecord = { ...(item as Record<string, unknown>), ...this._updateData } as unknown as T;
        tableData.set(id, updatedRecord as Record<string, unknown>);
        return updatedRecord;
      });
      return { data: updated, error: null };
    }

    if (this._operation === 'delete') {
      data.forEach(item => {
        const id = (item as Record<string, unknown>).id as string;
        tableData.delete(id);
      });
      return { data: [], error: null };
    }

    return { data: data as unknown as T[], error: null };
  }

  async then<TResult1 = { data: T[] | null; error: Error | null }, TResult2 = never>(
    onfulfilled?: (value: { data: T[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2> {
    return this._executeQuery().then(onfulfilled, onrejected);
  }

  async single(): Promise<{ data: T | null; error: Error | null }> {
    const result = await this._executeQuery();
    if (result.error) {
      return { data: null, error: result.error };
    }
    const dataArray = result.data as unknown as T[];
    return { data: dataArray && dataArray.length > 0 ? dataArray[0] : null, error: null };
  }

  async maybeSingle(): Promise<{ data: T | null; error: Error | null }> {
    return this.single();
  }

  async execute(): Promise<{ data: T[] | null; error: Error | null }> {
    return this._executeQuery();
  }

  async count(): Promise<{ count: number | null; error: Error | null }> {
    const result = await this._executeQuery();
    if (result.error) {
      return { count: null, error: result.error };
    }
    const dataArray = result.data as unknown as any[];
    return { count: Array.isArray(dataArray) ? dataArray.length : (dataArray ? 1 : 0), error: null };
  }
}
