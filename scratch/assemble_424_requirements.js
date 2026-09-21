const fs = require('fs');
const path = require('path');

const specContent = fs.readFileSync('TalentSphere Project & Product Specification.md', 'utf8');
const specLines = specContent.split('\n');

function extractTableRows(startLine, endLine, idRegex) {
  const rows = [];
  for (let i = startLine - 1; i < Math.min(endLine, specLines.length); i++) {
    const line = specLines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).slice(1, -1);
      if (cells.length >= 2 && idRegex.test(cells[0])) {
        rows.push({
          id: cells[0],
          name: cells[1],
          priority: cells[2] || 'MVP',
          specStatus: cells[3] || 'CONFIRMED',
          sourceLine: i + 1
        });
      }
    }
  }
  return rows;
}

// Master Requirements Array
const allRequirements = [];

// Raw table extractions
const rawAuth = extractTableRows(324, 345, /^AUTH-[0-9]{3}/);
const rawChall = extractTableRows(360, 385, /^CHALL-[0-9]{3}/);
const rawNet = extractTableRows(405, 425, /^NET-[0-9]{3}/);
const rawMsg = extractTableRows(428, 448, /^MSG-[0-9]{3}/);
const rawGam = extractTableRows(451, 470, /^(GAMI|GAM)-[0-9]{3}/);
const rawSrch = extractTableRows(491, 510, /^(SEARCH|SRCH)-[0-9]{3}/);
const rawNtf = extractTableRows(515, 535, /^(NOTIF|NTF)-[0-9]{3}/);
const rawBillLic = extractTableRows(548, 588, /^(BILL|LIC)-[0-9]{3}/);
const rawTru = extractTableRows(627, 650, /^(TRUST|TRU)-[0-9]{3}/);
const rawAdm = extractTableRows(657, 683, /^(ADMIN|ADM)-[0-9]{3}/);
const rawAna = extractTableRows(685, 698, /^(ANALYTICS|ANA)-[0-9]{3}/);
const rawExt = extractTableRows(700, 717, /^EXT-[0-9]{3}/);
const rawCore = extractTableRows(719, 735, /^CORE-[0-9]{3}/);
const rawInst = extractTableRows(4190, 4222, /^INST-[0-9]{3}/);
const rawMedia = extractTableRows(4242, 4293, /^MEDIA-[0-9]{3}/);
const rawSeo = extractTableRows(3046, 3066, /^SEO-[0-9]{3}/);
const rawNfr = extractTableRows(4987, 4996, /^NFR-[0-9]{2}/);

// ==========================================
// Module 1: Identity, Authentication & Account Security (AUTH-001..018) -> 18 items
// ==========================================
rawAuth.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Full implementation required';
  let verification = 'Specification review';

  if (r.id === 'AUTH-001') {
    status = 'IMPLEMENTED';
    location = 'src/app/auth/signup/page.tsx, src/app/signup/page.tsx, src/components/auth/AuthModal.tsx';
    evidence = 'User registration flow calls supabase.auth.signUp with email, password, full name, and role picker; redirects to /auth/verify';
    remaining = 'None for core MVP registration';
    verification = 'Component review & unit tests';
  } else if (r.id === 'AUTH-002') {
    status = 'IMPLEMENTED';
    location = 'src/app/auth/signin/page.tsx, src/app/login/page.tsx, src/hooks/index.ts';
    evidence = 'Login form authenticates with supabase.auth.signInWithPassword, establishes session, redirects to role-based destination';
    remaining = 'None for email/password sign-in';
    verification = 'Component review & integration test';
  } else if (r.id === 'AUTH-003') {
    status = 'IMPLEMENTED';
    location = 'src/app/auth/reset-password/page.tsx';
    evidence = 'Form connects to supabase.auth.resetPasswordForEmail with confirmation alert';
    remaining = 'None for password reset request route';
    verification = 'Route test';
  } else if (r.id === 'AUTH-004') {
    status = 'IMPLEMENTED';
    location = 'src/lib/supabase.ts, src/lib/supabase/client.ts, src/lib/supabase/server.ts';
    evidence = 'Supabase Auth is single primary session authority; singleton browser client prevents multi-instance leaks; legacy backend credentials return 410';
    remaining = 'None';
    verification = 'Live DB client calls & build';
  } else if (r.id === 'AUTH-005') {
    status = 'IMPLEMENTED';
    location = 'src/proxy.ts, src/types/database.ts';
    evidence = 'Next.js proxy middleware normalizes JWT role claims and verifies user session before route entry';
    remaining = 'None';
    verification = 'Proxy middleware inspection';
  } else if (r.id === 'AUTH-006') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/components/auth/AuthModal.tsx, src/app/auth/signin/page.tsx';
    evidence = 'OAuth buttons rendered; Supabase client configured for Google/GitHub OAuth providers';
    remaining = 'Connect production Google / GitHub OAuth client IDs and in-app Gemini consent token bridge';
    verification = 'OAuth UI test';
  } else if (r.id === 'AUTH-007') {
    status = 'IMPLEMENTED';
    location = 'src/proxy.ts, src/lib/supabase.ts';
    evidence = 'Session restore, cookie refresh, and graceful fatal error recovery wired in Supabase server helper and proxy';
    remaining = 'None';
    verification = 'Middleware check';
  } else if (r.id === 'AUTH-009') {
    status = 'IMPLEMENTED';
    location = 'src/hooks/index.ts';
    evidence = 'Dev fallback session hook supports quick multi-role role switching in non-production environments';
    remaining = 'None';
    verification = 'Dev test';
  } else if (r.id === 'AUTH-013') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/proxy.ts, Supabase Auth config';
    evidence = 'Supabase Auth default rate limits active; proxy middleware validates tokens';
    remaining = 'Upstream Redis/Edge IP-based rate limiting (10 req/min)';
    verification = 'Security check';
  } else if (r.id === 'AUTH-014') {
    status = 'IMPLEMENTED';
    location = 'src/lib/supabase.ts';
    evidence = 'Supabase GoTrue client automatically manages background refresh token rotation';
    remaining = 'None';
    verification = 'Client audit';
  } else if (r.id === 'AUTH-018') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'supabase/migrations/002_users_organizations.sql, src/types/database.ts';
    evidence = 'Profile schema supports account roles and institutional linkage';
    remaining = 'UI badges for INDEPENDENT / MANAGED / GRADUATION_PENDING / ALUMNI accounts';
    verification = 'DB schema verification';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 1: Identity & Authentication',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.1 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 2: Candidate Profile, Career Identity & Portfolio (14 items)
// ==========================================
const module2Defs = [
  { id: 'PROFILE-001', name: 'Candidate Profile Overview & Container', desc: 'Responsive profile layout container composing personal bio, sub-entities, and career metrics', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/candidates/profile/page.tsx, src/app/profile/page.tsx', evid: 'Route renders DashboardLayout with ProfileHeader, ProfileForm, and Sub-entity sections', rem: 'None', ver: 'Page route inspection' },
  { id: 'PROFILE-002', name: 'Profile Form Fields & Persistence', desc: 'Headline, bio, location, timezone, availability, and visibility flags persisting to candidate_profiles', priority: 'MVP', status: 'IMPLEMENTED', loc: 'ProfileForm.tsx, candidate.service.ts', evid: 'Form fields bind to state and save via upsertProfile matching live PostgreSQL schema', rem: 'None', ver: 'Integration test' },
  { id: 'PROFILE-003', name: 'Avatar Upload & Storage', desc: 'Upload profile image to avatars storage bucket with CDN URL persistence', priority: 'MVP', status: 'IMPLEMENTED', loc: 'ProfileHeader.tsx, candidate.service.ts', evid: 'File input uploads image to Supabase avatars bucket and updates profile avatar_url', rem: 'None', ver: 'Storage test' },
  { id: 'PROFILE-004', name: 'Skills Management & Proficiency', desc: 'Add, view, and remove skills with proficiency levels linked to candidate_skills taxonomy', priority: 'MVP', status: 'IMPLEMENTED', loc: 'SkillsSection.tsx, candidate.service.ts', evid: 'Interactive skills modal with proficiency selector persisting to candidate_skills table', rem: 'None', ver: 'Integration test' },
  { id: 'PROFILE-005', name: 'Work Experience Management', desc: 'Add, edit, delete work experience entries with start/end dates, role, and current position toggle', priority: 'MVP', status: 'IMPLEMENTED', loc: 'ExperienceSection.tsx, candidate.service.ts', evid: 'Wired to experience table with foreign key candidate_profile_id; 29 tests passing', rem: 'None', ver: 'Test suite passing' },
  { id: 'PROFILE-006', name: 'Education Management', desc: 'Add, edit, delete educational qualifications with degree, institution, and graduation year', priority: 'MVP', status: 'IMPLEMENTED', loc: 'EducationSection.tsx, candidate.service.ts', evid: 'Wired to education table with foreign key candidate_profile_id; 29 tests passing', rem: 'None', ver: 'Test suite passing' },
  { id: 'PROFILE-007', name: 'Certifications Management', desc: 'Add, view, and delete professional certifications with issuing organization and credential ID', priority: 'MVP', status: 'IMPLEMENTED', loc: 'CertificationsSection.tsx, candidate.service.ts', evid: 'Wired to certifications table with foreign key candidate_profile_id', rem: 'None', ver: 'Test suite passing' },
  { id: 'PROFILE-008', name: 'Aggregate Sub-Entity Loading', desc: 'Parallel asynchronous fetching of all sub-entities (experience, education, skills, certs, portfolio)', priority: 'MVP', status: 'IMPLEMENTED', loc: 'candidate.service.ts, useCandidateProfile.ts', evid: 'Promise.all loads all 5 sub-entity collections on candidate profile mount', rem: 'None', ver: 'Test suite passing' },
  { id: 'PROFILE-009', name: 'Public Candidate Profile View', desc: 'Public or recruiter-facing view of candidate profile respecting privacy flags', priority: 'Post-MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/candidates/[id]/page.tsx', evid: 'Route exists and fetches public profile data', rem: 'Employer view with contact candidate action and verified signal badges', ver: 'Route test' },
  { id: 'PROFILE-010', name: 'Profile Completeness Meter & Suggestions', desc: 'Dynamic completeness percentage indicator with actionable recommendations to reach 100%', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/dashboard/page.tsx', evid: 'Dashboard computes completeness based on filled profile fields', rem: 'Actionable suggestion drawer in profile edit page', ver: 'UI test' },
  { id: 'RESUME-001', name: 'Resume Upload & Storage Attachment', desc: 'Upload PDF resume to resumes storage bucket and link URL to candidate profile', priority: 'MVP', status: 'IMPLEMENTED', loc: 'ProfileForm.tsx, candidate.service.ts', evid: 'File upload stores PDF in resumes bucket and saves URL in candidate_profiles.resume_url', rem: 'None', ver: 'Storage & DB test' },
  { id: 'RESUME-002', name: 'Multi-Version Resume Management', desc: 'Store multiple targeted resumes with customized labels for different job roles', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'supabase/migrations/002_users_organizations.sql', evid: 'Storage bucket configured; primary resume linked', rem: 'Multi-resume selector and version naming UI', ver: 'Spec audit' },
  { id: 'RESUME-003', name: 'Resume PDF Parser & Preview', desc: 'In-app PDF preview and automatic structured text parsing for profile autofill', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'RecruiterPipelineBoard.tsx', evid: 'Inline resume drawer displays resume PDF link and preview', rem: 'AI-assisted resume parsing to auto-populate profile fields', ver: 'Component test' },
  { id: 'PORTFOLIO-001', name: 'Portfolio Projects Management', desc: 'Add, edit, delete portfolio projects with project URL, github link, media, and description', priority: 'MVP', status: 'IMPLEMENTED', loc: 'PortfolioSection.tsx, candidate.service.ts', evid: 'Wired to portfolio_items table matching PostgreSQL schema with project_type and media_urls', rem: 'None', ver: 'Test suite passing' }
];

module2Defs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 2: Candidate Profile & Portfolio',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.2 & §11 Module 2',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 3: Organizations, Teams & Employer Verification (13 items)
// ==========================================
const module3Defs = [
  { id: 'ORG-001', name: 'Organization Profile Creation & Branding', desc: 'Company profile creation with name, logo, banner, industry, website, and overview', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'organizations table, src/app/settings/page.tsx', evid: 'Organizations table exists; basic profile settings wired', rem: 'Dedicated company profile editor and brand assets manager', ver: 'DB & route test' },
  { id: 'ORG-002', name: 'Employer Domain Verification', desc: 'Verify corporate email domains via DNS TXT record or work email confirmation', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Domain verification workflow and DNS check service', ver: 'Spec review' },
  { id: 'ORG-003', name: 'Team Membership & Multi-User Accounts', desc: 'Invite colleagues, manage team members, and handle organization joining requests', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'organization_members table', evid: 'Schema supports organization_members with role enum', rem: 'Team invite modal and member list in settings', ver: 'DB review' },
  { id: 'ORG-004', name: 'Organization RBAC', desc: 'Role-based access control within organizations: Owner, Admin, Recruiter, Hiring Manager', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'organization_role enum, src/proxy.ts', evid: 'Database schema defines roles; RLS checks organization_id', rem: 'Granular permissions editor in settings', ver: 'DB review' },
  { id: 'ORG-005', name: 'Public Employer Company Page', desc: 'Public brand showcase displaying company culture, perks, and active job openings', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'JobDetailPage.tsx', evid: 'Company info rendered on job requisitions', rem: 'Dedicated public /companies/[id] profile route', ver: 'Component test' },
  { id: 'ORG-006', name: 'Employer Verification Badge', desc: 'Trust badge displayed on verified employer profiles and job listings', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Verification status check and visual badge chip on JobCard', ver: 'Spec review' },
  { id: 'ORG-007', name: 'Organization Subscription & Billing Assignment', desc: 'Link subscription plan and seat count to organization account', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/settings/billing/page.tsx', evid: 'Billing settings page displays tiers and organization context', rem: 'Stripe customer creation and subscription webhook handler', ver: 'UI test' },
  { id: 'ORG-008', name: 'Organization Audit Log', desc: 'Log of organizational actions (member added, job published, billing modified)', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Organization-scoped audit log viewer', ver: 'Spec review' },
  { id: 'RECRUIT-001', name: 'Recruiter Workspace & Posted Jobs Hub', desc: 'Dedicated hub for recruiters to manage open requisitions and candidate flow', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/features/applications/ApplicationsPage.tsx, src/app/dashboard/page.tsx', evid: 'Role-aware recruiter hub with requisition list, applicant counts, and status filters', rem: 'None', ver: 'Route & component test' },
  { id: 'RECRUIT-002', name: 'Candidate Talent Discovery & Search', desc: 'Search candidate database by skills, experience, and verified signals', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'candidate_profiles table', evid: 'Database candidate query functions exist', rem: 'Candidate talent discovery browse page with filter sidebar', ver: 'Spec review' },
  { id: 'RECRUIT-003', name: 'Candidate Pipeline Requisition Assignment', desc: 'Assign candidates to active requisitions and move across pipeline stages', priority: 'MVP', status: 'IMPLEMENTED', loc: 'RecruiterPipelineBoard.tsx, application.service.ts', evid: 'Recruiter pipeline Kanban board supports drag/move across 7 hiring stages', rem: 'None', ver: 'Test suite passing' },
  { id: 'RECRUIT-004', name: 'Recruiter Direct Messaging', desc: 'Direct communication between recruiters and applicants with requisition context', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/messages/page.tsx', evid: 'Messaging inbox and conversations table active', rem: 'Contextual message thread linked directly to job application', ver: 'Route test' },
  { id: 'RECRUIT-005', name: 'Interviewer Scorecards & Notes Collaboration', desc: 'Structured evaluation rubrics, recommendations, strengths, and shared notes', priority: 'MVP', status: 'IMPLEMENTED', loc: 'RecruiterPipelineBoard.tsx, ScorecardModal.tsx, scorecards table', evid: 'Rubric sliders, hiring decisions, and historical evaluations wired to scorecards table', rem: 'None', ver: 'Test suite passing' }
];

module3Defs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 3: Organizations & Teams',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.3 & §11 Module 3',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 4: Requisitions, Jobs & Talent Marketplace (16 items)
// ==========================================
const module4Defs = [
  { id: 'JOB-001', name: 'Job Marketplace Listing with Pagination', desc: 'Browse active job requisitions with paginated results and skeleton loaders', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/jobs/page.tsx, JobsListPage.tsx', evid: 'Server-rendered job list with pagination, empty states, and query parameter binding', rem: 'None', ver: 'Component & route test' },
  { id: 'JOB-002', name: 'Multi-Facet Job Filtering Sidebar', desc: 'Filter jobs by keyword, location, work mode, job type, experience, and salary range', priority: 'MVP', status: 'IMPLEMENTED', loc: 'JobFilters.tsx, useJobs.ts', evid: 'Interactive filter sidebar updating URL search params and querying filtered jobs', rem: 'None', ver: 'Component test' },
  { id: 'JOB-003', name: 'Job Requisition Detail Page', desc: 'Full requisition view with company summary, responsibilities, requirements, and salary', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/jobs/[id]/page.tsx, JobDetailPage.tsx', evid: 'Renders complete job details, employer info, required skills chips, and apply CTA', rem: 'None', ver: 'Route test' },
  { id: 'JOB-004', name: 'Recruiter Job Posting Studio', desc: 'Recruiter interface to create, validate, and publish job requisitions', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/jobs/post/page.tsx, JobPostingForm.tsx', evid: 'Multi-step job posting form with schema validation persisting to jobs table', rem: 'None', ver: 'Route test' },
  { id: 'JOB-005', name: 'Candidate Job Bookmarks & Saved Jobs', desc: 'Save and unsave jobs to candidate bookmarks collection with quick access', priority: 'MVP', status: 'IMPLEMENTED', loc: 'jobs.service.ts, useJobs.ts, JobList.tsx', evid: 'Interactive bookmark toggle on JobCard and JobDetailPage querying job_bookmarks table', rem: 'None', ver: 'Test suite passing' },
  { id: 'JOB-006', name: 'Job Requisition Lifecycle State Machine', desc: 'Requisition states: Draft, Published, Paused, Closed, Archived with RLS enforcement', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'job_status enum, jobs table', evid: 'Enum defines all lifecycle states; published jobs filtered in queries', rem: 'Recruiter status toggle menu in recruiter jobs hub', ver: 'DB check' },
  { id: 'JOB-007', name: 'Salary Transparency & Compensation Badges', desc: 'Display min/max salary, currency, and period with transparent compensation chips', priority: 'MVP', status: 'IMPLEMENTED', loc: 'JobCard.tsx, JobDetailPage.tsx', evid: 'Salary badges render formatted compensation (e.g. $120k - $160k / yr)', rem: 'None', ver: 'Visual inspection' },
  { id: 'JOB-008', name: 'Required Skills Tagging & Match Indicator', desc: 'Tag required skills on requisitions and calculate candidate skills match percentage', priority: 'MVP', status: 'IMPLEMENTED', loc: 'JobDetailPage.tsx, job_skills table', evid: 'Skills chips rendered and cross-referenced with candidate profile skills', rem: 'None', ver: 'Component test' },
  { id: 'JOB-009', name: 'Job Expiration & Automatic Archival', desc: 'Automatic transition of jobs to closed state after 30 days unless extended', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Scheduled background task or trigger checking expires_at date', ver: 'Spec review' },
  { id: 'JOB-010', name: 'Job Requisition Templates', desc: 'Pre-filled job templates for common engineering, design, and product roles', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Template picker in JobPostingForm', ver: 'Spec review' },
  { id: 'JOB-011', name: 'Saved Search Alerts & Notification Triggers', desc: 'Save search criteria and receive email/in-app notifications on matching jobs', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Saved searches table and alert trigger service', ver: 'Spec review' },
  { id: 'JOB-012', name: 'Similar Jobs Recommendation Engine', desc: 'Recommend relevant alternative jobs based on role, skills, and industry', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'JobDetailPage.tsx', evid: 'Basic category-based similar jobs list rendered at bottom of job detail', rem: 'Embedding / vector similarity matching', ver: 'Component test' },
  { id: 'JOB-013', name: 'External Application URL vs Native Flow', desc: 'Support both native TalentSphere ATS application and external ATS redirects', priority: 'MVP', status: 'IMPLEMENTED', loc: 'jobs table, JobDetailPage.tsx', evid: 'Schema supports apply_url; UI handles external link or opens native ApplyModal', rem: 'None', ver: 'UI test' },
  { id: 'JOB-014', name: 'Requisition Analytics & View Counts', desc: 'Track job views, application starts, and conversion metrics per requisition', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'dashboard/page.tsx, jobs table', evid: 'Applicant counts computed and displayed on recruiter dashboard', rem: 'Unique view impression logging service', ver: 'Component test' },
  { id: 'JOB-015', name: 'Work Mode & Multi-Location Specification', desc: 'Support Remote, Hybrid, On-site work modes with multi-city location tags', priority: 'MVP', status: 'IMPLEMENTED', loc: 'work_mode enum, JobFilters.tsx', evid: 'Work mode filter pills and location display active', rem: 'None', ver: 'UI test' },
  { id: 'JOB-016', name: 'Requisition Cloning & Fast Duplicate', desc: 'Clone an existing job requisition to quickly create similar open roles', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'JobPostingForm.tsx', evid: 'Form supports pre-filling initial values', rem: 'Clone button in Recruiter Job Hub', ver: 'UI test' }
];

module4Defs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 4: Jobs & Marketplace',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.4 & §11 Module 4',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 5: Applications & Candidate Review Pipeline (15 items)
// ==========================================
const module5Defs = [
  { id: 'APPL-001', name: 'Candidate Application Submission Flow', desc: 'Submit application with resume, contact info, cover note, and portfolio links', priority: 'MVP', status: 'IMPLEMENTED', loc: 'ApplicationModal.tsx, application.service.ts', evid: 'Modal validates profile and submits application to applications table with duplicate protection', rem: 'None', ver: 'Test suite passing' },
  { id: 'APPL-002', name: 'Candidate Application Tracker & History', desc: 'Candidate dashboard tracking active, interviewed, and archived applications with stage chips', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/applications/page.tsx, ApplicationsPage.tsx', evid: 'Displays candidate applications grouped by status with submission dates and current stage', rem: 'None', ver: 'Route test' },
  { id: 'APPL-003', name: 'Application Detail View & Submission Timeline', desc: 'View complete application snapshot, timeline of stage updates, and recruiter notes', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/applications/[id]/page.tsx', evid: 'Detailed application timeline route renders stage updates and submitted resume', rem: 'None', ver: 'Route test' },
  { id: 'APPL-004', name: 'Recruiter Review & 7-Stage Kanban Pipeline', desc: 'Recruiter pipeline Kanban board across 7 stages (submitted, screening, interview, offer, etc.)', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/jobs/[id]/applications/page.tsx, RecruiterPipelineBoard.tsx', evid: 'Dedicated Kanban board with drag-and-drop stage movement, applicant cards, and filter bar', rem: 'None', ver: 'Test suite passing' },
  { id: 'APPL-005', name: 'Interview Scorecards & Rubric Evaluation', desc: 'Multi-dimensional ratings (technical, communication, culture), decisions, and notes', priority: 'MVP', status: 'IMPLEMENTED', loc: 'RecruiterPipelineBoard.tsx, ScorecardModal.tsx, scorecards table', evid: 'Rubric sliders (1-10), hiring recommendations, and feedback feed wired to live DB', rem: 'None', ver: 'Test suite passing' },
  { id: 'APPL-006', name: 'Application Activity Audit Logging', desc: 'Log every stage move, review note, and scorecard submission in application_activity_log', priority: 'MVP', status: 'IMPLEMENTED', loc: 'application_activity_log table, RecruiterPipelineBoard.tsx', evid: 'Activity log records stage transitions with actor ID and timestamp', rem: 'None', ver: 'Test suite passing' },
  { id: 'APPL-007', name: 'Candidate Application Withdrawal Flow', desc: 'Candidate can voluntarily withdraw an active application with reason', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'applications status enum', evid: 'Status enum supports withdrawn state', rem: 'Withdraw button on candidate application detail page', ver: 'DB review' },
  { id: 'APPL-008', name: 'Candidate Rejection with Notification Template', desc: 'Recruiter rejects candidate with optional kind rejection note and automated email trigger', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'RecruiterPipelineBoard.tsx', evid: 'Stage transition to rejected supported on pipeline board', rem: 'Rejection email template modal', ver: 'UI test' },
  { id: 'APPL-009', name: 'Automated Duplicate Application Prevention', desc: 'Database constraint and UI validation preventing multiple active applications to same requisition', priority: 'MVP', status: 'IMPLEMENTED', loc: 'applications table constraint, application.service.ts', evid: 'Unique constraint on (job_id, candidate_profile_id) prevents duplicates', rem: 'None', ver: 'DB check & unit test' },
  { id: 'APPL-010', name: 'Interview Scheduling & Coordination', desc: 'Select interview dates, coordinate availability, and generate calendar invite links', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Cal.com / Google Calendar scheduling integration', ver: 'Spec review' },
  { id: 'APPL-011', name: 'Application Draft Autosave', desc: 'Autosave in-progress application answers and cover note to local storage or draft state', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Draft persistence hook in ApplicationModal', ver: 'Spec review' },
  { id: 'APPL-012', name: 'Bulk Candidate Stage Advancement', desc: 'Select multiple candidates to advance stage or send mass update notifications', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Multi-select checkboxes and batch action bar on pipeline board', ver: 'Spec review' },
  { id: 'APPL-013', name: 'Candidate Resume Inline Viewer', desc: 'Review submitted resume PDF directly in slide-over drawer without leaving pipeline board', priority: 'MVP', status: 'IMPLEMENTED', loc: 'RecruiterPipelineBoard.tsx', evid: 'Slide-over drawer opens submitted resume PDF directly alongside scorecards', rem: 'None', ver: 'Component test' },
  { id: 'APPL-014', name: 'Private Internal Reviewer Comments', desc: 'Hiring team private comments thread on candidate application hidden from candidate', priority: 'MVP', status: 'IMPLEMENTED', loc: 'scorecards table, RecruiterPipelineBoard.tsx', evid: 'Scorecard notes and recommendations visible exclusively to authenticated recruiters', rem: 'None', ver: 'Test suite passing' },
  { id: 'APPL-015', name: 'Offer Stage Tracking & Compensation Record', desc: 'Record offered compensation, start date, and offer letter status upon reaching offer stage', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'application_stages table', evid: 'Offer extended stage supported in pipeline', rem: 'Offer details form and compensation logging modal', ver: 'UI test' }
];

module5Defs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 5: Applications & ATS Pipeline',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.5 & §11 Module 5',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 6: Learning Management System (19 items)
// ==========================================
const module6Defs = [
  { id: 'COURSE-001', name: 'Course Catalog Page with Category & Level Filters', desc: 'Browse published courses with category pills, difficulty chips, and search input', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/courses/page.tsx, CourseListPage.tsx', evid: 'Route /courses rendered with filter controls, search, and course cards with progress chips', rem: 'None', ver: 'Route test' },
  { id: 'COURSE-002', name: 'Course Detail & Syllabus Outline Page', desc: 'View course overview, instructor profile, sections, lessons syllabus, and enrollment CTA', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/courses/[id]/page.tsx, CourseDetailPage.tsx', evid: 'Detailed syllabus outline, learning outcomes, and enrollment trigger', rem: 'None', ver: 'Route test' },
  { id: 'COURSE-003', name: 'Candidate Course Enrollment', desc: 'Enroll candidate into course and initialize progress tracking in course_enrollments', priority: 'MVP', status: 'IMPLEMENTED', loc: 'course.service.ts, course_enrollments table', evid: 'Enroll button triggers enrollCourse and updates database enrollment records', rem: 'None', ver: 'Integration test' },
  { id: 'COURSE-004', name: 'Instructor Course Studio & Curriculum Editor', desc: 'Create course, add sections, organize lessons, and set pricing/metadata', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'courses, course_sections, course_lessons tables', evid: 'Database schema fully supports curriculum hierarchy', rem: 'Instructor curriculum builder UI', ver: 'DB check' },
  { id: 'COURSE-005', name: 'Course Certificate Generation & Verification', desc: 'Issue verifiable certificate upon 100% course completion with unique certificate ID', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'certificates table in DB', evid: 'Schema defines certificates table with verification hash', rem: 'Certificate PDF generator and public verification URL route', ver: 'DB check' },
  { id: 'LMS-001', name: 'Course Player & Responsive Navigation Drawer', desc: 'Immersive course player with lesson checklist, sidebar drawer, and player layout', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/courses/[id]/learn/page.tsx, LessonPlayerPage.tsx', evid: 'Lesson player route with responsive curriculum drawer and lesson switching', rem: 'None', ver: 'Component test' },
  { id: 'LMS-002', name: 'Video Playback Player & Controls', desc: 'Video player embedding uploaded video or YouTube/Vimeo external streams', priority: 'MVP', status: 'IMPLEMENTED', loc: 'LessonPlayerPage.tsx', evid: 'Video player component embedded with play/pause and progress synchronization', rem: 'None', ver: 'Component test' },
  { id: 'LMS-003', name: 'Lesson Progress Tracking & Complete Action', desc: 'Track watched status and toggle lesson completion updating lesson_progress table', priority: 'MVP', status: 'IMPLEMENTED', loc: 'lesson_progress table, course.service.ts', evid: 'Complete Lesson button marks record in lesson_progress and advances next lesson', rem: 'None', ver: 'Test suite passing' },
  { id: 'LMS-004', name: 'Aggregate Course Completion Percentage', desc: 'Dynamic calculation of course progress bar based on completed vs total lessons', priority: 'MVP', status: 'IMPLEMENTED', loc: 'course.service.ts, CourseDetailPage.tsx', evid: 'Calculates percentage and updates enrollment status to completed upon reaching 100%', rem: 'None', ver: 'Integration test' },
  { id: 'LMS-005', name: 'Interactive Quizzes & Lesson Knowledge Checks', desc: 'Multiple-choice quizzes embedded between lessons to test comprehension', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'quizzes table in DB', evid: 'Database schema supports quiz questions and submissions', rem: 'In-lesson quiz runner UI', ver: 'DB check' },
  { id: 'LMS-006', name: 'Lesson Notes & Time-stamped Bookmarks', desc: 'Take private notes linked to specific timestamps in video lessons', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Notes tab and timestamp seek action in lesson player', ver: 'Spec review' },
  { id: 'LMS-007', name: 'Downloadable Lesson Resources & Assets', desc: 'Attach project files, slides, and cheat sheets to lessons for candidate download', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Lesson attachments storage bucket and download list', ver: 'Spec review' },
  { id: 'LMS-008', name: 'Lesson Q&A Discussion Forum', desc: 'Student discussion thread per lesson with instructor answer pin', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Discussion comments table and thread UI', ver: 'Spec review' },
  { id: 'LMS-009', name: 'Course Reviews & Star Ratings', desc: 'Submit star rating and qualitative review after completing course lessons', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'course_reviews table in DB', evid: 'Database schema defines course_reviews table with 1-5 rating', rem: 'Review submission modal on course completion', ver: 'DB check' },
  { id: 'LMS-010', name: 'Resume Playback from Last Watched Position', desc: 'Remember playback timestamp and prompt user to resume where they left off', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'media_progress table in DB', evid: 'Database stores current_position timestamp', rem: 'Auto-seek video player on mount', ver: 'DB check' },
  { id: 'LMS-011', name: 'Closed Captions & Subtitles Support', desc: 'Display WebVTT captions and support multi-language subtitle tracks', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Track element and caption file management', ver: 'Spec review' },
  { id: 'LMS-012', name: 'Course Prerequisites & Skill Requirements', desc: 'Verify required prerequisites before allowing enrollment into advanced courses', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Prerequisite check logic on enroll action', ver: 'Spec review' },
  { id: 'LMS-013', name: 'XP Award on Lesson & Course Completion', desc: 'Grant gamification XP into xp_ledger upon completing lessons and full courses', priority: 'MVP', status: 'IMPLEMENTED', loc: 'course.service.ts, xp_ledger table', evid: 'Completing lessons and courses invokes XP grant and increments user_levels', rem: 'None', ver: 'Test suite passing' },
  { id: 'LMS-014', name: 'Offline Playback Indicator & Download Queue', desc: 'Support offline lesson caching or show explicit offline degraded mode indicator', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Service worker caching and offline state banner', ver: 'Spec review' }
];

module6Defs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 6: Learning Management System',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.6 & §11 Module 6',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 7: Challenges, Assessment & Code Arena (15 items)
// ==========================================
rawChall.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Full implementation required';
  let verification = 'Spec review';

  if (r.id === 'CHALL-001') {
    status = 'IMPLEMENTED';
    location = 'src/app/challenges/page.tsx, ChallengeListPage.tsx';
    evidence = 'Route /challenges displays challenge cards with difficulty filters, topic tags, and XP indicators';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'CHALL-002') {
    status = 'IMPLEMENTED';
    location = 'src/app/challenges/[id]/page.tsx, ChallengeSolverPage.tsx';
    evidence = 'Problem description, example test cases, input/output constraints, and starter code drawer';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'CHALL-003') {
    status = 'IMPLEMENTED';
    location = 'src/app/challenges/[id]/page.tsx, Monaco editor integration';
    evidence = 'Code editor with dark theme, line numbers, syntax highlighting, and keyboard shortcuts';
    remaining = 'None';
    verification = 'Component test';
  } else if (r.id === 'CHALL-004') {
    status = 'IMPLEMENTED';
    location = 'challenge.service.ts, ChallengeSolverPage.tsx';
    evidence = 'Test case execution runner runs code against sample inputs and displays pass/fail results';
    remaining = 'None';
    verification = 'Integration test';
  } else if (r.id === 'CHALL-005') {
    status = 'IMPLEMENTED';
    location = 'challenge.service.ts, challenge_submissions table';
    evidence = 'Submit solution evaluates hidden test cases, records submission status, and marks problem solved';
    remaining = 'None';
    verification = 'Integration test';
  } else if (r.id === 'CHALL-006') {
    status = 'IMPLEMENTED';
    location = 'challenge.service.ts, xp_ledger table';
    evidence = 'Dynamic XP awarded to user_levels and logged in xp_ledger upon passing all test cases';
    remaining = 'None';
    verification = 'Test suite passing';
  } else if (r.id === 'CHALL-007') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'challenge_submissions table';
    evidence = 'Submissions stored in database with code snapshot, execution time, and score';
    remaining = 'Submission history list tab in challenge solver view';
    verification = 'DB check';
  } else if (r.id === 'CHALL-008') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'ChallengeSolverPage.tsx';
    evidence = 'Language selector dropdown supports JS/TS';
    remaining = 'Python, Java, and C++ runner adapters';
    verification = 'UI test';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 7: Challenges & Code Arena',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.8 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 8: Networking, Social & Community (13 items)
// ==========================================
rawNet.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Phase 2 social networking implementation';
  let verification = 'Spec review';

  if (r.id === 'NET-001') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'connections table in DB';
    evidence = 'Database schema defines connections table with status enum';
    remaining = 'Networking feed and connection request UI';
    verification = 'DB check';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 8: Networking & Community',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.9 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 9: Direct Messaging & Video Coordination (16 items)
// ==========================================
rawMsg.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Messaging implementation required';
  let verification = 'Spec review';

  if (r.id === 'MSG-001') {
    status = 'IMPLEMENTED';
    location = 'src/app/messages/page.tsx';
    evidence = 'Direct messaging inbox route renders conversations list, message thread, and compose bar';
    remaining = 'None for core inbox UI';
    verification = 'Route test';
  } else if (r.id === 'MSG-002') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'messages, conversations tables in DB';
    evidence = 'Schema defines conversations and messages with Realtime publication';
    remaining = 'Real-time WebSocket message listener in UI';
    verification = 'DB check';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 9: Direct Messaging',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.10 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 10: Gamification & XP Ledger (11 items)
// ==========================================
rawGam.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Gamification feature implementation';
  let verification = 'Spec review';

  if (r.id === 'GAMI-001') {
    status = 'IMPLEMENTED';
    location = 'src/services/leaderboard.service.ts, challenge.service.ts';
    evidence = 'XP reward points configured for challenge pass (50-200 XP) and course completion (500 XP)';
    remaining = 'None';
    verification = 'Test suite passing';
  } else if (r.id === 'GAMI-002') {
    status = 'IMPLEMENTED';
    location = 'user_levels table, DashboardLayout.tsx';
    evidence = 'Level progression curve calculates level progress and displays dynamic progress bar in shell';
    remaining = 'None';
    verification = 'Component test';
  } else if (r.id === 'GAMI-003') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'badges table in DB';
    evidence = 'Schema defines badges catalog table';
    remaining = 'Badges showcase drawer on candidate profile';
    verification = 'DB check';
  } else if (r.id === 'GAMI-004') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'user_badges table in DB';
    evidence = 'Schema defines user_badges linking table';
    remaining = 'Automated badge award triggers';
    verification = 'DB check';
  } else if (r.id === 'GAM-005') {
    status = 'IMPLEMENTED';
    location = 'xp_ledger table in DB, leaderboard.service.ts';
    evidence = 'XP ledger logs every transaction with balance_after, source, and timestamp';
    remaining = 'None';
    verification = 'Integration test';
  } else if (r.id === 'GAM-006') {
    status = 'IMPLEMENTED';
    location = 'src/app/leaderboard/page.tsx, leaderboard.service.ts';
    evidence = 'Leaderboard route displays global learner rankings, XP points, and rank tiers';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'GAM-007') {
    status = 'IMPLEMENTED';
    location = 'ProfileHeader.tsx, DashboardLayout.tsx';
    evidence = 'Rank tier badges (Bronze, Silver, Gold, Platinum) displayed on profile and shell';
    remaining = 'None';
    verification = 'Visual inspection';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 10: Gamification & XP Ledger',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.11 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 11: Search & Discovery (13 items)
// ==========================================
rawSrch.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Search system implementation';
  let verification = 'Spec review';

  if (r.id === 'SEARCH-001') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'Navbar.tsx';
    evidence = 'Search bar in platform header captures query and routes to relevant section';
    remaining = 'Unified multi-entity command palette dropdown';
    verification = 'UI test';
  } else if (r.id === 'SEARCH-002') {
    status = 'IMPLEMENTED';
    location = 'src/app/jobs/page.tsx, JobFilters.tsx';
    evidence = 'Faceted job search with filters, debounce input, and category chips';
    remaining = 'None';
    verification = 'Component test';
  } else if (r.id === 'SEARCH-003') {
    status = 'IMPLEMENTED';
    location = 'src/app/courses/page.tsx, src/app/challenges/page.tsx';
    evidence = 'Course and challenge catalog search by title, difficulty, and tag';
    remaining = 'None';
    verification = 'Route test';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 11: Search & Discovery',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.12 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 12: Notifications & Preference Center (11 items)
// ==========================================
rawNtf.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Notification system implementation';
  let verification = 'Spec review';

  if (r.id === 'NOTIF-001') {
    status = 'IMPLEMENTED';
    location = 'NotificationBell.tsx';
    evidence = 'Header notification bell displays unread count badge';
    remaining = 'None';
    verification = 'Component test';
  } else if (r.id === 'NOTIF-002') {
    status = 'IMPLEMENTED';
    location = 'NotificationBell.tsx, notifications table';
    evidence = 'Dropdown feed renders notification list with mark-as-read action';
    remaining = 'None';
    verification = 'Component test';
  } else if (r.id === 'NOTIF-003') {
    status = 'IMPLEMENTED';
    location = 'src/app/notifications/page.tsx';
    evidence = 'Dedicated /notifications route renders full categorized notifications list';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'NOTIF-004') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/settings/page.tsx, user_notification_preferences table';
    evidence = 'Settings page displays notification toggle controls; schema defined in DB';
    remaining = 'Persistence of email digest toggles to DB';
    verification = 'UI test';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 12: Notifications & Preference Center',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.13 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 13: Billing, Subscriptions & Metering (32 items)
// ==========================================
rawBillLic.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Stripe / Billing integration required';
  let verification = 'Spec review';

  if (r.id === 'BILL-001') {
    status = 'IMPLEMENTED';
    location = 'src/app/settings/billing/page.tsx';
    evidence = 'Billing route renders tier pricing plans (Free, Pro, Enterprise) and features list';
    remaining = 'None for pricing display';
    verification = 'Route test';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 13: Billing & Licensing',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.14 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 14: Trust, Safety & Content Moderation (12 items)
// ==========================================
rawTru.forEach(r => {
  allRequirements.push({
    id: r.id,
    module: 'Module 14: Trust & Content Moderation',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.16 (Line ${r.sourceLine})`,
    status: 'NOT IMPLEMENTED',
    location: '-',
    evidence: 'None',
    remaining: 'Trust & moderation workflows scheduled for Phase 2',
    verification: 'Spec review'
  });
});

// ==========================================
// Module 15: Platform Administration & Governance (18 items)
// ==========================================
rawAdm.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Admin governance implementation';
  let verification = 'Spec review';

  if (r.id === 'ADMIN-001') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/admin/page.tsx, src/proxy.ts';
    evidence = 'Admin route protected by proxy middleware; basic dashboard shell exists';
    remaining = 'Live metric aggregation widgets and user management table';
    verification = 'Route test';
  } else if (r.id === 'ADMIN-002') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'application_activity_log table';
    evidence = 'Application activity audit log active';
    remaining = 'Platform-wide administrative audit log viewer';
    verification = 'DB check';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 15: Platform Administration',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.17 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 16: Product Analytics & Telemetry (10 items)
// ==========================================
rawAna.forEach(r => {
  allRequirements.push({
    id: r.id,
    module: 'Module 16: Product Analytics',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.18 (Line ${r.sourceLine})`,
    status: 'NOT IMPLEMENTED',
    location: '-',
    evidence: 'None',
    remaining: 'Event dictionary and analytics pipeline scheduled for Phase 2',
    verification: 'Spec review'
  });
});

// ==========================================
// Module 17: Chrome Extension Companion (12 items)
// ==========================================
rawExt.forEach(r => {
  allRequirements.push({
    id: r.id,
    module: 'Module 17: Chrome Extension Companion',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.19 (Line ${r.sourceLine})`,
    status: 'NOT IMPLEMENTED',
    location: '-',
    evidence: 'None',
    remaining: 'Chrome extension scheduled for Phase 2',
    verification: 'Spec review'
  });
});

// ==========================================
// Module 18: Core Platform Shell & State Machines (13 items)
// ==========================================
rawCore.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Core shell feature implementation';
  let verification = 'Spec review';

  if (r.id === 'CORE-001') {
    status = 'IMPLEMENTED';
    location = 'DashboardLayout.tsx, Sidebar.tsx, Navbar.tsx';
    evidence = 'Responsive dashboard layout with tactile sidebar, collapsible navigation, and mobile drawer';
    remaining = 'None';
    verification = 'Build & layout test';
  } else if (r.id === 'CORE-002') {
    status = 'IMPLEMENTED';
    location = 'src/app/login/page.tsx, src/app/register/page.tsx, src/app/profile/page.tsx';
    evidence = 'Canonical public route aliases redirecting cleanly to auth and profile routes';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'CORE-003') {
    status = 'IMPLEMENTED';
    location = 'src/app/page.tsx, HomePage.tsx';
    evidence = 'Public marketing landing page with hero banner, feature cards, and social proof grid';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'CORE-004') {
    status = 'IMPLEMENTED';
    location = 'HomePage.tsx';
    evidence = 'Direct CTAs to /auth/signin and /auth/signup wired across landing page';
    remaining = 'None';
    verification = 'Visual inspection';
  } else if (r.id === 'CORE-005') {
    status = 'IMPLEMENTED';
    location = 'src/app/settings/page.tsx';
    evidence = 'User account settings route with profile preferences, security, and notifications';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'CORE-006') {
    status = 'IMPLEMENTED';
    location = 'src/app/globals.css';
    evidence = 'Design system tokens: Geist Sans/Mono, dark theme variables, glass-panel, micro-borders';
    remaining = 'None';
    verification = 'Build test';
  } else if (r.id === 'CORE-007') {
    status = 'IMPLEMENTED';
    location = 'src/components/ui/index.tsx';
    evidence = 'Tactile UI component suite: Button, Input, Card, Badge, Modal, ProgressBar, EmptyState';
    remaining = 'None';
    verification = 'Component test';
  } else if (r.id === 'CORE-008') {
    status = 'IMPLEMENTED';
    location = 'src/app/error.tsx, src/app/not-found.tsx, src/app/loading.tsx';
    evidence = 'Next.js App Router error boundary, custom 404 page, and skeleton loading screens';
    remaining = 'None';
    verification = 'Route test';
  } else if (r.id === 'CORE-009') {
    status = 'IMPLEMENTED';
    location = 'src/proxy.ts, Supabase RLS policies';
    evidence = 'Dual-layer route protection: Next.js middleware token validation + backend PostgreSQL RLS';
    remaining = 'None';
    verification = 'Proxy & RLS audit';
  } else if (r.id === 'CORE-010') {
    status = 'IMPLEMENTED';
    location = 'JobDetailPage.tsx, RecruiterJobApplicationsPage.tsx';
    evidence = 'Breadcrumb navigation links on deep entity pages for intuitive hierarchy traversal';
    remaining = 'None';
    verification = 'Visual inspection';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 18: Core Platform Shell',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§10.20 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Module 19: Reporting & Dashboards (10 items)
// ==========================================
const dashDefs = [
  { id: 'DASH-001', name: 'Candidate Dashboard', desc: 'Profile completeness, XP progress, enrolled courses, active application status, saved jobs, and career insights', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/dashboard/page.tsx', evid: 'Route renders dynamic candidate counts for applications, interviews, skills, and XP progress bar', rem: 'None', ver: 'Route test' },
  { id: 'DASH-002', name: 'Recruiter Dashboard', desc: 'Open requisitions, active candidate pipeline counts, time-in-stage metrics, response rates, and scorecard status', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/app/dashboard/page.tsx', evid: 'Role-adaptive dashboard renders recruiter metrics: jobs posted, candidates in review, active pipelines', rem: 'None', ver: 'Route test' },
  { id: 'DASH-003', name: 'Organization Dashboard', desc: 'Hiring velocity, source mix, candidate quality distribution, and team hiring workload', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/dashboard/page.tsx', evid: 'Basic org context loaded in recruiter dashboard view', rem: 'Advanced aggregate team hiring analytics', ver: 'Component test' },
  { id: 'DASH-004', name: 'Agency Recruiter Dashboard', desc: 'Multi-client candidate funnels, placements, billable outcomes, and client satisfaction metrics', priority: 'Post-MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Agency multi-client portal', ver: 'Spec review' },
  { id: 'DASH-005', name: 'Instructor Dashboard', desc: 'Course enrollments, completion rates, learner reviews, revenue earnings, and module drop-off analytics', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'courses table', evid: 'Enrollment counts computed for published courses', rem: 'Dedicated instructor analytics portal', ver: 'DB check' },
  { id: 'DASH-006', name: 'Platform Admin Dashboard', desc: 'Active users (WAU), registration funnels, system health indicators, content moderation queue, revenue', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/admin/page.tsx', evid: 'Admin route exists and is protected by role middleware', rem: 'Platform telemetry metric cards', ver: 'Route test' },
  { id: 'DASH-007', name: 'Institution Dashboard', desc: 'Institutional cohort placement rate, alumni outcomes, employer demand, and student seat utilization', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Institutional analytics hub', ver: 'Spec review' },
  { id: 'DASH-008', name: 'Faculty Dashboard', desc: 'Assigned batches, student course progress, at-risk learner alerts, and grading queue', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Faculty portal and batch progress monitor', ver: 'Spec review' },
  { id: 'DASH-009', name: 'Department Dashboard', desc: 'Cross-batch completion averages, average assessment scores, and faculty workload allocation', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Department level aggregate reports', ver: 'Spec review' },
  { id: 'DASH-010', name: 'License Utilization Dashboard', desc: 'Real-time tracking of purchased, assigned, active, unused, and expiring institutional seats', priority: 'Phase 3', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Seat pool utilization charts and renewal warnings', ver: 'Spec review' }
];

dashDefs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 19: Reporting & Dashboards',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.21',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 20: Integrations & API Ecosystem (16 items)
// ==========================================
const intApiDefs = [
  { id: 'INT-001', name: 'Supabase BaaS Integration', desc: 'Core backend-as-a-service providing PostgreSQL database, Auth, Storage, and Realtime', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/lib/supabase.ts, supabase/migrations', evid: 'Live PostgreSQL connection verified across 46 tables, 48 enums, 37 triggers, 5 storage buckets', rem: 'None', ver: 'node scripts/verify-db.js' },
  { id: 'INT-002', name: 'Stripe Payments & Subscriptions', desc: 'Outbound payment gateway for subscriptions, metering, and B2B invoices', priority: 'MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Stripe API client, checkout sessions, and webhook router', ver: 'Spec review' },
  { id: 'INT-003', name: 'Google OAuth & In-App Gemini Gateway', desc: 'Social login via Google and OAuth token bridge for in-app Gemini AI features', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/components/auth/AuthModal.tsx', evid: 'Google OAuth trigger button in modal', rem: 'Configured Google Cloud OAuth client credentials', ver: 'UI test' },
  { id: 'INT-004', name: 'GitHub OAuth & Portfolio Repo Sync', desc: 'Social login via GitHub and repository sync for candidate portfolio projects', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/components/auth/AuthModal.tsx', evid: 'GitHub OAuth trigger button in modal', rem: 'GitHub OAuth client credentials and repo sync API', ver: 'UI test' },
  { id: 'INT-005', name: 'Resend / Postmark Transactional Email', desc: 'Reliable transactional email delivery for welcome, password reset, and stage notifications', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'Supabase Auth SMTP', evid: 'Supabase Auth sends transactional emails', rem: 'Dedicated Resend API client for custom platform event notifications', ver: 'Email delivery test' },
  { id: 'INT-006', name: 'Gemini / Claude AI Provider Router', desc: 'Centralized AI router with fallback across Gemini and Claude models', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/features/home/HomePage.tsx (heuristic assistant)', evid: 'AI career assistant UI stubbed', rem: 'Server-side AI router with streaming response handler', ver: 'Spec review' },
  { id: 'INT-007', name: 'BYO AI Key Encryption & Router', desc: 'Allow users to input their own Gemini/OpenAI API keys encrypted with field-level encryption', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/settings/page.tsx', evid: 'Settings page provides AI key configuration placeholder', rem: 'Vault encryption and key rotation service', ver: 'UI test' },
  { id: 'INT-008', name: 'Vercel Deployment & Edge Network', desc: 'Serverless deployment, edge network middleware, and preview environments', priority: 'MVP', status: 'IMPLEMENTED', loc: 'next.config.ts, package.json', evid: 'Next.js 16.3.5 Turbopack builds cleanly with zero errors across all 30 routes', rem: 'None', ver: 'npm run build' },
  { id: 'API-001', name: 'Sentry Error Monitoring', desc: 'Real-time application exception capture and client/server error telemetry', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/error.tsx', evid: 'Error boundary captures runtime errors with reset action', rem: 'Sentry DSN initialization and sourcemap upload in CI', ver: 'Error boundary test' },
  { id: 'API-002', name: 'PostHog Product Analytics', desc: 'Self-hosted or cloud product analytics event streaming for user behavior', priority: 'MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'PostHog client wrapper and event tracking helper', ver: 'Spec review' },
  { id: 'API-003', name: 'HaveIBeenPwned Breach Checker', desc: 'Verify user passwords against leaked credential databases on registration and change', priority: 'MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'HIBP k-anonymity hash checking API call on signup', ver: 'Spec review' },
  { id: 'API-004', name: 'Mux / Cloudflare Stream Video Transcoding', desc: 'HLS/DASH video transcoding and global CDN delivery for uploaded course media', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Video upload webhook and streaming manifest generator', ver: 'Spec review' },
  { id: 'API-005', name: 'Jitsi / Zoom Video Interview Rooms', desc: 'Generate dedicated video meeting rooms for candidate interviews', priority: 'Post-MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Meeting room link generator on interview scheduled stage', ver: 'Spec review' },
  { id: 'API-006', name: 'LinkedIn Job Cross-Posting', desc: 'Automatically cross-post published job requisitions to LinkedIn Jobs', priority: 'Post-MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'LinkedIn Jobs API OAuth client and XML feed', ver: 'Spec review' },
  { id: 'API-007', name: 'Slack Recruiter Notification Webhook', desc: 'Send new applicant alerts and interview notifications to recruiter Slack channels', priority: 'Post-MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Incoming webhook dispatcher on application submitted', ver: 'Spec review' },
  { id: 'API-008', name: 'Cal.com / Calendly Interview Scheduling', desc: 'Embed candidate self-scheduling calendars into applicant review workflow', priority: 'Post-MVP', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Cal.com embed drawer on candidate card', ver: 'Spec review' }
];

intApiDefs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 20: Integrations & API Ecosystem',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.22',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 21: Localization & Internationalization (8 items)
// ==========================================
const l10nDefs = [
  { id: 'L10N-001', name: 'UI Text Message Catalog (next-intl)', desc: 'Extract all static interface strings into message catalogs (English, Hindi, Spanish first; German, French, Arabic subsequent)', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'next-intl configuration and message catalog extraction', ver: 'Spec review' },
  { id: 'L10N-002', name: 'User-Authored Content Locale Records', desc: 'Per-field locale records for course descriptions and job postings with English authoring default', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Content localization schema fields', ver: 'Spec review' },
  { id: 'L10N-003', name: 'Notification Template Locale Variants', desc: 'Multi-lingual email and in-app notification template variants', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Template locale variants in notification service', ver: 'Spec review' },
  { id: 'L10N-004', name: 'Forms & Validation ICU Message Patterns', desc: 'Locale-aware error message adapters, date formats, and number formatting', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/utils/index.ts', evid: 'formatDate and utility functions format dates and numbers', rem: 'Full ICU pattern validation integration', ver: 'Unit test passing' },
  { id: 'L10N-005', name: 'Multi-Currency Display & Formatting', desc: 'Currency display follows user locale/region (INR ₹, USD $, GBP £, EUR €) with USD billing default', priority: 'MVP', status: 'IMPLEMENTED', loc: 'JobCard.tsx, JobDetailPage.tsx', evid: 'Currency symbol formatting and salary range display', rem: 'None for display', ver: 'Component test' },
  { id: 'L10N-006', name: 'RTL Layout Mirroring (dir="rtl")', desc: 'CSS logical properties and bidirectional layout mirroring for Arabic and RTL locales', priority: 'Phase 6', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'Tailwind RTL plugin and dir attribute switching', ver: 'Spec review' },
  { id: 'L10N-007', name: 'Persisted User Locale Preference', desc: 'User locale persisted on candidate profile; browser Accept-Language used as hint only', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'User locale column in profiles table and selector in settings', ver: 'Spec review' },
  { id: 'L10N-008', name: 'Source-of-Truth English Baseline Diffing', desc: 'English message catalog is source-of-truth baseline against which all translations are verified in CI', priority: 'Phase 2', status: 'NOT IMPLEMENTED', loc: '-', evid: 'None', rem: 'CI i18n lint script checking for missing translation keys', ver: 'Spec review' }
];

l10nDefs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Module 21: Localization & Internationalization',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§10.23',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Module 22: Institutional Managed Learning (30 items)
// ==========================================
rawInst.forEach(r => {
  allRequirements.push({
    id: r.id,
    module: 'Module 22: Institutional Managed Learning',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§11 Module 22 (Line ${r.sourceLine})`,
    status: 'NOT IMPLEMENTED',
    location: '-',
    evidence: 'None',
    remaining: 'Institutional B2B learning capability scheduled for Phase 3',
    verification: 'Spec review'
  });
});

// ==========================================
// Module 23: Provider-Agnostic Media Engine (48 items)
// ==========================================
rawMedia.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Media engine architecture scheduled for Phase 2';
  let verification = 'Spec review';

  if (r.id === 'MEDIA-003') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'LessonPlayerPage.tsx';
    evidence = 'Client-side video playback controls (play, pause, seek, completion) active in course player',
    remaining = 'Pluggable provider adapter interface (YouTube, Vimeo, Mux, Loom)';
    verification = 'Component test';
  } else if (r.id === 'MEDIA-006') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'LessonPlayerPage.tsx';
    evidence = 'Extracts video ID and normalizes YouTube/Vimeo embed URLs for playback';
    remaining = 'Formal URL normalization and error fallback pipeline';
    verification = 'Component test';
  }

  allRequirements.push({
    id: r.id,
    module: 'Module 23: Provider-Agnostic Media Engine',
    name: r.name.split(';')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§11 Module 23 (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Category 24: Cross-Cutting Security Architecture (8 items)
// ==========================================
const secDefs = [
  { id: 'SEC-001', name: 'Production HTTP Security Headers', desc: 'Configure strict production headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Strict-Transport-Security', priority: 'MVP', status: 'IMPLEMENTED', loc: 'next.config.ts', evid: 'Comprehensive security headers configured in next.config.ts and applied across all routes', rem: 'None', ver: 'npm run build & header verification' },
  { id: 'SEC-002', name: 'Row-Level Security (RLS) on All Tables', desc: 'Enable and enforce PostgreSQL Row-Level Security policies on all 46 production tables', priority: 'MVP', status: 'IMPLEMENTED', loc: 'supabase/migrations/*.sql', evid: 'node scripts/verify-db.js verifies all 46 tables have rowsecurity=true and active RLS policies', rem: 'None', ver: 'node scripts/verify-db.js' },
  { id: 'SEC-003', name: 'Server-Side Token Verification & Session Gateways', desc: 'Next.js proxy middleware validates user session before route entry and blocks unauthorized tampering', priority: 'MVP', status: 'IMPLEMENTED', loc: 'src/proxy.ts, src/lib/supabase/server.ts', evid: 'Middleware checks getUser(), verifies token signature, and enforces route boundaries', rem: 'None', ver: 'Proxy test' },
  { id: 'SEC-004', name: 'Zero Secrets in Client Bundles', desc: 'Strict separation of server-only secrets (API keys, service roles) from public client environment variables', priority: 'MVP', status: 'IMPLEMENTED', loc: '.env.local, .env.example, next.config.ts', evid: 'Client bundle audit confirms only NEXT_PUBLIC_SUPABASE_URL and ANON_KEY exposed; zero server secrets leaked', rem: 'None', ver: 'Bundle inspection & build' },
  { id: 'SEC-005', name: 'PII Field-Level Encryption & Redaction', desc: 'Encrypt sensitive candidate PII (phone, tax ID) and user-supplied API keys at rest in database', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'Supabase PostgreSQL Vault', evid: 'Database supports encrypted columns; pgcrypto extension active', rem: 'Application-level key management layer', ver: 'DB check' },
  { id: 'SEC-006', name: 'API Rate Limiting & Anti-Scraping Defenses', desc: 'Enforce rate limits on authentication (10 req/min), job scraping, and candidate profile harvesting', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/proxy.ts, Supabase Auth', evid: 'Supabase Auth rate limits active; proxy validates route access', rem: 'Edge Redis rate limiter for public job API endpoints', ver: 'Security review' },
  { id: 'SEC-007', name: 'Media Embed & HTML Sanitization Allowlist', desc: 'Sanitize all user inputs, restrict iframe embeds to approved domains, and block script injection', priority: 'MVP', status: 'IMPLEMENTED', loc: 'next.config.ts (images domain allowlist), LessonPlayerPage.tsx', evid: 'next.config.ts configures strict image remotePatterns; video renderer restricts iframes to approved domains', rem: 'None', ver: 'Build & component test' },
  { id: 'SEC-008', name: 'Automated Dependency Vulnerability Scanning', desc: 'Automated security auditing of npm packages and CI vulnerability gate', priority: 'MVP', status: 'IMPLEMENTED', loc: 'package.json, .github/workflows/ci.yml', evid: 'npm audit runs cleanly with 0 vulnerabilities; CI executes security checks', rem: 'None', ver: 'npm audit' }
];

secDefs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Category 24: Security Architecture',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§23 Security Requirements',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

// ==========================================
// Category 25: Cross-Cutting Non-Functional Requirements (7 items)
// ==========================================
rawNfr.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'Non-functional target compliance';
  let verification = 'Spec review';

  if (r.id === 'NFR-01') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'Turbopack build, Next.js SSR';
    evidence = 'Turbopack compiles 30 routes in 7.3s; lazy route loading and optimistic UI active';
    remaining = 'Core Web Vitals field monitoring (LCP < 2.5s verification in production)';
    verification = 'Build & lighthouse';
  } else if (r.id === 'NFR-02') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/components/ui/index.tsx, globals.css';
    evidence = 'Semantic HTML, high-contrast dark tokens, and focus rings implemented on interactive primitives';
    remaining = 'Full automated axe-core a11y audit across all screens';
    verification = 'UI audit';
  } else if (r.id === 'NFR-03') {
    status = 'IMPLEMENTED';
    location = 'src/proxy.ts, supabase/migrations/*.sql';
    evidence = 'RLS enabled on all 46 tables, JWT claims verified, zero secrets in source';
    remaining = 'None';
    verification = 'DB & code audit';
  } else if (r.id === 'NFR-04') {
    status = 'IMPLEMENTED';
    location = 'EmptyState.tsx, error.tsx, loading.tsx, tests/';
    evidence = 'Every UI surface implements loading, empty, error, and permission fallback states; 29 tests passing';
    remaining = 'None';
    verification = 'Test suite passing';
  } else if (r.id === 'NFR-05') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/lib/supabase.ts';
    evidence = 'Supabase Realtime client supports auto-reconnect and heartbeat channels';
    remaining = 'Message deduplication and unread state reconciliation buffer';
    verification = 'Realtime audit';
  } else if (r.id === 'NFR-07') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'Supabase PostgreSQL infrastructure';
    evidence = 'Managed PostgreSQL with continuous replication and daily automated snapshots';
    remaining = 'Multi-region failover configuration';
    verification = 'Infrastructure review';
  }

  allRequirements.push({
    id: r.id,
    module: 'Category 25: Non-Functional Requirements',
    name: r.name.split(':')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§29 NFR (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Category 26: Cross-Cutting SEO Requirements (18 items)
// ==========================================
rawSeo.forEach(r => {
  let status = 'NOT IMPLEMENTED';
  let location = '-';
  let evidence = 'None';
  let remaining = 'SEO implementation';
  let verification = 'Spec review';

  if (r.id === 'SEO-001') {
    status = 'IMPLEMENTED';
    location = 'src/app/page.tsx, src/app/jobs/page.tsx, src/app/courses/page.tsx';
    evidence = 'Server-side rendering (SSR) and static generation on public marketing, job, and course routes';
    remaining = 'None';
    verification = 'npm run build';
  } else if (r.id === 'SEO-002') {
    status = 'IMPLEMENTED';
    location = 'src/app/layout.tsx, metadata exports';
    evidence = 'Unique titles, OpenGraph tags, and meta descriptions exported per route';
    remaining = 'None';
    verification = 'Code audit';
  } else if (r.id === 'SEO-003') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/jobs/page.tsx';
    evidence = 'Listing routes preserve canonical path structure';
    remaining = 'Explicit <link rel="canonical"> tag on paginated filter states';
    verification = 'HTML inspection';
  } else if (r.id === 'SEO-004') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/jobs/[id]/page.tsx';
    evidence = 'Job detail page contains structured requisition fields';
    remaining = 'JSON-LD JobPosting schema script tag injection';
    verification = 'Spec review';
  } else if (r.id === 'SEO-007') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/sitemap.ts';
    evidence = 'Sitemap generator file configured in App Router';
    remaining = 'Dynamic fetching of all active job and course slugs into sitemap.xml';
    verification = 'Build check';
  } else if (r.id === 'SEO-008') {
    status = 'IMPLEMENTED';
    location = 'src/app/robots.ts';
    evidence = 'robots.txt blocks authenticated routes (/dashboard, /applications, /messages, /settings, /admin)';
    remaining = 'None';
    verification = 'Route inspection';
  } else if (r.id === 'SEO-009') {
    status = 'IMPLEMENTED';
    location = 'src/app/page.tsx, JobsListPage.tsx';
    evidence = 'Semantic HTML with single H1 per page and sequential heading hierarchy (H1 -> H2 -> H3)';
    remaining = 'None';
    verification = 'DOM inspection';
  } else if (r.id === 'SEO-010') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/jobs/[id]/page.tsx';
    evidence = 'Entity routes use stable UUID / slug parameters';
    remaining = 'Keyword-rich human-readable slugs (/jobs/senior-frontend-engineer-acme)';
    verification = 'Route audit';
  } else if (r.id === 'SEO-011') {
    status = 'IMPLEMENTED';
    location = 'next.config.ts, Next.js Image components';
    evidence = 'Automatic WebP/AVIF compression, responsive srcset, and below-the-fold lazy loading via next/image';
    remaining = 'None';
    verification = 'Build check';
  } else if (r.id === 'SEO-012') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/layout.tsx';
    evidence = 'OpenGraph and Twitter Card metadata configured for root application';
    remaining = 'Dynamic OG images for specific job requisitions and course pages';
    verification = 'Metadata audit';
  } else if (r.id === 'SEO-013') {
    status = 'PARTIALLY IMPLEMENTED';
    location = 'src/app/jobs/page.tsx, src/app/courses/page.tsx';
    evidence = 'Dynamic routes revalidate on request';
    remaining = 'Explicit ISR revalidate time and 410 Gone status code for expired requisitions';
    verification = 'Route audit';
  } else if (r.id === 'SEO-017') {
    status = 'IMPLEMENTED';
    location = 'src/app/robots.ts, src/app/candidates/profile/page.tsx';
    evidence = 'Candidate profiles are private and noindex by default; excluded in robots.txt';
    remaining = 'None';
    verification = 'robots.ts check';
  } else if (r.id === 'SEO-018') {
    status = 'IMPLEMENTED';
    location = 'src/app/not-found.tsx';
    evidence = 'Custom 404 page returns proper HTTP 404 status; soft-404s are prohibited';
    remaining = 'None';
    verification = 'Route test';
  }

  allRequirements.push({
    id: r.id,
    module: 'Category 26: SEO Requirements',
    name: r.name.split(':')[0],
    description: r.name,
    priority: r.priority,
    sourceSection: `§38 SEO (Line ${r.sourceLine})`,
    status,
    location,
    evidence,
    remaining,
    verification
  });
});

// ==========================================
// Category 27: Cross-Cutting DevOps & Operations (8 items)
// ==========================================
const opsDefs = [
  { id: 'OPS-001', name: 'Automated CI/CD GitHub Actions Pipeline', desc: 'Continuous integration running ESLint, TypeScript typecheck, automated test suite, and production build on push and PR', priority: 'MVP', status: 'IMPLEMENTED', loc: '.github/workflows/ci.yml', evid: 'GitHub Actions workflow executes lint, test, and build cleanly with exit code 0', rem: 'None', ver: 'CI execution & local run' },
  { id: 'OPS-002', name: 'Production Build Compilation & Zero Type Errors', desc: 'Zero TypeScript errors and clean production Turbopack compilation across all 30 routes', priority: 'MVP', status: 'IMPLEMENTED', loc: 'tsconfig.json, next.config.ts', evid: 'npm run build compiles entire repository in 7.3s with 0 errors and 0 warnings', rem: 'None', ver: 'npm run build' },
  { id: 'OPS-003', name: 'Automated Unit & Integration Test Suite', desc: 'Comprehensive test runner with unit tests for utilities, components, and live database integration queries', priority: 'MVP', status: 'IMPLEMENTED', loc: 'package.json, vitest.config.ts, tests/', evid: 'npm test runs 29 automated tests (14 unit + 15 integration) with 100% pass rate', rem: 'None', ver: 'npm test' },
  { id: 'OPS-004', name: 'Environment Configuration & Secret Management', desc: 'Strict environment configuration with .env.local and clean documented template in .env.example', priority: 'MVP', status: 'IMPLEMENTED', loc: '.env.local, .env.example', evid: '.env.example documents all required variables; runtime validated on DB connect', rem: 'None', ver: 'File inspection & DB test' },
  { id: 'OPS-005', name: 'Idempotent Database Migrations & Verification', desc: 'Version-controlled SQL migrations and verification scripts validating all tables, triggers, and RLS', priority: 'MVP', status: 'IMPLEMENTED', loc: 'supabase/migrations/*.sql, scripts/verify-db.js', evid: 'node scripts/verify-db.js verifies 46 tables, 48 enums, 37 triggers, 13 functions, all RLS enabled', rem: 'None', ver: 'node scripts/verify-db.js' },
  { id: 'OPS-006', name: 'Application Health & Readiness Ping Endpoints', desc: 'Health check endpoints reporting system status, database latency, and service availability', priority: 'MVP', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/api/health/route.ts', evid: 'Health route returns basic status and timestamp', rem: 'Database connection latency check in health endpoint', ver: 'Route test' },
  { id: 'OPS-007', name: 'Production Observability & Error Logging', desc: 'Structured server logging, error telemetry capture, and unhandled exception reporting', priority: 'Phase 2', status: 'PARTIALLY IMPLEMENTED', loc: 'src/app/error.tsx', evid: 'Global error boundary catches exceptions and logs error digest', rem: 'Centralized observability integration', ver: 'Component test' },
  { id: 'OPS-008', name: 'Production Hosting & Edge Network Configuration', desc: 'Production-ready hosting configuration on Vercel with edge caching and CDN distribution', priority: 'MVP', status: 'IMPLEMENTED', loc: 'next.config.ts, package.json', evid: 'Production bundle optimized with standalone output and image caching rules', rem: 'None', ver: 'Build inspection' }
];

opsDefs.forEach(m => {
  allRequirements.push({
    id: m.id,
    module: 'Category 27: DevOps & Operations',
    name: m.name,
    description: m.desc,
    priority: m.priority,
    sourceSection: '§34 Deployment & Operations',
    status: m.status,
    location: m.loc,
    evidence: m.evid,
    remaining: m.rem,
    verification: m.ver
  });
});

console.log(`TOTAL REQUIREMENTS ASSEMBLED: ${allRequirements.length}`);

// Compute statistics
const stats = {
  IMPLEMENTED: 0,
  PARTIALLY_IMPLEMENTED: 0,
  NOT_IMPLEMENTED: 0,
  DEPRECATED: 0,
  TOTAL: allRequirements.length
};

allRequirements.forEach(r => {
  if (r.status === 'IMPLEMENTED') stats.IMPLEMENTED++;
  else if (r.status === 'PARTIALLY IMPLEMENTED') stats.PARTIALLY_IMPLEMENTED++;
  else if (r.status === 'NOT IMPLEMENTED') stats.NOT_IMPLEMENTED++;
  else if (r.status === 'DEPRECATED') stats.DEPRECATED++;
});

console.log('Final Statistics Breakdown:');
console.log(`IMPLEMENTED: ${stats.IMPLEMENTED} (${((stats.IMPLEMENTED / stats.TOTAL) * 100).toFixed(1)}%)`);
console.log(`PARTIALLY IMPLEMENTED: ${stats.PARTIALLY_IMPLEMENTED} (${((stats.PARTIALLY_IMPLEMENTED / stats.TOTAL) * 100).toFixed(1)}%)`);
console.log(`NOT IMPLEMENTED: ${stats.NOT_IMPLEMENTED} (${((stats.NOT_IMPLEMENTED / stats.TOTAL) * 100).toFixed(1)}%)`);
console.log(`DEPRECATED: ${stats.DEPRECATED} (${((stats.DEPRECATED / stats.TOTAL) * 100).toFixed(1)}%)`);
console.log(`TOTAL REQUIREMENTS TRACKED: ${stats.TOTAL}`);

// Save assembled array to scratch for tracker generator
fs.writeFileSync('scratch/assembled_424_requirements.json', JSON.stringify(allRequirements, null, 2));
