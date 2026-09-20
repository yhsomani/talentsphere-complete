-- ============================================================================
-- MIGRATION 006: Gamification, Notifications & Messaging
-- Core Engagement Features
-- ============================================================================

-- XP Ledger (immutable record of all XP transactions)
CREATE TABLE IF NOT EXISTS xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type xp_transaction_type NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id UUID,
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User levels progress
CREATE TABLE IF NOT EXISTS user_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    level_progress NUMERIC(5,2) DEFAULT 0,
    xp_to_next_level INTEGER NOT NULL,
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    last_level_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard entries (updated periodically)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period leaderboard_period NOT NULL,
    year INTEGER NOT NULL,
    week INTEGER,
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period, year, week)
);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type notification_channel NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    link_label VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    channel notification_channel,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    application_updates BOOLEAN DEFAULT TRUE,
    job_alerts BOOLEAN DEFAULT TRUE,
    messages BOOLEAN DEFAULT TRUE,
    system_announcements BOOLEAN DEFAULT TRUE,
    gamification_updates BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (messaging)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type conversation_type NOT NULL DEFAULT 'direct',
    subject VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type message_type NOT NULL DEFAULT 'text',
    attachments JSONB DEFAULT '[]'::jsonb,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reads
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created ON xp_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_user_levels_user ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period, year, week);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries(score DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Updated at triggers
CREATE TRIGGER update_user_levels_updated_at BEFORE UPDATE ON user_levels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed notification templates
INSERT INTO notification_templates (name, type, subject_template, body_template, variables) VALUES
    ('welcome', 'in_app', NULL, 'Welcome to TalentSphere! Get started by completing your profile.', '{}'),
    ('application_received', 'email', 'Application Received for {job_title}', 'Your application for {job_title} has been received.', '{job_title, company_name}'),
    ('application_status_change', 'email', 'Application Update: {status}', 'Your application status has been updated to: {status}.', '{status, job_title}'),
    ('new_message', 'in_app', NULL, 'You have a new message from {sender_name}.', '{sender_name}'),
    ('challenge_completed', 'in_app', NULL, 'Congratulations! You completed the {challenge_title} challenge and earned {xp} XP!', '{challenge_title, xp}'),
    ('level_up', 'in_app', NULL, 'Level Up! You are now level {level}!', '{level}'),
    ('interview_scheduled', 'email', 'Interview Scheduled', 'Your interview for {job_title} has been scheduled.', '{job_title, interview_time}')
ON CONFLICT (name) DO NOTHING;

