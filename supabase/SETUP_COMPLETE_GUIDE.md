# TalentSphere Database Setup Guide

## Quick Start (Recommended)

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase project**: https://supabase.com/dashboard/project/qumgxoscwrygwykbojym

2. **Open SQL Editor**: Click "SQL Editor" in the left sidebar

3. **Run the combined migration**: 
   - Open `/workspace/supabase/ALL_MIGRATIONS_COMBINED.sql`
   - Copy the ENTIRE content (2619 lines)
   - Paste into Supabase SQL Editor
   - Click "Run" to execute all migrations at once

   OR run individual files in order:
   - `001_core_extensions_enums.sql`
   - `002_users_organizations.sql`
   - `003_jobs_applications.sql`
   - `004_lms.sql`
   - `005_challenges.sql`
   - `006_gamification_notifications.sql`
   - `007_rls_policies.sql`
   - `008_auth_trigger_functions.sql`

4. **Create Storage Buckets**: Go to Storage → Create bucket
   - `avatars` (Public)
   - `resumes` (Private)
   - `course-content` (Private)
   - `portfolio` (Public)
   - `media-assets` (Private)

5. **Configure Authentication**: Go to Authentication → Providers
   - Enable Email provider
   - Set Site URL: `https://qumgxoscwrygwykbojym.supabase.co`
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`
     - `https://your-production-domain.com/auth/callback`

### Option 2: Using Supabase CLI

```bash
# Login to Supabase (opens browser for authentication)
supabase login

# Link to your project
supabase link --project-ref qumgxoscwrygwykbojym

# Push all migrations to production
supabase db push
```

**Note**: CLI requires authentication. If you encounter issues, use Option 1 (Dashboard).

### Option 3: Manual SQL Execution

Copy the complete SQL from below and run it in Supabase SQL Editor.

---

## Complete SQL Migration (All-in-One)

**Recommended**: Use the combined migration file at `/workspace/supabase/ALL_MIGRATIONS_COMBINED.sql`

This file contains all 8 migrations combined into a single script (2619 lines). Simply:

1. Open the file in your text editor
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. Go to Supabase Dashboard → SQL Editor
4. Paste and Run (Ctrl+V, then click "Run")

The combined script includes:
- PostgreSQL extensions (uuid-ossp, pgcrypto)
- All 25+ enum types
- All tables (users, organizations, profiles, jobs, applications, courses, challenges, etc.)
- Row-Level Security policies
- Authentication triggers and XP functions

---

## Verification Steps

After running migrations, verify the setup:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if enums were created
SELECT typname 
FROM pg_type 
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid  
GROUP BY typname 
ORDER BY typname;

-- Count records (should be 0 initially)
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'candidate_profiles', COUNT(*) FROM candidate_profiles
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations;
```

---

## Storage Bucket Setup

### Using Supabase Dashboard

1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Create these buckets:

| Bucket Name | Visibility | Purpose |
|------------|------------|---------|
| `avatars` | Public | User profile pictures |
| `resumes` | Private | Candidate resumes (PDF/DOC) |
| `course-content` | Private | Course materials |
| `portfolio` | Public | Portfolio projects/media |
| `media-assets` | Private | HLS chunked media, async interview videos |

### Using SQL (Alternative)

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('resumes', 'resumes', false),
  ('course-content', 'course-content', false),
  ('portfolio', 'portfolio', true),
  ('media-assets', 'media-assets', false);
```

### RLS Policies for Storage

```sql
-- Avatars: Anyone can read, only owners can upload
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Resumes: Only authenticated users can read/write their own
CREATE POLICY "Users can read own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Portfolio: Anyone can read, owners can upload
CREATE POLICY "Anyone can read portfolio"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload own portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Environment Variables

Update your `.env.local` file with your Supabase credentials:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit .env.local with your actual values
# Get these from: https://supabase.com/dashboard/project/qumgxoscwrygwykbojym/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://qumgxoscwrygwykbojym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-from-dashboard>
```

---

## Testing the Setup

After completing all steps, test the connection:

1. **Start the development server**:
   ```bash
   npm install
   npm run dev
   ```

2. **Visit**: http://localhost:3000

3. **Try signing up** as a new candidate

4. **Complete your profile** with avatar and resume upload

5. **Verify** XP points are awarded for profile completion

---

## Troubleshooting

### Common Issues

**Error: "relation already exists"**
- Migrations were already run. This is fine if tables exist.

**Error: "permission denied"**
- Ensure you're logged in as the project owner
- Try running migrations in the SQL Editor instead of CLI

**File upload fails**
- Verify storage buckets exist
- Check RLS policies are applied
- Ensure bucket names match exactly

**Authentication redirect loop**
- Verify redirect URLs are configured in Supabase Dashboard
- Check SITE_URL in environment variables

---

## Next Steps After Setup

Once database is ready:

1. ✅ Test candidate profile completion
2. ⏳ Implement job board pages (ready to deploy)
3. ⏳ Add application tracking
4. ⏳ Build company profiles
5. ⏳ Launch Code Arena features

---

**Project Reference**: `qumgxoscwrygwykbojym`  
**Dashboard**: https://supabase.com/dashboard/project/qumgxoscwrygwykbojym  
**API Docs**: https://supabase.com/docs/reference
