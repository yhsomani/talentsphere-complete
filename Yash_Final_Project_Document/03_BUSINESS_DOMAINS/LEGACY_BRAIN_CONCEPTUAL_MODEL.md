# Legacy Conceptual Model ("BRAIN") merged into the domain architecture

Doc ID: DOM-LEG-01 · Owner: Domain Architect · Version 1.0 · Status: Draft for Review · Relates: `DOMAIN_ARCHITECTURE.md` (DOM-00), `../01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md`, `../01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md`, `../22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md`, `../24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`, `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md`

Supersedes nothing; linked from `../00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` and `MASTER_INDEX`. Created under the standing instruction: "i dont want to loos information keep everything in use untile it get improved".

## Merged from legacy: `31_LEGACY_ARCHIVE/BRAIN/BRAIN.md` (v6.0, conceptual model)

(`BRAIN/MEMORY.md` is merged separately into `22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` and `24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md`.)

## 0. Frame

**Nothing is implemented.** The prior attempt kept a short "how to think about the system" note for coding agents. It is a conceptual model, not a design. Every statement is a requirement candidate or design heuristic for this project; none is evidence of a built system.

## 1. How to think about the system

TalentSphere is not primarily a job board, learning site, social network or AI wrapper. It is a **career evidence system**.

Core mental model:

```text
GOAL
-> CAPABILITY GAP
-> ACTIVITY
-> EVIDENCE
-> VERIFICATION
-> OPPORTUNITY
-> OUTCOME
-> NEW EVIDENCE
```

## 2. Claim vs evidence (legacy definitions)

| Term | Meaning |
|---|---|
| Profile claim | What a user says. |
| Evidence | What supports the claim. |
| Verification | Who or what validated the evidence. |
| Reputation | Context around trust and behaviour. |

Target alignment: the target evidence ladder (four rungs: claimed, artifact-backed, peer-attested, authority-verified; INV-T04 "a claim is never displayed as verified") refines the first three terms. The legacy fourth term, **reputation as context, not as a score a person can set**, matches legacy rules BR-164..BR-168 (reputation derived, skill-specific, time-decayed, private by default, auditable). Target `DOMAIN_ARCHITECTURE.md` should state explicitly that reputation is *derived context* and not an input to ranking (ADR-T22).

## 3. Graph model (legacy; three graphs)

| Graph | Contents |
|---|---|
| Talent Graph | skills; competencies; capabilities; prerequisites; relationships |
| Evidence Graph | evidence; provenance; verification; credentials; recency; conflicts; outcomes |
| Career Graph | goals; transitions; experiences; learning; applications; interviews; outcomes |

Target comparison: STR-01 section 2 names the Talent Graph and Evidence Graph as the durable asset. The **Career Graph** (goals, transitions, outcomes over time) appears in the target only through career intelligence features and legacy features F-85 (Career Graph and Progression), F-152, F-156. Legacy rules BR-157..BR-163 govern it (opt-in tracking, k >= 5 aggregates, individual transitions visible only to the user, benchmarks need >= 20 data points, no retroactive alteration of historical benchmarks, disclosure of data sources and confidence intervals). Target action: decide whether the Career Graph is a third first-class graph or a view over the other two (OPEN-LGA-11).

Legacy skill-graph rules that belong to the Talent Graph: BR-141..BR-148 (taxonomy curated by Platform Admin; directional prerequisite/sub-skill/supersedes relations; acyclic prerequisites; depth bound 5; emerging skills need independent signals). See `../06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md`.

## 4. Decision systems (legacy)

| System | Principle |
|---|---|
| Matching | Hard constraints first; then capability, evidence, experience, preferences, recency and uncertainty. |
| Recommendations | Always explain why. |
| Career intelligence | Scenario and decision support, **not prophecy**. |
| Trust | Anomaly is a signal for review, **not automatic guilt**. |

Target alignment: ADR-T22 (matching explainable, uncertainty-aware, never pay-to-rank); product constitution (no autonomous adverse decision). The **hard-constraints-first ordering** is an explicit design rule worth keeping in the matching specification (`SPEC_G4_HIRING_LOOP.md`); legacy rules BR-184..BR-188 add recommendation disclosure, no protected attributes, dismissals, sponsored labelling and a replaceable engine.

## 5. AI (legacy)

- AI can draft, explain, summarise, classify and recommend **within policy**.
- AI does not own truth.
- AI memory does not equal profile truth.
- AI-generated evidence is always provenance-labelled.

Target alignment: product constitution "never let AI output become evidence". The legacy wording is weaker (AI-generated evidence is allowed but **labelled**); the target is stricter (not evidence at all). Keep the target rule; record the difference (OPEN-LGA-11). The statement "AI memory does not equal profile truth" is not stated verbatim in the target and should be added to the AI policy documents (`../14_SECURITY_PRIVACY_COMPLIANCE/`).

## 6. Assessment (legacy)

The assessment session is a trust boundary. AI policy follows the session. (Legacy flow rule: no AI candidate assistance during an `AI_PROHIBITED` assessment; enforcement is server-side. Target: ADR-T13 and SPEC-05.)

## 7. Privacy (legacy)

The same data can have different visibility based on **purpose**. Never collapse privacy into a single public/private boolean. (Target: purpose-bound consent scopes, INV-T15; `../00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md`.)

## 8. Architecture heuristic (legacy)

Prefer:

```text
clear module
+ explicit contract
+ boring infrastructure
+ strong tests
```

over:

```text
generic abstraction
+ distributed complexity
+ hidden coupling
```

Target comparison: consistent with the modular-monolith baseline; in tension with optional runtime Module Federation (OPEN-03, OPEN-47). The heuristic is a useful tie-breaker for those decisions and is recorded as input to OPEN-03 (not a decision).

## 9. Common mistakes (legacy; carried over as review checklist)

- building AI before domain data is trustworthy;
- turning every feature into a shared platform;
- using a score when dimensions are needed;
- treating realtime as truth;
- treating queues as exactly-once business side effects;
- hard-coding policy values;
- confusing implementation existence with correctness.

Related legacy gap resolutions (from `31_LEGACY_ARCHIVE/docs/governance/GAP_ANALYSIS.md`): "Realtime as correctness: advisory only", "Queue exactly-once confusion: idempotent side effects", "Hard-coded retention: policy-driven", "Oversized shared kernel: narrowed to true cross-cutting primitives". The target already holds these as invariants; use this list as an architecture-review checklist.

## 10. Open items

| ID | Item |
|---|---|
| OPEN-LGA-11 | Decide Career Graph status (third graph vs view), and reconcile the AI-evidence wording (legacy: labelled; target: not evidence). Owner: Domain Architect + Product Director. |
