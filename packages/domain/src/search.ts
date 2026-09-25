/**
 * TalentSphere Multi-Entity Backend Search & Command Palette (⌘K) Domain
 * Features: F-20, F-34, F-32
 */

import crypto from 'node:crypto';

export type SearchEntityType =
  | 'all'
  | 'jobs'
  | 'skills'
  | 'courses'
  | 'challenges'
  | 'profiles'
  | 'commands';

export interface SearchResultItem {
  id: string;
  type: 'job' | 'skill' | 'course' | 'challenge' | 'profile' | 'command';
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface CommandItem {
  id: string;
  title: string;
  shortcut?: string;
  section: 'navigation' | 'actions' | 'account' | 'admin';
  actionUrl: string;
  requiredRole?: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  entityType: SearchEntityType;
  resultCount: number;
  createdAt: string;
}

export const BASE_COMMANDS: CommandItem[] = [
  // Navigation
  {
    id: 'nav_jobs',
    title: 'Browse Jobs & Opportunities',
    shortcut: 'G J',
    section: 'navigation',
    actionUrl: '/jobs',
  },
  {
    id: 'nav_courses',
    title: 'Explore Courses & Certifications',
    shortcut: 'G C',
    section: 'navigation',
    actionUrl: '/courses',
  },
  {
    id: 'nav_arena',
    title: 'Competitive Coding Arena',
    shortcut: 'G A',
    section: 'navigation',
    actionUrl: '/arena',
  },
  {
    id: 'nav_skills',
    title: 'Skills Taxonomy & Graph',
    shortcut: 'G S',
    section: 'navigation',
    actionUrl: '/skills',
  },
  {
    id: 'nav_profile',
    title: 'My Profile & Evidence Showcase',
    shortcut: 'G P',
    section: 'navigation',
    actionUrl: '/profile',
  },
  {
    id: 'nav_resumes',
    title: 'Resume Builder & Exports',
    shortcut: 'G R',
    section: 'navigation',
    actionUrl: '/resumes',
  },
  {
    id: 'nav_portfolio',
    title: 'Portfolio Projects & Proofs',
    shortcut: 'G O',
    section: 'navigation',
    actionUrl: '/portfolio',
  },
  // Actions
  {
    id: 'act_post_job',
    title: 'Post a New Job Opportunity',
    section: 'actions',
    actionUrl: '/jobs/new',
    requiredRole: 'recruiter',
  },
  {
    id: 'act_create_course',
    title: 'Author a New Course Module',
    section: 'actions',
    actionUrl: '/courses/new',
    requiredRole: 'course_author',
  },
  {
    id: 'act_verify_proof',
    title: 'Verify Cryptographic Credential Proof',
    shortcut: 'G V',
    section: 'actions',
    actionUrl: '/verify',
  },
  // Account
  {
    id: 'acc_settings',
    title: 'Account Settings & Privacy Preferences',
    shortcut: 'G ,',
    section: 'account',
    actionUrl: '/settings',
  },
  {
    id: 'acc_billing',
    title: 'Manage Subscriptions & Billing',
    shortcut: 'G B',
    section: 'account',
    actionUrl: '/billing',
  },
  // Administration (Restricted)
  {
    id: 'adm_console',
    title: 'Platform Administration Console',
    section: 'admin',
    actionUrl: '/admin',
    requiredRole: 'platform_admin',
  },
  {
    id: 'adm_feature_flags',
    title: 'Feature Flag Management Console',
    section: 'admin',
    actionUrl: '/admin/feature-flags',
    requiredRole: 'platform_admin',
  },
  {
    id: 'adm_health',
    title: 'System Health & Runtime Diagnostics',
    section: 'admin',
    actionUrl: '/admin/diagnostics',
    requiredRole: 'platform_admin',
  },
];

/**
 * Calculates a relevance score for a search term match against a query.
 * Exact match: 100
 * Prefix match: 85
 * Word match: 70
 * Substring match: 50
 * No match: 0
 */
export function scoreSearchMatch(target: string, query: string): number {
  if (!target || !query) return 0;
  const t = target.trim().toLowerCase();
  const q = query.trim().toLowerCase();
  if (q.length === 0) return 0;

  if (t === q) return 100;
  if (t.startsWith(q)) return 85;

  const words = t.split(/\s+/);
  if (words.some((w) => w === q)) return 75;
  if (words.some((w) => w.startsWith(q))) return 70;

  if (t.includes(q)) return 50;

  return 0;
}

/**
 * Ranks search results by relevance score descending, then title alphabetically.
 */
export function rankSearchResults(items: SearchResultItem[]): SearchResultItem[] {
  return [...items].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.title.localeCompare(b.title);
  });
}

/**
 * Returns commands available to a user based on their active roles.
 */
export function getAvailableCommands(roles: string[] = []): CommandItem[] {
  const isPlatformAdmin = roles.includes('platform_admin') || roles.includes('admin');
  return BASE_COMMANDS.filter((cmd) => {
    if (!cmd.requiredRole) return true;
    if (isPlatformAdmin) return true;
    return roles.includes(cmd.requiredRole);
  });
}

/**
 * Filters commands against a user's search query.
 */
export function filterCommandsByQuery(commands: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return commands;

  return commands.filter((cmd) => {
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const shortcutMatch = cmd.shortcut ? cmd.shortcut.toLowerCase().includes(q) : false;
    const sectionMatch = cmd.section.toLowerCase().includes(q);
    return titleMatch || shortcutMatch || sectionMatch;
  });
}

/**
 * Creates an immutable search history entry.
 */
export function createSearchHistoryRecord(
  userId: string,
  query: string,
  entityType: SearchEntityType = 'all',
  resultCount: number = 0,
  nowIso: string = new Date().toISOString()
): SearchHistoryItem {
  return {
    id: crypto.randomUUID(),
    userId,
    query: query.trim(),
    entityType,
    resultCount,
    createdAt: nowIso,
  };
}
