'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Target } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';

/**
 * OAuth Callback Handler Component
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters in the URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || `OAuth error: ${errorParam}`);
        }

        // Check for access token or code in the URL
        const accessToken = searchParams.get('access_token');
        const code = searchParams.get('code');
        
        if (!accessToken && !code) {
          // No auth data found, redirect to signin
          router.push('/auth/signin?error=No authentication data received');
          return;
        }

        // Successfully authenticated - redirect to dashboard
        // The Supabase client will automatically handle the session
        router.push('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect to signin after showing error
        setTimeout(() => {
          router.push('/auth/signin?error=' + encodeURIComponent(err instanceof Error ? err.message : 'Authentication failed'));
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <div className="mb-8">
        <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {error ? 'Authentication Failed' : 'Completing Sign In...'}
        </h1>
        <p className="text-gray-600">
          {error 
            ? `Error: ${error}. Redirecting you back...`
            : 'Please wait while we complete your authentication.'}
        </p>
      </div>

      {!error && (
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            You will be redirected to the sign in page shortly.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * OAuth Callback Handler
 * 
 * This page handles the OAuth callback from Google/GitHub after successful authentication.
 * It processes the auth token and redirects users to the appropriate dashboard.
 * 
 * Route: /auth/callback
 */
export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <LoadingSpinner size="lg" />
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
