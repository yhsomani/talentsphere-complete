-- ============================================================================
-- Migration 001: Core Extensions and Enum Types
-- ============================================================================
-- Purpose: Sets up PostgreSQL extensions and all enum types used throughout
--          the TalentSphere database schema.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PostgreSQL Extensions
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- User & Role Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'candidate',
        'recruiter',
        'hiring_manager',
        'interviewer',
        'admin',
        'institution_admin',
        'instructor'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE candidate_availability_status AS ENUM (
        'available',
        'employed',
        'open_to_work',
        'not_interested'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE profile_visibility AS ENUM (
        'public',
        'connections',
        'private'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Skill & Proficiency Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE skill_proficiency_level AS ENUM (
        'beginner',
        'intermediate',
        'advanced',
        'expert'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Job-Related Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM (
        'full_time',
        'part_time',
        'contract',
        'internship',
        'apprenticeship'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_mode AS ENUM (
        'onsite',
        'remote',
        'hybrid'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM (
        'draft',
        'active',
        'paused',
        'closed',
        'filled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM (
        'entry',
        'mid',
        'senior',
        'lead',
        'principal',
        'executive'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Application & Hiring Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'submitted',
        'screening',
        'under_review',
        'interview_scheduled',
        'interviewed',
        'offer_extended',
        'offer_accepted',
        'offer_declined',
        'rejected',
        'withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE scorecard_decision AS ENUM (
        'strong_yes',
        'yes',
        'no',
        'strong_no'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Learning & Course Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE course_level AS ENUM (
        'beginner',
        'intermediate',
        'advanced',
        'all_levels'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM (
        'video',
        'text',
        'quiz',
        'assignment',
        'interactive',
        'download'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM (
        'enrolled',
        'in_progress',
        'completed',
        'dropped',
        'expired',
        'active'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE certificate_status AS ENUM (
        'pending',
        'issued',
        'revoked',
        'expired'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Challenge & Assessment Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE challenge_type AS ENUM (
        'coding',
        'multiple_choice',
        'practical',
        'portfolio_review',
        'take_home'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE challenge_status AS ENUM (
        'draft',
        'published',
        'archived',
        'deprecated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE challenge_difficulty AS ENUM (
        'easy',
        'medium',
        'hard',
        'expert'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM (
        'pending',
        'passed',
        'failed',
        'compilation_error',
        'timeout',
        'runtime_error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Gamification Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE xp_source AS ENUM (
        'profile_completion',
        'skill_verification',
        'challenge_completed',
        'course_completed',
        'job_applied',
        'job_posted',
        'application_received',
        'interview_completed',
        'job_hired',
        'referral',
        'badge_earned',
        'daily_login',
        'streak_milestone',
        'community_contribution',
        'content_created',
        'review_submitted'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE badge_category AS ENUM (
        'skill',
        'achievement',
        'milestone',
        'social',
        'learning',
        'challenge',
        'job_search',
        'special'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Notification & Messaging Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'system',
        'application_update',
        'job_recommendation',
        'message_received',
        'challenge_result',
        'course_enrollment',
        'assignment_grade',
        'badge_earned',
        'level_up',
        'mention',
        'invitation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM (
        'in_app',
        'email',
        'push',
        'sms'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_status AS ENUM (
        'sent',
        'delivered',
        'read',
        'deleted'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- B2B & Institutional Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE license_type AS ENUM (
        'trial',
        'standard',
        'premium',
        'enterprise'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE license_status AS ENUM (
        'active',
        'suspended',
        'expired',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cohort_status AS ENUM (
        'draft',
        'active',
        'completed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Analytics & Audit Enums
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM (
        'auth',
        'profile',
        'job',
        'application',
        'challenge',
        'course',
        'messaging',
        'notification',
        'gamification',
        'admin',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'create',
        'read',
        'update',
        'delete',
        'restore',
        'export',
        'import'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- LMS Enums (for Migration 004)
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE course_category AS ENUM (
        'development',
        'design',
        'business',
        'data_science',
        'marketing',
        'devops',
        'security',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lesson_content_type AS ENUM (
        'video',
        'text',
        'quiz',
        'assignment',
        'interactive',
        'download',
        'code_challenge'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quiz_question_type AS ENUM (
        'multiple_choice',
        'true_false',
        'short_answer',
        'code_completion',
        'matching'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Gamification & Messaging Enums (for Migration 006)
-- ----------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE xp_transaction_type AS ENUM (
        'signup_bonus',
        'profile_milestone',
        'profile_complete',
        'skill_verification',
        'challenge_completed',
        'course_completed',
        'job_applied',
        'job_posted',
        'application_received',
        'interview_completed',
        'job_hired',
        'referral',
        'badge_earned',
        'daily_login',
        'streak_milestone',
        'community_contribution',
        'content_created',
        'review_submitted'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leaderboard_period AS ENUM (
        'daily',
        'weekly',
        'monthly',
        'all_time'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE conversation_type AS ENUM (
        'direct',
        'group'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM (
        'text',
        'image',
        'file',
        'link',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- Common Timestamp Trigger Function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- End of Migration 001
-- ----------------------------------------------------------------------------
