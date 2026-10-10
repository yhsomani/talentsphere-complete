import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiJson } from './api.js';
import { SESSION_EVENT, TOKEN_KEY, clearSession, getToken } from './session.js';

export interface SessionUser {
  id: string;
  email: string;
  roles: string[];
  status: string;
}

export interface SessionProfile {
  id: string;
  userId: string;
  fullName: string;
  headline?: string;
  bio?: string;
  location?: string;
  privacy: 'public' | 'connections_only' | 'recruiters_only' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface SessionMembership {
  orgId: string;
  role: string;
  organizationName?: string;
}

export interface Session {
  /** anonymous: no token. loading: token present, server not asked yet. */
  status: 'anonymous' | 'loading' | 'ready' | 'error';
  user: SessionUser | null;
  profile: SessionProfile | null;
  memberships: SessionMembership[];
  /** Hiring side of the product (posts jobs, reviews applicants). */
  isRecruiter: boolean;
  /** Suspended/banned: may only appeal and exercise data rights. */
  isRestricted: boolean;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const RECRUITER_ROLES = ['recruiter', 'hiring_manager', 'platform_admin'];

const SessionContext = createContext<Session | null>(null);

/**
 * The client's idea of "who is signed in" comes from the API
 * (GET /api/v1/auth/session), not from whatever localStorage last held: roles
 * and account status can change server-side at any time.
 */
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Session['status']>(() =>
    getToken() ? 'loading' : 'anonymous'
  );
  const [user, setUser] = useState<SessionUser | null>(null);
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [memberships, setMemberships] = useState<SessionMembership[]>([]);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setStatus('anonymous');
      setUser(null);
      setProfile(null);
      setMemberships([]);
      return;
    }
    setStatus((current) => (current === 'ready' ? 'ready' : 'loading'));
    try {
      const data = await apiJson<{
        user: SessionUser;
        profile: SessionProfile | null;
        memberships: SessionMembership[];
      }>('/api/v1/auth/session');
      setUser(data.user);
      setProfile(data.profile);
      setMemberships(data.memberships ?? []);
      setStatus('ready');
    } catch {
      // A 401 already cleared the token and redirected (lib/api.ts); any
      // other failure leaves the session unknown rather than guessed.
      setStatus(getToken() ? 'error' : 'anonymous');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onSessionChange = () => void refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY) void refresh();
    };
    window.addEventListener(SESSION_EVENT, onSessionChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SESSION_EVENT, onSessionChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [refresh]);

  const value = useMemo<Session>(
    () => ({
      status,
      user,
      profile,
      memberships,
      isRecruiter: Boolean(user?.roles.some((r) => RECRUITER_ROLES.includes(r))),
      isRestricted: Boolean(user && user.status !== 'active'),
      refresh,
      signOut: clearSession,
    }),
    [status, user, profile, memberships, refresh]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
