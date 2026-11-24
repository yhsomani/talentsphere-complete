<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

# Risk Register

Risks identified per module and per area.

**Total: 428.**

## 01_PRODUCT/01_VISION_AND_STRATEGY.md

Source: [01_PRODUCT/01_VISION_AND_STRATEGY.md](../01_PRODUCT/01_VISION_AND_STRATEGY.md)

| ID         | Risk                                                                                             | Mitigation / control                                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RSK-PRD-01 | Cold start on a multi-sided platform: candidates without employers, employers without candidates | Few early employers · No hiring outcomes, so no outcome evidence · Seed supply through institutions (`INS`) and single-player value (`PRF`, `EVD`, `LRN`) before marketplace depth; R1 pilot scope (`OD-PRD-09`) [SRC: STR-01 §9] |
| RSK-PRD-02 | Scope overreach: 30 modules dilute delivery of the core loop                                     | OS goal · Nothing reaches production quality · Release tiers by dependency (02 §4); OS-expansion gated (`OD-PRD-02`) [SRC: SSOT §2.5]                                                                                             |
| RSK-PRD-03 | Referee non-response leaves evidence stuck at `claimed`                                          | Busy referees · Weak evidence ladder · Tokenized mobile flow, reminders, alternative verification paths [SRC: STR-01 §9]                                                                                                          |
| RSK-PRD-04 | Evidence gaming: fake referees, colluding attestations, purchased projects                       | Incentive to look verified · Trust collapse · Independence checks, anomaly review (anomaly is not guilt), revocation [SRC: SSOT §3.2]                                                                                             |
| RSK-PRD-05 | Regulatory exposure for automated employment decisions and AI                                    | AI features in hiring · Legal action; forced withdrawal · No autonomous adverse decisions; descriptive only; adverse-impact review (`OD-PRD-14`) [SRC: SSOT Amendment E]                                                          |
| RSK-PRD-06 | AI cost overrun from free users                                                                  | Popular AI features · Negative margin · Cost policy and quotas (`OD-PRD-21`) [SRC: SSOT §16.4]                                                                                                                                    |
| RSK-PRD-07 | Marketplace money-flow liability (tax, payouts, refunds, fraud)                                  | `GIG`, `MEN`, paid courses · Financial and legal loss · Seller-of-record decision first (`OD-PRD-04`); payouts inactive until then                                                                                                |
| RSK-PRD-08 | Institutions or employers treated as data owners of a person                                     | Contract pressure · Loss of user trust; legal conflict · `BR-XCT-001`, graduation transfer, consent per institution                                                                                                               |
| RSK-PRD-09 | Moderation load from community and reviews                                                       | `NET`, `EMP` reviews · Harm, defamation · Narrow community scope (`OD-PRD-16`, `OD-PRD-17`), moderation model (`OD-PRD-35`)                                                                                                       |
| RSK-PRD-10 | Personas are hypothetical; no user research exists                                               | No research budget recorded · Building the wrong thing · Research before R1 (`OD-PRD-25`) [SRC: USR-01 "Personas below are hypothetical"]                                                                                         |

## ADM

Source: [02_MODULES/ADM_Admin_Console_Support_Operations.md](../02_MODULES/ADM_Admin_Console_Support_Operations.md)

| ID         | Risk                                                                               | Mitigation / control                                                                                  |
| ---------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| RSK-ADM-01 | Insider misuse of personal data through support access.                            | Medium / High · Masking, grants, anomaly rules, audit, quarterly reviews (FR-ADM-005, 009, 012, 013). |
| RSK-ADM-02 | Compromise of an admin account yields platform-wide damage.                        | Low / Critical · Passkeys, separate origin, 2P, step-up, network allowlist, break-glass monitoring.   |
| RSK-ADM-03 | Kill switch fails to propagate during a real incident.                             | Low / High · Signed cached state, instance acknowledgements, drills, partial-propagation alerts.      |
| RSK-ADM-04 | Support service levels never defined, so the desk cannot be managed.               | High / Medium · OD-ADM-03; defaults shown in tooling.                                                 |
| RSK-ADM-05 | Admin scope grows into generic HR or payroll tooling, violating the SSOT non-goal. | Medium / Medium · OD-ADM-13; reviews of new admin features against §1.2.                              |
| RSK-ADM-06 | Audit log volume and cost grow faster than planned.                                | Medium / Medium · Event class retention, summary-only payloads, tiered storage.                       |
| RSK-ADM-07 | Impersonation erodes user trust.                                                   | Low / High · Consent by default, user-visible trail, org opt-out, read-only enforcement.              |
| RSK-ADM-08 | Flag and config debt makes behavior unpredictable.                                 | High / Medium · Owner and expiry, stale reports, creation block for owners with stale flags.          |
| RSK-ADM-09 | Two-person approval slows incident response.                                       | Medium / Medium · Break-glass, kill-switch single-person activation with review.                      |
| RSK-ADM-10 | Staff time-zone coverage is insufficient for SLAs and statutory deadlines.         | Medium / Medium · Business calendars, on-call rota outside platform, escalation to SAD.               |

## AIC

Source: [02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md](../02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md)

| ID         | Risk                                                         | Mitigation / control                                                                         |
| ---------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| RSK-AIC-01 | Biased matching harms protected groups                       | M / H · Allowlist inputs, counterfactual tests, fairness gates, human review, no auto-reject |
| RSK-AIC-02 | Hallucinated or fabricated resume content misleads employers | H / H · "Needs your input" rule, golden-set zero tolerance, verified evidence separation     |
| RSK-AIC-03 | Provider data exposure or training on user data              | M / H · Redaction, contracts, class-based routing, on-device option                          |
| RSK-AIC-04 | Cost overrun from heavy use                                  | M / M · Metering, budgets, fallbacks, free-user invariant                                    |
| RSK-AIC-05 | Prompt injection via uploaded resumes or job posts           | H / M · Sanitization, enclosure, canary, schema validation                                   |
| RSK-AIC-06 | Users over-trust AI outputs                                  | M / M · Confidence labels, disclaimers, evidence links                                       |
| RSK-AIC-07 | AI use during assessments undermines integrity               | M / H · Server-side deny with fail-closed context                                            |
| RSK-AIC-08 | Regulatory classification of hiring AI                       | M / H · Treat as high-risk, transparency, human review, audits, `OD-AIC-05`                  |
| RSK-AIC-09 | Provider outage or deprecation                               | H / M · Breakers, fallbacks, model registry migration plan                                   |

## ANL

Source: [02_MODULES/ANL_Analytics_Reporting_Insights.md](../02_MODULES/ANL_Analytics_Reporting_Insights.md)

| ID         | Risk                                                             | Mitigation / control                                                                         |
| ---------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| RSK-ANL-01 | Analytics becomes surveillance of candidates, staff or employees | Trust and legal harm · BR-ANL-007, 030, 031; no individual-level tools in dashboards         |
| RSK-ANL-02 | Re-identification from small cells or repeated queries           | Privacy breach · BR-ANL-004, 005, 024; query budgets (FR-ANL-005)                            |
| RSK-ANL-03 | Conflicting definitions and silently shifting numbers            | Wrong decisions · Registry, versioning, certification, reconciliation (FR-ANL-001, 008, 035) |
| RSK-ANL-04 | Experimentation harms users or fairness                          | Harm, reputation · BR-ANL-018..021, guardrails and kill switch                               |
| RSK-ANL-05 | Low consent reduces coverage and biases insights                 | Misleading metrics · Coverage labels, service-fact metrics from server records, `OD-ANL-02`  |
| RSK-ANL-06 | Cost and load of analytic queries affecting the product          | Outages · Separate store, query budgets, rollups (BR-ANL-026)                                |
| RSK-ANL-07 | Scope breadth across all roles delays core value                 | Delivery risk · `OD-ANL-01` minimal slice; dashboards follow module readiness                |
| RSK-ANL-08 | Dashboard overload with vanity metrics                           | Poor decisions · Decision-supported rule (BR-ANL-001), counter-metrics (BR-ANL-025)          |

## ASM

Source: [02_MODULES/ASM_Assessments_Challenges_Integrity.md](../02_MODULES/ASM_Assessments_Challenges_Integrity.md)

| ID         | Risk                                                                               | Mitigation / control                                                                                        |
| ---------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| RSK-ASM-01 | Sandbox escape or abuse (crypto mining, network probing)                           | Medium, high · Network-less isolation, seccomp, limits, security tests, separate pools                      |
| RSK-ASM-02 | False-positive integrity flags harm candidates or disproportionately affect groups | Medium, high · Human review, disclosure, appeals, fairness monitoring, thresholds validated before enabling |
| RSK-ASM-03 | AI misuse outside the platform cannot be detected                                  | High, medium · Honest policy statements, proctoring levels for high stakes, item design resistant to lookup |
| RSK-ASM-04 | Item leaks undermine exams                                                         | Medium, high · Pools, rotation, exposure caps, watermarking, leak scans, response playbook                  |
| RSK-ASM-05 | Runner outages cause backlogs and many `unverified` attempts                       | Medium, medium · Multiple pools, autoscaling, honest status, re-grade window                                |
| RSK-ASM-06 | Proctoring privacy and legal exposure                                              | Medium, high · Consent, alternatives, DPIA, minimal retention, vendor contracts                             |
| RSK-ASM-07 | Accommodation data exposure                                                        | Low, high · Special-category controls, access logs, no employer visibility                                  |
| RSK-ASM-08 | Employers misuse assessments for discriminatory screening                          | Medium, high · Job-relatedness mapping, disallowed content rules, consent, audit                            |
| RSK-ASM-09 | Evidence inflation from poorly calibrated or short assessments                     | Medium, high · Calibration, standard setting, eligibility gate, level bands                                 |
| RSK-ASM-10 | Sandbox compute cost grows unbounded                                               | Medium, medium · Rate limits, caps per user, queue priorities, cost dashboards                              |
| RSK-ASM-11 | Timer, clock or session manipulation                                               | Low, high · Server authority, session binding, signals, tests                                               |
| RSK-ASM-12 | Content licensing disputes for imported item banks                                 | Medium, medium · License matrix, provenance fields, takedown path (STU process reuse)                       |
| RSK-ASM-13 | Candidate anxiety and perceived unfairness reduce adoption                         | Medium, medium · Clear disclosure, accessible design, practice mode, appeals                                |

## ATS

Source: [02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md](../02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)

| ID         | Risk                                                                | Mitigation / control                           |
| ---------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| RSK-ATS-01 | Automated or AI-assisted screening creates discrimination liability | BR-ATS-015, BR-ATS-038, blind mode, monitoring |
| RSK-ATS-02 | Candidate PII leak across tenants or to the candidate (notes)       | BR-ATS-002, BR-ATS-016, contract tests         |
| RSK-ATS-03 | Over-complex pipelines slow recruiters                              | Defaults, templates, saved views               |
| RSK-ATS-04 | Retention and rights obligations missed                             | Scheduled jobs, escalation at day 25           |
| RSK-ATS-05 | Scraping of sourcing index                                          | Caps, logging, contact reveal policy           |
| RSK-ATS-06 | Offer errors (wrong pay, wrong letter)                              | Letter vs offer match check, approvals         |
| RSK-ATS-07 | Integrations (boards, HRIS) fail silently                           | Retries with visible status and tasks          |
| RSK-ATS-08 | Legacy state vocabulary disagreement causes enum drift              | SM names are authoritative here; OD in JOB     |

## BGV

Source: [02_MODULES/BGV_Verification_Background_Checks.md](../02_MODULES/BGV_Verification_Background_Checks.md)

| ID         | Risk                                                                        | Mitigation / control                                                                                            |
| ---------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| RSK-BGV-01 | Non-compliance with consumer reporting, fair-chance or data protection laws | Regulatory action, litigation · Rule engine, counsel-reviewed packs, fail closed, audit                         |
| RSK-BGV-02 | Inaccurate vendor data causes wrongful rejection                            | Harm to candidates, liability · Individualized assessment, pre-adverse notice, disputes, no automated decisions |
| RSK-BGV-03 | Leak of check data                                                          | Severe harm · Restricted classification, segregation, field encryption, watermark, logs, anomaly alerts         |
| RSK-BGV-04 | Employers misuse checks for discrimination or fishing                       | Harm, brand risk · Packages by role, uniform-policy prompts, fair-hiring monitoring, TSF review                 |
| RSK-BGV-05 | Vendor outage or country coverage gaps                                      | Delays · Failover to disclosed vendors, SLA monitoring, status transparency                                     |
| RSK-BGV-06 | Biometric data handling failures                                            | Privacy harm · Vendor-held data, separate consent, non-biometric alternative                                    |
| RSK-BGV-07 | Check data bleeds into profiles, search or matching                         | Discrimination · BR-BGV-013, contract tests on other modules, data access policy                                |
| RSK-BGV-08 | Consent flow friction reduces completion                                    | Hiring delays · Clear language, mobile-first, reminders                                                         |
| RSK-BGV-09 | Retention schedule conflicts across jurisdictions                           | Legal exposure · Jurisdiction-level schedules, holds, counsel sign-off                                          |
| RSK-BGV-10 | Candidates cannot reach vendors to dispute                                  | Unresolved errors · Platform-forwarded disputes, SLA tracking, escalation                                       |

## BIL

Source: [02_MODULES/BIL_Billing_Plans_Entitlements.md](../02_MODULES/BIL_Billing_Plans_Entitlements.md)

| ID         | Risk                                                                                          | Mitigation / control                                                                |
| ---------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| RSK-BIL-01 | Entitlement drift: product grants access that payment state does not support, or the reverse. | Medium, high · Single resolver, drift metric, reconciliation re-sync                |
| RSK-BIL-02 | Forged or replayed webhooks.                                                                  | Low, high · Signature, tolerance, idempotency, mode isolation                       |
| RSK-BIL-03 | Prices or quotas set without a cost model causing losses (AI cost).                           | Medium, high · OD-BIL-01, BR-BIL-019, hard cap default                              |
| RSK-BIL-04 | Tax non-compliance in new regions.                                                            | Medium, high · Registration gap list, no assumed rates, OD-BIL-03                   |
| RSK-BIL-05 | Pay-to-rank creep through custom contracts.                                                   | Medium, high · Integrity guard on contracts and grants, no exceptions               |
| RSK-BIL-06 | Fraud: trial abuse, coupon abuse, stolen cards, refund abuse.                                 | Medium, medium · Fingerprint checks, rate limits, dual approval, dispute handling   |
| RSK-BIL-07 | Payout and escrow regulation exposure (money transmission).                                   | Medium, severe · Use provider-managed connected accounts, escrow gated by OD-BIL-10 |
| RSK-BIL-08 | Over-limit downgrades harming customers (unpublished jobs).                                   | Medium, medium · BR-BIL-008, notice, owner chooses                                  |
| RSK-BIL-09 | Scope creep into accounting, payroll or CRM.                                                  | Medium, medium · Hooks only, BR-BIL-031, OD-BIL-12                                  |
| RSK-BIL-10 | Provider lock-in or outage.                                                                   | Low, high · Provider port, status banner, cached resolution with fail policy        |

## EMP

Source: [02_MODULES/EMP_Employer_Organisation_Teams_Brand.md](../02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)

| ID         | Risk                                                                 | Mitigation / control                                                         |
| ---------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| RSK-EMP-01 | Fake or lookalike employers harm candidates                          | Verification, lookalike screening, suspension, reports                       |
| RSK-EMP-02 | Review manipulation (employer pressure, competitor attacks, bombing) | Relationship verification, velocity checks, moderation, anonymity protection |
| RSK-EMP-03 | Cross-tenant data leaks via agencies or sub-orgs                     | Isolation tests, context-bound authorization, audits                         |
| RSK-EMP-04 | Privilege escalation through custom roles or API keys                | Creator-bound permissions, re-auth, key scopes                               |
| RSK-EMP-05 | Webhook endpoints abused for SSRF or data leaks                      | URL validation, minimal payloads, signing                                    |
| RSK-EMP-06 | Billing and entitlement drift between EMP and BIL                    | Single source of truth in BIL, cached with TTL                               |
| RSK-EMP-07 | Legal exposure from reviews or DPA gaps                              | Moderation guidelines, counsel review, DPA gate                              |
| RSK-EMP-08 | SSO misconfiguration locks out an org                                | Test requirement, break-glass owner                                          |

## ENT

Source: [02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md](../02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)

| ID         | Risk                                                                        | Mitigation / control                                                                                           |
| ---------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| RSK-ENT-01 | Scope creep into HRIS, performance or payroll                               | Violates SSOT §4.2 · Blocklist, read-only HRIS, `OD-ENT-01`, `OD-ENT-02`                                       |
| RSK-ENT-02 | Employer surveillance of employee career exploration                        | Trust collapse, legal risk · Confidential applications, access log, projection boundary (BR-ENT-003, 008, 023) |
| RSK-ENT-03 | Works-council and local law non-compliance                                  | Fines, blocked rollout · Regional controls and acknowledgements (FR-ENT-031)                                   |
| RSK-ENT-04 | Bias in internal matching or succession                                     | Discrimination · Narrow inputs, explainability, fairness review with `MKT` (BR-ENT-011, 017)                   |
| RSK-ENT-05 | SSO or SCIM misconfiguration locking out users or leaving access after exit | Security incident · Tests, dual control, break-glass, latency metric (BR-ENT-021, 026)                         |
| RSK-ENT-06 | Small-group re-identification in team views                                 | Privacy breach · Thresholds and operational vs analytic separation (BR-ENT-019)                                |
| RSK-ENT-07 | Compliance evidence tampering or loss                                       | Audit failure · Immutable evidence, retention (BR-ENT-013, 014)                                                |

## EVD

Source: [02_MODULES/EVD_Evidence_Work_History_Credentials.md](../02_MODULES/EVD_Evidence_Work_History_Credentials.md)

| ID         | Risk                                                                     | Mitigation / control                                                                                                             |
| ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| RSK-EVD-01 | Fake employers or colluding verifiers inflate verified work history      | Loss of trust · Domain binding, verifier authentication, independence rules, anomaly detection, manual review with dual approval |
| RSK-EVD-02 | Endorsement rings and reciprocal gaming                                  | Meaningless signal · Weighting adjustments, cluster detection, caps, reports                                                     |
| RSK-EVD-03 | Public verification pages leak personal data                             | Privacy breach · No PII by default, PII scans in tests, random ids                                                               |
| RSK-EVD-04 | Revocation not propagating to caches, shares and downstream systems      | Stale trust · Cache purge, impact analysis, 5 minute target, monitoring                                                          |
| RSK-EVD-05 | Issuer key compromise                                                    | Forged credentials · KMS, rotation, re-verification runbook                                                                      |
| RSK-EVD-06 | Evidence scoring perpetuates bias (institution prestige, employer brand) | Unfair outcomes · Excluded inputs, cohort audits, disclosure                                                                     |
| RSK-EVD-07 | Employers drown in verification requests or ignore them                  | Low verification rates · Bulk program, reminders, auto-response, peer path                                                       |
| RSK-EVD-08 | Erasure conflicts with append-only evidence and legal holds              | Compliance failure · Opaque subject refs, documented exceptions, sweep reports                                                   |
| RSK-EVD-09 | Recruiters over-rely on a composite strength label                       | Unfair rejections · Components shown, no automatic rejection, training text                                                      |
| RSK-EVD-10 | Third-party credential URLs are abused for SSRF or malware               | Security incident · SSRF-safe fetcher, scanning, allowlists                                                                      |

## EVT

Source: [02_MODULES/EVT_Events_Hackathons_Community_Programmes.md](../02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)

| ID         | Risk                                                  | Mitigation / control                                                                                 |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| RSK-EVT-01 | Scam events and phishing links via join URLs          | User harm, brand damage · Host verification, allow-list, review gate, reports (FR-EVT-004, 015, 035) |
| RSK-EVT-02 | Sponsor pressure turns events into lead farms         | Consent violations · Opt-in per organization, audit logs (FR-EVT-034)                                |
| RSK-EVT-03 | Judging disputes and IP claims in hackathons          | Legal, reputation · Locked rules, conflict controls, audit, IP clause (BR-EVT-013..015)              |
| RSK-EVT-04 | Oversell or double allocation under race conditions   | Trust loss · Transactional capacity, idempotency (BR-EVT-004, 005)                                   |
| RSK-EVT-05 | Scope creep toward a social network or live streaming | Violates SSOT §4.2 · Keep external providers, labelled limits (OD-EVT-01, 03)                        |
| RSK-EVT-06 | Cross-border event data and recording laws            | Compliance · Consent notice, retention, OD-EVT-06                                                    |

## GIG

Source: [02_MODULES/GIG_Freelance_Contract_Project_Work.md](../02_MODULES/GIG_Freelance_Contract_Project_Work.md)

| ID         | Risk                                                                      | Mitigation / control                                                                             |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| RSK-GIG-01 | Regulatory exposure from holding funds (money transmission).              | Medium, severe · Mode A default, OD-GIG-02, licensed provider only                               |
| RSK-GIG-02 | Worker misclassification claims against clients or the platform.          | Medium, high · Classification guard, no payroll features, counsel-reviewed terms                 |
| RSK-GIG-03 | Scope creep into a general marketplace against SSOT §4.2.                 | High, medium · Category allowlist, OD-GIG-01, no pay-to-rank                                     |
| RSK-GIG-04 | Client non-payment under pay-on-acceptance.                               | Medium, high · Pre-authorization, spend limits, suspensions, collections, auto-accept protection |
| RSK-GIG-05 | Fraud: fake clients, stolen cards, fake freelancers.                      | Medium, high · Verification, limits, fraud queue                                                 |
| RSK-GIG-06 | Off-platform circumvention eroding revenue and safety.                    | High, medium · Masking, value-add features, post-contract freedom                                |
| RSK-GIG-07 | Tax and cross-border compliance errors.                                   | Medium, high · Provider-hosted forms, supported-country list, sanctions screening                |
| RSK-GIG-08 | Academic dishonesty and credential fraud brokered through projects.       | Medium, high · BR-GIG-003, scope guard, reports                                                  |
| RSK-GIG-09 | Exploitation through unpaid spec work or learning projects as free labor. | Medium, medium · BR-GIG-024, BR-GIG-028, pattern review                                          |
| RSK-GIG-10 | Low liquidity at launch (few clients or freelancers).                     | High, medium · Start with learning and institution partner projects, OD-GIG-01 slice B           |

## IDN

Source: [02_MODULES/IDN_Identity_Authentication_Account.md](../02_MODULES/IDN_Identity_Authentication_Account.md)

| ID         | Risk                                                                             | Mitigation / control                                                                                     |
| ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RSK-IDN-01 | Account takeover through recovery or support channels                            | M / H · Hold, multi-channel notice, no support bypass (BR-IDN-019, 028)                                  |
| RSK-IDN-02 | Credential stuffing at scale degrades login or locks real users                  | H / M · Layered throttle by account and IP, passkeys, risk challenge (FR-IDN-030)                        |
| RSK-IDN-03 | Cookie-based sessions break in installed PWAs or third-party-cookie restrictions | M / M · Same-origin design, platform test matrix (`PWA` planned)                                         |
| RSK-IDN-04 | Auth outage takes down the whole product (tier-0)                                | L / H · Fail-closed design with honest maintenance page, no vendor lock-in decision recorded (OD-IDN-01) |
| RSK-IDN-05 | SMS pumping fraud and SIM-swap                                                   | M / M · Caps, risk service, phone never the sole recovery factor (BR-IDN-036)                            |
| RSK-IDN-06 | Pre-registration or linking account takeover                                     | M / H · BR-IDN-024 override rule                                                                         |
| RSK-IDN-07 | Support impersonation abused as insider threat                                   | L / H · Grants, read-only, anomaly alerts, subject-visible log                                           |
| RSK-IDN-08 | Age rules unresolved create legal exposure                                       | M / H · Attestation-only default with OD-IDN-11 before launch                                            |
| RSK-IDN-09 | Mandatory MFA for org members drives churn                                       | M / L · Grace period and adoption reporting                                                              |

## INS

Source: [02_MODULES/INS_Institutions_Managed_Learning.md](../02_MODULES/INS_Institutions_Managed_Learning.md)

| ID         | Risk                                                                           | Mitigation / control                                                                                                    |
| ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| RSK-INS-01 | Cross-tenant data leak through a missed policy or admin tooling.               | Low likelihood, severe · Isolation tests per table, mandatory tenant filter in repository layer, support access audited |
| RSK-INS-02 | Fake institutions use verified status to issue credible-looking certificates.  | Medium, high · Two-proof verification, independent reviewer, re-verification interval, revocation propagation           |
| RSK-INS-03 | Seat overselling or counter drift under concurrency.                           | Medium, high · Row locks, constraints, nightly reconcile with write pause                                               |
| RSK-INS-04 | Minors' data processed without valid guardian consent.                         | Low, severe · Activation guard, age floor, OD-INS-05 before enabling minors                                             |
| RSK-INS-05 | Placement drives become a channel for discrimination or pressure on students.  | Medium, high · Eligibility allowlist, voluntary participation, student consent per drive                                |
| RSK-INS-06 | Institutions treat the dashboard as a ranking or punishment tool for students. | Medium, medium · Explainable flags, no adverse automation, student visibility of shared items                           |
| RSK-INS-07 | Bulk import mistakes disrupt thousands of students.                            | Medium, medium · Dry-run, typed confirmation, 24-hour undo, sync guard                                                  |
| RSK-INS-08 | Employer data retained after a student revokes consent.                        | Medium, medium · Warning at consent time, watermarking, drive-scoped time-boxed access                                  |
| RSK-INS-09 | SSO or LTI misconfiguration locks out an entire institution.                   | Medium, high · Break-glass `IAD` path, test sign-in before enforce, cert expiry warnings                                |
| RSK-INS-10 | Scope creep toward SIS and CRM against SSOT non-goals.                         | Medium, medium · OD-INS-02, OD-INS-03, BR-INS-033, quarterly scope review                                               |

## INT

Source: [02_MODULES/INT_Interviews_Scheduling.md](../02_MODULES/INT_Interviews_Scheduling.md)

| ID         | Risk                                             | Mitigation / control                                            |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------- |
| RSK-INT-01 | Consent gaps lead to unlawful recording          | Consent as a hard gate (BR-INT-012), audit metric, rule library |
| RSK-INT-02 | AI notes become hidden evaluation                | BR-INT-021 limits, no scoring, human scorecards                 |
| RSK-INT-03 | Calendar provider outages or permission problems | Fallback ICS, health states, alerts                             |
| RSK-INT-04 | Time zone errors cause no-shows                  | BR-INT-005, dual-time display, tests across DST                 |
| RSK-INT-05 | Media costs and storage growth                   | Retention defaults, audio-only option                           |
| RSK-INT-06 | Accommodation data misuse                        | BR-INT-032 separation, restricted access                        |
| RSK-INT-07 | Video quality varies across networks             | Adaptive bitrate, device test, fallback                         |

## JOB

Source: [02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md](../02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)

| ID         | Risk                                                    | Mitigation / control                                                     |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| RSK-JOB-01 | Ghost jobs and stale listings erode trust               | FR-JOB-035 freshness, reconfirmation, response-rate transparency         |
| RSK-JOB-02 | Scam listings harm candidates                           | FR-JOB-036 scoring, holds, reports, verified-employer weighting          |
| RSK-JOB-03 | Ranking or fit introduces bias                          | BR-JOB-017 feature allowlist, periodic bias review, ranking explanations |
| RSK-JOB-04 | Status projection leaks internal notes                  | BR-JOB-007 deny-list contract tests                                      |
| RSK-JOB-05 | Imported listings create legal or quality exposure      | Licensed sources only, takedown SLA, labelling                           |
| RSK-JOB-06 | Search latency and degraded mode harm discovery         | Fallback query, performance budgets in NFR (planned)                     |
| RSK-JOB-07 | Alert volume causes spam complaints                     | Caps, digest default, one-click unsubscribe                              |
| RSK-JOB-08 | Draft or submit duplicated or lost under network faults | Idempotency keys, local plus server autosave                             |

## LRN

Source: [02_MODULES/LRN_Learning_Course_Experience.md](../02_MODULES/LRN_Learning_Course_Experience.md)

| ID         | Risk                                                                           | Mitigation / control                                                                        |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| RSK-LRN-01 | Completion credentials inflated by watch-only courses, reducing employer trust | Medium, high · BR-LRN-025 rung policy; evidence integrity metric; OD-LRN-02                 |
| RSK-LRN-02 | Media cost (storage, egress, DRM) grows faster than revenue                    | Medium, high · Adaptive ladder, data saver, download gating, cost dashboards (OD-LRN-05)    |
| RSK-LRN-03 | Progress loss or double counting on poor networks                              | Medium, high · Idempotent events, queue, reconciliation job, chaos tests                    |
| RSK-LRN-04 | Fake or incentivized reviews distort ratings                                   | High, medium · Eligibility rules, moderation, burst detection, review authenticity metric   |
| RSK-LRN-05 | Account sharing and content piracy                                             | High, medium · Tokens, concurrency limits, sharing flags, DRM where justified               |
| RSK-LRN-06 | Accessibility gaps (captions missing, player barriers)                         | Medium, high · Publish gates (STU), accessibility audit gate, barrier reports with priority |
| RSK-LRN-07 | Recommendations amplify bias or reveal sensitive inferences                    | Medium, high · Consent, no protected attributes, explanations, evaluation by AIC (planned)  |
| RSK-LRN-08 | Payment webhook ordering and delays create wrong access                        | Medium, high · Event-owned activation, idempotency, sweeps, reconciliation                  |
| RSK-LRN-09 | Notification fatigue drives opt-outs and lost deliverability                   | Medium, medium · BR-LRN-026 caps, quiet hours, opt-out metric                               |
| RSK-LRN-10 | Scope creep from commerce and live features into a full marketplace            | Medium, medium · Tier gating (R5), OD-LRN-01, boundary with STU and BIL                     |
| RSK-LRN-11 | Version migration corrupts progress mapping                                    | Low, high · Atomic mapping, preview, tests on lessonKey stability, rollback                 |
| RSK-LRN-12 | Privacy exposure of learner data to institutions or instructors                | Medium, high · Scope disclosure, field-level authorization, audits, k-thresholds            |

## MEN

Source: [02_MODULES/MEN_Mentorship_Coaching_Career_Services.md](../02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)

| ID         | Risk                                                                                          | Mitigation / control                                                                              |
| ---------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| RSK-MEN-01 | Harm to participants, especially minors, from unsafe mentors.                                 | Low, severe · Level gates, L3 for minors, platform-only sessions, auto-suspend on serious reports |
| RSK-MEN-02 | Marketplace leakage: pairs move off-platform, removing the platform's visibility and revenue. | High, medium · Allowed after 5 sessions, value-add features (plans, scheduling)                   |
| RSK-MEN-03 | Mentoring turns into pay-to-get-hired (influence on hiring).                                  | Medium, high · BR-MEN-003, BR-MEN-027, ATS conflict check                                         |
| RSK-MEN-04 | Scope creep into a general services marketplace.                                              | Medium, medium · Category allowlist, OD-MEN-01 and 02                                             |
| RSK-MEN-05 | Low liquidity (too few mentors or mentees) making the module feel empty.                      | High, medium · Start with programs and alumni inside institutions (slice B)                       |
| RSK-MEN-06 | Fake reviews and rating manipulation.                                                         | Medium, medium · Ratings need completed sessions, hidden until both submit, quarantine            |
| RSK-MEN-07 | Privacy incident from notes or recordings.                                                    | Low, high · Private notes author-only, recording consent, short retention                         |
| RSK-MEN-08 | Safeguarding staffing cannot keep the SLA.                                                    | Medium, high · Gate paid and minor features on staffing (OD-MEN-05)                               |
| RSK-MEN-09 | Fabricated experience advice in resume reviews.                                               | Medium, medium · BR-MEN-014, review flags                                                         |
| RSK-MEN-10 | Regulatory classification of coaching and payouts.                                            | Low, high · Provider-managed payouts, allowlist, legal review                                     |

## MKT

Source: [02_MODULES/MKT_Market_Intelligence_Career_Pathing.md](../02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)

| ID         | Risk                                                                | Mitigation / control                                                                                     |
| ---------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| RSK-MKT-01 | Re-identification through small cells or overlapping queries        | Privacy breach · Central engine, complementary suppression, query budgets (FR-MKT-033)                   |
| RSK-MKT-02 | Platform sample bias presented as "the market"                      | Misleading insight · Labelling, provenance, external sources (FR-MKT-010, 013)                           |
| RSK-MKT-03 | Salary gaming and coordinated false reports                         | Poor benchmarks · Weights, outlier and burst controls, review (FR-MKT-011, 017)                          |
| RSK-MKT-04 | Readiness or path outputs taken as guarantees, or used by employers | Harm, fairness issues · Honest copy, no employer exposure, fairness review (BR-MKT-019, 024; FR-MKT-036) |
| RSK-MKT-05 | External data license breach                                        | Legal exposure · Source registry, export filter (FR-MKT-009, 031)                                        |
| RSK-MKT-06 | Taxonomy churn breaks consumers                                     | Regressions across modules · Versioning, migration, immutable snapshots (FR-MKT-004)                     |
| RSK-MKT-07 | Scope drift toward HR/payroll                                       | Violates SSOT §4.2 · Narrow employer features, `OD-MKT-01`, `OD-MKT-08`                                  |

## MSG

Source: [02_MODULES/MSG_Messaging_Realtime_Communication.md](../02_MODULES/MSG_Messaging_Realtime_Communication.md)

| ID         | Risk                                                                   | Mitigation / control                                                                               |
| ---------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| RSK-MSG-01 | Recruitment and fake-job scams delivered via messages                  | H / H · Verified orgs, caps, scam banners, TSF signals, no external contact info in first messages |
| RSK-MSG-02 | Harassment and unsolicited sexual content                              | M / H · Message requests, block, report, hash matching, rate limits                                |
| RSK-MSG-03 | Message leak through staff access or support tooling                   | L / H · Metadata default, consent, break-glass, audit, member-visible log                          |
| RSK-MSG-04 | Realtime outage degrades trust                                         | M / M · Fallback ladder, polling kill switch, status chip                                          |
| RSK-MSG-05 | Candidate frustration from unsolicited outreach volume                 | M / M · Preferences binding, caps, credit refund model, silent decline                             |
| RSK-MSG-06 | Retention rules conflict with data-protection law across jurisdictions | M / H · Counsel review, per-region config, `OD-MSG-05`                                             |
| RSK-MSG-07 | Block leaks via delivery behavior                                      | M / H · Silent not-delivered, uniform responses, tests                                             |
| RSK-MSG-08 | Cost of attachments and storage                                        | M / M · Quotas, scanning limits, lifecycle rules                                                   |

## NET

Source: [02_MODULES/NET_Networking_Community_Referrals.md](../02_MODULES/NET_Networking_Community_Referrals.md)

| ID         | Risk                                                          | Mitigation / control                                                                                  |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| RSK-NET-01 | The feed drifts into engagement-bait and a social-media clone | M / H · Section 1.3 exclusions, signal allowlist, quarterly ranking audit                             |
| RSK-NET-02 | Connection spam and romance or investment scams               | H / H · Caps, note link stripping, TSF scam signals, silent decline                                   |
| RSK-NET-03 | Referral collusion and bounty farming                         | M / M · `BR-NET-033`, rewards withheld on flag, human review                                          |
| RSK-NET-04 | Referral tag becomes a hidden pay-to-rank or bias channel     | M / H · `BR-NET-030`, audits of outcomes by tag                                                       |
| RSK-NET-05 | Minors contacted by adults                                    | L / H · `BR-NET-011`, shared-context rule, TSF minors policy                                          |
| RSK-NET-06 | Block leaks (side channels reveal a block)                    | M / H · Uniform not-found responses, tests on all read paths                                          |
| RSK-NET-07 | Ranking opacity erodes trust                                  | M / M · Explanations, chronological view, transparency summary                                        |
| RSK-NET-08 | Hidden-group abuse (harassment, fraud rings)                  | M / H · Group-level automated detection, TSF access with legal basis, report channel always available |

## NTF

Source: [02_MODULES/NTF_Notifications_Communication.md](../02_MODULES/NTF_Notifications_Communication.md)

| ID         | Risk                                                                  | Mitigation / control                                                           |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| RSK-NTF-01 | Reputation damage from complaint spikes harms security email delivery | M / H · Separate streams, auto-pause, warm-up (FR-NTF-031)                     |
| RSK-NTF-02 | Notification fatigue drives disablement and churn                     | H / M · Caps, grouping, digests, nudge budget                                  |
| RSK-NTF-03 | Phishing by imitating platform emails                                 | M / H · Fixed security layout and phrase, no sign-in links (BR-NTF-031)        |
| RSK-NTF-04 | Provider outage delays security mail                                  | M / M · Failover, in-app source of truth, retries                              |
| RSK-NTF-05 | Sensitive detail leaks via lock screen or shared mailbox              | M / M · Generic push, `sensitiveContent` flag                                  |
| RSK-NTF-06 | Loop bug floods a user with mandatory messages                        | L / M · Anomaly caps and alerts                                                |
| RSK-NTF-07 | Live delivery assumed from source but never verified                  | M / M · Outbox labeling and an explicit provider readiness check before launch |
| RSK-NTF-08 | Quiet-hours or time-zone errors cause wrong-time sends                | M / L · DST-safe tests, user-confirmed zone                                    |

## PLT

Source: [02_MODULES/PLT_Platform_API_Integrations_Media_Files.md](../02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)

| ID         | Risk                                                                                | Mitigation / control                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| RSK-PLT-01 | SSRF through webhooks, oEmbed, imports or metadata fetch reaches internal services. | Medium / Critical · Single egress client, pinned DNS, network-level egress rules, bypass corpus tests (FR-PLT-041).  |
| RSK-PLT-02 | Webhook or API secret leakage.                                                      | Medium / High · Hashing and vault, scanner revocation, short overlap rotations, IP allowlists.                       |
| RSK-PLT-03 | Malicious uploads (malware, polyglots, active documents) reach users.               | Medium / High · Fail-closed scan, sandbox origin, re-scan, type sniffing.                                            |
| RSK-PLT-04 | Vendor outage or lock-in (storage, transcode, email, payments).                     | Medium / High · Ports, degraded modes, breakers, removal drills, export of renditions.                               |
| RSK-PLT-05 | Bulk scraping of candidate or profile data through the public API.                  | High / High · Scope limits, sealed classes excluded, rate limits and anomaly detection, developer terms, app review. |
| RSK-PLT-06 | Breaking changes slip into a stable version.                                        | Medium / Medium · Contract diff in CI, pinned SDK tests, long deprecation window.                                    |
| RSK-PLT-07 | Dead-letter growth hides data loss.                                                 | Medium / High · Alerts by age and count, console replay, ownership per kind (FR-ADM-037).                            |
| RSK-PLT-08 | Storage and transcoding costs grow faster than plan revenue.                        | Medium / Medium · Quotas, renditions caps, lifecycle tiers, per-tenant cost tracking.                                |
| RSK-PLT-09 | Poor integration data quality (duplicates, mapping errors) damages customer trust.  | Medium / Medium · Dry runs, mapping validation, duplicate review, undo windows.                                      |
| RSK-PLT-10 | Marketplace ambitions drift into the SSOT §4.2 general-marketplace non-goal.        | Medium / Medium · Decision gate, career-domain limit, unlisted-first policy.                                         |
| RSK-PLT-11 | Rate-limit counters inconsistent across instances (SSOT §20.1 open issue).          | Medium / Medium · Shared store, documented fail modes, tests with multiple instances.                                |
| RSK-PLT-12 | Enforced SSO locks out an organization when the IdP fails.                          | Low / High · Break-glass owner account requirement, certificate expiry alerts.                                       |

## PRF

Source: [02_MODULES/PRF_Profile_Resume_Portfolio.md](../02_MODULES/PRF_Profile_Resume_Portfolio.md)

| ID         | Risk                                                                                               | Mitigation / control                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| RSK-PRF-01 | A visibility check is missed on one surface (search snippet, export, API) and exposes private data | Privacy breach · Single `visibleSections` function; contract tests across surfaces; query-time checks; leak scanning       |
| RSK-PRF-02 | Resume parsing quality is low for some formats and languages                                       | User frustration, wrong data · Review step mandatory; confidence chips; manual fallback; measure correction rate           |
| RSK-PRF-03 | Employers learn a candidate is job hunting through a side channel                                  | Harm to candidate · Domain and org blocks; query-time enforcement; anonymous-link caveat; no analytics at individual level |
| RSK-PRF-04 | Impersonation profiles and fake experience claims                                                  | Trust erosion · Safety checks, slug controls, EVD verification, TSF reports                                                |
| RSK-PRF-05 | ATS checker over-promises compatibility                                                            | Rejected resumes, blame · Advisory language; documented limitations; no guarantees                                         |
| RSK-PRF-06 | Photo and personal fields enable discrimination                                                    | Legal exposure · BR-PRF-030; defaults; fairness controls in SRC                                                            |
| RSK-PRF-07 | Vendor lock-in on parser or renderer                                                               | Cost and quality risk · Adapter interfaces; deterministic tests                                                            |
| RSK-PRF-08 | Slug squatting and brand impersonation                                                             | Trust, support load · Reserved list, change limits, quarantine, TSF override                                               |

## PWA

Source: [02_MODULES/PWA_PWA_Offline_Mobile_Extension.md](../02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)

| ID         | Risk                                                                                                                                            | Mitigation / control                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| RSK-PWA-01 | iOS and Safari web limits (push needs Home-Screen install, storage eviction after inactivity, no background sync) reduce reach and reliability. | High / Medium · Install guidance, email and in-app as channels of record, honest labels, wrapper decision gate. |
| RSK-PWA-02 | Browser evicts drafts and caches, causing user data loss.                                                                                       | Medium / High · Persistent storage request, draft-count hints, clear messaging, short draft lifetime guidance.  |
| RSK-PWA-03 | A faulty service worker bricks the app.                                                                                                         | Low / Critical · No auto skipWaiting, remote passthrough and unregister modes, Reset app data, staged releases. |
| RSK-PWA-04 | Scanner and autofill violate sites' terms or local laws, or trigger takedowns.                                                                  | Medium / High · OD-PWA-11, user-initiated activation, no crawling, adapter kill switch.                         |
| RSK-PWA-05 | Extension store rejection or user distrust over permissions.                                                                                    | Medium / Medium · Minimal permissions, optional hosts at use, privacy page, truthful listing.                   |
| RSK-PWA-06 | Cached personal data remains on shared devices.                                                                                                 | Medium / High · Partitioning, purge on logout, shared-device mode, encryption.                                  |
| RSK-PWA-07 | Lock-screen push reveals private information to bystanders.                                                                                     | Medium / Medium · Sensitive-free payloads, org-level text policy.                                               |
| RSK-PWA-08 | Conflict dialogs frustrate users or lead to wrong choices.                                                                                      | Medium / Medium · Field-level diffs, safe automatic rules for monotonic data, telemetry on conflict rate.       |
| RSK-PWA-09 | Parser breakage as job sites change markup.                                                                                                     | High / Low · Versioned adapters, JSON-LD first, parse-success monitoring, remote disable.                       |
| RSK-PWA-10 | The offline registry drifts from reality and consequential actions become reachable offline.                                                    | Low / High · CI tests that exercise each action offline, default ON, security review for reclassification.      |

## REP

Source: [02_MODULES/REP_Gamification_Reputation.md](../02_MODULES/REP_Gamification_Reputation.md)

| ID         | Risk                                                  | Mitigation / control                                                                   |
| ---------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| RSK-REP-01 | XP farming and collusion undermine trust              | H / M · Server-side rules, diminishing returns, weighting, sanctions (FR-REP-024, 025) |
| RSK-REP-02 | Dark patterns and anxiety from streaks                | M / M · Humane copy rule, protection, opt-out, vacation mode (BR-REP-014, 027)         |
| RSK-REP-03 | Reputation seen as verified evidence by recruiters    | M / H · Labeling, advisory-only rule, explanation (BR-REP-024, 034)                    |
| RSK-REP-04 | Discriminatory effects of reputation or detection     | M / H · No protected attributes, fairness audit, human gate (BR-REP-030)               |
| RSK-REP-05 | Privacy leakage through leaderboards or small cohorts | M / H · Opt-in identity, k-minimum, aliases (BR-REP-016)                               |
| RSK-REP-06 | Rule changes cause inflation or user distrust         | M / M · Simulation, guardrails, notice (BR-REP-029)                                    |
| RSK-REP-07 | Enterprise boards drift into employee monitoring      | L / H · Opt-in, aggregate-only, no HR export (BR-REP-035)                              |
| RSK-REP-08 | Review bombing or reputation attacks                  | M / M · Independence discounts, minimum samples, contest path                          |
| RSK-REP-09 | Ledger and projection drift                           | L / M · Nightly verification and rebuild                                               |

## SET

Source: [02_MODULES/SET_Settings_Privacy_Consent.md](../02_MODULES/SET_Settings_Privacy_Consent.md)

| ID         | Risk                                                                               | Mitigation / control                                                                  |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| RSK-SET-01 | A module forgets an export or erase contributor and residual data survives erasure | M / H · CI lint (BR-SET-014), sweep gate (BR-SET-015)                                 |
| RSK-SET-02 | Consent caching or CDN caching leaks revoked data                                  | M / H · Read-time evaluation, `private, no-store` on consented endpoints              |
| RSK-SET-03 | Audit immutability conflicts with erasure                                          | M / M · Opaque subject refs and deleting the mapping (BR-SET-017)                     |
| RSK-SET-04 | Consent fatigue and dark patterns erode trust                                      | M / M · Equal-prominence rules, plain-language review, dashboard facts only           |
| RSK-SET-05 | Regional rules drift from law                                                      | M / H · Versioned rules, counsel review flag, no compliance claims without review     |
| RSK-SET-06 | Backups reintroduce erased data                                                    | L / H · Erasure log replay before serving, age-out (BR-SET-018)                       |
| RSK-SET-07 | Org locks used to pressure members into sharing                                    | L / M · Closed lock catalog, member-visible reasons, convert-to-personal (BR-SET-031) |
| RSK-SET-08 | Export archive theft                                                               | L / H · Step-up, one-time URL, encryption, short TTL, never emailed                   |
| RSK-SET-09 | Large exports overload the build pipeline                                          | M / L · Streaming, parts, throttling, checkpoints                                     |

## SRC

Source: [02_MODULES/SRC_Search_Discovery.md](../02_MODULES/SRC_Search_Discovery.md)

| ID         | Risk                                                                               | Mitigation / control                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| RSK-SRC-01 | Search leaks hidden or private data through results, counts, suggestions or alerts | Privacy breach, legal exposure · Two-layer permission checks, canary tests in CI and production, field-group indexing, fail closed |
| RSK-SRC-02 | Talent search produces discriminatory outcomes                                     | Legal and reputational harm · Excluded attributes, blind mode, monitoring, proxy review                                            |
| RSK-SRC-03 | Scraping of people data                                                            | Privacy and competitive harm · Rate limits, caps, anomaly detection, honeypots, watermarking                                       |
| RSK-SRC-04 | Index lag shows closed jobs or removed content                                     | Poor trust · Freshness targets, reconciliation, query-time status checks                                                           |
| RSK-SRC-05 | Ranking changes degrade relevance unnoticed                                        | User dissatisfaction · Offline and shadow evaluation, approvals, rollback                                                          |
| RSK-SRC-06 | Taxonomy drift and duplicate skills                                                | Poor matching and evidence fragmentation · Governed editing, merge redirects, proposal queue                                       |
| RSK-SRC-07 | Alert fatigue or alert leaks                                                       | Unsubscribes, privacy issues · Caps, digest, permission recheck, content minimization                                              |
| RSK-SRC-08 | Engine migration causes outages or inconsistent results                            | Downtime · Adapter interface, versioned indexes, shadow reads, rollback                                                            |
| RSK-SRC-09 | Query logs hold sensitive data                                                     | Privacy risk · Redaction, short retention, restricted access                                                                       |
| RSK-SRC-10 | Recruiters over-trust evidence filters or rankings                                 | Unfair rejections · Default "Any", explanation, no automatic rejection, training text                                              |

## STU

Source: [02_MODULES/STU_Instructor_Studio_Content_Production.md](../02_MODULES/STU_Instructor_Studio_Content_Production.md)

| ID         | Risk                                                                     | Mitigation / control                                                                          |
| ---------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| RSK-STU-01 | Media pipeline cost and latency grow faster than revenue                 | Medium, high · Provider interface, ladder tuning, quotas, lazy re-processing, cost dashboards |
| RSK-STU-02 | Low-quality or inaccurate courses reach learners                         | High, high · Review, quality checks, post-publish reports, quality components, takedown path  |
| RSK-STU-03 | Copyright infringement and unlicensed third-party material               | High, high · Attestation, license matrix, notice process, repeat infringer policy             |
| RSK-STU-04 | Instructor fraud (fake credentials, self-sign-off, review manipulation)  | Medium, high · Verification levels, independence checks (BR-STU-015), anomaly flags           |
| RSK-STU-05 | Payout errors or compliance gaps (tax, KYC)                              | Medium, high · Decision gating, BIL ledger source of truth, reconciliation, holds             |
| RSK-STU-06 | Review backlog slows publishing and discourages instructors              | Medium, medium · SLA escalation, risk-based sampling, reviewer capacity metrics               |
| RSK-STU-07 | Version and `lessonKey` mistakes corrupt learner progress mapping        | Low, high · Permanent keys, structural check, patch eligibility rules, tests                  |
| RSK-STU-08 | Accessibility shortfalls (low-quality ASR captions published unreviewed) | Medium, high · Review confirmation, labeling, accessibility metrics, audits                   |
| RSK-STU-09 | Instructor privacy overreach into learner data                           | Medium, medium · Scope limits, suppression thresholds, audits (BR-STU-029)                    |
| RSK-STU-10 | Scope creep into a generic marketplace or CMS                            | Medium, medium · Tier gating, OD-STU-01, boundaries with BIL and PLT                          |
| RSK-STU-11 | Provider lock-in for transcoding, ASR or DRM                             | Medium, medium · Provider-agnostic interfaces and conformance tests                           |

## TSF

Source: [02_MODULES/TSF_Trust_Safety_Moderation.md](../02_MODULES/TSF_Trust_Safety_Moderation.md)

| ID         | Risk                                                                   | Mitigation / control                                                                        |
| ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| RSK-TSF-01 | Fake jobs and recruitment scams harm job seekers and the brand         | H / H · Employer verification gating, pre-moderation, scam signals, warnings, fast takedown |
| RSK-TSF-02 | Over-enforcement from automation harms legitimate users                | M / H · Holds not bans, human review, appeals, precision monitoring, 72-hour hold limit     |
| RSK-TSF-03 | Under-enforcement, slow response to severe harm                        | M / H · P0 on-call, SLAs, surge mode, trusted flaggers                                      |
| RSK-TSF-04 | Moderator psychological harm and turnover                              | H / H · Exposure limits, tooling, counselling, rotation                                     |
| RSK-TSF-05 | Regulatory non-compliance (DSA, child safety law)                      | M / H · Compliance register, counsel review, audits                                         |
| RSK-TSF-06 | Abuse of reporting to silence people (brigading, employer retaliation) | M / M · Report-abuse controls, brigading holds, reviewer judgment                           |
| RSK-TSF-07 | Evidence tampering or leakage                                          | L / H · Hash chain, restricted storage, dual control, audit                                 |
| RSK-TSF-08 | Inconsistent decisions across reviewers and regions                    | M / M · Matrix, QA, calibration, macros                                                     |
| RSK-TSF-09 | Anonymous review identity exposure                                     | L / H · Dual approval lookups, minimal access, audit                                        |
| RSK-TSF-10 | Misuse of legal-request channel (fake authority)                       | M / H · Independent verification, counsel, minimum disclosure                               |

## 03_EXPERIENCE/01_INFORMATION_ARCHITECTURE.md

Source: [03_EXPERIENCE/01_INFORMATION_ARCHITECTURE.md](../03_EXPERIENCE/01_INFORMATION_ARCHITECTURE.md)

| ID        | Risk                                                                     | Mitigation / control                                                                                 |
| --------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| RSK-UX-01 | Navigation grows by module without discipline, exceeding limits          | Manifest lint enforces the 7/7/24 limits; additions require an IA review                             |
| RSK-UX-02 | Users with many memberships lose track of the active workspace           | Persistent workspace name in the top bar, document title, announcement on switch, last-used ordering |
| RSK-UX-03 | Two modules propose clashing routes                                      | Namespace table in section 5 is the arbiter; route lint in CI (`NFR-IAX-004`, `NFR-IAX-016`)         |
| RSK-UX-04 | Hiding items by permission confuses users who were told a feature exists | Locked items for purchasable entitlements; help articles state role requirements                     |

## 03_EXPERIENCE/02_DESIGN_SYSTEM.md

Source: [03_EXPERIENCE/02_DESIGN_SYSTEM.md](../03_EXPERIENCE/02_DESIGN_SYSTEM.md)

| ID        | Risk                                                                                   | Mitigation / control                                                             |
| --------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| RSK-UX-05 | Token drift between CSS and TypeScript                                                 | Generate both from one source (section 2.2)                                      |
| RSK-UX-06 | Spruce brand green equals success green; users confuse "primary action" with "success" | Success always has check icon and text; primary actions never use the check icon |
| RSK-UX-07 | Component catalogue grows faster than the team can maintain                            | Promotion rule: second meaningful reuse; each component entry owns tests         |

## 03_EXPERIENCE/03_INTERACTION_PATTERNS.md

Source: [03_EXPERIENCE/03_INTERACTION_PATTERNS.md](../03_EXPERIENCE/03_INTERACTION_PATTERNS.md)

| ID        | Risk                                          | Mitigation / control                                                 |
| --------- | --------------------------------------------- | -------------------------------------------------------------------- |
| RSK-UX-08 | Autosave and conflict rules differ per module | Section 8 is the single rule; module specs may only choose the class |
| RSK-UX-09 | Notification fatigue                          | Frequency caps, quiet hours, digest defaults, preference matrix      |
| RSK-UX-10 | Optimistic updates showing false state        | Section 8.4 allow-list; rollback within 150 ms                       |

## 03_EXPERIENCE/04_ACCESSIBILITY_AND_INCLUSION.md

Source: [03_EXPERIENCE/04_ACCESSIBILITY_AND_INCLUSION.md](../03_EXPERIENCE/04_ACCESSIBILITY_AND_INCLUSION.md)

| ID         | Risk                                                                 | Mitigation / control                                                                  |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| RSK-AXS-01 | Third-party proctoring and video vendors are inaccessible            | Procurement rule; alternative paths; no facial analysis                               |
| RSK-AXS-02 | Rich user-generated content (portfolio media, posts) is inaccessible | Required alt text and caption fields, nudges, reports, moderation of obvious failures |
| RSK-AXS-03 | Custom widgets drift from APG patterns                               | Shared component library only; promotion rule; AT regression tests                    |
| RSK-AXS-04 | Accessibility treated as late polish                                 | Release gate and definition-of-done checklist                                         |

## 03_EXPERIENCE/05_RESPONSIVE_MOBILE_PWA_UX.md

Source: [03_EXPERIENCE/05_RESPONSIVE_MOBILE_PWA_UX.md](../03_EXPERIENCE/05_RESPONSIVE_MOBILE_PWA_UX.md)

| ID         | Risk                                                          | Mitigation / control                                                             |
| ---------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| RSK-RWD-01 | iOS PWA limits (push, storage eviction, background sync gaps) | Honest messaging, draft protection, server-side drafts as truth, email fallbacks |
| RSK-RWD-02 | Offline conflict complexity                                   | One conflict model (`03` section 8.3), restricted queueable classes              |
| RSK-RWD-03 | Install prompt annoyance                                      | Timing and dismissal memory rules in section 7.2                                 |
| RSK-RWD-04 | Mobile assessments with weaker integrity and accessibility    | Device requirements stated up front; "Continue on a computer" path               |

## 03_EXPERIENCE/06_CONTENT_AND_MICROCOPY_GUIDE.md

Source: [03_EXPERIENCE/06_CONTENT_AND_MICROCOPY_GUIDE.md](../03_EXPERIENCE/06_CONTENT_AND_MICROCOPY_GUIDE.md)

| ID         | Risk                                                                      | Mitigation / control                                                                               |
| ---------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| RSK-CPY-01 | Copy drift across 31 modules                                              | Shared catalogs, glossary lint, reviewer role                                                      |
| RSK-CPY-02 | Legal text not matching product behavior (consent claims we do not honor) | Consent copy generated from the consent registry in SET; claims reviewed against behavior in tests |
| RSK-CPY-03 | Rejection and moderation copy causing harm or legal exposure              | Template guardrails, counsel review, tone tests                                                    |

## 03_EXPERIENCE/07_SCREEN_STATE_CHECKLIST.md

Source: [03_EXPERIENCE/07_SCREEN_STATE_CHECKLIST.md](../03_EXPERIENCE/07_SCREEN_STATE_CHECKLIST.md)

| ID         | Risk                                            | Mitigation / control                                                                       |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| RSK-SCR-01 | Screen specs become inconsistent across authors | Checklist gate and reference screens as patterns; periodic spec audit                      |
| RSK-SCR-02 | Reference screens are treated as pixel designs  | They are behavior and structure patterns; visual design follows `02` tokens and components |
| RSK-SCR-03 | Spec effort too heavy for trivial screens       | Template permits "n/a, reason"; trivial variations cite the pattern and list deltas only   |

## 04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md

Source: [04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md](../04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md)

| ID         | Risk                                                                                                                                                       | Mitigation / control                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RSK-ARC-nn | An architecture risk (§24).                                                                                                                                |                                                                                                                                                                                                      |
| RSK-ARC-01 | Migrating from Map reads to SQL reads changes behavior in subtle ways (ordering, stale-read assumptions in tests)                                          | Medium · High · Migrate one module at a time behind the existing tests; dual-read comparison in staging for the core loop · Backend lead                                                             |
| RSK-ARC-02 | RLS under `ts_app` adds latency or blocks legitimate queries                                                                                               | Medium · Medium · Stable helper functions, indexes on tenancy columns, query plans reviewed per module; policy-deny alarms · Database lead                                                           |
| RSK-ARC-03 | In-house SAML and OIDC implementation has protocol flaws                                                                                                   | Medium · High · Use maintained libraries; conformance suites; external penetration test before enabling SSO enforcement · Security officer                                                           |
| RSK-ARC-04 | Enterprise tenants infer employees' external job search                                                                                                    | Low · Very high · Enterprise boundary rule (§8.4), generated negative tests, stealth exclusion in search · Architect                                                                                 |
| RSK-ARC-05 | Dispatcher becomes a bottleneck (single leader)                                                                                                            | Medium · Medium · Partition dispatch by `aggregate_type` hash with one leader per partition when lag trigger fires · Backend lead                                                                    |
| RSK-ARC-06 | Thirty modules in one codebase drift into a "big ball of mud"                                                                                              | High · High · Generated dependency graph, table-ownership lint, `pv_` only cross-module reads, review checklist · Architect                                                                          |
| RSK-ARC-07 | Security-critical as-built gaps (simulated assessment scores, course completion minting authority-verified evidence) carry into the target                 | Medium · Very high · Block verified evidence from assessment and learning until runner and final-assessment rules exist (DEC-ARC-015) [SRC: ARCHITECTURE.md §20] · Architect with ASM and EVD owners |
| RSK-ARC-08 | Vendor lock-in through provider-specific features leaking into domain logic                                                                                | Medium · Medium · Ports with capability flags; adapters normalize to domain types; removal drill per provider [SRC: SSOT §13.4 VER-021] · Architect                                                  |
| RSK-ARC-09 | AI cost overrun from fan-out features (matching, recommendations)                                                                                          | Medium · High · Budget reservation before every call; batch embeddings; free-user invariant [SRC: SSOT §16.4] · AIC owner with finance                                                               |
| RSK-ARC-10 | Realtime gateway leaks data through channel subscriptions                                                                                                  | Low · High · Per-subscription policy check; signals carry no personal fields; re-authorize on membership change events · Security officer                                                            |
| RSK-ARC-11 | Build-file restrictions delay structural changes (new packages, entrypoints, dependencies)                                                                 | High · Medium · Batch the needed build-file changes into one owner-approved change early (see 08 §4) · Architect                                                                                     |
| RSK-ARC-12 | OS-expansion modules dilute the core loop or conflict with SSOT §4.2 non-goals (not generic HR, not ad network, not social clone, not general marketplace) | Medium · High · Context map keeps them as separate modules behind `DEC-002` and module ODs; GIG and ENT data boundaries specified narrowly · Product owner                                           |

## 04_ARCHITECTURE/02_DATA_MODEL.md

Source: [04_ARCHITECTURE/02_DATA_MODEL.md](../04_ARCHITECTURE/02_DATA_MODEL.md)

| ID         | Risk                                                                                       | Mitigation / control                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| RSK-ARC-13 | `subject_ref` indirection is bypassed by a developer storing account ids in history tables | Medium · High · Lint on append-only tables for `*_account_id` columns; schema review checklist · Database lead                 |
| RSK-ARC-14 | Generated RLS policies become slow on SHARED-PARTY tables with complex predicates          | Medium · Medium · Denormalize `tenant_org_id` and `owner_account_id` onto child rows; explain-plan tests in CI · Database lead |
| RSK-ARC-15 | Field encryption blocks needed queries (for example search by student number)              | Medium · Medium · Store a keyed blind index (HMAC) beside ciphertext for equality lookups only · Security officer              |

## 04_ARCHITECTURE/03_API_DESIGN.md

Source: [04_ARCHITECTURE/03_API_DESIGN.md](../04_ARCHITECTURE/03_API_DESIGN.md)

| ID         | Risk                                         | Mitigation / control                                                                                                      |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| RSK-ARC-16 | Two error shapes in parallel confuse clients | Medium · Medium · One global mapper, generated client handles both, removal date per module · Frontend lead               |
| RSK-ARC-17 | Candidate search API used for scraping       | Medium · High · RL-HEAVY, entitlement, per-query audit, result caps, anomaly alerts, live consent join · Security officer |

## 04_ARCHITECTURE/04_EVENTS_AND_ASYNC.md

Source: [04_ARCHITECTURE/04_EVENTS_AND_ASYNC.md](../04_ARCHITECTURE/04_EVENTS_AND_ASYNC.md)

| ID         | Risk                                                            | Mitigation / control                                                                                                                    |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| RSK-ARC-18 | Outbox write amplification raises primary write load            | Medium · Medium · Inline consumers write no job rows; coalescing; partition drops instead of deletes [SRC: BE-01-R2 §1] · Database lead |
| RSK-ARC-19 | Consumers assume order across aggregates and act on stale state | Medium · High · Consumers re-read owner state; review checklist; EC-ORD only per aggregate · Backend lead                               |

## 04_ARCHITECTURE/05_INTEGRATIONS_AND_ADAPTERS.md

Source: [04_ARCHITECTURE/05_INTEGRATIONS_AND_ADAPTERS.md](../04_ARCHITECTURE/05_INTEGRATIONS_AND_ADAPTERS.md)

| ID         | Risk                                                        | Mitigation / control                                                                                                           |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| RSK-ARC-20 | Vendor sandbox behavior differs from production             | High · Medium · Contract suites plus recorded production-shaped fixtures; canary release per integration · Integration owner   |
| RSK-ARC-21 | Personal data sent to vendors beyond what the purpose needs | Medium · High · Per-port allowlisted fields, data-class checks in adapters, data-processing register review · Security officer |

## 04_ARCHITECTURE/06_AI_ARCHITECTURE.md

Source: [04_ARCHITECTURE/06_AI_ARCHITECTURE.md](../04_ARCHITECTURE/06_AI_ARCHITECTURE.md)

| ID         | Risk                                                                                              | Mitigation / control                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| RSK-ARC-22 | Prompt injection via resumes, job descriptions or messages manipulates recruiter-facing summaries | High · High · Fencing, output validation, summaries labelled, no tool access from summarization, adversarial evals · AIC owner              |
| RSK-ARC-23 | Hidden bias in ranking harms candidates and creates legal exposure                                | Medium · Very high · Fairness evals, no protected attributes or proxies, display-only ordering, audits (OD-ARC-30) · AIC owner with counsel |
| RSK-ARC-24 | AI spend grows faster than revenue                                                                | Medium · High · Budget ledger, per-capability caps, cheap-model defaults, batch embeddings, cost dashboards · Finance                       |

## 04_ARCHITECTURE/07_SEARCH_MEDIA_REALTIME_ARCHITECTURE.md

Source: [04_ARCHITECTURE/07_SEARCH_MEDIA_REALTIME_ARCHITECTURE.md](../04_ARCHITECTURE/07_SEARCH_MEDIA_REALTIME_ARCHITECTURE.md)

| ID         | Risk                                                                                        | Mitigation / control                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RSK-ARC-25 | Vector search on PostgreSQL degrades write and vacuum performance as candidate volume grows | Medium · Medium · Partition by doc type, batch re-embedding, monitor HNSW build times, external engine trigger · Database lead                                                     |
| RSK-ARC-26 | Malicious files reach users through preview rendering                                       | Low · High · Fail-closed quarantine, type detection, preview generation in the sandboxed heavy pool, separate content domain, `Content-Disposition: attachment` · Security officer |

## 04_ARCHITECTURE/08_TECHNICAL_SPECIFICATION_INDEX.md

Source: [04_ARCHITECTURE/08_TECHNICAL_SPECIFICATION_INDEX.md](../04_ARCHITECTURE/08_TECHNICAL_SPECIFICATION_INDEX.md)

| ID         | Risk                                                                                             | Mitigation / control                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| RSK-ARC-27 | Module specs written in parallel diverge further on names and ownership                          | High · Medium · This register; generated registries from headings; architecture review before each module starts build · Architect |
| RSK-ARC-28 | Foundation work (F1–F10) is underestimated and modules start on the as-built single-writer model | Medium · High · Treat F-steps as release gates; no new module enabled in a deployed environment before F9 · Product owner          |

## 05_SECURITY_PRIVACY/01_SECURITY_ARCHITECTURE.md

Source: [05_SECURITY_PRIVACY/01_SECURITY_ARCHITECTURE.md](../05_SECURITY_PRIVACY/01_SECURITY_ARCHITECTURE.md)

| ID         | Risk                                                                                     | Mitigation / control                                                                             |
| ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| RSK-SEC-nn | Security risk                                                                            | RSK-SEC-01..RSK-SEC-14 (§26)                                                                     |
| RSK-SEC-01 | Cross-tenant data exposure through a missed filter in a new feature                      | Medium / High · RLS FORCE, generated IDOR suite, canary rows, OD-SEC-08 · `SAD`                  |
| RSK-SEC-02 | Account takeover at scale through credential stuffing before passkey adoption            | High / Medium · RL-AUTH, breached-password check, MFA for tenant roles · `SAD`                   |
| RSK-SEC-03 | Fake employers use the platform to phish job seekers                                     | High / High · OD-SEC-16 verification, scam detection, report flows · TSF lead                    |
| RSK-SEC-04 | Prompt injection through user content causes an AI feature to leak another person's data | Medium / High · §23 controls, no side-effect tools, red team · AI governance owner               |
| RSK-SEC-05 | Assessment item bank leak destroys credibility of credentials                            | Medium / High · KEK-ASM, item rotation, leak monitoring · ASM owner                              |
| RSK-SEC-06 | Insider browsing of candidate data                                                       | Low / High · Grants, access log, monthly review · `SAD`                                          |
| RSK-SEC-07 | Supply-chain compromise of a frontend dependency                                         | Medium / High · §19 controls · Engineering lead                                                  |
| RSK-SEC-08 | Erasure conflicts with tamper-evident audit if `subject_ref` design is rejected          | Medium / Medium · OD-PRV-03 · Privacy lead                                                       |
| RSK-SEC-09 | Self-issued identity stack accumulates unreviewed edge cases (recovery, SSO, SCIM)       | Medium / High · OD-SEC-07, external pen test (NFR-SEC-072) · `SAD`                               |
| RSK-SEC-10 | Payout account takeover drains seller earnings                                           | Medium / High · Step-up, payout change hold, notifications · `FIN`                               |
| RSK-SEC-11 | Sandbox escape from code challenges                                                      | Low / High · NFR-SEC-070, isolated execution infrastructure · ASM owner                          |
| RSK-SEC-12 | Media and file storage misconfiguration makes evidence public                            | Low / High · Private by default, policy tests, CSPM scan [PROP] · Platform lead                  |
| RSK-SEC-13 | Real-time and offline features cache sensitive data on shared devices                    | Medium / Medium · NFR-SEC-016, shared-device mode · PWA owner                                    |
| RSK-SEC-14 | Security controls are documented but never proven, repeating the gap noted in SSOT §21.2 | High / High · Every NFR-SEC has a named test; release gate refuses unproven requirements · `SAD` |

## 05_SECURITY_PRIVACY/02_PRIVACY_AND_DATA_GOVERNANCE.md

Source: [05_SECURITY_PRIVACY/02_PRIVACY_AND_DATA_GOVERNANCE.md](../05_SECURITY_PRIVACY/02_PRIVACY_AND_DATA_GOVERNANCE.md)

| ID         | Risk                                                                               | Mitigation / control                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| RSK-PRV-nn | Privacy risk                                                                       | RSK-PRV-01..RSK-PRV-10 (§18)                                                                                                      |
| RSK-PRV-01 | Consent revocation not propagated to derived stores (search, embeddings, exports)  | Medium / High · Read-time checks, consent epoch, clean-up SLA · Privacy lead                                                      |
| RSK-PRV-02 | Erasure misses a module or a backup restore resurrects erased data                 | Medium / High · Module export and erasure interfaces mandatory, sweep, ledger re-application · Privacy lead                       |
| RSK-PRV-03 | Fairness data leaks into ranking or recruiter views                                | Low / High · Separate schema and key, data-flow tests · AI governance owner                                                       |
| RSK-PRV-04 | Controller and processor roles unclear with employers, causing unanswered requests | Medium / Medium · OD-SEC-18, tenant routing of requests · Counsel                                                                 |
| RSK-PRV-05 | Small-cell re-identification in salary or institution reports                      | Medium / Medium · `min_cohort_k`, complementary suppression · ANL owner                                                           |
| RSK-PRV-06 | Minors onboarded without valid basis                                               | Medium / High · Age gate, institution-only path · INS owner                                                                       |
| RSK-PRV-07 | AI providers retain prompts beyond policy                                          | Medium / Medium · OD-PRV-09 contract terms, redaction · Privacy lead                                                              |
| RSK-PRV-08 | Employer surveillance of employees' job search                                     | Low / High · Hard separation, tests · ENT owner                                                                                   |
| RSK-PRV-09 | Retention defaults adopted without counsel review                                  | Medium / Medium · OD-PRV-04 gate before production · Counsel                                                                      |
| RSK-PRV-10 | Dark patterns creep into consent screens through growth experiments                | Medium / Medium · Experiment review rule: consent screens excluded from A/B tests without privacy approval [PROP] · Product owner |

## 05_SECURITY_PRIVACY/03_COMPLIANCE_MAP.md

Source: [05_SECURITY_PRIVACY/03_COMPLIANCE_MAP.md](../05_SECURITY_PRIVACY/03_COMPLIANCE_MAP.md)

| ID         | Risk                                                                                                           | Mitigation / control                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| RSK-SEC-15 | High-risk AI features launched in the EU without conformity work                                               | Medium / High · OD-SEC-19 gate, feature flags per region · AI governance owner       |
| RSK-SEC-16 | Employers use ranking without required notices or audits and the platform is named in claims                   | Medium / High · AEDT notice workflow, audit packs, contract terms · Counsel          |
| RSK-SEC-17 | Legal dates and thresholds in this map become stale                                                            | High / Medium · Yearly counsel review; every date tagged "to confirm" · Counsel      |
| RSK-SEC-18 | OS-expansion modules (BGV, GIG, MEN, ENT) introduce regulated activities outside the career-platform non-goals | Medium / High · `DEC-002` gate, per-module regime check before build · Product owner |

## 05_SECURITY_PRIVACY/04_FAIRNESS_AND_AI_GOVERNANCE.md

Source: [05_SECURITY_PRIVACY/04_FAIRNESS_AND_AI_GOVERNANCE.md](../05_SECURITY_PRIVACY/04_FAIRNESS_AND_AI_GOVERNANCE.md)

| ID         | Risk                                                                                    | Mitigation / control                                                                                             |
| ---------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| RSK-AIG-nn | AI risk register entry                                                                  | RSK-AIG-01..RSK-AIG-16 (§9)                                                                                      |
| RSK-AIG-01 | Ranking produces adverse impact against a protected group                               | AIS-03, 04 · Medium / High · §3 inputs, §4 monitoring, kill switch · AI governance owner                         |
| RSK-AIG-02 | Proxy features (school, location, career gaps) reintroduce bias                         | AIS-03, 04, 08 · High / High · Proxy review, counterfactual red team · AIC owner                                 |
| RSK-AIG-03 | Automation bias: recruiters rubber-stamp AI order                                       | AIS-04 · High / High · Equal non-AI sort, override monitoring, no bulk reject · ATS owner                        |
| RSK-AIG-04 | Resume parser underperforms for non-standard formats or scripts                         | AIS-05 · Medium / Medium · Stratified accuracy, manual correction UI · PRF owner                                 |
| RSK-AIG-05 | Summaries hallucinate or omit material facts                                            | AIS-06 · Medium / High · Source citation requirement, sampling review · ATS owner                                |
| RSK-AIG-06 | Targeted job distribution excludes groups                                               | AIS-08 · Medium / High · No demographic targeting, exposure monitoring · JOB owner                               |
| RSK-AIG-07 | Integrity signals falsely flag disabled or neurodivergent test takers                   | AIS-11, 12 · Medium / High · FPR parity, accommodations, human review only · ASM owner                           |
| RSK-AIG-08 | Proctoring drifts into biometric identification or emotion analysis                     | AIS-12 · Low / High · OD-AIG-02, prohibited list, DPIA · ASM owner                                               |
| RSK-AIG-09 | Prompt injection changes ranking or leaks data                                          | All with user content · Medium / High · Security doc §23, red team · `SAD`                                       |
| RSK-AIG-10 | Career assistant gives harmful or misleading career, legal or immigration advice        | AIS-14 · Medium / Medium · Scope limits, disclaimers, refusal patterns, sources · AIC owner                      |
| RSK-AIG-11 | Moderation classifiers suppress lawful speech disproportionately by dialect or language | AIS-15 · Medium / Medium · Classifier only prioritizes; humans decide; per-language evaluation · TSF owner       |
| RSK-AIG-12 | Insufficient self-identification data makes monitoring inconclusive                     | All HIGH · High / Medium · Clear purpose explanation, periodic invitation, external audits · AI governance owner |
| RSK-AIG-13 | Provider model updates change behavior silently                                         | All · High / Medium · Pin model versions, G6 re-evaluation, canary prompts · AIC owner                           |
| RSK-AIG-14 | Regulatory classification changes (EU AI Act timing, US state laws)                     | All HIGH · High / Medium · Yearly counsel review, region flags · Counsel                                         |
| RSK-AIG-15 | Fake employers use AI to generate convincing scam posts                                 | AIS-07, 16 · Medium / High · Employer verification, scam classifiers, reports · TSF owner                        |
| RSK-AIG-16 | Free-tier inference cost overrun                                                        | All · Medium / Medium · Budgets, no silent paid fallback [SRC: SSOT §16.4] · `FIN`                               |

## 06_QUALITY_AND_PERFORMANCE/01_NON_FUNCTIONAL_REQUIREMENTS.md

Source: [06_QUALITY_AND_PERFORMANCE/01_NON_FUNCTIONAL_REQUIREMENTS.md](../06_QUALITY_AND_PERFORMANCE/01_NON_FUNCTIONAL_REQUIREMENTS.md)

| ID         | Risk                                                                                     | Mitigation / control                                                                         |
| ---------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| RSK-NFR    | 01..08                                                                                   |                                                                                              |
| RSK-NFR-01 | Targets set without forecasts lead to over- or under-provisioning                        | High / Medium · OD-NFR-05, scenario-based load tests, triggers in §5.3 · SRE lead            |
| RSK-NFR-02 | Field telemetry blocked by consent decisions, leaving client SLOs on synthetic data only | Medium / Medium · Synthetic of record (OD-NFR-03), OD-PRV-07 · SRE lead                      |
| RSK-NFR-03 | PostgreSQL-backed queue and search saturate before migration work is planned             | Medium / High · §5.3 triggers monitored with alerts · Architecture                           |
| RSK-NFR-04 | Heavy routes (builder, arena) exceed budgets on low-end devices                          | High / Medium · Lazy loading, RMP-2 testing · Frontend lead                                  |
| RSK-NFR-05 | Single-region outage exceeds the monthly budget                                          | Low / High · OD-NFR-12, declared-disaster reporting · SRE lead                               |
| RSK-NFR-06 | Restore without reconciling external systems corrupts billing or resurrects erased data  | Medium / High · NFR-DR-008 checklist and drills · SRE lead                                   |
| RSK-NFR-07 | Accessibility regressions in rich interactions (drag-and-drop, editors, video)           | High / Medium · Per-route matrix, manual screen-reader tests · Design lead                   |
| RSK-NFR-08 | Requirements reported as met without measurement, repeating SSOT §21.2 gap               | High / High · Every NFR names a measurement; release gate checks evidence · Engineering lead |

## 06_QUALITY_AND_PERFORMANCE/02_QA_AND_TEST_STRATEGY.md

Source: [06_QUALITY_AND_PERFORMANCE/02_QA_AND_TEST_STRATEGY.md](../06_QUALITY_AND_PERFORMANCE/02_QA_AND_TEST_STRATEGY.md)

| ID        | Risk                                                                                                        | Mitigation / control                                             |
| --------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| RSK-QA-01 | Tests pass while features are simulated or ephemeral (as the legacy baseline showed for assessment scoring) | honesty tests, labelled stubs, G8 and persistence honesty checks |
| RSK-QA-02 | Tenant-isolation regressions across many modules                                                            | generated authz matrix tests and RLS coverage check              |
| RSK-QA-03 | E2E suite slow and flaky as product grows to 30 modules                                                     | pyramid discipline, tiering, flaky policy                        |
| RSK-QA-04 | AC traceability decays into paperwork                                                                       | generated matrix, orphan checks, gate G6                         |
| RSK-QA-05 | AI evaluation sets go stale or are biased                                                                   | owners, weekly human sampling, fairness sets                     |
| RSK-QA-06 | Build-file restriction slows adding test tooling                                                            | batch tooling requests through an ADR and ask-first step         |

## 06_QUALITY_AND_PERFORMANCE/03_ENGINEERING_STANDARDS.md

Source: [06_QUALITY_AND_PERFORMANCE/03_ENGINEERING_STANDARDS.md](../06_QUALITY_AND_PERFORMANCE/03_ENGINEERING_STANDARDS.md)

| ID         | Risk                                                            | Mitigation / control                                                                        |
| ---------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| RSK-ENG-01 | Single `server.ts` grows to unmaintainable size with 30 modules | module folder standard, approved split plan (OD-ENG-09)                                     |
| RSK-ENG-02 | Standards documented but not enforced                           | each MUST maps to a CI check or review checklist item; quarterly review of unenforced rules |
| RSK-ENG-03 | Build-file restriction blocks required tooling                  | ask-first path with batching and ADRs                                                       |
| RSK-ENG-04 | Flag sprawl                                                     | lifecycle rules and stale-flag report                                                       |
| RSK-ENG-05 | Business rules leak into routes and UI                          | review checklist, lint import boundaries, domain tests per BR                               |

## 07_DEVOPS_AND_OPERATIONS/01_INFRASTRUCTURE_AND_DEPLOYMENT.md

Source: [07_DEVOPS_AND_OPERATIONS/01_INFRASTRUCTURE_AND_DEPLOYMENT.md](../07_DEVOPS_AND_OPERATIONS/01_INFRASTRUCTURE_AND_DEPLOYMENT.md)

| ID         | Risk                                              | Mitigation / control                                                  |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| RSK-OPS-01 | Backups exist but restores fail                   | scheduled restore drills with recorded RPO/RTO                        |
| RSK-OPS-02 | Long-locking migration causes outage              | lock timeouts, expand/contract, production-shaped upgrade test        |
| RSK-OPS-03 | Provider outage cascades into user-facing failure | adapters with timeouts, queues, degraded labelled states, chaos tests |
| RSK-OPS-04 | Cost overrun from media or AI usage               | caps, budgets, anomaly alerts                                         |
| RSK-OPS-05 | Staging not representative                        | parity register, volume seed                                          |
| RSK-OPS-06 | Single operator knowledge                         | runbooks, rebuild-from-IaC drill, bus-factor controls (doc 07/03)     |
| RSK-OPS-07 | Region lock-in or residency violations            | residency-aware design, OD-OPS-14                                     |

## 07_DEVOPS_AND_OPERATIONS/02_OPERATIONS_AND_SUPPORT.md

Source: [07_DEVOPS_AND_OPERATIONS/02_OPERATIONS_AND_SUPPORT.md](../07_DEVOPS_AND_OPERATIONS/02_OPERATIONS_AND_SUPPORT.md)

| ID         | Risk                                                    | Mitigation / control                                         |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| RSK-SUP-01 | Alert fatigue leads to missed Sev 1                     | symptom-based paging, weekly alert review, precision metric  |
| RSK-SUP-02 | Runbooks rot                                            | verification metadata, game days, postmortem checks          |
| RSK-SUP-03 | Support access leaks personal data                      | role-scoped views, masking, audit, impersonation limits      |
| RSK-SUP-04 | Single vendor outage cascades                           | concentration review, fallbacks, exit plans                  |
| RSK-SUP-05 | Data operation damages production data                  | dry runs, approvals, restore point, idempotency, audit       |
| RSK-SUP-06 | Status page unavailable during platform outage          | separate hosting and domain                                  |
| RSK-SUP-07 | Support overwhelmed during assessment day or mass issue | priority lanes, pre-registered contacts, mass-issue workflow |
| RSK-SUP-08 | Breach notification deadline missed                     | clock tracked from awareness, legal on-call, RB-SEC-04       |

## 07_DEVOPS_AND_OPERATIONS/03_MAINTENANCE_AND_SUSTAINABILITY.md

Source: [07_DEVOPS_AND_OPERATIONS/03_MAINTENANCE_AND_SUSTAINABILITY.md](../07_DEVOPS_AND_OPERATIONS/03_MAINTENANCE_AND_SUSTAINABILITY.md)

| ID         | Risk                                                  | Mitigation / control                                               |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| RSK-MNT-01 | Maintenance squeezed out by feature pressure          | reserved capacity, health review escalation of red items           |
| RSK-MNT-02 | Unnoticed end-of-support of a runtime or provider API | horizon register with lead time rule, model/provider pinning       |
| RSK-MNT-03 | Knowledge concentrated in few people                  | bus-factor register, pairing, key-person-out exercise              |
| RSK-MNT-04 | Documentation drifts from intent and from code        | docs-as-code checks, freshness reports, divergence rule            |
| RSK-MNT-05 | Deprecations break integrators                        | notice periods, usage telemetry, contract tests until removal      |
| RSK-MNT-06 | Build-file restriction delays urgent upgrades         | owner-approved fast path for security patches, pre-agreed approver |
| RSK-MNT-07 | Cost drift unnoticed in media and AI usage            | monthly review, unit economics, caps                               |
| RSK-MNT-08 | Quarterly review becomes ritual without action        | red-item escalation rule, annual checklist review                  |
