/**
 * Custom React Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores';

/**
 * Hook for managing authentication state
 */
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, isAuthenticated } = useAuthStore();
  const supabase = createBrowserClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, supabase.auth]);

  return { user, loading, isAuthenticated };
}

/**
 * Hook for sign in functionality
 */
export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/dashboard');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, supabase.auth]);

  return { signIn, loading, error };
}

/**
 * Hook for sign up functionality
 */
export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    fullName: string,
    role: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) throw error;

      router.push('/auth/verify');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router, supabase.auth]);

  return { signUp, loading, error };
}

/**
 * Hook for sign out functionality
 */
export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();
  const { clearAuth } = useAuthStore();

  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      clearAuth();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, [router, supabase.auth, clearAuth]);

  return { signOut, loading };
}

/**
 * Hook for OAuth sign in functionality
 */
export function useSignInOAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // User will be redirected to OAuth provider
      // After successful auth, they'll be redirected back to /auth/callback
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  return { signInWithOAuth, loading, error };
}

/**
 * Hook for pagination
 */
export function usePagination<T>(
  items: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);

  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Hook for search with debounce
 */
export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(items);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults(items);
        return;
      }

      const lowerQuery = query.toLowerCase().trim();
      const filtered = items.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerQuery);
          }
          return false;
        })
      );

      setResults(filtered);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, items, searchFields, debounceMs]);

  return { query, setQuery, results };
}

/**
 * Hook for fetching data with loading and error states
 */
export function useFetch<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const result = await fetcher();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Fetch failed'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key, fetcher]);

  return { data, loading, error };
}
