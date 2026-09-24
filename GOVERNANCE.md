# TalentSphere — GOVERNANCE.md v6.0

## 1. Authority

`SSOT.md` = canonical project intent and system definition.

Supporting documents specialize:
- PRD = product/business;
- TRD = technical requirements;
- ARCHITECTURE = architecture;
- UI/UX = visual/interaction;
- SECURITY = security/privacy/AI/assessment;
- TESTING = verification;
- FEATURE_REGISTRY = features;
- APP_FLOW = application journeys;
- WORKFLOWS_AND_BUSINESS_RULES = behavioral corpus;
- IMPLEMENTATION_PLAN = execution order;
- AGENTS = coding-agent operation;
- CODE_STYLE = engineering conventions;
- DATABASE/API = infrastructure contracts;
- BRAIN = conceptual model.

## 2. No Duplication

A definition belongs in one canonical place. Other documents reference it.

## 3. Change classes

- C1 text/copy
- C2 code/behavior
- C3 schema/security-policy
- C4 dependency
- C5 secret/config
- C6 architecture
- C7 commercial/entitlement

C3+ require expanded review; C6/C7 require founder approval.

## 4. Traceability

```text
Business outcome
→ User need
→ Journey
→ Feature
→ Requirement
→ Data/API/Event
→ Implementation
→ Test
→ Release gate
```

## 5. Status

```text
PLANNED
IN DEVELOPMENT
IMPLEMENTED
VERIFIED
RELEASED
```

Side states:
`BLOCKED`, `DEPRECATED`, `REJECTED`.

## 6. Documentation Sync

Any change that alters canonical behavior must update the relevant artifact in the same change set.

## 7. Historical Material

Prior editions are evidence/provenance only. They cannot override current canonical decisions.
