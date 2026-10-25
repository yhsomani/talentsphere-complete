# Assumptions

All unverified unless stated. Detail and owners in `24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` (written by the Ops team; IDs here are canonical).

| ID | Assumption / open question | Status |
|---|---|---|
| OPEN-03 | At least 3 independent frontend teams will exist; otherwise federation runs in bundled mode (ADR-T03). | OPEN |
| OPEN-05 | Gross-margin and AI-cost targets will be set by finance. | OPEN |
| OPEN-06 | Instructor revenue share model. | OPEN |
| OPEN-07 | Personas will be validated by real user research. | OPEN |
| OPEN-08 | Applicable legal regimes and retention periods confirmed by counsel. | OPEN |
| OPEN-09 | Whether minors (under 18) are in scope for institutions. | OPEN |
| OPEN-10 | Identity verification (government ID) offered at all, and via which vendor. | OPEN |
| OPEN-11 | `@module-federation/vite` is production-stable for our needs (spike required). | OPEN |
| OPEN-12 | iOS/Android PWA behaviours (push, storage, install) verified on a real device lab. | OPEN |
| OPEN-13 | Remaining research items listed in RESEARCH_LOG. | OPEN |
| OPEN-43 | Which root SSOT and legacy-registry business rules are adopted, revised, or retired, and how are conflicts resolved? | OPEN |
| OPEN-44 | Authorization model and permission enforcement contract reconcile the canonical SSOT roles, observed implementation role union, and target scoped grants. | OPEN |
| OPEN-45 | Journey, workflow-integrity and state-machine identities map completely from the root SSOT to the target UJ/BP/SM contracts. | OPEN |
| OPEN-46 | A single reviewed API envelope, pagination default, deprecation lifecycle, and source-contract identity mapping is selected. | OPEN |
| OPEN-47 | Target domain merges and optional frontend federation are justified against the root SSOT's domain-oriented modular-monolith boundaries. | OPEN |
| OPEN-48 | Security, privacy, AI-safety, assessment, and source-control differences have explicit owner-approved target dispositions. | OPEN |
| OPEN-49 | Reliability/operations source controls map to calibrated target SLOs, runbooks, and recovery evidence. | OPEN |
| OPEN-50 | Source service, UX, phase, governance, and tail-register identities are reconciled with preserved IDs and contradictions. | OPEN |
| OPEN-51 | Primary product outcome metric and its relationship to supporting marketplace/hiring measures are approved. | OPEN |
| A-01 | PostgreSQL 16+ with `pgvector` and `pg_trgm` available on the chosen host. | OPEN |
| A-02 | Single primary region at launch; multi-region later. | TARGET |
| A-03 | English-only UI at launch, i18n-ready. | TARGET |
