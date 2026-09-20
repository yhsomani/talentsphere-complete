/**
 * TalentSphere Configuration
 * 
 * Centralized configuration for the application
 */

import { UserRole } from '@/types';

export const AppConfig = {
  name: 'TalentSphere',
  tagline: 'The Unified Talent Operating System',
  version: '0.1.0',
  
  // Application URLs
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiBaseUrl: '/api',
  
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Feature Flags (for progressive rollout)
  features: {
    aiMatching: false,
    codeArena: true,
    institutionalB2B: false,
    chromeExtension: false,
    gamification: true,
    mentorship: false,
  },
  
  // Pagination Defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // File Upload Limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  // Session Configuration
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
} as const;

export const RolePermissions: Record<UserRole, string[]> = {
  candidate: [
    'profile:read',
    'profile:update',
    'jobs:read',
    'jobs:apply',
    'applications:read',
    'applications:create',
    'courses:read',
    'courses:enroll',
    'challenges:read',
    'challenges:submit',
    'messages:read',
    'messages:send',
    'notifications:read',
    'notifications:update',
  ],
  recruiter: [
    'jobs:read',
    'jobs:create',
    'jobs:update',
    'jobs:delete',
    'applications:read',
    'applications:update',
    'candidates:search',
    'candidates:read',
    'scorecards:create',
    'scorecards:read',
    'messages:read',
    'messages:send',
    'company:read',
    'company:update',
  ],
  hiring_manager: [
    'jobs:read',
    'jobs:create',
    'jobs:update',
    'applications:read',
    'applications:update',
    'scorecards:read',
    'scorecards:create',
    'interviews:schedule',
  ],
  interviewer: [
    'jobs:read',
    'applications:read',
    'scorecards:create',
    'scorecards:read',
    'interviews:view',
  ],
  admin: [
    'users:read',
    'users:update',
    'users:delete',
    'roles:assign',
    'jobs:read',
    'jobs:update',
    'jobs:delete',
    'courses:read',
    'courses:update',
    'courses:delete',
    'reports:read',
    'audit:read',
    'config:read',
    'config:update',
  ],
  institution_admin: [
    'institution:read',
    'institution:update',
    'licenses:read',
    'cohorts:create',
    'cohorts:read',
    'cohorts:update',
    'students:read',
    'instructors:manage',
    'reports:read',
  ],
  institution_instructor: [
    'courses:read',
    'courses:teach',
    'students:read',
    'assignments:grade',
    'cohorts:read',
  ],
  institution_student: [
    'courses:read',
    'courses:enroll',
    'assignments:submit',
    'profile:read',
    'profile:update',
  ],
  provider: [
    'courses:read',
    'courses:create',
    'courses:update',
    'courses:publish',
    'analytics:read',
  ],
  mentor: [
    'mentees:read',
    'mentees:message',
    'sessions:schedule',
    'resources:share',
  ],
  coach: [
    'coachees:read',
    'coachees:message',
    'sessions:schedule',
    'career_plans:create',
  ],
};

export const UserStatuses = {
  candidate: ['available', 'employed', 'open_to_work', 'not_interested'] as const,
  job: ['draft', 'published', 'paused', 'closed', 'filled'] as const,
  application: ['submitted', 'screening', 'under_review', 'interview_scheduled', 'interviewed', 'offer_extended', 'offer_accepted', 'offer_declined', 'rejected', 'withdrawn', 'on_hold'] as const,
  enrollment: ['enrolled', 'in_progress', 'completed', 'dropped', 'expired'] as const,
  challenge: ['draft', 'published', 'active', 'completed', 'archived'] as const,
  submission: ['submitted', 'graded', 'reviewed', 'appealed'] as const,
} as const;

export const SkillProficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export const CourseLevels = ['beginner', 'intermediate', 'advanced'] as const;
export const JobTypes = ['full_time', 'part_time', 'contract', 'internship', 'apprenticeship'] as const;
export const WorkModes = ['remote', 'hybrid', 'onsite'] as const;
export const ExperienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive'] as const;

export const XPRewards = {
  profileComplete: 100,
  courseCompletion: 500,
  challengePass: 200,
  firstJobApplication: 50,
  jobReceived: 300,
  dailyLogin: 10,
  referral: 250,
  portfolioItemCreated: 75,
  skillVerified: 100,
} as const;

export const LevelThresholds = [
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
] as const;

export function getLevelFromXP(xp: number): number {
  for (let i = LevelThresholds.length - 1; i >= 0; i--) {
    if (xp >= LevelThresholds[i].xp) {
      return LevelThresholds[i].level;
    }
  }
  return 1;
}

export const DateFormat = {
  short: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMMM d, yyyy h:mm a',
  relative: 'PPP',
} as const;

export const TimezoneDefault = 'UTC';

export const CurrencyDefault = 'USD';

export const NotificationChannels = ['in_app', 'email', 'push'] as const;

export const NotificationPriorities = ['low', 'normal', 'high', 'urgent'] as const;
