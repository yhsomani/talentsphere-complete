# TalentSphere — PRD.md v6.0

## Purpose

Product and business requirements. This document does not redefine technical implementation details; it points to `SSOT.md` for canonical system rules.

## 1. Product Definition

TalentSphere is a PWA-first Career Operating System centered on a Talent Graph and Evidence Graph. Its purpose is to connect career goals, learning, proof, verification, opportunities, hiring and outcomes.

### North-star loop

```text
GOAL → GAP → LEARN → PRACTICE → PROVE → VERIFY
→ DISCOVER → MATCH → APPLY → INTERVIEW → OUTCOME
→ NEW EVIDENCE → NEXT ACTION
```

## 2. Problem

Career information is fragmented across profiles, learning systems, job boards, assessments, portfolios, networking tools and employer workflows. Users repeatedly translate the same experience into claims without a unified evidence trail.

TalentSphere is designed to reduce that fragmentation by treating evidence and outcomes as first-class objects.

## 3. Target Users

Candidate/learner, career switcher, professional, recruiter, hiring manager, employer admin, instructor/course author, institution admin/faculty, mentor/expert, moderator, verification operator, support, finance and platform admin.

## 4. Core Jobs-to-be-Done

### Candidate
- Understand readiness for a goal.
- Identify gaps.
- Learn what matters.
- Produce evidence.
- Discover relevant opportunities.
- Apply with stronger proof.
- Learn from outcomes.

### Recruiter
- Find candidates using relevant capability/evidence signals.
- Understand why a candidate matches.
- Communicate, interview and decide efficiently.
- Preserve auditable hiring workflow.

### Instructor
- Deliver learning.
- Assess progress.
- Generate trustworthy achievement evidence.

### Institution
- Manage cohorts and permissions.
- Connect learning outcomes to employability.
- Preserve learner privacy and lifecycle.

## 5. Product Value Proposition

The strongest product promise is not “more features.” It is **a coherent evidence-backed career loop** where every meaningful action can improve future career decisions.

## 6. Goals

1. Create a trusted career identity.
2. Turn activity into attributable evidence.
3. Connect learning to opportunities.
4. Improve the quality and explainability of matching.
5. Close the feedback loop from application outcomes to future action.
6. Preserve privacy and human control.

## 7. Non-goals

- General social-media clone.
- General HR/payroll suite.
- Autonomous hiring engine.
- Guaranteed jobs or salary outcomes.
- General non-career services marketplace.
- Hardware/OS platform.
- Mandatory dependency on LinkedIn/Udemy/Coursera/Glassdoor/HackerRank.

## 8. GA Scope

GA requires the platform foundations plus a complete trusted career loop. The 173-feature portfolio is not a requirement to ship all 173 features before validating the core product.

### GA release path

```text
Identity
→ Profile + Goals
→ Skills + Evidence
→ Learning
→ Assessment/Practice
→ Portfolio/Proof
→ Jobs
→ Applications
→ Recruiter Review
→ Communication
→ Outcome
→ Career Graph
```

## 9. Product Metrics

### Primary
**Verifiable Career Progress**

### Supporting
- activation;
- goal creation;
- skill coverage;
- evidence creation;
- verified evidence;
- learning completion;
- assessment improvement;
- qualified applications;
- interviews;
- offers;
- hires;
- outcome feedback;
- retention.

### Business
- paid conversion;
- recurring revenue;
- gross margin;
- infrastructure cost;
- AI cost by capability;
- enterprise expansion;
- support burden.

## 10. Product Rules

- Evidence is stronger than unsupported self-claims.
- Matching is explainable.
- AI is governed.
- Assessment AI restrictions are enforceable server-side.
- Free users do not create unplanned paid AI cost.
- Privacy is purpose-bound.
- Popularity is not professional credibility.
- Anomalies require review, not automatic guilt.

## 11. Feature Portfolio

The canonical 173-feature register and status/dependency metadata live in `FEATURE_REGISTRY.md`. Feature-specific implementation contracts live with the feature/domain artifacts.

## 12. Product Acceptance

A product increment is accepted only when the user outcome, journey, security/privacy constraints, accessibility behavior, operational readiness and measurable acceptance criteria are satisfied.
