# TalentSphere Database Setup Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **New Project**: Create a new project in Supabase Dashboard
3. **Wait for provisioning**: Wait 2-3 minutes for database to be ready

## Step-by-Step Setup

### Option A: Manual Setup (Recommended for first-time)

#### 1. Get Your Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **API**
3. Copy the following values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` key (keep this secret!)

#### 2. Configure Environment Variables

```bash
cd /workspace
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3. Apply Database Migrations

**IMPORTANT**: Run migrations in **EXACT ORDER** (001 → 008)

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open each migration file and paste contents:
   - `supabase/001_core_extensions_enums.sql` → Run
   - `supabase/002_users_organizations.sql` → Run
   - `supabase/003_jobs_applications.sql` → Run
   - `supabase/004_lms.sql` → Run
   - `supabase/005_challenges.sql` → Run
   - `supabase/006_gamification_notifications.sql` → Run
   - `supabase/007_rls_policies.sql` → Run
   - `supabase/008_auth_trigger_functions.sql` → Run

✅ Each migration should complete without errors. If you see errors, check:
- Migrations are run in correct order
- No typos in SQL
- Database extensions are enabled

#### 4. Create Storage Buckets

Go to **Storage** in Supabase Dashboard and create these buckets:

| Bucket Name | Privacy | Purpose |
|-------------|---------|---------|
| `avatars` | Public | User profile pictures |
| `resumes` | Private | Candidate resumes (PDF/DOC) |
| `course-content` | Private | LMS course materials |
| `portfolio` | Public | Candidate portfolio items |

**For each bucket:**

1. Click **Create bucket**
2. Enter the exact name (e.g., `avatars`)
3. Set privacy level as shown above
4. Click **Create**

**Add RLS Policies:**

After creating buckets, add policies for each:

**avatars bucket:**
```sql
-- Allow anyone to read avatars
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "User Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatar
CREATE POLICY "User Update Access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**resumes bucket:**
```sql
-- Allow users to read/write their own resumes
CREATE POLICY "User Resume Access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow recruiters to read resumes of applicants (via applications)
CREATE POLICY "Recruiter Read Access" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.recruiter_id = auth.uid()
    )
  );
```

**course-content bucket:**
```sql
-- Only instructors/admins can upload
CREATE POLICY "Instructor Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-content' AND 
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('instructor', 'admin')
    )
  );

-- Enrolled students can read
CREATE POLICY "Student Read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-content' AND 
    EXISTS (
      SELECT 1 FROM course_enrollments ce
      WHERE ce.student_id = auth.uid()
    )
  );
```

**portfolio bucket:**
```sql
-- Public read access
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

-- Users can manage their own portfolio
CREATE POLICY "User Portfolio Access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'portfolio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

#### 5. Configure Authentication

Go to **Authentication** → **Providers**:

1. **Email Provider**: Enable (should be on by default)
2. **Site URL**: Set to `http://localhost:3000` (or your production URL)
3. **Redirect URLs**: Add these:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/verify-email`

**Email Templates** (Optional but recommended):

Go to **Authentication** → **Email Templates**:

1. **Confirm Signup**: Customize welcome email
2. **Reset Password**: Customize reset email
3. **Email Change**: Customize confirmation email

Example template for signup confirmation:

```html
<h2>Welcome to TalentSphere!</h2>
<p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
<p>Or copy this link: {{ .ConfirmationURL }}</p>
```

#### 6. Verify Setup

Run these checks in SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check enums exist
SELECT typname FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;

-- Check storage buckets
SELECT name, owner, public FROM storage.buckets;

-- Count records (should be 0 initially)
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM organizations) as orgs,
  (SELECT COUNT(*) FROM candidate_profiles) as profiles;
```

Expected results:
- 40+ tables listed
- 25+ enum types listed
- 4 storage buckets (avatars, resumes, course-content, portfolio)
- All counts should be 0

### Option B: Automated Setup (Alternative)

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push all migrations
supabase db push
```

Then manually create storage buckets via Dashboard (CLI doesn't support bucket creation yet).

## Troubleshooting

### Migration Errors

**Error: "relation already exists"**
- Solution: You've already run this migration. Skip it or drop the table first.

**Error: "type already exists"**
- Solution: Enums persist across migrations. This is normal, skip the error.

**Error: "permission denied"**
- Solution: Make sure you're using the service_role key for migrations.

### Storage Bucket Errors

**Error: "Bucket already exists"**
- Solution: Bucket names are globally unique. Choose a different name or delete the existing one.

**Error: "RLS policy already exists"**
- Solution: Drop the existing policy first: `DROP POLICY IF EXISTS "policy_name" ON storage.objects;`

### Authentication Issues

**Emails not sending**
- Check: Supabase email quota (free tier: 100 emails/month)
- Consider: Using custom SMTP for production

**Redirect URL mismatch**
- Solution: Add your exact redirect URL in Auth → URL Configuration

## Next Steps After Setup

1. ✅ Test signup flow: `http://localhost:3000/auth/signup`
2. ✅ Verify email confirmation works
3. ✅ Login and reach dashboard
4. ✅ Complete candidate profile with avatar upload
5. ✅ Test resume upload functionality

## Support

- Documentation: `/supabase/README.md`
- Schema reference: `/supabase/SCHEMA_REFERENCE.md`
- Architecture: `/ARCHITECTURE.md`
