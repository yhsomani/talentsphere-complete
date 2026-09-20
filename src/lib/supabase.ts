/**
 * Supabase Client Configuration
 * 
 * Provides browser and server-side Supabase clients
 * Following the spec: Browser-based SaaS with Supabase/PostgreSQL
 */

import { createClient } from '@supabase/supabase-js';
import { AppConfig } from '@/config';

// ============================================================================
// BROWSER CLIENT
// For client-side operations
// ============================================================================

let browserClientInstance: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (typeof window === 'undefined') {
    return createClient(
      AppConfig.supabase.url,
      AppConfig.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  if (!browserClientInstance) {
    browserClientInstance = createClient(
      AppConfig.supabase.url,
      AppConfig.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );
  }

  return browserClientInstance;
}

// ============================================================================
// SERVER CLIENT
// For server-side operations (Route Handlers, Server Components)
// Call this function in your server components/route handlers, not at module level
// ============================================================================

export async function createServerClient() {
  const { cookies: nextCookies } = await import('next/headers');
  const cookieStore = await nextCookies();
  
  return createClient(
    AppConfig.supabase.url,
    AppConfig.supabase.anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${cookieStore.get('sb-access-token')?.value || ''}`,
        },
      },
    }
  );
}

// ============================================================================
// ADMIN CLIENT
// For privileged operations (use with caution)
// Only for server-side usage
// ============================================================================

export function createAdminClient() {
  if (!AppConfig.supabase.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(
    AppConfig.supabase.url,
    AppConfig.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type SupabaseClient = ReturnType<typeof createBrowserClient>;
export type { User, Session, AuthResponse } from '@supabase/supabase-js';
