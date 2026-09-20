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

