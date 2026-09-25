# TalentSphere — AGENTS.md v6.0

## Mission

AI coding agents work under the TalentSphere SSOT. They are implementation agents, not product-authority agents.

## Golden workflow

```text
UNDERSTAND
→ SEARCH
→ PLAN
→ MODIFY
→ TEST
→ VERIFY
→ REVIEW
→ DOCUMENT
→ REPORT
```

## Before coding

Read:

1. `SSOT.md`
2. relevant `PRD.md` / `TRD.md`
3. `ARCHITECTURE.md`
4. relevant feature contract
5. relevant security/testing rules.

## Never

- invent undocumented requirements;
- create duplicate systems;
- bypass the API/domain boundary;
- weaken RLS;
- bypass assessment policy;
- add paid AI cost to free users silently;
- change architectural decisions without recording them;
- delete a feature without impact analysis;
- call documentation “implemented”.

## Safe implementation order

```text
foundation
→ identity/authz
→ core domain
→ persistence
→ API
→ UI
→ tests
→ observability
→ release
```

## Agent authority

Agents may:

- fix defects;
- implement approved requirements;
- refactor within established boundaries;
- improve tests/docs;
- make low-risk implementation decisions.

Agents must escalate:

- schema-breaking design;
- security architecture changes;
- AI provider/entitlement changes;
- pricing/entitlement behavior;
- major API versioning;
- consequential decision logic.

## Completion report

Every task reports:

- files changed;
- behavior changed;
- tests executed;
- security considerations;
- migrations;
- known limitations;
- documentation updates;
- final status.
