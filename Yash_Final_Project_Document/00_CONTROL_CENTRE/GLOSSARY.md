# Glossary

| Term | Meaning |
|---|---|
| Evidence | Artifact or observation supporting a skill claim, with provenance, recency, visibility and a rung on the evidence ladder. |
| Evidence provenance | Attributable origin and validation context for evidence, including source reliability, directness, recency, lifecycle, visibility, conflicts, and downstream effects. |
| Evidence ladder | `claimed → artifact-backed → peer-attested → authority-verified` (ADR-T14). |
| Verification | Auditable server-side act moving evidence/work-history up the ladder. |
| Referee | Non-account person who attests work history via a single-use tokenised link (INV-T05). |
| Credential | Formal attestation by an issuer (course, institution, assessment) with lifecycle (issued/suspended/revoked). |
| Capability | Evidence-informed representation of what a person can perform in a defined context; not a guarantee of future performance. |
| Goal | A user-defined career or development objective with a desired outcome and relevant target capabilities. |
| Experience | An attributable period or body of work that may support claims and evidence. |
| Opportunity | A career-related option, such as a job, project, apprenticeship, scholarship, volunteer placement, or mentorship. |
| Assessment | Governed evaluation with tasks, policy, attempts, scoring, and integrity controls. |
| Learning resource / path | A course, lesson, activity, or ordered program that supports a defined learning outcome. |
| Recommendation | Explainable suggested action, content, or opportunity with evidence, uncertainty, and freshness context. |
| Contribution | Attributable work or community activity that may create evidence; activity alone does not establish skill. |
| Entitlement | Access state derived from subscription, policy, or organization licensing. |
| Audit event | Attributable record of a consequential action and its relevant context. |
| Trust signal | Bounded input used to assess integrity or confidence; it is not proof of misconduct on its own. |
| Consent scope | Purpose-bound, versioned, revocable permission that gates recruiter/institution reads. |
| Host shell | Module Federation host app: auth session, router, design system, remote loader. |
| Remote | Independently built/deployed frontend module (MOD-CAND…MOD-ADM). |
| Host Contract | Versioned TypeScript/semver interface the shell exposes to remotes (ADR-T18). |
| Remote manifest | Signed JSON describing a remote build: version, compat ranges, assets, SRI. |
| Outbox | Table written in the same transaction as state change; worker publishes events (ADR-T09). |
| Fenced lease | Job claim carrying a generation token so stale workers cannot complete jobs. |
| Capability endpoint | `GET /me/capabilities`; UI hints only. |
| Sandbox runner | Isolated, network-less service that executes candidate code for assessments (ADR-T13). |
| BFF | Term for the same-origin session routes (`/api/v1/auth/*`, `GET /me`) that set httpOnly cookies so JS never sees tokens. There is no separate `/bff` URL namespace. |
| Explainable match | Match result with shown factors, evidence references and uncertainty (ADR-T22). |
| Tenant | Organization or institution; isolation unit (ADR-T21). |
| Fitness function (FF) | Automatable architecture rule checked in CI. |
| [REF] / [CONF] / [TARGET] / [OPEN] | Reference / confirmed / target decision / open assumption. |

Skills and evidence semantics must remain versioned and attributable. A conflicting authoritative record is surfaced as disputed; revocation or correction preserves history and triggers downstream impact review rather than silently rewriting a prior claim (root `SSOT.md` §§6.1–6.3; target lifecycle contracts remain in 06_BUSINESS_PROCESSES).
