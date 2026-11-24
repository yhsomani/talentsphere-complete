# Glossary

One meaning per term, used the same way in every blueprint file. Terms carried from `SSOT.md` §26 keep their sense; where this blueprint sharpens or changes a term, the note says so.

## Product terms

| Term                                    | Definition                                                                                                                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Career operating system**             | The product goal: one platform covering the whole career domain (identity, learning, assessment, evidence, hiring, networking, institutions and adjacent career services). It is a breadth metaphor, not a device-level operating system (`DEC-002`; `SSOT.md` §4.1). |
| **Candidate** (`CAN`)                   | An individual professional using the product to build a career. The default role.                                                                                                                                                                                     |
| **Student** (`STD`)                     | A candidate attached to an institution; may be a managed learner.                                                                                                                                                                                                     |
| **Managed learner**                     | A user whose learning is provisioned and visible to an institution within the scope the institution agreement and consent allow.                                                                                                                                      |
| **Graduation transition**               | The process by which a managed learner becomes an independent candidate, keeping the credentials earned.                                                                                                                                                              |
| **Evidence**                            | Proof attached to a claim (skill, work history, credential), with an issuer, a source and a verification level. A claim without evidence is a claim, not proof.                                                                                                       |
| **Evidence ladder**                     | The ordered verification levels that evidence climbs (self-asserted up to independently verified). Defined in the `EVD` module.                                                                                                                                       |
| **Credential**                          | An issued recognition (certificate, badge, attestation) with an explicit lifecycle: issued, valid, expired, revoked.                                                                                                                                                  |
| **Verifiable credential**               | A credential that a third party can check without contacting the platform, using an open standard. Optional per `OD-EVD-*`.                                                                                                                                           |
| **Verified signal**                     | A credential or evidence item earned on the platform, as opposed to imported or self-declared.                                                                                                                                                                        |
| **Skill**                               | A node in the skills taxonomy with a stable `SK-` id. The taxonomy owner is an open decision (`OD-ARC-07`).                                                                                                                                                           |
| **Skills graph**                        | Relationships among skills (synonyms, parents, prerequisites, adjacency).                                                                                                                                                                                             |
| **Requisition**                         | An employer's authorized request to fill a role; one requisition can produce one or more job postings.                                                                                                                                                                |
| **Posting / listing**                   | `ATS` owns the posting; `JOB` owns the candidate-facing listing projection and applications.                                                                                                                                                                          |
| **Application**                         | A candidate's submission to a listing, with a snapshot of what they submitted.                                                                                                                                                                                        |
| **Pipeline**                            | The ordered stages through which applications move.                                                                                                                                                                                                                   |
| **Scorecard**                           | A structured, criteria-based interview evaluation.                                                                                                                                                                                                                    |
| **Human in the loop**                   | AI may assist but never takes a consequential decision alone; a named human is recorded on every such decision.                                                                                                                                                       |
| **Consequential decision**              | A decision that materially affects a person's access to work, learning, money or standing (reject, rank for removal, sanction, certify, pay).                                                                                                                         |
| **Consent scope**                       | A named purpose a person grants or withdraws permission for. The catalogue is owned by `SET`.                                                                                                                                                                         |
| **Cohort suppression (`min_cohort_k`)** | The minimum group size below which an aggregate is not shown, to prevent re-identification. Value is `OD-PRD-12`.                                                                                                                                                     |
| **Entitlement**                         | A capability a plan, license or grant gives an account. Enforced server-side; owned by `BIL`.                                                                                                                                                                         |
| **Seat pool**                           | A purchased set of seats an institution or organization assigns to people.                                                                                                                                                                                            |
| **OS-expansion module**                 | A module beyond the SSOT scope (`MEN`, `GIG`, `EVT`, `MKT`, `ENT`). Fully specified, denied by policy until admitted (`OD-PRD-02`).                                                                                                                                   |

## Blueprint terms

| Term                           | Definition                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Module**                     | A bounded area of the product with a three-letter code (see [CONVENTIONS](CONVENTIONS.md) §4).      |
| **Sub-module**                 | A grouping of related features inside a module (lettered A, B, C in the module file).               |
| **Feature (`FR-`)**            | One specified capability with the full template.                                                    |
| **Business rule (`BR-`)**      | A rule the system enforces, with rationale and enforcement point.                                   |
| **State machine (`SM-`)**      | A lifecycle with states, transitions, guards and triggers.                                          |
| **Open decision (`OD-`)**      | A question needing stakeholder input, with options and a default proposal. Never silently resolved. |
| **Recorded decision (`DEC-`)** | A decision already taken, with who decided and when.                                                |
| **Release tier (`R0`-`R6`)**   | A dependency-based grouping of features; not a date.                                                |
| **Evidence tags**              | `[SRC]` sourced, `[DER]` derived, `[PROP]` proposed, `[DEC-REQ]` needs a decision.                  |
| **As-built**                   | What the repository's code does today, recorded only in `ARCHITECTURE.md` and `docs/reports/`.      |
| **Intended**                   | What this blueprint says the product should be.                                                     |

## Technical terms

| Term                 | Definition                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Modular monolith** | One deployable application organized into modules with enforced boundaries; the starting architecture.                                                       |
| **Outbox**           | A table written in the same transaction as a state change; a dispatcher publishes its rows as events, so no change is lost or announced without being saved. |
| **Idempotency key**  | A client-supplied token that makes a repeated request produce one effect.                                                                                    |
| **Tenant**           | The ownership boundary for data: a user, employer organization, institution or enterprise workspace.                                                         |
| **RLS**              | Row-level security: database policies that restrict rows by tenant and principal.                                                                            |
| **Adapter / port**   | A provider-neutral interface (port) and a vendor-specific implementation (adapter) so vendors can be swapped.                                                |
| **DSAR**             | Data subject access request: a person exercising privacy rights (access, export, correction, erasure).                                                       |
| **DPIA**             | Data protection impact assessment.                                                                                                                           |
| **SLO / SLI**        | Service level objective / indicator: a measurable reliability target and the measurement behind it.                                                          |
| **PWA**              | Progressive web app: installable web application with offline support.                                                                                       |
| **RPO / RTO**        | Recovery point / time objective: tolerated data loss / downtime after a failure.                                                                             |
| **SSRF**             | Server-side request forgery: tricking the server into fetching an internal resource.                                                                         |
| **MoSCoW**           | Must, Should, Could, Won't-now priority classes.                                                                                                             |
