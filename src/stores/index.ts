/**
 * Zustand Store for User Authentication State
 */

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { CandidateProfile } from '@/types';

interface AuthState {
  user: User | null;
  profile: CandidateProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: CandidateProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  setProfile: (profile) => set({ profile }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearAuth: () => set({ 
    user: null, 
    profile: null, 
    isAuthenticated: false, 
    isLoading: false 
  }),
}));

/**
 * Zustand Store for UI State
 */

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notificationsOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleNotifications: () => void;
  toggleSearch: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: 'system',
  notificationsOpen: false,
  searchOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  
  setTheme: (theme) => set({ theme }),
  
  toggleNotifications: () => set((state) => ({ 
    notificationsOpen: !state.notificationsOpen,
    searchOpen: false,
  })),
  
  toggleSearch: () => set((state) => ({ 
    searchOpen: !state.searchOpen,
    notificationsOpen: false,
  })),
  
  closeAll: () => set({ 
    mobileMenuOpen: false, 
    notificationsOpen: false, 
    searchOpen: false 
  }),
}));

/**
 * Zustand Store for Gamification State (XP, Level, Badges)
 */

interface GamificationState {
  xpPoints: number;
  level: number;
  badges: string[];
  recentXPGains: XPGain[];
  addXP: (amount: number, source: string) => void;
  addBadge: (badgeId: string) => void;
  resetProgress: () => void;
}

interface XPGain {
  amount: number;
  source: string;
  timestamp: Date;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  xpPoints: 0,
  level: 1,
  badges: [],
  recentXPGains: [],
  
  addXP: (amount, source) => {
    const newXp = get().xpPoints + amount;
    const newLevel = calculateLevel(newXp);
    
    set({
      xpPoints: newXp,
      level: newLevel,
      recentXPGains: [
        { amount, source, timestamp: new Date() },
        ...get().recentXPGains.slice(0, 9),
      ],
    });
  },
  
  addBadge: (badgeId) => set((state) => ({
    badges: [...state.badges, badgeId]
  })),
  
  resetProgress: () => set({
    xpPoints: 0,
    level: 1,
    badges: [],
    recentXPGains: [],
  }),
}));

function calculateLevel(xp: number): number {
  const thresholds = [
    { level: 1, xp: 0 },
    { level: 2, xp: 500 },
    { level: 3, xp: 1500 },
    { level: 4, xp: 3000 },
    { level: 5, xp: 5000 },
    { level: 6, xp: 8000 },
    { level: 7, xp: 12000 },
    { level: 8, xp: 17000 },
    { level: 9, xp: 23000 },
    { level: 10, xp: 30000 },
    { level: 11, xp: 40000 },
    { level: 12, xp: 52000 },
    { level: 13, xp: 66000 },
    { level: 14, xp: 82000 },
    { level: 15, xp: 100000 },
  ];
  
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i].xp) {
      return thresholds[i].level;
    }
  }
  return 1;
}
