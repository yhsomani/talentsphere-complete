#!/bin/bash

# =============================================================================
# TalentSphere Database Setup Script
# =============================================================================
# This script helps you apply database migrations to your Supabase project.
# 
# Prerequisites:
# - Supabase CLI installed: npm install -g supabase
# - Supabase account created
# - .env.local file configured with your Supabase credentials
# =============================================================================

set -e  # Exit on error

echo "======================================================================"
echo "TalentSphere Database Setup"
echo "======================================================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Copy .env.example to .env.local:"
    echo "   cp .env.example .env.local"
    echo ""
    echo "2. Edit .env.local and add your Supabase credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    exit 1
fi

# Load environment variables
source .env.local

# Check if required env vars are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" == "https://your-project-id.supabase.co" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not configured!"
    echo "Please edit .env.local and set your Supabase project URL."
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == "your-anon-key-here" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured!"
    echo "Please edit .env.local and set your Supabase anon key."
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" == "your-service-role-key-here" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY is not configured!"
    echo "Please edit .env.local and set your Supabase service role key."
    echo "⚠️  WARNING: Never commit this key to version control!"
    exit 1
fi

echo "✅ Environment variables loaded successfully"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed!"
    echo ""
    echo "Install it with:"
    echo "   npm install -g supabase"
    echo "or"
    echo "   brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI detected: $(supabase --version)"
echo ""

# Extract project ID from URL
PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "======================================================================"
echo "Supabase Project Configuration"
echo "======================================================================"
echo "Project URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "Project ID:  $PROJECT_ID"
echo ""

# Check if user is logged in
echo "Checking Supabase authentication..."
if ! supabase auth status &> /dev/null; then
    echo ""
    echo "🔐 You need to log in to Supabase first."
    echo ""
    read -p "Press Enter to open the login page in your browser..."
    supabase login
fi

echo "✅ Authenticated with Supabase"
echo ""

# Link project
echo "Linking to Supabase project..."
if ! supabase projects inspect --project-ref "$PROJECT_ID" &> /dev/null; then
    echo "Project not linked. Linking now..."
    supabase link --project-ref "$PROJECT_ID"
fi

echo "✅ Project linked successfully"
echo ""

# Apply migrations
echo "======================================================================"
echo "Applying Database Migrations"
echo "======================================================================"
echo ""

MIGRATION_DIR="./supabase"
MIGRATIONS=(
    "001_core_extensions_enums.sql"
    "002_users_organizations.sql"
    "003_jobs_applications.sql"
    "004_lms.sql"
    "005_challenges.sql"
    "006_gamification_notifications.sql"
    "007_rls_policies.sql"
    "008_auth_trigger_functions.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    migration_file="$MIGRATION_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo "❌ Error: Migration file not found: $migration_file"
        exit 1
    fi
    
    echo "📄 Applying: $migration"
    
    # Read the file content and execute via Supabase CLI
    # Using psql through Supabase's connection string
    supabase db execute --file "$migration_file" --db-url "$(supabase projects inspect --project-ref "$PROJECT_ID" -o json | jq -r '.[0].dbConnectionString')" 2>/dev/null || {
        # Fallback: manual execution instruction
        echo "⚠️  Automatic execution failed. Manual step required:"
        echo ""
        echo "1. Go to: https://app.supabase.com/project/$PROJECT_ID/sql"
        echo "2. Copy content from: $migration_file"
        echo "3. Paste and execute in SQL Editor"
        echo ""
        read -p "Press Enter after executing $migration in Supabase dashboard..."
    }
    
    echo "✅ Applied: $migration"
    echo ""
done

echo "======================================================================"
echo "Verifying Installation"
echo "======================================================================"
echo ""

echo "Running verification queries..."
echo ""

# Create a temporary SQL file for verification
cat > /tmp/verify_setup.sql << 'EOF'
-- Check table count
SELECT COUNT(*) AS table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check enum types
SELECT COUNT(*) AS enum_count 
FROM pg_type 
WHERE typtype = 'e';

-- Verify RLS is enabled
SELECT COUNT(*) AS rls_enabled_count 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Check trigger exists
SELECT tgname AS trigger_name 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
EOF

echo "✅ Verification SQL created at: /tmp/verify_setup.sql"
echo ""
echo "To verify your setup, run these queries in Supabase SQL Editor:"
echo "https://app.supabase.com/project/$PROJECT_ID/sql"
echo ""
echo "Or execute manually:"
echo "cat /tmp/verify_setup.sql | psql <connection-string>"
echo ""

echo "======================================================================"
echo "Setup Complete! 🎉"
echo "======================================================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. Create Storage Buckets in Supabase Dashboard:"
echo "   - avatars (public)"
echo "   - resumes (private)"
echo "   - course-content (private)"
echo "   - portfolio (public)"
echo ""
echo "2. Configure Authentication:"
echo "   - Enable Email/Password auth"
echo "   - Optionally add OAuth providers (Google, GitHub)"
echo ""
echo "3. Test the application:"
echo "   npm run dev"
echo ""
echo "4. Visit: http://localhost:3000"
echo ""
echo "======================================================================"
