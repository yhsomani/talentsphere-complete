# TalentSphere — IMPLEMENTATION_PLAN.md v6.0

## Founder execution order

### Phase 0 — Platform Trust Foundation
Repository, environments, CI/CD, Supabase, Postgres, migrations, Auth, authorization, RLS, API boundary, audit, observability, design system, PWA shell, AI policy engine.

### Phase 1 — Career Identity
Profile, goals, skills, ontology, experience, education, portfolio.

### Phase 2 — Evidence & Learning
Evidence, verification foundation, courses, progress, challenges, assessment core.

### Phase 3 — Opportunity Loop
Jobs, search, applications, recruiter pipeline, messaging, notifications.

### Phase 4 — Hiring Depth
Interview, scorecards, application feedback, references, career outcomes.

### Phase 5 — Intelligence
Talent/Evidence/Career graph, matching, recommendations, readiness, market signals.

### Phase 6 — Trust & Ecosystem
Reputation, moderation, appeals, anti-gaming, mentorship, networking.

### Phase 7 — Institutional/Enterprise
Institutions, licensing, reporting, procurement, enterprise controls.

### Phase 8 — Advanced AI
Expanded AI capabilities after gateway/policy/evaluation foundations are proven.

### Phase 9 — Expansion
Marketplace, advanced analytics, internal mobility, advanced forecasting, external ecosystem.

### Phase 10 — Scale
Only measured search extraction, cache, replicas, selective service extraction, bounded agents/automation.

## Exit gates

Every phase must prove:
- user outcome;
- architecture integrity;
- security;
- accessibility;
- tests;
- observability;
- documentation;
- rollback/recovery.

## First implementation epics

1. monorepo/tooling
2. CI
3. database/migrations
4. Auth
5. authorization/RLS
6. audit
7. API contract
8. PWA shell
9. design system
10. observability
11. profile
12. ontology
13. evidence
14. learning
15. assessment
16. jobs
17. applications
18. recruiter workflow
19. career graph
20. AI Gateway

## Rule

Do not start downstream implementation merely because a feature has high priority. All blocking dependencies must be ready or intentionally mocked with a documented exit path.
