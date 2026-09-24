# TalentSphere — TESTING.md v6.0

## 1. Testing Philosophy

Tests prove intended behavior, not accidental current behavior.

## 2. Layers

```text
Unit
→ Component
→ Integration
→ API/Contract
→ E2E
→ Security
→ Accessibility
→ Performance
→ Failure/Recovery
→ Regression
```

## 3. Coverage Ownership

### Unit
Domain rules, pure transformations, scoring, matching explanations, state transitions.

### Component
UI states, forms, validation, accessibility behavior.

### Integration
Database, RLS, queues, provider adapters, transactional workflows.

### API
AuthZ, schema validation, pagination, errors, idempotency, rate limits.

### E2E
Critical user journeys.

### Security
Authorization fuzzing, RLS deny tests, tenant isolation, SSRF, upload, webhook replay, secrets.

### Accessibility
Keyboard, focus, semantics, screen reader, zoom, contrast, reduced motion.

### Performance
Route startup, interaction latency, API p95/p99, DB queries, queue age.

## 4. Critical E2E Suites

Candidate:
`signup → goal → skills → learning → assessment → evidence → job → apply`

Recruiter:
`org → job → search → review → message → interview → decision`

Institution:
`tenant → learner → learning → assessment → credential → verification`

## 5. Assessment Security Tests

Verify:
- session binding;
- timing;
- submission idempotency;
- answer protection;
- AI_PROHIBITED enforcement;
- AI escape-route closure;
- suspicious event capture;
- retry behavior;
- replay resistance.

## 6. AI Tests

- prompt injection;
- data boundary enforcement;
- provider fallback;
- free-user cost gate;
- provenance;
- malformed model output;
- policy denial;
- context minimization;
- hallucination/groundedness eval where applicable.

## 7. Data Integrity Tests

- unique constraints;
- FK constraints;
- state transition validity;
- audit records;
- evidence revocation impact;
- tenant isolation;
- migration verification.

## 8. Flaky Test Policy

A flaky test is a defect. Do not permanently quarantine critical tests without owner, reason and removal deadline.

## 9. CI Gates

No merge if required checks fail. High-risk domain changes require expanded test suites.

## 10. Production Verification

Post-deploy smoke tests verify:
- authentication;
- authorization;
- critical API;
- database connectivity;
- queue health;
- storage;
- observability;
- critical user journey.
