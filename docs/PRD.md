# Product Requirements Document (PRD)

## Product
**TalentSphere** — The Unified Talent Operating System

## Version
1.0 MVP

## Problem Statement

There is a structural gap in today's talent ecosystem:

- **Candidates** have no reliable way to prove skills beyond a resume or self-reported claims.
- **Employers** waste months interviewing candidates who don't match the required skill level.
- **Institutions** (colleges, bootcamps) cannot connect their graduates directly to hiring pipelines.

The existing solutions (LinkedIn, Naukri, Glassdoor) are disconnected silos. Candidates build profiles in one place, prove skills in another, and apply for jobs in a third. There is no single platform that closes the loop from *learning* → *verification* → *hiring*.

## Target Users

### Primary: Candidates
- BCA, BSc CS, BTech students and fresh graduates
- Working professionals seeking to switch careers or upskill
- Self-taught developers wanting verified credibility
- Age: 18–35

### Secondary: Employers / Recruiters
- Startups and mid-size tech companies (10–500 employees)
- Hiring managers and technical recruiters
- Companies tired of high interview-to-offer ratios

### Tertiary: Institutions (B2B)
- Engineering colleges, bootcamps, and online academies
- Seeking placement pipeline for their students

## Product Goal

Create a centralized platform where:
1. Candidates build verifiable skill profiles (not just self-reported)
2. Employers find pre-vetted talent with transparent signals
3. The hiring process becomes faster and more accurate for both sides

## Core MVP Features

### Phase 1: Foundation (CURRENT)
1. **Authentication** — Signup, Login, Logout, Password Reset
2. **Dashboard** — Role-based view (Candidate / Recruiter)
3. **Candidate Profile** — Personal info, skills, experience, education
4. **Job Board** — Browse, filter, search job listings
5. **Job Details** — Full job description with apply button
6. **Job Application** — Submit application with cover letter
7. **Application Tracker** — View all submitted applications + status

### Phase 2: Core Engagement
8. **Code Arena** — Algorithmic challenges to verify coding skills
9. **LMS / Courses** — Curated learning paths
10. **Leaderboard** — XP-based ranking system
11. **Notifications** — In-app alerts for application status, challenges
12. **Messages** — Recruiter ↔ Candidate direct messaging

### Phase 3: B2B & Monetization
13. **Company Profiles** — Employer branding pages
14. **Institution Portal** — Bulk candidate enrollment
15. **Analytics Dashboard** — Hiring funnel metrics for employers
16. **Subscription Plans** — Free tier, Professional, Enterprise

## MVP Success Criteria

A candidate user should be able to:
1. ✅ Create an account with email + password
2. ✅ Log in and see their dashboard
3. ✅ Browse and filter job listings
4. ✅ View a job's full details
5. ✅ Apply to a job with a cover letter
6. ✅ Track all their applications and statuses
7. ✅ View their candidate profile
8. ✅ Browse coding challenges
9. ✅ Browse courses

A recruiter user should be able to:
1. ✅ Log in and see recruiter dashboard
2. ✅ Post a new job listing
3. ✅ Browse candidate profiles
4. ✅ View applications received

## Out of Scope (v1.0)
- Mobile application (iOS/Android)
- Payment processing / subscription billing
- AI-powered resume parsing
- Video interviews
- Enterprise SSO / SAML
- Real-time collaborative features
- Integration with ATS tools (Greenhouse, Lever)
- Email notifications (uses in-app only)

## Technical Constraints
- Must be browser-first (no native mobile)
- Supabase as single backend (no separate Express server)
- Must support 1,000 concurrent users at launch
- Page load under 3 seconds on 3G networks

---

*PRD Version 1.0 — TalentSphere*
