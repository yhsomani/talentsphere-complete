/**
 * Candidate Service
 * 
 * Data access layer for candidate profile operations.
 * Refactored to use DatabaseAdapter for loose coupling, resilience,
 * and testability via Dependency Injection.
 * Fully aligned with Supabase schema (002_users_organizations.sql).
 */

import type { DatabaseAdapter } from '../lib/database/adapter';
import { createDatabaseAdapter } from '../lib/database/adapter';
import { AppConfig } from '../config/index';
import { AppErrors, isAppError } from '../lib/errors/index';
import type { CandidateProfile, Experience, Education, Certification, PortfolioItem } from '@/types';

export interface ResumeItem {
  id: string;
  name: string;
  fileName: string;
  url: string;
  size: number;
  uploadedAt: string;
  isPrimary: boolean;
}

export interface ProfileUpdateData {
  headline?: string;
  bio?: string;
  summary?: string;
  location?: string;
  timezone?: string;
  availability_status?: 'available' | 'employed' | 'open_to_work' | 'not_interested';
  visibility?: 'public' | 'connections' | 'private';
  resume_url?: string;
}

export interface CandidateSkillRecord {
  id: string;
  candidate_profile_id: string;
  skill_id: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface CandidateSearchResult {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  headline: string | null;
  summary: string | null;
  location: string | null;
  availability_status: string | null;
  years_of_experience: number;
  resume_url: string | null;
  skills: Array<{ id: string; name: string; proficiency?: string }>;
  level: number;
  total_xp: number;
}

export interface CandidateSearchFilters {
  search?: string;
  skills?: string[];
  availability?: string;
  minExperience?: number;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface PublicCandidateProfile {
  profile: CandidateProfile;
  user: {
    id: string;
    full_name: string | null;
    email?: string | null;
    avatar_url: string | null;
    role: string;
    created_at?: string;
  };
  level: {
    current_level: number;
    total_xp_earned: number;
    current_xp: number;
  };
  skills: Array<{ id: string; skill_id: string; name: string; proficiency_level: string }>;
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  portfolioItems: PortfolioItem[];
  badges: import('@/types').Badge[];
  yearsOfExperience: number;
  isPrivate: boolean;
}

export interface BadgeRecord {
  id: string;
  name: string;
  description: string;
  category: 'skill' | 'achievement' | 'milestone' | 'social' | 'learning' | 'challenge' | 'job_search' | 'special';
  icon_url?: string | null;
  xp_reward: number;
  criteria?: Record<string, unknown> | null;
  is_active: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  created_at?: string;
}

export interface CandidateBadgeRecord {
  id: string;
  candidate_profile_id: string;
  badge_id: string;
  earned_at: string;
  context?: Record<string, unknown> | null;
  badge?: BadgeRecord;
}

export const DEFAULT_PLATFORM_BADGES: BadgeRecord[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Early Adopter',
    description: 'Joined the TalentSphere ecosystem in the early launch phase',
    category: 'milestone',
    icon_url: 'sparkles',
    xp_reward: 100,
    is_active: true,
    rarity: 'uncommon',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    name: 'Profile Perfectionist',
    description: 'Completed all core profile sections: headline, summary, skills, and experience',
    category: 'achievement',
    icon_url: 'award',
    xp_reward: 250,
    is_active: true,
    rarity: 'rare',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    name: 'Resume Ready',
    description: 'Uploaded and verified candidate resume in the talent pool',
    category: 'milestone',
    icon_url: 'file-text',
    xp_reward: 150,
    is_active: true,
    rarity: 'common',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    name: 'Code Arena Champion',
    description: 'Successfully completed algorithmic coding challenges in Code Arena',
    category: 'challenge',
    icon_url: 'trophy',
    xp_reward: 500,
    is_active: true,
    rarity: 'epic',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    name: 'Knowledge Seeker',
    description: 'Enrolled in and completed an interactive skill development course',
    category: 'learning',
    icon_url: 'book-open',
    xp_reward: 200,
    is_active: true,
    rarity: 'common',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000006',
    name: 'Master Networker',
    description: 'Connected with fellow professionals and recruiters across the talent graph',
    category: 'social',
    icon_url: 'users',
    xp_reward: 200,
    is_active: true,
    rarity: 'rare',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000007',
    name: 'Job Hunt Voyager',
    description: 'Submitted applications to verified corporate job openings',
    category: 'job_search',
    icon_url: 'target',
    xp_reward: 150,
    is_active: true,
    rarity: 'uncommon',
  },
  {
    id: 'b1000000-0000-0000-0000-000000000008',
    name: 'TalentSphere Luminary',
    description: 'Achieved elite standing on the global learner leaderboard',
    category: 'special',
    icon_url: 'star',
    xp_reward: 1000,
    is_active: true,
    rarity: 'legendary',
  },
];

export class CandidateService {
  constructor(private readonly db: DatabaseAdapter) {}

  /**
   * Get candidate profile by user ID, including all sub-entities
   */
  async getProfile(userId: string): Promise<{
    profile: CandidateProfile | null;
    skills: Array<{ id: string; name: string; proficiency_level: string; skill_id: string }>;
    experiences: Experience[];
    educations: Education[];
    certifications: Certification[];
    portfolioItems: PortfolioItem[];
  }> {
    try {
      // 1. Fetch profile
      const { data: profileData, error: profileError } = await this.db
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        throw AppErrors.database('Failed to fetch candidate profile', {
          cause: profileError,
          context: { userId },
        });
      }

      if (!profileData) {
        return {
          profile: null,
          skills: [],
          experiences: [],
          educations: [],
          certifications: [],
          portfolioItems: [],
        };
      }

      const profileRow = profileData as unknown as Record<string, unknown>;
      const candidateProfileId = profileRow.id as string;

      // 2. Fetch sub-entities in parallel using candidateProfileId
      const [skillsRes, expRes, eduRes, certRes, portRes] = await Promise.all([
        this.db
          .from('candidate_skills')
          .select('id, candidate_profile_id, skill_id, proficiency, skills(id, name, category)')
          .eq('candidate_profile_id', candidateProfileId),
        this.db
          .from('experience')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('start_date', { ascending: false }),
        this.db
          .from('education')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('start_date', { ascending: false }),
        this.db
          .from('certifications')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('issue_date', { ascending: false }),
        this.db
          .from('portfolio_items')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('created_at', { ascending: false }),
      ]);

      const skills = ((skillsRes.data as unknown as Record<string, unknown>[]) || []).map((s: unknown) => {
        const row = s as {
          id: string;
          skill_id: string;
          proficiency: string;
          skills: { id: string; name: string; category?: string } | null;
        };
        return {
          id: row.id,
          skill_id: row.skill_id,
          name: row.skills?.name || 'Skill',
          proficiency_level: row.proficiency || 'intermediate',
        };
      });

      const experiences: Experience[] = ((expRes.data as unknown as Record<string, unknown>[]) || []).map((e: Record<string, unknown>) => ({
        id: String(e.id),
        candidate_id: String(e.candidate_profile_id),
        company_name: String(e.company_name || ''),
        job_title: String(e.job_title || ''),
        description: e.description ? String(e.description) : undefined,
        start_date: String(e.start_date || ''),
        end_date: e.end_date ? String(e.end_date) : undefined,
        is_current: Boolean(e.is_current),
        location: e.location_city ? String(e.location_city) : undefined,
        skills_used: Array.isArray(e.skills_used) ? (e.skills_used as string[]) : [],
        verified: false,
        created_at: String(e.created_at || ''),
      }));

      const educations: Education[] = ((eduRes.data as unknown as Record<string, unknown>[]) || []).map((ed: Record<string, unknown>) => ({
        id: String(ed.id),
        candidate_id: String(ed.candidate_profile_id),
        institution_name: String(ed.institution_name || ''),
        degree: ed.degree_type ? String(ed.degree_type) : undefined,
        field_of_study: ed.field_of_study ? String(ed.field_of_study) : undefined,
        grade: ed.grade ? String(ed.grade) : undefined,
        start_date: String(ed.start_date || ''),
        end_date: ed.end_date ? String(ed.end_date) : undefined,
        activities: Array.isArray(ed.activities) ? (ed.activities as string[]) : [],
        created_at: String(ed.created_at || ''),
      }));

      const certifications: Certification[] = ((certRes.data as unknown as Record<string, unknown>[]) || []).map((c: Record<string, unknown>) => ({
        id: String(c.id),
        candidate_id: String(c.candidate_profile_id),
        name: String(c.name || ''),
        issuing_organization: String(c.issuing_organization || ''),
        issue_date: String(c.issue_date || ''),
        expiration_date: c.expiration_date ? String(c.expiration_date) : undefined,
        credential_id: c.credential_id ? String(c.credential_id) : undefined,
        credential_url: c.credential_url ? String(c.credential_url) : undefined,
        skills: [],
        created_at: String(c.created_at || ''),
      }));

      const portfolioItems: PortfolioItem[] = ((portRes.data as unknown as Record<string, unknown>[]) || []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        candidate_id: String(p.candidate_profile_id),
        title: String(p.title || ''),
        description: String(p.description || ''),
        project_type: (p.project_type as PortfolioItem['project_type']) || 'web_app',
        url: p.project_url ? String(p.project_url) : undefined,
        repository_url: p.repository_url ? String(p.repository_url) : undefined,
        media_urls: Array.isArray(p.media_urls) ? (p.media_urls as string[]) : [],
        skills_demonstrated: [],
        started_at: String(p.created_at || ''),
        completed_at: undefined,
        is_featured: Boolean(p.is_featured),
        visibility: 'public',
        created_at: String(p.created_at || ''),
        updated_at: String(p.updated_at || ''),
      }));

      // Fetch earned badges for candidate
      let candidateBadges: import('@/types').Badge[] = [];
      try {
        const { data: cbData } = await this.db
          .from('candidate_badges')
          .select('badge_id, earned_at')
          .eq('candidate_profile_id', profileRow.id);
        if (cbData && (cbData as unknown[]).length > 0) {
          const rawCb = cbData as unknown as Array<{ badge_id: string; earned_at: string }>;
          const badgeIds = rawCb.map(b => b.badge_id);
          const { data: bData } = await this.db
            .from('badges')
            .select('*')
            .in('id', badgeIds);
          if (bData) {
            const rawB = bData as unknown as Array<{
              id: string;
              name: string;
              description: string;
              category: string;
              icon_url?: string | null;
            }>;
            const bMap = new Map(rawB.map(b => [b.id, b]));
            candidateBadges = rawCb.map(cb => {
              const b = bMap.get(cb.badge_id);
              const cat = (b?.category as 'skill' | 'achievement' | 'milestone') || 'achievement';
              return {
                id: cb.badge_id,
                name: b?.name || 'Badge',
                description: b?.description || '',
                icon_url: b?.icon_url || '',
                category: cat,
                earned_at: cb.earned_at,
                metadata: {},
              };
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch candidate badges in getProfile:', err);
      }

      const profile: CandidateProfile = {
        id: profileRow.id as string,
        user_id: profileRow.user_id as string,
        headline: (profileRow.headline as string) || '',
        bio: (profileRow.summary as string) || '',
        summary: (profileRow.summary as string) || '',
        location: (profileRow.location_city as string) || '',
        timezone: 'UTC',
        availability_status: (profileRow.availability_status as CandidateProfile['availability_status']) || 'open_to_work',
        xp_points: 0,
        level: 1,
        badges: candidateBadges,
        skills: [],
        experience: experiences,
        education: educations,
        certifications,
        portfolio_items: portfolioItems,
        resume_url: (profileRow.resume_url as string) || '',
        visibility: (profileRow.profile_visibility as CandidateProfile['visibility']) || 'public',
        created_at: profileRow.created_at as string,
        updated_at: profileRow.updated_at as string,
      };

      return {
        profile,
        skills,
        experiences,
        educations,
        certifications,
        portfolioItems,
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error fetching candidate profile', {
        cause: error,
        context: { userId },
      });
    }
  }

  /**
   * Fetch public candidate profile by candidate profile ID or user ID (PROFILE-009)
   */
  async getPublicProfile(idOrUserId: string): Promise<PublicCandidateProfile | null> {
    try {
      // 1. Try resolving profile by candidate_profiles.id
      let { data: profileData } = await this.db
        .from('candidate_profiles')
        .select('*')
        .eq('id', idOrUserId)
        .maybeSingle();

      // If not found by profile id, try by user_id
      if (!profileData) {
        const { data: byUser } = await this.db
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', idOrUserId)
          .maybeSingle();
        profileData = byUser;
      }

      if (!profileData) {
        return null;
      }

      const profileRow = profileData as unknown as Record<string, unknown>;
      const candidateProfileId = profileRow.id as string;
      const candidateUserId = profileRow.user_id as string;

      // 2. Fetch User, Level, Sub-entities, and Badges in parallel
      const [userRes, levelRes, skillsRes, expRes, eduRes, certRes, portRes, cbRes] = await Promise.all([
        this.db
          .from('users')
          .select('id, full_name, email, avatar_url, role, created_at')
          .eq('id', candidateUserId)
          .maybeSingle(),
        this.db
          .from('user_levels')
          .select('*')
          .eq('user_id', candidateUserId)
          .maybeSingle(),
        this.db
          .from('candidate_skills')
          .select('id, candidate_profile_id, skill_id, proficiency, skills(id, name, category)')
          .eq('candidate_profile_id', candidateProfileId),
        this.db
          .from('experience')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('start_date', { ascending: false }),
        this.db
          .from('education')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('start_date', { ascending: false }),
        this.db
          .from('certifications')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('issue_date', { ascending: false }),
        this.db
          .from('portfolio_items')
          .select('*')
          .eq('candidate_profile_id', candidateProfileId)
          .order('created_at', { ascending: false }),
        this.db
          .from('candidate_badges')
          .select('badge_id, earned_at')
          .eq('candidate_profile_id', candidateProfileId),
      ]);

      const userRow = (userRes.data as unknown as Record<string, unknown>) || {};
      const levelRow = (levelRes.data as unknown as Record<string, unknown>) || {};

      const user = {
        id: candidateUserId,
        full_name: (userRow.full_name as string) || null,
        email: (userRow.email as string) || null,
        avatar_url: (userRow.avatar_url as string) || null,
        role: (userRow.role as string) || 'candidate',
        created_at: (userRow.created_at as string) || undefined,
      };

      const level = {
        current_level: (levelRow.current_level as number) || 1,
        total_xp_earned: (levelRow.total_xp_earned as number) || 0,
        current_xp: (levelRow.current_xp as number) || 0,
      };

      // Map skills
      const rawSkills = ((skillsRes.data as unknown as Record<string, unknown>[]) || []);
      const unjoinedSkillIds = rawSkills
        .filter(s => {
          const sObj = s as { skills?: { name?: string } | null; skill_id?: string };
          return (!sObj.skills || !sObj.skills.name) && Boolean(sObj.skill_id);
        })
        .map(s => (s as { skill_id: string }).skill_id);

      const extraSkillMap = new Map<string, string>();
      if (unjoinedSkillIds.length > 0) {
        const { data: catSkills } = await this.db
          .from('skills')
          .select('id, name')
          .in('id', unjoinedSkillIds);
        if (catSkills && Array.isArray(catSkills)) {
          for (const cs of (catSkills as unknown as Array<{ id: string; name: string }>)) {
            extraSkillMap.set(cs.id, cs.name);
          }
        }
      }

      const skills = rawSkills.map((s: unknown) => {
        const row = s as {
          id: string;
          skill_id: string;
          proficiency: string;
          skills: { id: string; name: string; category?: string } | null;
        };
        const skillName = row.skills?.name || extraSkillMap.get(row.skill_id) || 'Skill';
        return {
          id: row.id,
          skill_id: row.skill_id,
          name: skillName,
          proficiency_level: row.proficiency || 'intermediate',
        };
      });

      // Map experiences
      const experiences: Experience[] = ((expRes.data as unknown as Record<string, unknown>[]) || []).map((e: Record<string, unknown>) => ({
        id: String(e.id),
        candidate_id: String(e.candidate_profile_id),
        company_name: String(e.company_name || ''),
        job_title: String(e.job_title || ''),
        description: e.description ? String(e.description) : undefined,
        start_date: String(e.start_date || ''),
        end_date: e.end_date ? String(e.end_date) : undefined,
        is_current: Boolean(e.is_current),
        location: e.location_city ? String(e.location_city) : undefined,
        skills_used: Array.isArray(e.skills_used) ? (e.skills_used as string[]) : [],
        verified: false,
        created_at: String(e.created_at || ''),
      }));

      // Calculate years of experience
      let yearsOfExperience = 0;
      if (experiences.length > 0) {
        let totalMonths = 0;
        for (const exp of experiences) {
          const start = exp.start_date ? new Date(exp.start_date).getTime() : Date.now();
          const end = exp.is_current || !exp.end_date ? Date.now() : new Date(exp.end_date).getTime();
          const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.4375)));
          totalMonths += months;
        }
        yearsOfExperience = Math.max(1, Math.round(totalMonths / 12));
      }

      // Map educations
      const educations: Education[] = ((eduRes.data as unknown as Record<string, unknown>[]) || []).map((ed: Record<string, unknown>) => ({
        id: String(ed.id),
        candidate_id: String(ed.candidate_profile_id),
        institution_name: String(ed.institution_name || ''),
        degree: ed.degree_type ? String(ed.degree_type) : undefined,
        field_of_study: ed.field_of_study ? String(ed.field_of_study) : undefined,
        grade: ed.grade ? String(ed.grade) : undefined,
        start_date: String(ed.start_date || ''),
        end_date: ed.end_date ? String(ed.end_date) : undefined,
        activities: Array.isArray(ed.activities) ? (ed.activities as string[]) : [],
        created_at: String(ed.created_at || ''),
      }));

      // Map certifications
      const certifications: Certification[] = ((certRes.data as unknown as Record<string, unknown>[]) || []).map((c: Record<string, unknown>) => ({
        id: String(c.id),
        candidate_id: String(c.candidate_profile_id),
        name: String(c.name || ''),
        issuing_organization: String(c.issuing_organization || ''),
        issue_date: String(c.issue_date || ''),
        expiration_date: c.expiration_date ? String(c.expiration_date) : undefined,
        credential_id: c.credential_id ? String(c.credential_id) : undefined,
        credential_url: c.credential_url ? String(c.credential_url) : undefined,
        skills: [],
        created_at: String(c.created_at || ''),
      }));

      // Map portfolio items
      const portfolioItems: PortfolioItem[] = ((portRes.data as unknown as Record<string, unknown>[]) || []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        candidate_id: String(p.candidate_profile_id),
        title: String(p.title || ''),
        description: String(p.description || ''),
        project_type: (p.project_type as PortfolioItem['project_type']) || 'web_app',
        url: p.project_url ? String(p.project_url) : undefined,
        repository_url: p.repository_url ? String(p.repository_url) : undefined,
        media_urls: Array.isArray(p.media_urls) ? (p.media_urls as string[]) : [],
        skills_demonstrated: [],
        started_at: String(p.created_at || ''),
        completed_at: undefined,
        is_featured: Boolean(p.is_featured),
        visibility: 'public',
        created_at: String(p.created_at || ''),
        updated_at: String(p.updated_at || ''),
      }));

      // Map badges
      let badges: import('@/types').Badge[] = [];
      const cbData = cbRes.data as unknown as Array<{ badge_id: string; earned_at: string }> | null;
      if (cbData && cbData.length > 0) {
        const badgeIds = cbData.map(b => b.badge_id);
        const { data: bData } = await this.db
          .from('badges')
          .select('*')
          .in('id', badgeIds);

        const bMap = new Map(
          ((bData as unknown as Array<Record<string, unknown>>) || []).map(b => [b.id as string, b])
        );

        badges = cbData.map(cb => {
          const b = bMap.get(cb.badge_id) || DEFAULT_PLATFORM_BADGES.find(pb => pb.id === cb.badge_id);
          const cat = (b?.category as 'skill' | 'achievement' | 'milestone') || 'achievement';
          return {
            id: cb.badge_id,
            name: (b?.name as string) || 'Badge',
            description: (b?.description as string) || '',
            icon_url: (b?.icon_url as string) || '',
            category: cat,
            earned_at: cb.earned_at,
            metadata: {},
          };
        });
      }

      const visibility = (profileRow.visibility || profileRow.profile_visibility) as string | undefined;
      const isPrivate = visibility === 'private';

      const profile: CandidateProfile = {
        id: candidateProfileId,
        user_id: candidateUserId,
        headline: (profileRow.headline as string) || '',
        bio: (profileRow.summary as string) || '',
        summary: (profileRow.summary as string) || '',
        location: (profileRow.location_city as string) || '',
        timezone: 'UTC',
        availability_status: (profileRow.availability_status as CandidateProfile['availability_status']) || 'open_to_work',
        xp_points: level.total_xp_earned,
        level: level.current_level,
        badges,
        skills: [],
        experience: experiences,
        education: educations,
        certifications,
        portfolio_items: portfolioItems,
        resume_url: (profileRow.resume_url as string) || '',
        visibility: (visibility as CandidateProfile['visibility']) || 'public',
        created_at: profileRow.created_at as string,
        updated_at: profileRow.updated_at as string,
      };

      return {
        profile,
        user,
        level,
        skills,
        experiences,
        educations,
        certifications,
        portfolioItems,
        badges,
        yearsOfExperience,
        isPrivate,
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error fetching public candidate profile', {
        cause: error,
        context: { idOrUserId },
      });
    }
  }

  /**
   * Create or update candidate profile
   */
  async upsertProfile(
    userId: string,
    profileData: ProfileUpdateData
  ): Promise<CandidateProfile> {
    try {
      const payload: Record<string, unknown> = {
        user_id: userId,
        headline: profileData.headline ?? null,
        summary: profileData.bio || profileData.summary || null,
        location_city: profileData.location || null,
        availability_status: profileData.availability_status || 'open_to_work',
        profile_visibility: profileData.visibility || 'public',
        updated_at: new Date().toISOString(),
      };

      if (profileData.resume_url) {
        payload.resume_url = profileData.resume_url;
      }

      const { data, error } = await this.db
        .from('candidate_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to upsert candidate profile', {
          cause: error,
          context: { userId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        user_id: row.user_id as string,
        headline: (row.headline as string) || '',
        bio: (row.summary as string) || '',
        summary: (row.summary as string) || '',
        location: (row.location_city as string) || '',
        availability_status: (row.availability_status as CandidateProfile['availability_status']) || 'open_to_work',
        xp_points: 0,
        level: 1,
        badges: [],
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        portfolio_items: [],
        resume_url: (row.resume_url as string) || '',
        visibility: (row.profile_visibility as CandidateProfile['visibility']) || 'public',
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error upserting candidate profile', {
        cause: error,
        context: { userId },
      });
    }
  }

  /**
   * Upload resume to storage in user-scoped path (e.g. `${userId}/${timestamp}-${cleanName}`)
   * Updates candidate profile resume_url if this is the first/primary resume.
   */
  async uploadResume(
    file: File,
    userId: string,
    options?: { customTitle?: string; setAsPrimary?: boolean }
  ): Promise<string> {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const storagePath = `${userId}/${timestamp}-${cleanName}`;

      const { error: uploadError } = await this.db.storage
        .from('resumes')
        .upload(storagePath, file, {
          upsert: true,
          contentType: file.type || 'application/pdf',
        });

      if (uploadError) {
        throw AppErrors.externalService('Storage', 'Failed to upload resume', {
          cause: uploadError,
          context: { userId, storagePath },
        });
      }

      const { data } = this.db.storage
        .from('resumes')
        .getPublicUrl(storagePath);

      const publicUrl = data.publicUrl;

      // Check current profile to see if resume_url is already set
      const { data: profile } = await this.db
        .from('candidate_profiles')
        .select('id, resume_url')
        .eq('user_id', userId)
        .maybeSingle();

      const profileRow = profile as { id?: string; resume_url?: string } | null;
      const shouldSetPrimary = options?.setAsPrimary ?? (!profileRow?.resume_url);

      if (shouldSetPrimary && profileRow?.id) {
        await this.db
          .from('candidate_profiles')
          .update({
            resume_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileRow.id);
      }

      return publicUrl;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.externalService('Storage', 'Unexpected error uploading resume', {
        cause: error,
        context: { userId },
      });
    }
  }

  /**
   * Get all resumes for a candidate from storage, cross-referenced with candidate_profiles
   */
  async getResumes(userId: string): Promise<ResumeItem[]> {
    try {
      // 1. Fetch current profile to check primary resume_url
      const { data: profileData } = await this.db
        .from('candidate_profiles')
        .select('id, resume_url')
        .eq('user_id', userId)
        .maybeSingle();

      const primaryUrl = (profileData as { resume_url?: string } | null)?.resume_url || null;

      // 2. List files from resumes storage bucket under userId/
      const { data: fileList, error: listError } = await this.db.storage
        .from('resumes')
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (listError) {
        // If directory doesn't exist yet, return empty or single primary if URL exists
        if (primaryUrl) {
          return [{
            id: 'primary-existing',
            name: 'Primary Resume',
            fileName: 'resume.pdf',
            url: primaryUrl,
            size: 0,
            uploadedAt: new Date().toISOString(),
            isPrimary: true,
          }];
        }
        return [];
      }

      const files = (fileList || []).filter((f: Record<string, unknown>) => f.name && !String(f.name).startsWith('.'));
      
      const resumes: ResumeItem[] = files.map((file: Record<string, unknown>) => {
        const fileName = String(file.name || '');
        const storagePath = `${userId}/${fileName}`;
        const { data } = this.db.storage.from('resumes').getPublicUrl(storagePath);
        const url = data.publicUrl;
        
        // Clean display name: remove timestamp prefix if present
        let displayName = fileName;
        const match = fileName.match(/^\d+-(.+)$/);
        if (match) {
          displayName = match[1];
        }

        const isPrimary = primaryUrl ? (url === primaryUrl || primaryUrl.includes(fileName)) : false;

        return {
          id: (file.id as string) || fileName,
          name: displayName,
          fileName,
          url,
          size: (file.metadata as { size?: number })?.size || 0,
          uploadedAt: (file.created_at as string) || new Date().toISOString(),
          isPrimary,
        };
      });

      // If there are files and none is marked primary, mark the most recent one as primary
      if (resumes.length > 0 && !resumes.some(r => r.isPrimary)) {
        if (!primaryUrl) {
          resumes[0].isPrimary = true;
          // Asynchronously persist as primary
          this.setPrimaryResume(userId, resumes[0].url).catch(() => {});
        } else {
          // If primaryUrl was an external URL not in storage list, prepend it
          resumes.unshift({
            id: 'external-primary',
            name: 'Primary Resume (Linked)',
            fileName: 'resume-link',
            url: primaryUrl,
            size: 0,
            uploadedAt: new Date().toISOString(),
            isPrimary: true,
          });
        }
      }

      return resumes;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.externalService('Storage', 'Unexpected error fetching resumes', {
        cause: error,
        context: { userId },
      });
    }
  }

  /**
   * Set a specific resume URL as the primary resume on candidate profile
   */
  async setPrimaryResume(userId: string, resumeUrl: string): Promise<void> {
    try {
      const { data: profile } = await this.db
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const profileRow = profile as { id?: string } | null;
      if (!profileRow?.id) {
        throw AppErrors.notFound('Candidate profile', userId);
      }

      const { error } = await this.db
        .from('candidate_profiles')
        .update({
          resume_url: resumeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileRow.id);

      if (error) {
        throw AppErrors.database('Failed to update primary resume', {
          cause: error,
          context: { userId, resumeUrl },
        });
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error setting primary resume', {
        cause: error,
        context: { userId, resumeUrl },
      });
    }
  }

  /**
   * Delete a resume from storage and update candidate profile if it was primary
   */
  async deleteResume(userId: string, fileName: string): Promise<void> {
    try {
      const storagePath = `${userId}/${fileName}`;
      const { data: publicUrlData } = this.db.storage.from('resumes').getPublicUrl(storagePath);
      const targetUrl = publicUrlData.publicUrl;

      // 1. Delete file from storage
      const { error: deleteError } = await this.db.storage
        .from('resumes')
        .remove([storagePath]);

      if (deleteError) {
        throw AppErrors.externalService('Storage', 'Failed to delete resume file', {
          cause: deleteError,
          context: { userId, fileName },
        });
      }

      // 2. Check if this resume was primary in candidate_profiles
      const { data: profile } = await this.db
        .from('candidate_profiles')
        .select('id, resume_url')
        .eq('user_id', userId)
        .maybeSingle();

      const profileRow = profile as { id?: string; resume_url?: string } | null;
      if (profileRow?.id && profileRow.resume_url && (profileRow.resume_url === targetUrl || profileRow.resume_url.includes(fileName))) {
        // Clear primary resume first so getResumes doesn't unshift the deleted resume as an external link
        await this.db
          .from('candidate_profiles')
          .update({
            resume_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileRow.id);

        // Find remaining resumes to elect new primary
        const remaining = await this.getResumes(userId);
        const newPrimaryUrl = remaining.length > 0 ? remaining[0].url : null;

        if (newPrimaryUrl) {
          await this.db
            .from('candidate_profiles')
            .update({
              resume_url: newPrimaryUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileRow.id);
        }
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.externalService('Storage', 'Unexpected error deleting resume', {
        cause: error,
        context: { userId, fileName },
      });
    }
  }

  /**
   * Upload avatar to storage
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await this.db.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw AppErrors.externalService('Storage', 'Failed to upload avatar', {
          cause: uploadError,
          context: { userId, fileName },
        });
      }

      const { data } = this.db.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.externalService('Storage', 'Unexpected error uploading avatar', {
        cause: error,
        context: { userId },
      });
    }
  }

  /**
   * Add skill to profile by skill name
   */
  async addSkill(
    candidateProfileId: string,
    skillName: string,
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate'
  ): Promise<{ id: string; name: string; proficiency_level: string; skill_id: string }> {
    try {
      const trimmedName = skillName.trim();
      if (!trimmedName) throw AppErrors.validation('Skill name cannot be empty');

      // 1. Find or create skill in `skills` taxonomy table
      let skillId: string | null = null;
      const { data: existingSkill } = await this.db
        .from('skills')
        .select('id, name')
        .ilike('name', trimmedName)
        .maybeSingle();

      if (existingSkill) {
        skillId = (existingSkill as unknown as Record<string, unknown>).id as string;
      } else {
        const { data: newSkill, error: createSkillError } = await this.db
          .from('skills')
          .insert({ name: trimmedName, category: 'Technical' })
          .select()
          .single();

        if (createSkillError) {
          throw AppErrors.database('Failed to create skill in taxonomy', {
            cause: createSkillError,
            context: { skillName: trimmedName },
          });
        }
        skillId = (newSkill as unknown as Record<string, unknown>).id as string;
      }

      // 2. Insert into `candidate_skills`
      const { data: linkData, error: linkError } = await this.db
        .from('candidate_skills')
        .upsert({
          candidate_profile_id: candidateProfileId,
          skill_id: skillId,
          proficiency: proficiencyLevel,
        }, { onConflict: 'candidate_profile_id,skill_id' })
        .select('id, proficiency')
        .single();

      if (linkError) {
        throw AppErrors.database('Failed to link skill to candidate', {
          cause: linkError,
          context: { candidateProfileId, skillId },
        });
      }

      const row = linkData as unknown as Record<string, unknown>;

      return {
        id: row.id as string,
        skill_id: skillId!,
        name: trimmedName,
        proficiency_level: row.proficiency as string,
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error adding skill to candidate', {
        cause: error,
        context: { candidateProfileId, skillName },
      });
    }
  }

  /**
   * Remove skill from candidate profile
   */
  async removeSkill(candidateProfileId: string, candidateSkillId: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('candidate_skills')
        .delete()
        .eq('candidate_profile_id', candidateProfileId)
        .eq('id', candidateSkillId);

      if (error) {
        throw AppErrors.database('Failed to remove skill from candidate', {
          cause: error,
          context: { candidateProfileId, candidateSkillId },
        });
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error removing skill from candidate', {
        cause: error,
        context: { candidateProfileId, candidateSkillId },
      });
    }
  }

  /**
   * Add experience entry
   */
  async addExperience(
    candidateProfileId: string,
    experience: {
      company_name: string;
      job_title: string;
      start_date: string;
      end_date?: string;
      is_current?: boolean;
      location?: string;
      description?: string;
    }
  ): Promise<Experience> {
    try {
      const { data, error } = await this.db
        .from('experience')
        .insert({
          candidate_profile_id: candidateProfileId,
          company_name: experience.company_name,
          job_title: experience.job_title,
          start_date: experience.start_date,
          end_date: experience.end_date || null,
          is_current: Boolean(experience.is_current),
          location_city: experience.location || null,
          description: experience.description || null,
        })
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to add experience', {
          cause: error,
          context: { candidateProfileId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        candidate_id: row.candidate_profile_id as string,
        company_name: (row.company_name as string) || '',
        job_title: (row.job_title as string) || '',
        description: (row.description as string) || undefined,
        start_date: (row.start_date as string) || '',
        end_date: (row.end_date as string) || undefined,
        is_current: Boolean(row.is_current),
        location: (row.location_city as string) || undefined,
        skills_used: [],
        verified: false,
        created_at: (row.created_at as string) || '',
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error adding experience', {
        cause: error,
        context: { candidateProfileId },
      });
    }
  }

  /**
   * Update experience entry
   */
  async updateExperience(
    experienceId: string,
    updates: Partial<Experience>
  ): Promise<Experience> {
    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.company_name !== undefined) payload.company_name = updates.company_name;
      if (updates.job_title !== undefined) payload.job_title = updates.job_title;
      if (updates.start_date !== undefined) payload.start_date = updates.start_date;
      if (updates.end_date !== undefined) payload.end_date = updates.end_date || null;
      if (updates.is_current !== undefined) payload.is_current = updates.is_current;
      if (updates.location !== undefined) payload.location_city = updates.location || null;
      if (updates.description !== undefined) payload.description = updates.description || null;

      const { data, error } = await this.db
        .from('experience')
        .update(payload)
        .eq('id', experienceId)
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to update experience', {
          cause: error,
          context: { experienceId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        candidate_id: row.candidate_profile_id as string,
        company_name: (row.company_name as string) || '',
        job_title: (row.job_title as string) || '',
        description: (row.description as string) || undefined,
        start_date: (row.start_date as string) || '',
        end_date: (row.end_date as string) || undefined,
        is_current: Boolean(row.is_current),
        location: (row.location_city as string) || undefined,
        skills_used: [],
        verified: false,
        created_at: (row.created_at as string) || '',
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error updating experience', {
        cause: error,
        context: { experienceId },
      });
    }
  }

  /**
   * Delete experience entry
   */
  async deleteExperience(experienceId: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('experience')
        .delete()
        .eq('id', experienceId);

      if (error) {
        throw AppErrors.database('Failed to delete experience', {
          cause: error,
          context: { experienceId },
        });
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error deleting experience', {
        cause: error,
        context: { experienceId },
      });
    }
  }

  /**
   * Add education entry
   */
  async addEducation(
    candidateProfileId: string,
    education: {
      institution_name: string;
      degree?: string;
      field_of_study?: string;
      start_date: string;
      end_date?: string;
      is_current?: boolean;
      grade?: string;
      description?: string;
    }
  ): Promise<Education> {
    try {
      const { data, error } = await this.db
        .from('education')
        .insert({
          candidate_profile_id: candidateProfileId,
          institution_name: education.institution_name,
          degree_type: education.degree || null,
          field_of_study: education.field_of_study || null,
          grade: education.grade || null,
          start_date: education.start_date,
          end_date: education.end_date || null,
          is_current: Boolean(education.is_current),
          description: education.description || null,
        })
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to add education', {
          cause: error,
          context: { candidateProfileId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        candidate_id: row.candidate_profile_id as string,
        institution_name: (row.institution_name as string) || '',
        degree: (row.degree_type as string) || undefined,
        field_of_study: (row.field_of_study as string) || undefined,
        grade: (row.grade as string) || undefined,
        start_date: (row.start_date as string) || '',
        end_date: (row.end_date as string) || undefined,
        activities: [],
        created_at: (row.created_at as string) || '',
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error adding education', {
        cause: error,
        context: { candidateProfileId },
      });
    }
  }

  /**
   * Delete education entry
   */
  async deleteEducation(educationId: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('education')
        .delete()
        .eq('id', educationId);

      if (error) {
        throw AppErrors.database('Failed to delete education', {
          cause: error,
          context: { educationId },
        });
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error deleting education', {
        cause: error,
        context: { educationId },
      });
    }
  }

  /**
   * Add certification entry
   */
  async addCertification(
    candidateProfileId: string,
    certification: {
      name: string;
      issuing_organization: string;
      issue_date: string;
      expiration_date?: string;
      credential_id?: string;
      credential_url?: string;
    }
  ): Promise<Certification> {
    try {
      const { data, error } = await this.db
        .from('certifications')
        .insert({
          candidate_profile_id: candidateProfileId,
          name: certification.name,
          issuing_organization: certification.issuing_organization,
          issue_date: certification.issue_date,
          expiration_date: certification.expiration_date || null,
          credential_id: certification.credential_id || null,
          credential_url: certification.credential_url || null,
        })
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to add certification', {
          cause: error,
          context: { candidateProfileId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        candidate_id: row.candidate_profile_id as string,
        name: (row.name as string) || '',
        issuing_organization: (row.issuing_organization as string) || '',
        issue_date: (row.issue_date as string) || '',
        expiration_date: (row.expiration_date as string) || undefined,
        credential_id: (row.credential_id as string) || undefined,
        credential_url: (row.credential_url as string) || undefined,
        skills: [],
        created_at: (row.created_at as string) || '',
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error adding certification', {
        cause: error,
        context: { candidateProfileId },
      });
    }
  }

  /**
   * Delete certification entry
   */
  async deleteCertification(certificationId: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('certifications')
        .delete()
        .eq('id', certificationId);

      if (error) {
        throw AppErrors.database('Failed to delete certification', {
          cause: error,
          context: { certificationId },
        });
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error deleting certification', {
        cause: error,
        context: { certificationId },
      });
    }
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(
    candidateProfileId: string,
    portfolioItem: {
      title: string;
      description?: string;
      url?: string;
      repository_url?: string;
      started_at?: string;
      completed_at?: string;
    }
  ): Promise<PortfolioItem> {
    try {
      const { data, error } = await this.db
        .from('portfolio_items')
        .insert({
          candidate_profile_id: candidateProfileId,
          title: portfolioItem.title,
          description: portfolioItem.description || null,
          project_url: portfolioItem.url || null,
          repository_url: portfolioItem.repository_url || null,
          project_type: 'web_app',
        })
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to add portfolio item', {
          cause: error,
          context: { candidateProfileId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        candidate_id: row.candidate_profile_id as string,
        title: (row.title as string) || '',
        description: (row.description as string) || '',
        project_type: (row.project_type as PortfolioItem['project_type']) || 'web_app',
        url: (row.project_url as string) || undefined,
        repository_url: (row.repository_url as string) || undefined,
        media_urls: Array.isArray(row.media_urls) ? (row.media_urls as string[]) : [],
        skills_demonstrated: [],
        started_at: (row.created_at as string) || '',
        completed_at: undefined,
        is_featured: Boolean(row.is_featured),
        visibility: 'public',
        created_at: (row.created_at as string) || '',
        updated_at: (row.updated_at as string) || '',
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error adding portfolio item', {
        cause: error,
        context: { candidateProfileId },
      });
    }
  }

  /**
   * Update portfolio item
   */
  async updatePortfolioItem(
    portfolioItemId: string,
    updates: Partial<PortfolioItem>
  ): Promise<PortfolioItem> {
    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description || null;
      if (updates.url !== undefined) payload.project_url = updates.url || null;
      if (updates.repository_url !== undefined) payload.repository_url = updates.repository_url || null;

      const { data, error } = await this.db
        .from('portfolio_items')
        .update(payload)
        .eq('id', portfolioItemId)
        .select()
        .single();

      if (error) {
        throw AppErrors.database('Failed to update portfolio item', {
          cause: error,
          context: { portfolioItemId },
        });
      }

      const row = data as Record<string, unknown>;

      return {
        id: row.id as string,
        candidate_id: row.candidate_profile_id as string,
        title: (row.title as string) || '',
        description: (row.description as string) || '',
        project_type: 'personal',
        url: (row.project_url as string) || undefined,
        repository_url: (row.repository_url as string) || undefined,
        media_urls: [],
        skills_demonstrated: [],
        started_at: (row.start_date as string) || (row.created_at as string) || '',
        completed_at: (row.end_date as string) || undefined,
        is_featured: false,
        visibility: 'public',
        created_at: (row.created_at as string) || '',
        updated_at: (row.updated_at as string) || '',
      };
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error updating portfolio item', {
        cause: error,
        context: { portfolioItemId },
      });
    }
  }

  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(portfolioItemId: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('portfolio_items')
        .delete()
        .eq('id', portfolioItemId);

      if (error) {
        throw AppErrors.database('Failed to delete portfolio item', {
          cause: error,
          context: { portfolioItemId },
        });
      }
    } catch (error) {
      if (isAppError(error)) throw error;
      throw AppErrors.database('Unexpected error deleting portfolio item', {
        cause: error,
        context: { portfolioItemId },
      });
    }
  }

  /**
   * Search and filter candidates for recruiter talent discovery (RECRUIT-002)
   */
  async searchCandidates(filters: CandidateSearchFilters = {}): Promise<{
    candidates: CandidateSearchResult[];
    total: number;
  }> {
    try {
      // 1. Fetch candidate profiles
      const { data: profilesData, error: profileErr } = await this.db
        .from('candidate_profiles')
        .select('*');

      if (profileErr || !profilesData) {
        return { candidates: [], total: 0 };
      }

      const rawProfiles = (profilesData as unknown as Array<Record<string, unknown>>) || [];
      const userIds = rawProfiles.map(p => p.user_id as string).filter(Boolean);
      const profileIds = rawProfiles.map(p => p.id as string).filter(Boolean);

      // 2. Fetch users
      const usersMap = new Map<string, { id: string; full_name?: string; email?: string; avatar_url?: string | null }>();
      if (userIds.length > 0) {
        const { data: usersData } = await this.db
          .from('users')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds);
        ((usersData as unknown as Array<{ id: string; full_name?: string; email?: string; avatar_url?: string | null }>) || []).forEach(u => usersMap.set(u.id, u));
      }

      // 3. Fetch candidate skills
      const skillsMap = new Map<string, Array<{ id: string; name: string; proficiency?: string }>>();
      if (profileIds.length > 0) {
        const { data: skillsData } = await this.db
          .from('candidate_skills')
          .select('candidate_profile_id, skill_id, proficiency, skills(id, name)')
          .in('candidate_profile_id', profileIds);

        const rawSkills = (skillsData as unknown as Array<{
          candidate_profile_id: string;
          skill_id: string;
          proficiency?: string;
          skills?: { id: string; name: string } | null;
        }>) || [];
        
        // If join didn't populate skills object, fallback lookup
        const missingSkillIds = rawSkills.filter(s => !s.skills).map(s => s.skill_id);
        const nameMap = new Map<string, string>();
        if (missingSkillIds.length > 0) {
          const { data: globalSkills } = await this.db
            .from('skills')
            .select('id, name')
            .in('id', missingSkillIds);
          ((globalSkills as unknown as Array<{ id: string; name: string }>) || []).forEach(gs => nameMap.set(gs.id, gs.name));
        }

        for (const s of rawSkills) {
          const list = skillsMap.get(s.candidate_profile_id) || [];
          const skillName = s.skills?.name || nameMap.get(s.skill_id) || s.skill_id;
          list.push({
            id: s.skill_id,
            name: skillName,
            proficiency: s.proficiency,
          });
          skillsMap.set(s.candidate_profile_id, list);
        }
      }

      // 4. Fetch user levels / XP
      const xpMap = new Map<string, { level: number; total_xp: number }>();
      if (userIds.length > 0) {
        const { data: levelsData } = await this.db
          .from('user_levels')
          .select('user_id, current_level, total_xp')
          .in('user_id', userIds);
        ((levelsData as unknown as Array<{ user_id: string; current_level?: number; total_xp?: number }>) || []).forEach(lvl => {
          xpMap.set(lvl.user_id, {
            level: lvl.current_level || 1,
            total_xp: lvl.total_xp || 0,
          });
        });
      }

      // 5. Combine and filter
      const results: CandidateSearchResult[] = [];

      for (const p of rawProfiles) {
        // Skip private profiles
        if (p.profile_visibility === 'private') {
          continue;
        }

        const userId = p.user_id as string;
        const profileId = p.id as string;
        const user = usersMap.get(userId);
        const candSkills = skillsMap.get(profileId) || [];
        const candXp = xpMap.get(userId) || { level: 1, total_xp: 0 };
        const fullName = user?.full_name || '';
        const email = user?.email || '';
        const headline = (p.headline as string) || '';
        const summary = (p.summary as string) || (p.bio as string) || '';
        const locationCity = p.location_city as string | undefined;
        const locationCountry = p.location_country as string | undefined;
        const location = locationCity ? `${locationCity}${locationCountry ? ', ' + locationCountry : ''}` : ((p.location as string) || '');
        const yearsOfExp = Number(p.years_of_experience || 0);

        // Filter: Availability
        if (filters.availability && filters.availability !== 'all') {
          if (p.availability_status !== filters.availability) {
            continue;
          }
        }

        // Filter: Minimum Experience
        if (filters.minExperience && yearsOfExp < filters.minExperience) {
          continue;
        }

        // Filter: Location
        if (filters.location && filters.location.trim()) {
          const locQuery = filters.location.toLowerCase();
          if (!location.toLowerCase().includes(locQuery)) {
            continue;
          }
        }

        // Filter: Skills
        if (filters.skills && filters.skills.length > 0) {
          const candSkillNames = candSkills.map(s => s.name.toLowerCase());
          const hasMatchingSkill = filters.skills.some(reqSkill =>
            candSkillNames.some(csn => csn.includes(reqSkill.toLowerCase()))
          );
          if (!hasMatchingSkill) {
            continue;
          }
        }

        // Filter: Search Keyword
        if (filters.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchName = fullName.toLowerCase().includes(q);
          const matchEmail = email.toLowerCase().includes(q);
          const matchHeadline = headline.toLowerCase().includes(q);
          const matchSummary = summary.toLowerCase().includes(q);
          const matchSkills = candSkills.some(s => s.name.toLowerCase().includes(q));

          if (!matchName && !matchEmail && !matchHeadline && !matchSummary && !matchSkills) {
            continue;
          }
        }

        results.push({
          id: profileId,
          user_id: userId,
          full_name: fullName,
          email,
          avatar_url: user?.avatar_url || null,
          headline: headline || null,
          summary: summary || null,
          location: location || null,
          availability_status: (p.availability_status as string) || 'open_to_work',
          years_of_experience: yearsOfExp,
          resume_url: (p.resume_url as string) || null,
          skills: candSkills,
          level: candXp.level,
          total_xp: candXp.total_xp,
        });
      }

      // 6. Pagination
      const total = results.length;
      const offset = filters.offset || 0;
      const limit = filters.limit || 20;
      const paginated = results.slice(offset, offset + limit);

      return {
        candidates: paginated,
        total,
      };
    } catch (err) {
      console.error('Error in searchCandidates:', err);
      return { candidates: [], total: 0 };
    }
  }


  /**
   * Get all active badge definitions (GAMI-003)
   */
  async getAllBadges(): Promise<BadgeRecord[]> {
    try {
      const { data, error } = await this.db
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('xp_reward', { ascending: false });

      const dbBadges = (!error && data && (data as unknown[]).length > 0)
        ? ((data as unknown) as BadgeRecord[])
        : [];

      // Merge with default platform catalog so unseeded default badges are always available
      const mergedMap = new Map<string, BadgeRecord>();
      for (const b of DEFAULT_PLATFORM_BADGES) {
        mergedMap.set(b.id, b);
      }
      for (const b of dbBadges) {
        mergedMap.set(b.id, b);
      }

      return Array.from(mergedMap.values());
    } catch (err) {
      console.warn('Error fetching all badges, returning defaults:', err);
      return DEFAULT_PLATFORM_BADGES;
    }
  }

  /**
   * Get all earned badges for a candidate profile (GAMI-003)
   */
  async getCandidateBadges(candidateProfileId: string): Promise<CandidateBadgeRecord[]> {
    try {
      const { data: userBadges, error } = await this.db
        .from('candidate_badges')
        .select('*')
        .eq('candidate_profile_id', candidateProfileId)
        .order('earned_at', { ascending: false });

      if (error || !userBadges || (userBadges as unknown[]).length === 0) {
        return [];
      }

      const allBadges = await this.getAllBadges();
      const badgeMap = new Map<string, BadgeRecord>();
      for (const b of allBadges) {
        badgeMap.set(b.id, b);
      }

      const rawUserBadges = (userBadges as unknown) as Array<{
        id: string;
        candidate_profile_id: string;
        badge_id: string;
        earned_at: string;
        context?: Record<string, unknown> | null;
      }>;

      const result: CandidateBadgeRecord[] = rawUserBadges.map(ub => ({
        id: ub.id,
        candidate_profile_id: ub.candidate_profile_id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        context: ub.context,
        badge: badgeMap.get(ub.badge_id) || DEFAULT_PLATFORM_BADGES.find(b => b.id === ub.badge_id),
      }));

      return result;
    } catch (err) {
      console.warn('Error fetching candidate badges:', err);
      return [];
    }
  }

  /**
   * Award a badge to a candidate profile (GAMI-004)
   * Automatically updates XP in user_levels and xp_ledger, and sends in-app notification
   */
  async awardBadge(
    candidateProfileId: string,
    badgeNameOrId: string,
    context?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    alreadyAwarded?: boolean;
    badge?: BadgeRecord;
    xpAwarded?: number;
  }> {
    try {
      const allBadges = await this.getAllBadges();
      const badge = allBadges.find(
        b => b.id === badgeNameOrId || b.name.toLowerCase() === badgeNameOrId.toLowerCase()
      );

      if (!badge) {
        console.warn(`Badge '${badgeNameOrId}' not found in catalog.`);
        return { success: false };
      }

      // Check if candidate already has this badge
      const { data: existing } = await this.db
        .from('candidate_badges')
        .select('id')
        .eq('candidate_profile_id', candidateProfileId)
        .eq('badge_id', badge.id)
        .maybeSingle();

      if (existing) {
        return { success: true, alreadyAwarded: true, badge };
      }

      // Ensure badge exists in database badges table before inserting FK
      try {
        const { data: dbBadge } = await this.db
          .from('badges')
          .select('id')
          .eq('id', badge.id)
          .maybeSingle();

        if (!dbBadge) {
          await this.db.from('badges').upsert({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            category: badge.category,
            icon_url: badge.icon_url,
            xp_reward: badge.xp_reward,
            rarity: badge.rarity,
            is_active: true,
          }, { onConflict: 'name' });
        }
      } catch (seedErr) {
        console.warn('Non-blocking badge seed sync:', seedErr);
      }

      // Insert candidate_badge record
      const { error: insertErr } = await this.db
        .from('candidate_badges')
        .insert({
          candidate_profile_id: candidateProfileId,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
          context: context || {},
        });

      if (insertErr) {
        const isConflict = String(insertErr.message || '').includes('unique') || (insertErr as unknown as Record<string, unknown>).code === '23505';
        if (isConflict) {
          return { success: true, alreadyAwarded: true, badge };
        }
        console.error('Failed to insert candidate_badge:', insertErr);
        return { success: false };
      }

      // Lookup candidate user_id to award XP & notification
      try {
        const { data: profData } = await this.db
          .from('candidate_profiles')
          .select('user_id')
          .eq('id', candidateProfileId)
          .maybeSingle();

        const rawProf = (profData as unknown) as Record<string, unknown> | null;
        const userId = rawProf?.user_id as string | undefined;
        if (userId && badge.xp_reward > 0) {
          // 1. Fetch current user level
          const { data: levelData } = await this.db
            .from('user_levels')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          const rawLevel = (levelData as unknown) as Record<string, unknown> | null;
          const currentTotalXp = Number(rawLevel?.total_xp_earned || 0);
          const currentXp = Number(rawLevel?.current_xp || 0);
          const newTotalXp = currentTotalXp + badge.xp_reward;
          let newCurrentXp = currentXp + badge.xp_reward;
          const xpToNext = Number(rawLevel?.xp_to_next_level || 500);
          let newLevelNum = Number(rawLevel?.current_level || 1);
          let leveledUp = false;

          while (newCurrentXp >= xpToNext) {
            newLevelNum += 1;
            newCurrentXp -= xpToNext;
            leveledUp = true;
          }

          const levelProgress = Number(((newCurrentXp / xpToNext) * 100).toFixed(2));

          // Log into xp_ledger
          await this.db.from('xp_ledger').insert({
            user_id: userId,
            amount: badge.xp_reward,
            transaction_type: 'earned',
            source_type: 'badge_award',
            source_id: badge.id,
            description: `Unlocked badge: ${badge.name} (+${badge.xp_reward} XP)`,
            balance_after: newTotalXp,
          });

          // Update user_levels
          if (rawLevel) {
            await this.db
              .from('user_levels')
              .update({
                total_xp_earned: newTotalXp,
                current_xp: newCurrentXp,
                current_level: newLevelNum,
                level_progress: levelProgress,
                last_level_up_at: leveledUp ? new Date().toISOString() : rawLevel?.last_level_up_at,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
          } else {
            await this.db
              .from('user_levels')
              .insert({
                user_id: userId,
                total_xp_earned: newTotalXp,
                current_xp: newCurrentXp,
                current_level: newLevelNum,
                level_progress: levelProgress,
                last_level_up_at: leveledUp ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              });
          }

          // Send in-app notification (badge_earned)
          await this.db.from('notifications').insert({
            user_id: userId,
            type: 'badge_earned',
            title: `Badge Unlocked: ${badge.name}`,
            message: `Congratulations! You unlocked the "${badge.name}" badge and earned +${badge.xp_reward} XP.`,
            link_url: '/candidates/profile#badges-section',
            link_label: 'View Badge',
            channel: 'in_app',
            metadata: { badgeId: badge.id, badgeName: badge.name, xpReward: badge.xp_reward },
            is_read: false,
            is_archived: false,
          });
        }
      } catch (xpErr) {
        console.warn('Non-blocking XP/notification dispatch error in awardBadge:', xpErr);
      }

      return {
        success: true,
        alreadyAwarded: false,
        badge,
        xpAwarded: badge.xp_reward,
      };
    } catch (err) {
      console.error('Error in awardBadge:', err);
      return { success: false };
    }
  }
}

// Export singleton instance for backward compatibility
const defaultAdapter = createDatabaseAdapter({
  supabaseUrl: AppConfig.supabase.url,
  supabaseKey: AppConfig.supabase.anonKey,
});
export const candidateService = new CandidateService(defaultAdapter);
