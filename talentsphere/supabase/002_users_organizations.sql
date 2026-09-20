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
    skills_used UUID[] REFERENCES skills(id),
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
    skills_validated UUID[] REFERENCES skills(id),
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
    skills_demonstrated UUID[] REFERENCES skills(id),
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
