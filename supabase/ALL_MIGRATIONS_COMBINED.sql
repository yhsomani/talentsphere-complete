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
-- ============================================================================
-- Migration 002: Users and Organizations
-- ============================================================================
-- Purpose: Creates core user management tables, organization structure,
--          candidate profiles, skills, and related entities.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Organizations Table
-- ----------------------------------------------------------------------------

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'company',
    industry VARCHAR(100),
    size VARCHAR(50),
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    headquarters_location VARCHAR(255),
    founded_year INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT organizations_type_check CHECK (type IN ('company', 'institution', 'nonprofit', 'government', 'startup'))
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_industry ON organizations(industry);

-- ----------------------------------------------------------------------------
-- Users Table (extends auth.users)
-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    role user_role NOT NULL DEFAULT 'candidate',
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    phone VARCHAR(50),
    timezone VARCHAR(50),
    locale VARCHAR(10) DEFAULT 'en',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_role_check CHECK (role IN (
        'candidate', 'recruiter', 'hiring_manager', 'interviewer', 
        'admin', 'institution_admin', 'instructor'
    ))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ----------------------------------------------------------------------------
-- Candidate Profiles Table
-- ----------------------------------------------------------------------------

CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    summary TEXT,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    location_remote BOOLEAN DEFAULT TRUE,
    availability_status candidate_availability_status DEFAULT 'open_to_work',
    profile_visibility profile_visibility DEFAULT 'public',
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    twitter_url VARCHAR(255),
    website_url VARCHAR(255),
    years_of_experience INTEGER,
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    preferred_job_types job_type[],
    preferred_work_modes work_mode[],
    preferred_experience_levels experience_level[],
    profile_completion_percentage INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT candidate_profiles_availability_check CHECK (availability_status IN (
        'available', 'employed', 'open_to_work', 'not_interested'
    )),
    CONSTRAINT candidate_profiles_visibility_check CHECK (profile_visibility IN (
        'public', 'connections', 'private'
    ))
);

CREATE INDEX idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_location ON candidate_profiles(location_city, location_country);
CREATE INDEX idx_candidate_profiles_availability ON candidate_profiles(availability_status);
CREATE INDEX idx_candidate_profiles_visibility ON candidate_profiles(profile_visibility);
CREATE INDEX idx_candidate_profiles_headline_fts ON candidate_profiles USING GIN(to_tsvector('english', headline || ' ' || COALESCE(summary, '')));

-- ----------------------------------------------------------------------------
-- Skills Taxonomy Table
-- ----------------------------------------------------------------------------

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    parent_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_parent ON skills(parent_skill_id);
CREATE INDEX idx_skills_name_fts ON skills USING GIN(to_tsvector('english', name));

-- ----------------------------------------------------------------------------
-- Candidate Skills Junction Table
-- ----------------------------------------------------------------------------

CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency skill_proficiency_level NOT NULL DEFAULT 'intermediate',
    years_of_experience INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_source VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_candidate_skill UNIQUE(candidate_profile_id, skill_id),
    CONSTRAINT candidate_skills_proficiency_check CHECK (proficiency IN (
        'beginner', 'intermediate', 'advanced', 'expert'
    ))
);

CREATE INDEX idx_candidate_skills_profile ON candidate_skills(candidate_profile_id);
CREATE INDEX idx_candidate_skills_skill ON candidate_skills(skill_id);
CREATE INDEX idx_candidate_skills_verified ON candidate_skills(is_verified);

-- ----------------------------------------------------------------------------
-- Experience Table
-- ----------------------------------------------------------------------------

CREATE TABLE experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    employment_type job_type,
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    location_remote BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    achievements TEXT[],
    skills_used UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT experience_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_experience_profile ON experience(candidate_profile_id);
CREATE INDEX idx_experience_company ON experience(company_id);
CREATE INDEX idx_experience_dates ON experience(start_date, end_date);
CREATE INDEX idx_experience_current ON experience(is_current);

-- ----------------------------------------------------------------------------
-- Education Table
-- ----------------------------------------------------------------------------

CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    institution_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    degree_type VARCHAR(100),
    field_of_study VARCHAR(255),
    grade VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    activities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT education_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_education_profile ON education(candidate_profile_id);
CREATE INDEX idx_education_institution ON education(institution_id);
CREATE INDEX idx_education_dates ON education(start_date, end_date);

-- ----------------------------------------------------------------------------
-- Certifications Table
-- ----------------------------------------------------------------------------

CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_id VARCHAR(100),
    credential_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    skills_validated UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certifications_profile ON certifications(candidate_profile_id);
CREATE INDEX idx_certifications_organization ON certifications(issuing_organization);
CREATE INDEX idx_certifications_dates ON certifications(issue_date, expiration_date);

-- ----------------------------------------------------------------------------
-- Portfolio Items Table
-- ----------------------------------------------------------------------------

CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50),
    project_url VARCHAR(500),
    repository_url VARCHAR(500),
    media_urls TEXT[],
    thumbnail_url VARCHAR(500),
    tags VARCHAR(100)[],
    skills_demonstrated UUID[],
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT portfolio_items_type_check CHECK (project_type IN (
        'web_app', 'mobile_app', 'library', 'design', 'writing', 'video', 'other'
    ))
);

CREATE INDEX idx_portfolio_profile ON portfolio_items(candidate_profile_id);
CREATE INDEX idx_portfolio_featured ON portfolio_items(is_featured);
CREATE INDEX idx_portfolio_tags ON portfolio_items USING GIN(tags);

-- ----------------------------------------------------------------------------
-- Badges Table
-- ----------------------------------------------------------------------------

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category badge_category NOT NULL,
    icon_url VARCHAR(500),
    xp_reward INTEGER DEFAULT 0,
    criteria JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    rarity VARCHAR(50) DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT badges_category_check CHECK (category IN (
        'skill', 'achievement', 'milestone', 'social', 'learning', 'challenge', 'job_search', 'special'
    )),
    CONSTRAINT badges_rarity_check CHECK (rarity IN (
        'common', 'uncommon', 'rare', 'epic', 'legendary'
    ))
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_active ON badges(is_active);
CREATE INDEX idx_badges_rarity ON badges(rarity);

-- ----------------------------------------------------------------------------
-- Candidate Badges Junction Table
-- ----------------------------------------------------------------------------

CREATE TABLE candidate_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    context JSONB,
    
    CONSTRAINT unique_candidate_badge UNIQUE(candidate_profile_id, badge_id)
);

CREATE INDEX idx_candidate_badges_profile ON candidate_badges(candidate_profile_id);
CREATE INDEX idx_candidate_badges_badge ON candidate_badges(badge_id);
CREATE INDEX idx_candidate_badges_earned ON candidate_badges(earned_at);

-- ----------------------------------------------------------------------------
-- Auto-update triggers for updated_at columns
-- ----------------------------------------------------------------------------

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at
    BEFORE UPDATE ON candidate_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
    BEFORE UPDATE ON experience
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at
    BEFORE UPDATE ON certifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Helper function to calculate profile completion percentage
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
    completion INTEGER := 0;
    profile candidate_profiles%ROWTYPE;
BEGIN
    SELECT * INTO profile FROM candidate_profiles WHERE id = NEW.id;
    
    -- Headline (10%)
    IF profile.headline IS NOT NULL AND profile.headline != '' THEN
        completion := completion + 10;
    END IF;
    
    -- Summary (15%)
    IF profile.summary IS NOT NULL AND profile.summary != '' THEN
        completion := completion + 15;
    END IF;
    
    -- Location (5%)
    IF profile.location_city IS NOT NULL OR profile.location_country IS NOT NULL THEN
        completion := completion + 5;
    END IF;
    
    -- Experience (20%)
    IF EXISTS (SELECT 1 FROM experience WHERE candidate_profile_id = profile.id) THEN
        completion := completion + 20;
    END IF;
    
    -- Education (15%)
    IF EXISTS (SELECT 1 FROM education WHERE candidate_profile_id = profile.id) THEN
        completion := completion + 15;
    END IF;
    
    -- Skills (15%)
    IF EXISTS (SELECT 1 FROM candidate_skills WHERE candidate_profile_id = profile.id) THEN
        completion := completion + 15;
    END IF;
    
    -- Portfolio (10%)
    IF EXISTS (SELECT 1 FROM portfolio_items WHERE candidate_profile_id = profile.id) THEN
        completion := completion + 10;
    END IF;
    
    -- Resume (10%)
    IF profile.resume_url IS NOT NULL AND profile.resume_url != '' THEN
        completion := completion + 10;
    END IF;
    
    NEW.profile_completion_percentage := completion;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_profile_completion_trigger
    BEFORE INSERT OR UPDATE ON candidate_profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_profile_completion();

-- ----------------------------------------------------------------------------
-- Seed initial skills taxonomy
-- ----------------------------------------------------------------------------

INSERT INTO skills (name, category) VALUES
-- Programming Languages
('JavaScript', 'Programming Language'),
('TypeScript', 'Programming Language'),
('Python', 'Programming Language'),
('Java', 'Programming Language'),
('C#', 'Programming Language'),
('Go', 'Programming Language'),
('Rust', 'Programming Language'),
('Ruby', 'Programming Language'),
('PHP', 'Programming Language'),
('Swift', 'Programming Language'),
('Kotlin', 'Programming Language'),
('SQL', 'Programming Language'),

-- Frontend
('React', 'Frontend Framework'),
('Vue.js', 'Frontend Framework'),
('Angular', 'Frontend Framework'),
('Svelte', 'Frontend Framework'),
('Next.js', 'Frontend Framework'),
('HTML', 'Frontend'),
('CSS', 'Frontend'),
('Tailwind CSS', 'Frontend'),

-- Backend
('Node.js', 'Backend'),
('Express', 'Backend Framework'),
('Django', 'Backend Framework'),
('Flask', 'Backend Framework'),
('Spring Boot', 'Backend Framework'),
('FastAPI', 'Backend Framework'),

-- Databases
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('MongoDB', 'Database'),
('Redis', 'Database'),
('Elasticsearch', 'Database'),

-- Cloud & DevOps
('AWS', 'Cloud'),
('Azure', 'Cloud'),
('GCP', 'Cloud'),
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('Terraform', 'DevOps'),
('CI/CD', 'DevOps'),

-- Tools & Practices
('Git', 'Tools'),
('Agile', 'Methodology'),
('Scrum', 'Methodology'),
('REST API', 'Architecture'),
('GraphQL', 'Architecture'),
('Microservices', 'Architecture'),
('System Design', 'Architecture'),

-- Soft Skills
('Communication', 'Soft Skill'),
('Leadership', 'Soft Skill'),
('Problem Solving', 'Soft Skill'),
('Teamwork', 'Soft Skill');

-- ----------------------------------------------------------------------------
-- End of Migration 002
-- ----------------------------------------------------------------------------
cat: supabase/003_jobs_atl.sql: No such file or directory
-- ============================================================================
-- MIGRATION 004: Learning Management System (LMS)
-- Post-MVP Feature Set
-- ============================================================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    level course_level DEFAULT 'beginner',
    category course_category,
    estimated_hours INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    price_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course modules/sections
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type lesson_content_type NOT NULL,
    content_url TEXT,
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percentage NUMERIC(5,2) DEFAULT 0,
    status enrollment_status DEFAULT 'enrolled',
    UNIQUE(course_id, user_id)
);

-- Lesson completions
CREATE TABLE IF NOT EXISTS lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, user_id)
);

-- Course quizzes
CREATE TABLE IF NOT EXISTS course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    time_limit_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type quiz_question_type NOT NULL,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- Quiz answers
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score INTEGER DEFAULT 0,
    passed BOOLEAN,
    attempt_number INTEGER NOT NULL DEFAULT 1
);

-- Quiz responses
CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_answer_id UUID REFERENCES quiz_answers(id),
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    credential_url TEXT,
    UNIQUE(course_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_organization ON courses(organization_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

-- Updated at triggers
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

cat: supabase/005_challenges_code_arena.sql: No such file or directory
cat: supabase/006_gamification_notifications_messaging_b2b.sql: No such file or directory
-- ============================================================================
-- MIGRATION 007: Row Level Security (RLS) Policies
-- Critical Security Layer - Defense in Depth
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hiring_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is recruiter or hiring manager
CREATE OR REPLACE FUNCTION is_employer() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('recruiter', 'hiring_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is candidate
CREATE OR REPLACE FUNCTION is_candidate() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'candidate'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id() RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id 
    FROM users 
    WHERE id = auth.uid();
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================

-- Users can view their own organization
CREATE POLICY org_view_own ON organizations
    FOR SELECT
    USING (
        id = get_user_organization_id()
        OR is_admin()
    );

-- Only admins can create organizations
CREATE POLICY org_insert_admin ON organizations
    FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update organizations
CREATE POLICY org_update_admin ON organizations
    FOR UPDATE
    USING (is_admin());

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY users_view_own ON users
    FOR SELECT
    USING (id = auth.uid());

-- Users can view other users in same organization
CREATE POLICY users_view_org ON users
    FOR SELECT
    USING (
        organization_id = get_user_organization_id()
        OR is_admin()
    );

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (id = auth.uid());

-- ============================================================================
-- CANDIDATE PROFILES POLICIES
-- ============================================================================

-- Candidates can view and edit their own profile
CREATE POLICY profiles_view_own ON candidate_profiles
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY profiles_update_own ON candidate_profiles
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY profiles_insert_own ON candidate_profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Employers and admins can view all candidate profiles
CREATE POLICY profiles_view_employers ON candidate_profiles
    FOR SELECT
    USING (is_employer() OR is_admin());

-- ============================================================================
-- SKILLS POLICIES
-- ============================================================================

-- Everyone can read skills (taxonomy)
CREATE POLICY skills_view_all ON skills
    FOR SELECT
    USING (true);

-- Only admins can modify skills taxonomy
CREATE POLICY skills_modify_admin ON skills
    FOR ALL
    USING (is_admin());

-- ============================================================================
-- EXPERIENCE, EDUCATION, CERTIFICATIONS, PORTFOLIO POLICIES
-- ============================================================================

-- Users can manage their own records (via candidate_profiles)
CREATE POLICY experience_own ON experience
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = experience.candidate_profile_id
            AND candidate_profiles.user_id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY education_own ON education
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = education.candidate_profile_id
            AND candidate_profiles.user_id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY certifications_own ON certifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = certifications.candidate_profile_id
            AND candidate_profiles.user_id = auth.uid()
        )
        OR is_admin()
    );

CREATE POLICY portfolio_own ON portfolio_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = portfolio_items.candidate_profile_id
            AND candidate_profiles.user_id = auth.uid()
        )
        OR is_admin()
    );

-- ============================================================================
-- JOBS POLICIES
-- ============================================================================

-- Everyone can view published jobs
CREATE POLICY jobs_view_published ON jobs
    FOR SELECT
    USING (status = 'active' OR is_admin());

-- Employers can view their own jobs (including drafts)
CREATE POLICY jobs_view_own ON jobs
    FOR SELECT
    USING (employer_id = auth.uid() OR is_admin());

-- Employers can create jobs
CREATE POLICY jobs_insert_employer ON jobs
    FOR INSERT
    WITH CHECK (
        employer_id = auth.uid() 
        AND is_employer()
    );

-- Employers can update their own jobs
CREATE POLICY jobs_update_own ON jobs
    FOR UPDATE
    USING (employer_id = auth.uid() OR is_admin());

-- Employers can delete their own jobs
CREATE POLICY jobs_delete_own ON jobs
    FOR DELETE
    USING (employer_id = auth.uid() OR is_admin());

-- ============================================================================
-- APPLICATIONS POLICIES
-- ============================================================================

-- Candidates can view their own applications
CREATE POLICY applications_view_own ON applications
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = applications.candidate_profile_id AND candidate_profiles.user_id = auth.uid()) OR is_admin());

-- Candidates can create applications
CREATE POLICY applications_insert_own ON applications
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM candidate_profiles WHERE candidate_profiles.id = applications.candidate_profile_id AND candidate_profiles.user_id = auth.uid()));

-- Employers can view applications for their jobs
CREATE POLICY applications_view_employer ON applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.employer_id = auth.uid()
        )
        OR is_admin()
    );

-- Employers can update applications for their jobs
CREATE POLICY applications_update_employer ON applications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.employer_id = auth.uid()
        )
        OR is_admin()
    );

-- ============================================================================
-- SCORECARDS POLICIES
-- ============================================================================

-- Employers can create and view scorecards for their applications
CREATE POLICY scorecards_employer ON scorecards
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN jobs ON jobs.id = applications.job_id
            WHERE applications.id = scorecards.application_id
            AND jobs.employer_id = auth.uid()
        )
        OR is_admin()
    );

-- ============================================================================
-- XP LEDGER POLICIES
-- ============================================================================

-- Users can view their own XP ledger
CREATE POLICY xp_ledger_view_own ON xp_ledger
    FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

-- System can insert XP records (via service role or trigger)
CREATE POLICY xp_ledger_insert_system ON xp_ledger
    FOR INSERT
    WITH CHECK (true); -- Handled by application logic

-- ============================================================================
-- USER LEVELS POLICIES
-- ============================================================================

-- Users can view their own level
CREATE POLICY user_levels_view_own ON user_levels
    FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

-- System can update levels (via trigger)
CREATE POLICY user_levels_update_system ON user_levels
    FOR UPDATE
    USING (true);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view and manage their own notifications
CREATE POLICY notifications_view_own ON notifications
    FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE
    USING (user_id = auth.uid() OR is_admin());

CREATE POLICY notifications_delete_own ON notifications
    FOR DELETE
    USING (user_id = auth.uid() OR is_admin());

-- System can insert notifications
CREATE POLICY notifications_insert_system ON notifications
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- NOTIFICATION PREFERENCES POLICIES
-- ============================================================================

-- Users can view and update their own preferences
CREATE POLICY notification_preferences_own ON notification_preferences
    FOR ALL
    USING (user_id = auth.uid() OR is_admin());

-- ============================================================================
-- CONVERSATIONS & MESSAGES POLICIES
-- ============================================================================

-- Users can view conversations they participate in
CREATE POLICY conversations_view_participant ON conversations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
        OR is_admin()
    );

-- Users can update conversations they participate in
CREATE POLICY conversations_update_participant ON conversations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
        OR is_admin()
    );

-- Users can view messages in their conversations
CREATE POLICY messages_view_participant ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            JOIN conversations c ON c.id = messages.conversation_id
            WHERE cp.conversation_id = c.id
            AND cp.user_id = auth.uid()
        )
        OR is_admin()
        OR sender_id = auth.uid()
    );

-- Users can send messages in their conversations
CREATE POLICY messages_insert_participant ON messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

-- ============================================================================
-- CHALLENGES POLICIES
-- ============================================================================

-- Everyone can view published challenges
CREATE POLICY challenges_view_published ON challenges
    FOR SELECT
    USING (is_published = TRUE OR is_admin());

-- Authors can view their own challenges
CREATE POLICY challenges_view_author ON challenges
    FOR SELECT
    USING (author_id = auth.uid() OR is_admin());

-- Authenticated users can create challenges
CREATE POLICY challenges_insert_auth ON challenges
    FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- Authors can update their own challenges
CREATE POLICY challenges_update_author ON challenges
    FOR UPDATE
    USING (author_id = auth.uid() OR is_admin());

-- ============================================================================
-- CHALLENGE SUBMISSIONS POLICIES
-- ============================================================================

-- Users can view their own submissions
CREATE POLICY submissions_view_own ON challenge_submissions
    FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

-- Users can create submissions
CREATE POLICY submissions_insert_own ON challenge_submissions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- CHALLENGE ATTEMPTS POLICIES
-- ============================================================================

-- Users can view their own attempts
CREATE POLICY attempts_view_own ON challenge_attempts
    FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

-- System can track attempts
CREATE POLICY attempts_upsert_system ON challenge_attempts
    FOR ALL
    USING (true);

cat: supabase/008_auth_triggers_xp_functions.sql: No such file or directory
