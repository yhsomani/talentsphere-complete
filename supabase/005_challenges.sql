-- ============================================================================
-- MIGRATION 005: Code Arena / Assessment Challenges
-- Core MVP Feature Set
-- ============================================================================

-- Challenge categories
CREATE TABLE IF NOT EXISTS challenge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    order_index INTEGER DEFAULT 0
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES challenge_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty challenge_difficulty NOT NULL DEFAULT 'easy',
    programming_language VARCHAR(50) NOT NULL,
    starter_code TEXT,
    solution_template TEXT,
    test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
    time_limit_ms INTEGER DEFAULT 5000,
    memory_limit_mb INTEGER DEFAULT 256,
    xp_reward INTEGER NOT NULL DEFAULT 100,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    hints TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge submissions
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status submission_status NOT NULL DEFAULT 'pending',
    execution_result JSONB,
    test_results JSONB,
    passed_tests INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    memory_used_mb INTEGER,
    error_message TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge attempts tracking (for limits and stats)
CREATE TABLE IF NOT EXISTS challenge_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    attempts_count INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT FALSE,
    UNIQUE(challenge_id, user_id)
);

-- Challenge comments/discussions
CREATE TABLE IF NOT EXISTS challenge_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES challenge_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_solution_hint BOOLEAN DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge test cases (detailed)
CREATE TABLE IF NOT EXISTS challenge_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- Challenge ratings/reviews
CREATE TABLE IF NOT EXISTS challenge_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenges_author ON challenges(author_id);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category_id);
CREATE INDEX IF NOT EXISTS idx_challenges_slug ON challenges(slug);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_language ON challenges(programming_language);
CREATE INDEX IF NOT EXISTS idx_challenges_published ON challenges(is_published);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON challenges(is_featured);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge_user ON challenge_attempts(challenge_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_challenge ON challenge_comments(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ratings_challenge ON challenge_ratings(challenge_id);

-- Updated at triggers
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_comments_updated_at BEFORE UPDATE ON challenge_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_ratings_updated_at BEFORE UPDATE ON challenge_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed challenge categories
INSERT INTO challenge_categories (name, slug, description, order_index) VALUES
    ('Algorithms', 'algorithms', 'Classic algorithm challenges', 1),
    ('Data Structures', 'data-structures', 'Arrays, trees, graphs, and more', 2),
    ('Web Development', 'web-development', 'Frontend and backend challenges', 3),
    ('Database', 'database', 'SQL and NoSQL challenges', 4),
    ('System Design', 'system-design', 'Architecture and design problems', 5),
    ('Security', 'security', 'Security and cryptography challenges', 6)
ON CONFLICT (slug) DO NOTHING;

