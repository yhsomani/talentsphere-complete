# Final Domain Coverage

Version 1.0 · Under Review. Full matrix of mission families A–X: [DOMAIN_ARCHITECTURE §4](../03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md). Features per domain: [hierarchy](../04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md).

Portfolio identity is not yet crosswalked: root `SSOT.md` §7 owns 173 canonical `F-*` IDs, while the hierarchy contains 253 decomposed `FEAT-*` rows. Domain-family coverage does not prove one-to-one or one-to-many feature coverage; OPEN-41 blocks a complete portfolio-coverage claim.

| Family | Covered by | Depth |
|---|---|---|
| Identity, orgs, profile, skills, evidence, verification, assessment, learning, jobs, applications, matching | DOM-01…11 | Full specs, rules, state machines, screens, APIs |
| Career intelligence, messaging, notifications, billing, privacy, AI gateway | DOM-12/13/15/16/17/22 | Specs + rules + APIs |
| Institutions, networking/community, integrations | DOM-18/14/23 | Lighter; phased (Ph3/Ph4); community deferred |
| Safety, admin/support, analytics, platform | DOM-19/20/21/24 | Processes, runbooks, metrics; fewer feature specs |
| Deliberately not built | generic workflow engine, CRM, payroll, ad network, crypto credentials, native apps at launch | Rationale in DOMAIN_ARCHITECTURE |

Known coverage gaps: 26 features without acceptance criteria; no UI research validation; legal regimes unconfirmed (OPEN-08).
