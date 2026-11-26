# Removed and moved files

> **Status.** Record of the 2026-11-25 documentation consolidation. Every file below left its old path. Files in sections 1 and 2 were merged or moved, so their text is still in the repository at the new location. Files in section 3 were deleted; restore any of them with `git checkout 08387ec -- <path>`. Section 4 records the second round on the same day, with its own restore commit.

515 paths changed. Commit before the change: `08387ec`.

## 1. Merged into another file

331 files. Each is now a section, under its original title, of the new file.

| Former file | Now in |
|---|---|
| `BRAIN/BRAIN.md` | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#talentsphere--brainmd-v60) |
| `BRAIN/MEMORY.md` | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#talentsphere--project-memory) |
| `PRODUCT_BLUEPRINT/00_START_HERE/CONVENTIONS.md` | [`docs/blueprint/README.md`](../blueprint/README.md#blueprint-conventions) |
| `PRODUCT_BLUEPRINT/00_START_HERE/FINAL_AUDIT_REPORT.md` | [`docs/blueprint/README.md`](../blueprint/README.md#final-audit-report) |
| `PRODUCT_BLUEPRINT/00_START_HERE/GLOSSARY.md` | [`docs/blueprint/README.md`](../blueprint/README.md#glossary) |
| `PRODUCT_BLUEPRINT/00_START_HERE/README.md` | [`docs/blueprint/README.md`](../blueprint/README.md#talentsphere-product-blueprint-1) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/01_VISION_AND_STRATEGY.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#01--vision-and-strategy) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/02_SCOPE_AND_BOUNDARIES.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#02--scope-and-boundaries) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/03_PERSONAS_AND_ROLES.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#03--personas-and-roles) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/04_PERMISSION_MATRIX.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#04--permission-matrix) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/05_USER_JOURNEYS.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#05--user-journeys) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/06_BUSINESS_MODEL_AND_CROSS_MODULE_RULES.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#06--business-model-and-cross-module-rules) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/07_MODULE_MAP_AND_DEPENDENCIES.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#07--module-map-and-dependencies) |
| `PRODUCT_BLUEPRINT/01_PRODUCT/08_STAKEHOLDER_DECISIONS_NEEDED.md` | [`docs/blueprint/01_PRODUCT.md`](../blueprint/01_PRODUCT.md#08--stakeholder-decisions-needed) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/01_INFORMATION_ARCHITECTURE.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#01-information-architecture) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/02_DESIGN_SYSTEM.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#02-design-system) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/03_INTERACTION_PATTERNS.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#03-interaction-patterns) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/04_ACCESSIBILITY_AND_INCLUSION.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#04-accessibility-and-inclusion) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/05_RESPONSIVE_MOBILE_PWA_UX.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#05-responsive-mobile-and-pwa-ux) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/06_CONTENT_AND_MICROCOPY_GUIDE.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#06-content-and-microcopy-guide) |
| `PRODUCT_BLUEPRINT/03_EXPERIENCE/07_SCREEN_STATE_CHECKLIST.md` | [`docs/blueprint/03_EXPERIENCE.md`](../blueprint/03_EXPERIENCE.md#07-screen-and-state-checklist) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#01--system-architecture) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/02_DATA_MODEL.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#02--data-model) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/03_API_DESIGN.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#03--api-design) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/04_EVENTS_AND_ASYNC.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#04--events-and-asynchronous-processing) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/05_INTEGRATIONS_AND_ADAPTERS.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#05--integrations-and-adapters) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/06_AI_ARCHITECTURE.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#06--ai-architecture) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/07_SEARCH_MEDIA_REALTIME_ARCHITECTURE.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#07--search-media-and-realtime-architecture) |
| `PRODUCT_BLUEPRINT/04_ARCHITECTURE/08_TECHNICAL_SPECIFICATION_INDEX.md` | [`docs/blueprint/04_ARCHITECTURE.md`](../blueprint/04_ARCHITECTURE.md#08--technical-specification-index) |
| `PRODUCT_BLUEPRINT/05_SECURITY_PRIVACY/01_SECURITY_ARCHITECTURE.md` | [`docs/blueprint/05_SECURITY_PRIVACY.md`](../blueprint/05_SECURITY_PRIVACY.md#security-architecture) |
| `PRODUCT_BLUEPRINT/05_SECURITY_PRIVACY/02_PRIVACY_AND_DATA_GOVERNANCE.md` | [`docs/blueprint/05_SECURITY_PRIVACY.md`](../blueprint/05_SECURITY_PRIVACY.md#privacy-and-data-governance) |
| `PRODUCT_BLUEPRINT/05_SECURITY_PRIVACY/03_COMPLIANCE_MAP.md` | [`docs/blueprint/05_SECURITY_PRIVACY.md`](../blueprint/05_SECURITY_PRIVACY.md#compliance-map) |
| `PRODUCT_BLUEPRINT/05_SECURITY_PRIVACY/04_FAIRNESS_AND_AI_GOVERNANCE.md` | [`docs/blueprint/05_SECURITY_PRIVACY.md`](../blueprint/05_SECURITY_PRIVACY.md#fairness-and-ai-governance) |
| `PRODUCT_BLUEPRINT/06_QUALITY_AND_PERFORMANCE/01_NON_FUNCTIONAL_REQUIREMENTS.md` | [`docs/blueprint/06_QUALITY_AND_PERFORMANCE.md`](../blueprint/06_QUALITY_AND_PERFORMANCE.md#non-functional-requirements) |
| `PRODUCT_BLUEPRINT/06_QUALITY_AND_PERFORMANCE/02_QA_AND_TEST_STRATEGY.md` | [`docs/blueprint/06_QUALITY_AND_PERFORMANCE.md`](../blueprint/06_QUALITY_AND_PERFORMANCE.md#qa-and-test-strategy) |
| `PRODUCT_BLUEPRINT/06_QUALITY_AND_PERFORMANCE/03_ENGINEERING_STANDARDS.md` | [`docs/blueprint/06_QUALITY_AND_PERFORMANCE.md`](../blueprint/06_QUALITY_AND_PERFORMANCE.md#engineering-standards) |
| `PRODUCT_BLUEPRINT/07_DEVOPS_AND_OPERATIONS/01_INFRASTRUCTURE_AND_DEPLOYMENT.md` | [`docs/blueprint/07_DEVOPS_AND_OPERATIONS.md`](../blueprint/07_DEVOPS_AND_OPERATIONS.md#infrastructure-and-deployment) |
| `PRODUCT_BLUEPRINT/07_DEVOPS_AND_OPERATIONS/02_OPERATIONS_AND_SUPPORT.md` | [`docs/blueprint/07_DEVOPS_AND_OPERATIONS.md`](../blueprint/07_DEVOPS_AND_OPERATIONS.md#operations-and-support) |
| `PRODUCT_BLUEPRINT/07_DEVOPS_AND_OPERATIONS/03_MAINTENANCE_AND_SUSTAINABILITY.md` | [`docs/blueprint/07_DEVOPS_AND_OPERATIONS.md`](../blueprint/07_DEVOPS_AND_OPERATIONS.md#maintenance-and-sustainability) |
| `PRODUCT_BLUEPRINT/08_ROADMAP/01_LIFECYCLE_ROADMAP.md` | [`docs/blueprint/08_ROADMAP.md`](../blueprint/08_ROADMAP.md#lifecycle-roadmap) |
| `PRODUCT_BLUEPRINT/08_ROADMAP/02_TIER_PLAN.md` | [`docs/blueprint/08_ROADMAP.md`](../blueprint/08_ROADMAP.md#tier-plan-r0-to-r6) |
| `PRODUCT_BLUEPRINT/08_ROADMAP/03_DECISION_GATES_AND_CRITICAL_PATH.md` | [`docs/blueprint/08_ROADMAP.md`](../blueprint/08_ROADMAP.md#decision-gates-and-critical-path) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/ACCEPTANCE_CRITERIA_COVERAGE.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#acceptance_criteria_coveragemd) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/DECISION_REGISTER.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#decision_registermd) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/DEPENDENCY_REGISTER.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#dependency_registermd) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/FEATURES_BY_RELEASE_TIER.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#features_by_release_tiermd) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/INTEGRITY_REPORT.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#integrity_reportmd) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/JOURNEY_REGISTER.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#journey_registermd) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/STATE_MACHINE_REGISTER.md` | [`docs/blueprint/09_REGISTERS/OTHER_REGISTERS.md`](../blueprint/09_REGISTERS/OTHER_REGISTERS.md#state_machine_registermd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/00_MASTER_MINDMAP.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#00_master_mindmapmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/01_FOUNDATION.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#01_foundationmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/02_CAREER_IDENTITY.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#02_career_identitymd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/03_LEARNING.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#03_learningmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/04_HIRING.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#04_hiringmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/05_SOCIAL_AI_TRUST.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#05_social_ai_trustmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/06_INSTITUTIONS_COMMERCIAL.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#06_institutions_commercialmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/07_OS_EXPANSION.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#07_os_expansionmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/08_PLATFORM.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#08_platformmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/11_VISION_BUSINESS.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#11_vision_businessmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/12_ROLES_PERMISSIONS_JOURNEYS.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#12_roles_permissions_journeysmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/13_UX_NAVIGATION.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#13_ux_navigationmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/14_ARCHITECTURE_DATA_API.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#14_architecture_data_apimd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/15_SECURITY_PRIVACY_PERFORMANCE.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#15_security_privacy_performancemd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/16_QA_ENGINEERING.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#16_qa_engineeringmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/17_DEVOPS_OPERATIONS.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#17_devops_operationsmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/18_ROADMAP.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#18_roadmapmd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/19_REGISTERS_TRACEABILITY.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#19_registers_traceabilitymd) |
| `PRODUCT_BLUEPRINT/10_MINDMAPS/README.md` | [`docs/blueprint/10_MINDMAPS.md`](../blueprint/10_MINDMAPS.md#mind-maps) |
| `PRODUCT_BLUEPRINT/11_LEGACY_DISPOSITION/DISPOSITION_PLAN.md` | [`docs/blueprint/11_LEGACY_DISPOSITION.md`](../blueprint/11_LEGACY_DISPOSITION.md#legacy-documentation-disposition-plan) |
| `PRODUCT_BLUEPRINT/11_LEGACY_DISPOSITION/LEGACY_FEATURE_COVERAGE.md` | [`docs/blueprint/11_LEGACY_DISPOSITION.md`](../blueprint/11_LEGACY_DISPOSITION.md#legacy-feature-coverage-f-01-to-f-173) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/ASSUMPTIONS.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#assumptions) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/CANONICAL_INVARIANTS.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#canonical-target-invariants--cross-cutting-rules-inv-t--br-t-seeds) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/CLEANUP_CANDIDATES.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#cleanup-candidate-register-v9-control-document) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#consent-scope-catalogue-csc) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/DOCUMENT_STATUS.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#document-status-register) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/EXECUTION_LEDGER.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#execution-ledger) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/EXECUTION_LEDGER_V9_ADDENDUM.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#change-record-execution-ledger--v9-addendum-2026-10-25) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/GLOSSARY.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#glossary) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/ID_REGISTRY.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#id-registry-canonical--all-documents-must-use-these-ids) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/INFORMATION_RECONCILIATION_MATRIX.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#information-reconciliation-matrix-v9-control-document) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/KNOWLEDGE_PRESERVATION_MANIFEST.csv` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#knowledge_preservation_manifestcsv) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/KNOWLEDGE_PRESERVATION_MANIFEST.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#knowledge_preservation_manifestmd) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/LEGACY_MERGE_LEDGER_A.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#legacy-merge-ledger-a-preservation-record-for-source-group-a) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/MASTER_INDEX.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#master-index) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/MASTER_INDEX_V9_ADDENDUM.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#change-record-master-index--v9-addendum) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/MASTER_INDEX_V9_ADDENDUM_2.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#change-record-master-index--v9-addendum-2-review-fix-revisions) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/MASTER_INDEX_V9_ADDENDUM_3.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#change-record-master-index--v9-addendum-3-second-independent-review) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/PROJECT_SCOPE.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#project-scope--execution-boundary-1) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/PROTECTED_DOCUMENT_TREE_BASELINE.csv` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#protected_document_tree_baselinecsv) |
| `Yash_Final_Project_Document/00_CONTROL_CENTRE/SOURCE_DOCUMENT_INVENTORY.md` | [`docs/archive/target-blueprint/00_CONTROL_CENTRE.md`](target-blueprint/00_CONTROL_CENTRE.md#source-document-inventory-v9-control-document-1) |
| `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/LEGACY_PRD_PRODUCT_REQUIREMENTS.md` | [`docs/archive/target-blueprint/01_EXECUTIVE_AND_STRATEGY.md`](target-blueprint/01_EXECUTIVE_AND_STRATEGY.md#legacy-product-requirements-prior-prd-v60-merged-into-the-target-strategy) |
| `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_AND_BUSINESS_MODEL.md` | [`docs/archive/target-blueprint/01_EXECUTIVE_AND_STRATEGY.md`](target-blueprint/01_EXECUTIVE_AND_STRATEGY.md#product-vision-business-model--success-measures) |
| `Yash_Final_Project_Document/01_EXECUTIVE_AND_STRATEGY/PRODUCT_VISION_GOALS_REV2.md` | [`docs/archive/target-blueprint/01_EXECUTIVE_AND_STRATEGY.md`](target-blueprint/01_EXECUTIVE_AND_STRATEGY.md#change-record-product-vision-goals-revision-2-str-01-rev2-goal-wording-and-thresholds) |
| `Yash_Final_Project_Document/02_STAKEHOLDERS_AND_USERS/LEGACY_JOURNEY_REGISTRY_J01_J28.md` | [`docs/archive/target-blueprint/02_STAKEHOLDERS_AND_USERS.md`](target-blueprint/02_STAKEHOLDERS_AND_USERS.md#legacy-journey-register-j-01-to-j-28) |
| `Yash_Final_Project_Document/02_STAKEHOLDERS_AND_USERS/PERMISSION_MATRIX_REV2.md` | [`docs/archive/target-blueprint/02_STAKEHOLDERS_AND_USERS.md`](target-blueprint/02_STAKEHOLDERS_AND_USERS.md#change-record-roles-and-permission-matrix-revision-2-usr-01-rev2) |
| `Yash_Final_Project_Document/02_STAKEHOLDERS_AND_USERS/STAKEHOLDERS_ROLES_PERMISSIONS.md` | [`docs/archive/target-blueprint/02_STAKEHOLDERS_AND_USERS.md`](target-blueprint/02_STAKEHOLDERS_AND_USERS.md#stakeholders-personas-roles--permission-matrix) |
| `Yash_Final_Project_Document/02_STAKEHOLDERS_AND_USERS/USER_JOURNEYS.md` | [`docs/archive/target-blueprint/02_STAKEHOLDERS_AND_USERS.md`](target-blueprint/02_STAKEHOLDERS_AND_USERS.md#user-journeys--20-role-lifecycles) |
| `Yash_Final_Project_Document/03_BUSINESS_DOMAINS/DOMAIN_ARCHITECTURE.md` | [`docs/archive/target-blueprint/03_BUSINESS_DOMAINS.md`](target-blueprint/03_BUSINESS_DOMAINS.md#domain-architecture-bounded-contexts--coverage) |
| `Yash_Final_Project_Document/03_BUSINESS_DOMAINS/LEGACY_BRAIN_CONCEPTUAL_MODEL.md` | [`docs/archive/target-blueprint/03_BUSINESS_DOMAINS.md`](target-blueprint/03_BUSINESS_DOMAINS.md#legacy-conceptual-model-brain-merged-into-the-domain-architecture) |
| `Yash_Final_Project_Document/04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_AND_FEATURE_HIERARCHY.md` | [`docs/archive/target-blueprint/04_PRODUCT_CAPABILITIES.md`](target-blueprint/04_PRODUCT_CAPABILITIES.md#capability-map--feature-hierarchy) |
| `Yash_Final_Project_Document/04_PRODUCT_CAPABILITIES/CAPABILITY_MAP_PHASE_RECONCILIATION_REV2.md` | [`docs/archive/target-blueprint/04_PRODUCT_CAPABILITIES.md`](target-blueprint/04_PRODUCT_CAPABILITIES.md#change-record-capability-map-phase-reconciliation-revision-2-pcap-01-rev2) |
| `Yash_Final_Project_Document/04_PRODUCT_CAPABILITIES/LEGACY_FEATURE_REGISTRY_F01_F173.md` | [`docs/archive/target-blueprint/04_PRODUCT_CAPABILITIES.md`](target-blueprint/04_PRODUCT_CAPABILITIES.md#legacy-feature-registry-f-01-to-f-173-identity-priority-phase-dependencies) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/LEGACY_FEATURE_CONTRACT_AND_ACCEPTANCE.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#legacy-feature-contract-31-fields-status-rule-and-product-acceptance-merged) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/LEGACY_REQUIREMENTS_AND_ACCEPTANCE_FROM_REPORTS.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#legacy-requirements-and-acceptance-criteria-extracted-from-the-prior-attempts-reports) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/MICRO_FEATURE_SPECS.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#micro-feature-specifications) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/README.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#readmemd) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_ACCEPTANCE_ADDITIONS_REV2.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#change-record-feature-specifications-acceptance-additions-spec-rev2) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G1_IDENTITY_AND_PROFILE.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#feature-specifications--group-1-identity-sessions-profile--consent) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G2_EVIDENCE_AND_TRUST.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#feature-specifications--group-2-evidence-verification--referees) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G3_ASSESSMENT_AND_LEARNING.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#feature-specifications--group-3-assessment--learning) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G4_HIRING_LOOP.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#feature-specifications--group-4-jobs-search--match-applications-pipeline) |
| `Yash_Final_Project_Document/05_FEATURE_SPECIFICATIONS/SPEC_G5_ENGAGEMENT_COMMERCE_PRIVACY_INSTITUTIONS.md` | [`docs/archive/target-blueprint/05_FEATURE_SPECIFICATIONS.md`](target-blueprint/05_FEATURE_SPECIFICATIONS.md#feature-specifications--group-5-messaging-billing-data-rights-institutions) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/BUSINESS_PROCESS_INVENTORY.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#business-process-inventory) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#business-rules-registry-br-t) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/BUSINESS_RULES_REGISTRY_REV2.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#change-record-business-rules-registry-revision-2-br-reg-rev2) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/DECISION_TABLES.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#decision-tables-dt-) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/DECISION_TABLES_REV2.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#change-record-decision-tables-revision-2-dt-00-rev2) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/LEGACY_BR_CATALOGUE_BR001_BR248.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#legacy-business-rule-catalogue-br-001-to-br-248-and-mig-01-to-mig-08) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.csv` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#legacy_rule_crosswalkcsv) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/LEGACY_RULE_CROSSWALK.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#legacy-business-rule-crosswalk) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/PRODUCT_INVARIANT_REGISTRY.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#product-invariant-registry) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/PRODUCT_INVARIANT_REGISTRY_REV2.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#change-record-product-invariant-registry-revision-2-inv-reg-rev2) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/SSOT_WORKFLOW_CROSSWALK.csv` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#ssot_workflow_crosswalkcsv) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/SSOT_WORKFLOW_CROSSWALK.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#ssot-workflow-and-integrity-crosswalk) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/STATE_MACHINES.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#state-machines-sm-) |
| `Yash_Final_Project_Document/06_BUSINESS_PROCESSES/STATE_MACHINES_REV2.md` | [`docs/archive/target-blueprint/06_BUSINESS_PROCESSES.md`](target-blueprint/06_BUSINESS_PROCESSES.md#change-record-state-machines-revision-2-sm-00-rev2) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/ACCESSIBILITY_SPEC.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#accessibility-specification--wcag-22-aa-design-targets--test-plan) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/ACTION_REGISTRY.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#action-registry--231-user-and-operator-actions) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/DESIGN_SYSTEM.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#design-system--tokens-components-theming-localization--the-tsui-contract) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_APP_FLOW_MERGE.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#legacy-application-flow-routes-navigation-model-request-flow-recovery-merged) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/LEGACY_UI_UX_DESIGN_SYSTEM_MERGE.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#legacy-uiux-design-system-prior-v60-merged-and-reconciled) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/NAVIGATION_ARCHITECTURE.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#navigation-architecture--shell-nav-route-trees-deep-links-redirects-dashboards) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/PROGRESSIVE_UX_AND_FEEDBACK.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#progressive-ux--feedback--loading-lists-bulk-work-truthful-progress-sync-states-failure--conflict) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_REGISTRY.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#screen-registry--130-screens-across-mod-shell-and-seven-remotes) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/SCREEN_SPECIFICATIONS_KEY.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#key-screen-specifications--15-screens) |
| `Yash_Final_Project_Document/07_UI_UX_AND_DESIGN_SYSTEM/UX_REVIEW_FIXES.md` | [`docs/archive/target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md`](target-blueprint/07_UI_UX_AND_DESIGN_SYSTEM.md#uiux---review-fixes-revision-overlay-1) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/LEGACY_MERGE_PWA_AND_OFFLINE.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#legacy-merge-b-08-pwa-and-offline-claims-prior-attempt-and-the-six-flag-offline-declaration) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/MOBILE_DISTRIBUTION_DECISION.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#mobile-distribution-decision) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#offline-and-sync-design) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN_REV2.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#change-record-offline-and-sync-design---revision-2-review-fixes) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/PLATFORM_COMPATIBILITY_MATRIX.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#platform-compatibility-matrix) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/PWA_ARCHITECTURE.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#pwa-architecture) |
| `Yash_Final_Project_Document/08_PWA_AND_MOBILE/PWA_MOBILE_REVIEW_FIXES.md` | [`docs/archive/target-blueprint/08_PWA_AND_MOBILE.md`](target-blueprint/08_PWA_AND_MOBILE.md#pwa-and-mobile---review-fixes-revision-overlay-1) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/DEPENDENCY_AND_OWNERSHIP_MAP.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#dependency-and-ownership-map) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/FAULT_ISOLATION_MATRIX.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#fault-isolation-matrix) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/FEDERATION_ARCHITECTURE.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#module-federation-architecture) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/FEDERATION_REVIEW_FIXES.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#module-federation---review-fixes-revision-overlay) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/HOST_CONTRACT_AND_REMOTE_CONTRACTS.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#host-contract-v1-and-remote-contracts) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/LEGACY_MERGE_MODULE_BOUNDARY_RULES.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#legacy-merge-b-09-module-boundary-rules-from-the-prior-attempt-no-federation-existed) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/REMOTE_MANIFEST.schema.json` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#remote_manifestschemajson) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/REMOTE_MANIFEST.schema_REV2.json` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#change-record-remote_manifestschema_rev2json) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/REMOTE_REGISTRY.example.json` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#remote_registryexamplejson) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/REMOTE_REGISTRY.example_REV2.json` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#change-record-remote_registryexample_rev2json) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/REMOTE_REGISTRY.schema.json` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#remote_registryschemajson) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/REMOTE_REGISTRY.schema_REV2.json` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#change-record-remote_registryschema_rev2json) |
| `Yash_Final_Project_Document/09_MODULE_FEDERATION/VERSION_COMPATIBILITY_DESIGN.md` | [`docs/archive/target-blueprint/09_MODULE_FEDERATION.md`](target-blueprint/09_MODULE_FEDERATION.md#version-compatibility-design) |
| `Yash_Final_Project_Document/10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE.md` | [`docs/archive/target-blueprint/10_FRONTEND_ARCHITECTURE.md`](target-blueprint/10_FRONTEND_ARCHITECTURE.md#frontend-architecture) |
| `Yash_Final_Project_Document/10_FRONTEND_ARCHITECTURE/FRONTEND_ARCHITECTURE_REV2.md` | [`docs/archive/target-blueprint/10_FRONTEND_ARCHITECTURE.md`](target-blueprint/10_FRONTEND_ARCHITECTURE.md#change-record-frontend-architecture---revision-2-review-fixes) |
| `Yash_Final_Project_Document/10_FRONTEND_ARCHITECTURE/LEGACY_MERGE_FRONTEND_AND_UI_QUALITY.md` | [`docs/archive/target-blueprint/10_FRONTEND_ARCHITECTURE.md`](target-blueprint/10_FRONTEND_ARCHITECTURE.md#legacy-merge-b-10-frontend-requirements-web-journeys-and-ui-honesty-lessons-prior-attempt) |
| `Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE.md` | [`docs/archive/target-blueprint/11_BACKEND_ARCHITECTURE.md`](target-blueprint/11_BACKEND_ARCHITECTURE.md#backend-architecture-target) |
| `Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/BACKEND_ARCHITECTURE_REV2.md` | [`docs/archive/target-blueprint/11_BACKEND_ARCHITECTURE.md`](target-blueprint/11_BACKEND_ARCHITECTURE.md#change-record-backend-architecture-revision-2-be-01-rev2) |
| `Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/INDEX.md` | [`docs/archive/target-blueprint/11_BACKEND_ARCHITECTURE.md`](target-blueprint/11_BACKEND_ARCHITECTURE.md#11-backend-architecture---index) |
| `Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/LEGACY_MERGE_ARCHITECTURE_RULES_AND_ADRS.md` | [`docs/archive/target-blueprint/11_BACKEND_ARCHITECTURE.md`](target-blueprint/11_BACKEND_ARCHITECTURE.md#legacy-merge-b-11a-architecture-rules-import-rules-legacy-adr-set-trd-baseline-and-code-style) |
| `Yash_Final_Project_Document/11_BACKEND_ARCHITECTURE/LEGACY_MERGE_IMPLEMENTED_TOPOLOGY_LESSONS.md` | [`docs/archive/target-blueprint/11_BACKEND_ARCHITECTURE.md`](target-blueprint/11_BACKEND_ARCHITECTURE.md#legacy-merge-b-11b-prior-attempt-architecture-as-implemented---topology-owners-invariants-async-and-decision-register) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/CONCEPTUAL_AND_LOGICAL_MODEL.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#conceptual--logical-data-model-target) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/DATA_GOVERNANCE_AND_LIFECYCLE.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#data-governance--lifecycle-target) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/INDEX.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#12-data--database---index) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/LEGACY_MERGE_DATABASE_REFERENCE.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#legacy-merge-b-12-database-and-persistence-reference-prior-attempt-reconciled-to-the-target-data-design) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/MIGRATION_POLICY.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#database-migration-policy-target) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/PHYSICAL_DESIGN.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#physical-database-design-target) |
| `Yash_Final_Project_Document/12_DATA_AND_DATABASE/PHYSICAL_DESIGN_REV2.md` | [`docs/archive/target-blueprint/12_DATA_AND_DATABASE.md`](target-blueprint/12_DATA_AND_DATABASE.md#change-record-physical-database-design-revision-2-db-02-rev2) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/ACTION_TO_OPERATION_MAP.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#action-to-operation-map-ui-actions-to-api-operations) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#api-catalog-target) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG_ADDENDUM.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md#change-record-api-catalog-addendum-apic-02) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#api-design-standards) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/EVENT_CATALOG.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#event-catalog) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/INDEX.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#13-api-events--integrations---index) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/INTEGRATION_ARCHITECTURE.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#integration-architecture) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/LEGACY_MERGE_API_CONTRACTS.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#legacy-merge-b-13-api-contracts-error-envelope-and-billingwebhook-semantics-prior-attempt-reconciled-to-the-target-api-standard) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_REFERENCE_API_INVENTORY.csv` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#observed_reference_api_inventorycsv) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_REFERENCE_API_INVENTORY.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS.md#observed-reference-api-inventory) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_ROUTE_TARGET_CROSSWALK.csv` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md#observed_route_target_crosswalkcsv) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.csv` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md#ssot_interface_contract_crosswalkcsv) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md#ssot-interface-contract-crosswalk) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.csv` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md#ssot_service_contract_crosswalkcsv) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.md` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md#ssot-service-contract-crosswalk) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/asyncapi.yaml` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART2.md#asyncapiyaml) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/openapi.addendum.yaml` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md#openapiaddendumyaml) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/openapi.yaml` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART3.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART3.md#openapiyaml) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/schemas/Application.schema.json` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md#applicationschemajson) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/schemas/EventEnvelope.schema.json` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md#eventenvelopeschemajson) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/schemas/Evidence.schema.json` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md#evidenceschemajson) |
| `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/schemas/EvidenceIssuer.schema.json` | [`docs/archive/target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md`](target-blueprint/13_API_EVENTS_AND_INTEGRATIONS_PART4.md#evidenceissuerschemajson) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/COMPLIANCE_APPLICABILITY_MATRIX.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#compliance-applicability-matrix-candidate-regimes) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/INDEX.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#14-security-privacy--compliance---index) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_ROUTE_AUTHORIZATION_FINDINGS.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#legacy-merge-b-14b-route-authorization-review-and-findings-cf-31cf-45-prior-attempt-with-target-requirements) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/LEGACY_MERGE_SECURITY_CONTROLS.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#legacy-merge-b-14a-security-controls-threat-lists-credential-handling-and-privacy-pointers-prior-attempt-reconciled-to-the-target-security-design) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#privacy--data-lifecycle-design) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#security-architecture) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_REV2.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#change-record-security-and-privacy-architecture-revision-2-sec-02-rev2) |
| `Yash_Final_Project_Document/14_SECURITY_PRIVACY_COMPLIANCE/THREAT_MODEL.md` | [`docs/archive/target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md`](target-blueprint/14_SECURITY_PRIVACY_COMPLIANCE.md#threat-model) |
| `Yash_Final_Project_Document/15_RELIABILITY_AND_PERFORMANCE/CAPACITY_AND_SCALING.md` | [`docs/archive/target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md`](target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md#capacity-and-scaling) |
| `Yash_Final_Project_Document/15_RELIABILITY_AND_PERFORMANCE/FAILURE_MODE_ANALYSIS.md` | [`docs/archive/target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md`](target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md#failure-mode-analysis) |
| `Yash_Final_Project_Document/15_RELIABILITY_AND_PERFORMANCE/LEGACY_MERGE_RELIABILITY_AND_FAILURE_MODES.md` | [`docs/archive/target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md`](target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md#legacy-merge-b-15-reliability-constants-observed-failure-modes-and-capacity-lessons-prior-attempt-as-fmea-and-slo-seeds) |
| `Yash_Final_Project_Document/15_RELIABILITY_AND_PERFORMANCE/SLO_AND_PERFORMANCE_TARGETS.md` | [`docs/archive/target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md`](target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md#slo-and-performance-targets) |
| `Yash_Final_Project_Document/15_RELIABILITY_AND_PERFORMANCE/SLO_REV2.md` | [`docs/archive/target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md`](target-blueprint/15_RELIABILITY_AND_PERFORMANCE.md#change-record-slo-revision-2-synthetic-only-client-slis-budget-alignment-capacity-note) |
| `Yash_Final_Project_Document/16_QA_AND_TESTING/ACCEPTANCE_CRITERIA_GUIDE.md` | [`docs/archive/target-blueprint/16_QA_AND_TESTING.md`](target-blueprint/16_QA_AND_TESTING.md#acceptance-criteria-guide-and-definition-of-done) |
| `Yash_Final_Project_Document/16_QA_AND_TESTING/LEGACY_MERGE_CONDITION_MATRIX.md` | [`docs/archive/target-blueprint/16_QA_AND_TESTING.md`](target-blueprint/16_QA_AND_TESTING.md#legacy-merge-b-16b-condition-and-business-rule-matrix-62-rules-prior-attempt-as-test-design-seeds) |
| `Yash_Final_Project_Document/16_QA_AND_TESTING/LEGACY_MERGE_TESTING_STRATEGY.md` | [`docs/archive/target-blueprint/16_QA_AND_TESTING.md`](target-blueprint/16_QA_AND_TESTING.md#legacy-merge-b-16a-testing-strategy-commands-ci-gates-audit-method-and-adr-016-prior-attempt-reconciled-to-the-target-qa-strategy) |
| `Yash_Final_Project_Document/16_QA_AND_TESTING/TEST_CATALOG.md` | [`docs/archive/target-blueprint/16_QA_AND_TESTING.md`](target-blueprint/16_QA_AND_TESTING.md#test-catalog) |
| `Yash_Final_Project_Document/16_QA_AND_TESTING/TEST_CATALOG_REV2.md` | [`docs/archive/target-blueprint/16_QA_AND_TESTING.md`](target-blueprint/16_QA_AND_TESTING.md#change-record-test-catalog-revision-2-additive) |
| `Yash_Final_Project_Document/16_QA_AND_TESTING/TEST_STRATEGY.md` | [`docs/archive/target-blueprint/16_QA_AND_TESTING.md`](target-blueprint/16_QA_AND_TESTING.md#test-strategy) |
| `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/DEPLOYMENT_ARCHITECTURE.md` | [`docs/archive/target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md`](target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md#deployment-architecture) |
| `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/DEVOPS_AND_RELEASE_STRATEGY.md` | [`docs/archive/target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md`](target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md#devops-and-release-strategy) |
| `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/FRONTEND_DELIVERY_REVIEW_FIXES.md` | [`docs/archive/target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md`](target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md#frontend-delivery---review-fixes-federation-cdn-registry-wording-1) |
| `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/LEGACY_MERGE_DEVOPS_AND_DEPLOY.md` | [`docs/archive/target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md`](target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md#legacy-merge-b-17-deployment-environments-release-preflight-backuprestore-drills-and-maintenance-tooling-prior-attempt) |
| `Yash_Final_Project_Document/17_DEVOPS_AND_INFRASTRUCTURE/OBSERVABILITY_DESIGN.md` | [`docs/archive/target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md`](target-blueprint/17_DEVOPS_AND_INFRASTRUCTURE.md#observability-design) |
| `Yash_Final_Project_Document/18_OPERATIONS_AND_SUPPORT/INCIDENT_MANAGEMENT.md` | [`docs/archive/target-blueprint/18_OPERATIONS_AND_SUPPORT.md`](target-blueprint/18_OPERATIONS_AND_SUPPORT.md#incident-management) |
| `Yash_Final_Project_Document/18_OPERATIONS_AND_SUPPORT/LEGACY_MERGE_OPERATIONS_RUNBOOK_MATERIAL.md` | [`docs/archive/target-blueprint/18_OPERATIONS_AND_SUPPORT.md`](target-blueprint/18_OPERATIONS_AND_SUPPORT.md#legacy-merge-b-18-operations-runbook-material-operational-gates-and-common-failures-prior-attempt) |
| `Yash_Final_Project_Document/18_OPERATIONS_AND_SUPPORT/OPERATIONS_AND_SUPPORT_PROCESSES.md` | [`docs/archive/target-blueprint/18_OPERATIONS_AND_SUPPORT.md`](target-blueprint/18_OPERATIONS_AND_SUPPORT.md#operations-and-support-processes) |
| `Yash_Final_Project_Document/18_OPERATIONS_AND_SUPPORT/RUNBOOK_INDEX.md` | [`docs/archive/target-blueprint/18_OPERATIONS_AND_SUPPORT.md`](target-blueprint/18_OPERATIONS_AND_SUPPORT.md#runbook-index) |
| `Yash_Final_Project_Document/19_BUSINESS_AND_COMMERCIAL_OPERATIONS/COMMERCIAL_OPERATIONS.md` | [`docs/archive/target-blueprint/19_BUSINESS_AND_COMMERCIAL_OPERATIONS.md`](target-blueprint/19_BUSINESS_AND_COMMERCIAL_OPERATIONS.md#commercial-operations) |
| `Yash_Final_Project_Document/19_BUSINESS_AND_COMMERCIAL_OPERATIONS/LEGACY_PRICING_PRIOR_ATTEMPT.md` | [`docs/archive/target-blueprint/19_BUSINESS_AND_COMMERCIAL_OPERATIONS.md`](target-blueprint/19_BUSINESS_AND_COMMERCIAL_OPERATIONS.md#legacy-pricing-plans-and-entitlements-prior-attempt-merged) |
| `Yash_Final_Project_Document/19_BUSINESS_AND_COMMERCIAL_OPERATIONS/MARKETPLACE_MONEY_FLOW_ADR_PROPOSAL.md` | [`docs/archive/target-blueprint/19_BUSINESS_AND_COMMERCIAL_OPERATIONS.md`](target-blueprint/19_BUSINESS_AND_COMMERCIAL_OPERATIONS.md#third-party-marketplace-money-flow-adr-proposal-outline) |
| `Yash_Final_Project_Document/20_ANALYTICS_AND_MEASUREMENT/METRICS_CATALOG.md` | [`docs/archive/target-blueprint/20_ANALYTICS_AND_MEASUREMENT.md`](target-blueprint/20_ANALYTICS_AND_MEASUREMENT.md#metrics-catalog) |
| `Yash_Final_Project_Document/21_COST_AND_FINOPS/COST_ENVELOPE.md` | [`docs/archive/target-blueprint/21_COST_AND_FINOPS.md`](target-blueprint/21_COST_AND_FINOPS.md#coarse-cost-envelope-structure-only) |
| `Yash_Final_Project_Document/21_COST_AND_FINOPS/COST_MODEL.md` | [`docs/archive/target-blueprint/21_COST_AND_FINOPS.md`](target-blueprint/21_COST_AND_FINOPS.md#cost-model-and-finops) |
| `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/LEGACY_PRIOR_ATTEMPT_ROADMAP_AND_LESSONS.md` | [`docs/archive/target-blueprint/22_IMPLEMENTATION_ROADMAP.md`](target-blueprint/22_IMPLEMENTATION_ROADMAP.md#legacy-prior-attempt-roadmap-backlog-and-lessons-from-brainmemorymd-merged) |
| `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/LEGACY_RELEASE_GATES.md` | [`docs/archive/target-blueprint/22_IMPLEMENTATION_ROADMAP.md`](target-blueprint/22_IMPLEMENTATION_ROADMAP.md#legacy-release-gates-issue-and-pr-lineage-reports-group) |
| `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP.md` | [`docs/archive/target-blueprint/22_IMPLEMENTATION_ROADMAP.md`](target-blueprint/22_IMPLEMENTATION_ROADMAP.md#implementation-roadmap) |
| `Yash_Final_Project_Document/22_IMPLEMENTATION_ROADMAP/ROADMAP_REV2.md` | [`docs/archive/target-blueprint/22_IMPLEMENTATION_ROADMAP.md`](target-blueprint/22_IMPLEMENTATION_ROADMAP.md#change-record-implementation-roadmap-revision-2-overlay-rdm-01-rev2) |
| `Yash_Final_Project_Document/23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_CONFLICT_REGISTER.md` | [`docs/archive/target-blueprint/23_MIGRATION_AND_EVOLUTION.md`](target-blueprint/23_MIGRATION_AND_EVOLUTION.md#legacy-merge-b-23a-conflict-register-cf-01cf-45-prior-attempt-with-target-disposition-and-consolidated-conflict-index) |
| `Yash_Final_Project_Document/23_MIGRATION_AND_EVOLUTION/LEGACY_MERGE_INVENTORY_AND_COVERAGE.md` | [`docs/archive/target-blueprint/23_MIGRATION_AND_EVOLUTION.md`](target-blueprint/23_MIGRATION_AND_EVOLUTION.md#legacy-merge-b-23b-prior-attempt-inventory-feature-status-claims-domain-module-map-and-removed-sample-data) |
| `Yash_Final_Project_Document/23_MIGRATION_AND_EVOLUTION/MIGRATION_AND_EVOLUTION_PLAN.md` | [`docs/archive/target-blueprint/23_MIGRATION_AND_EVOLUTION.md`](target-blueprint/23_MIGRATION_AND_EVOLUTION.md#migration-and-evolution-plan-reference-system-to-target) |
| `Yash_Final_Project_Document/23_MIGRATION_AND_EVOLUTION/REFERENCE_TO_TARGET_DATA_MIGRATION.md` | [`docs/archive/target-blueprint/23_MIGRATION_AND_EVOLUTION.md`](target-blueprint/23_MIGRATION_AND_EVOLUTION.md#reference-to-target-data-migration-note) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/ADR_REGISTER.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#architecture-decision-register-target-design) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/GOVERNANCE_REGISTRATIONS_REV2.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#change-record-governance-registrations-proposed--adrs-open-items-index-additions) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/OPEN_DECISIONS.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#open-decisions-register) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/OPEN_DECISIONS_LEGACY_MERGE.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#open-decisions-conflicts-governance-and-lessons-merged-from-the-legacy-documentation-group-a) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/RISK_AND_LESSONS_FROM_PRIOR_ATTEMPT.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#risks-and-lessons-from-the-prior-attempt-reports-group) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/RISK_REGISTER.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#risk-register) |
| `Yash_Final_Project_Document/24_RISKS_AND_DECISIONS/RISK_REGISTER_REV2.md` | [`docs/archive/target-blueprint/24_RISKS_AND_DECISIONS.md`](target-blueprint/24_RISKS_AND_DECISIONS.md#change-record-risk-register-revision-2-additions-rsk-reg-rev2) |
| `Yash_Final_Project_Document/25_DIAGRAM_LIBRARY/LEGACY_MERGE_DIAGRAMS.md` | [`docs/archive/target-blueprint/25_DIAGRAM_LIBRARY.md`](target-blueprint/25_DIAGRAM_LIBRARY.md#legacy-merge-b-25-prior-attempt-diagrams-preserved-verbatim-architecture-auth-ai-safety-flows-f1-f7) |
| `Yash_Final_Project_Document/25_DIAGRAM_LIBRARY/SYSTEM_DIAGRAMS.md` | [`docs/archive/target-blueprint/25_DIAGRAM_LIBRARY.md`](target-blueprint/25_DIAGRAM_LIBRARY.md#system-diagram-library-1) |
| `Yash_Final_Project_Document/26_RESEARCH_AND_REFERENCES/RESEARCH_LOG.md` | [`docs/archive/target-blueprint/26_RESEARCH_AND_REFERENCES.md`](target-blueprint/26_RESEARCH_AND_REFERENCES.md#research-log-accessed-2026-10-25) |
| `Yash_Final_Project_Document/26_RESEARCH_AND_REFERENCES/RESEARCH_LOG_FRONTEND.md` | [`docs/archive/target-blueprint/26_RESEARCH_AND_REFERENCES.md`](target-blueprint/26_RESEARCH_AND_REFERENCES.md#research-log--frontend--platform-accessed-2026-10-25) |
| `Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md` | [`docs/archive/target-blueprint/27_INDEPENDENT_REVIEWS.md`](target-blueprint/27_INDEPENDENT_REVIEWS.md#independent-final-review-report) |
| `Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/REVIEW_FIX_STATUS.md` | [`docs/archive/target-blueprint/27_INDEPENDENT_REVIEWS.md`](target-blueprint/27_INDEPENDENT_REVIEWS.md#review-fix-status-revw-0145) |
| `Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/REVIEW_RESOLUTION_DECISIONS.md` | [`docs/archive/target-blueprint/27_INDEPENDENT_REVIEWS.md`](target-blueprint/27_INDEPENDENT_REVIEWS.md#review-resolution-proposals-not-yet-ratified) |
| `Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/SCENARIO_SIMULATIONS.md` | [`docs/archive/target-blueprint/27_INDEPENDENT_REVIEWS.md`](target-blueprint/27_INDEPENDENT_REVIEWS.md#scenario-simulations-paper-walk-throughs--not-executed-tests-1) |
| `Yash_Final_Project_Document/27_INDEPENDENT_REVIEWS/SECOND_REVIEW_REPORT.md` | [`docs/archive/target-blueprint/27_INDEPENDENT_REVIEWS.md`](target-blueprint/27_INDEPENDENT_REVIEWS.md#second-independent-review-report-originals-plus-rev2-layer) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AC_TEST_TRACEABILITY_MATRIX.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#acceptance-criteria-to-test-traceability-matrix) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ADR_015_PERSISTENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#adr_015_persistence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ADR_015_PERSISTENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#adr-015-persistence-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#architecture_durability_report_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ARCHITECTURE_DURABILITY_REPORT_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#historical-architecture-durability-report-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_DOCUMENTATION_CROSSCHECK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#audit_documentation_crosscheckcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_DOCUMENTATION_CROSSCHECK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#historical-documentation-cross-check-map) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_EVIDENCE_2026-10-21_INDEX.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#historical-audit-evidence-index---2026-10-21) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#audit_external_issue_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_EXTERNAL_ISSUE_EVIDENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#historical-external-issue-evidence-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_FEATURE_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#audit_feature_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_INVENTORY_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#audit_inventory_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_INVENTORY_EVIDENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE.md#historical-audit-inventory-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_JOURNEY_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#audit_journey_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_MIGRATION_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#audit_migration_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_MIGRATION_EVIDENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#historical-migration-evidence-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_PROBE_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#audit_probe_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_PROBE_EVIDENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#historical-probe-evidence-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_ROUTE_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#audit_route_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_ROUTE_EVIDENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#historical-route-evidence-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_TEST_EVIDENCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md#audit_test_evidence_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/AUDIT_TEST_EVIDENCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART2.md#historical-test-evidence-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/COVERAGE_MATRICES.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md#coverage-matrices-ac-to-test-br-to-ac-to-test-per-feature-ac-counts) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/FEATURE_REGISTRY_METADATA_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md#feature_registry_metadata_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/FEATURE_REGISTRY_METADATA_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART3.md#feature-registry-metadata-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/LEGACY_AUDIT_JSON_PER_BUSINESS_RULE_JUDGEMENTS.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#legacy_audit_json_per_business_rule_judgementscsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/LEGACY_AUDIT_JSON_PER_FEATURE_JUDGEMENTS.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#legacy_audit_json_per_feature_judgementscsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/LEGACY_REPORTS_EVIDENCE_INDEX.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#legacy-reports-evidence-index-and-verification-methodology-reports-group) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/LEGACY_TRACEABILITY_MATRIX_ROWS_FROM_PRIOR_ATTEMPT.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#legacy-feature-traceability-matrix-rows-verbatim-quote-from-the-prior-attempt) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#observed_implementation_control_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/OBSERVED_IMPLEMENTATION_CONTROL_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#observed-implementation-control-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/PHASE_GATE_GOVERNANCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#phase_gate_governance_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/PHASE_GATE_GOVERNANCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#phase_gate_governance_crosswalkmd) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ROUTE_AUTHORIZATION_FINDING_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#route_authorization_finding_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/ROUTE_AUTHORIZATION_FINDING_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#route-authorization-finding-crosswalk) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/SSOT_FEATURE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#canonical-ssot-feature-crosswalk-draft) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/SSOT_RECONCILIATION_AUDIT.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#ssot_reconciliation_auditmd) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/TRACEABILITY_AND_VALIDATION.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#traceability-coverage--validation-report) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/UX_PATTERN_SOURCE_CROSSWALK.csv` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#ux_pattern_source_crosswalkcsv) |
| `Yash_Final_Project_Document/28_TRACEABILITY_AND_COVERAGE/UX_PATTERN_SOURCE_CROSSWALK.md` | [`docs/archive/target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md`](target-blueprint/28_TRACEABILITY_AND_COVERAGE_PART4.md#ux-pattern-source-crosswalk-1) |
| `Yash_Final_Project_Document/29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md` | [`docs/archive/target-blueprint/29_DEVELOPER_IMPLEMENTATION_GUIDE.md`](target-blueprint/29_DEVELOPER_IMPLEMENTATION_GUIDE.md#developer-implementation-guide) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/00-INDEX.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#talentsphere--canonical-documentation-index) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/01-PRODUCT-REQUIREMENTS.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#01---product-requirements) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/02-ARCHITECTURE.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#02---architecture-and-technical-truth) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/03-DEVELOPMENT-GUIDE.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#03---development-guide) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/04-FEATURES-AND-WORKFLOWS.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#04---features-and-workflows) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/05-DATABASE-AND-API.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#05---database-and-api) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/06-SECURITY-AND-INTEGRATIONS.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#06---security-and-integrations) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/07-TESTING-AND-OPERATIONS.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#07---testing-and-operations) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/08-ROADMAP-AND-DECISIONS.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE.md#08---roadmap-debt-decisions-and-open-conflicts) |
| `Yash_Final_Project_Document/30_PRIOR_IMPLEMENTATION_REFERENCE/MIGRATION_MATRIX.md` | [`docs/archive/target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE_PART2.md`](target-blueprint/30_PRIOR_IMPLEMENTATION_REFERENCE_PART2.md#migration-matrix-working-record-for-deletion-gates) |
| `Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/FINAL_ARCHITECTURE_SUMMARY.md` | [`docs/archive/target-blueprint/99_FINAL_MASTER_BLUEPRINT.md`](target-blueprint/99_FINAL_MASTER_BLUEPRINT.md#final-architecture-summary) |
| `Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/FINAL_DOMAIN_COVERAGE.md` | [`docs/archive/target-blueprint/99_FINAL_MASTER_BLUEPRINT.md`](target-blueprint/99_FINAL_MASTER_BLUEPRINT.md#final-domain-coverage) |
| `Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/IMPLEMENTATION_READINESS.md` | [`docs/archive/target-blueprint/99_FINAL_MASTER_BLUEPRINT.md`](target-blueprint/99_FINAL_MASTER_BLUEPRINT.md#implementation-readiness) |
| `Yash_Final_Project_Document/99_FINAL_MASTER_BLUEPRINT/PROJECT_MASTER_BLUEPRINT.md` | [`docs/archive/target-blueprint/99_FINAL_MASTER_BLUEPRINT.md`](target-blueprint/99_FINAL_MASTER_BLUEPRINT.md#talentsphere--project-master-blueprint-target-design) |
| `Yash_Final_Project_Document/README.md` | [`docs/archive/target-blueprint/README.md`](target-blueprint/README.md#yash-final-project-document--talentsphere-target-product-blueprint) |
| `docs/engineering/HOSTED_SUPABASE_MIGRATION_GATE.md` | [`docs/engineering/DATABASE.md`](../engineering/DATABASE.md#hosted-supabase-migration-gate-and-dependency-audit) |
| `docs/engineering/TRD.md` | [`docs/engineering/TARGET_ARCHITECTURE.md`](../engineering/TARGET_ARCHITECTURE.md#talentsphere--trdmd-v60) |
| `docs/engineering/adr/ADR-015-core-loop-persistence.md` | [`docs/engineering/DECISIONS.md`](../engineering/DECISIONS.md#adr-015--persist-the-core-career-loop-keep-the-apis-maps-as-a-read-model) |
| `docs/engineering/adr/ADR-016-browser-measured-ui-quality-gates.md` | [`docs/engineering/DECISIONS.md`](../engineering/DECISIONS.md#adr-016--measure-ui-quality-in-a-real-browser-and-test-it-adversarially) |
| `docs/governance/GAP_ANALYSIS.md` | [`docs/governance/GOVERNANCE.md`](../governance/GOVERNANCE.md#talentsphere--gap_analysismd-v60) |
| `docs/governance/IMPLEMENTATION_PLAN.md` | [`docs/governance/GOVERNANCE.md`](../governance/GOVERNANCE.md#talentsphere--implementation_planmd-v60) |
| `docs/governance/SOURCE_RECONCILIATION.md` | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#talentsphere--source-reconciliation-v10) (in `GOVERNANCE.md` until 2026-11-26, see §5) |
| `docs/registries/WORKFLOWS_AND_BUSINESS_RULES.md` | [`docs/registries/BUSINESS_RULE_REGISTRY.md`](../registries/BUSINESS_RULE_REGISTRY.md#talentsphere--workflows_and_business_rulesmd-v60) |
| `docs/reports/ARCHITECTURE_DURABILITY_REPORT.md` | [`docs/reports/REPOSITORY_STATE_2026-10.md`](../reports/REPOSITORY_STATE_2026-10.md#talentsphere--architecture-security-durability--integrations-report) |
| `docs/reports/AUDIT_EVIDENCE_2026-10-21.json` | [`docs/reports/AUDIT_EVIDENCE_2026-10-21.md`](../reports/AUDIT_EVIDENCE_2026-10-21.md#audit_evidence_2026-10-21json) |
| `docs/reports/AUDIT_MASTER_REPORT.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#talentsphere--master-repository-audit--strategic-engineering-report) |
| `docs/reports/E2E_AUDIT_2026-10-21.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#end-to-end-audit--2026-10-21) |
| `docs/reports/FINAL_VALIDATION_REPORT.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#talentsphere--final_validation_reportmd-v60) |
| `docs/reports/GIT_RECONCILIATION_REPORT.md` | [`docs/reports/REPOSITORY_STATE_2026-10.md`](../reports/REPOSITORY_STATE_2026-10.md#talentsphere--git-history-issues--pull-requests-reconciliation-report) |
| `docs/reports/MAINTENANCE_AUDIT_2026-10-21.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#repository-maintenance-audit-and-proposed-design) |
| `docs/reports/PAYMENT_AUDIT_2026-10-23.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#payment-audit-and-fixes-2026-10-23) |
| `docs/reports/PRODUCTION_AUDIT_2026-10-03.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#talentsphere-complete--end-user--business-owner-production-audit) |
| `docs/reports/RELEASE_SCOPE_AND_BACKLOG.md` | [`docs/reports/REPOSITORY_STATE_2026-10.md`](../reports/REPOSITORY_STATE_2026-10.md#talentsphere--release-scope-backlog--sprint-roadmap-stages-af) |
| `docs/reports/REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md` | [`docs/reports/REPOSITORY_STATE_2026-10.md`](../reports/REPOSITORY_STATE_2026-10.md#talentsphere--repository-re-audit--github-issue-reconciliation) |
| `docs/reports/STRIPE_SUPABASE_AUDIT_2026-10-23.md` | [`docs/reports/AUDITS_2026-10.md`](../reports/AUDITS_2026-10.md#stripe-and-supabase-audit-2026-10-23) |
| `docs/superpowers/plans/2026-10-21-project-maintenance.md` | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#project-maintenance-implementation-plan) |
| `docs/system-model/03-conflict-register.md` | [`docs/system-model/03-conflicts-conditions-audit.md`](../system-model/03-conflicts-conditions-audit.md#system-model-03--conflict-register-and-decision-records) |
| `docs/system-model/04-conditions.md` | [`docs/system-model/03-conflicts-conditions-audit.md`](../system-model/03-conflicts-conditions-audit.md#system-model-04--condition-and-business-rule-matrix) |
| `docs/system-model/05-audit.md` | [`docs/system-model/03-conflicts-conditions-audit.md`](../system-model/03-conflicts-conditions-audit.md#system-model-05--audit-traceability-sample-and-limits) |

## 2. Moved without change

39 files.

| Former path | New path |
|---|---|
| `PRODUCT_BLUEPRINT/02_MODULES/ADM_Admin_Console_Support_Operations.md` | [`docs/blueprint/02_MODULES/ADM_Admin_Console_Support_Operations.md`](../blueprint/02_MODULES/ADM_Admin_Console_Support_Operations.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md` | [`docs/blueprint/02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md`](../blueprint/02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/ANL_Analytics_Reporting_Insights.md` | [`docs/blueprint/02_MODULES/ANL_Analytics_Reporting_Insights.md`](../blueprint/02_MODULES/ANL_Analytics_Reporting_Insights.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/ASM_Assessments_Challenges_Integrity.md` | [`docs/blueprint/02_MODULES/ASM_Assessments_Challenges_Integrity.md`](../blueprint/02_MODULES/ASM_Assessments_Challenges_Integrity.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md` | [`docs/blueprint/02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md`](../blueprint/02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/BGV_Verification_Background_Checks.md` | [`docs/blueprint/02_MODULES/BGV_Verification_Background_Checks.md`](../blueprint/02_MODULES/BGV_Verification_Background_Checks.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/BIL_Billing_Plans_Entitlements.md` | [`docs/blueprint/02_MODULES/BIL_Billing_Plans_Entitlements.md`](../blueprint/02_MODULES/BIL_Billing_Plans_Entitlements.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/EMP_Employer_Organisation_Teams_Brand.md` | [`docs/blueprint/02_MODULES/EMP_Employer_Organisation_Teams_Brand.md`](../blueprint/02_MODULES/EMP_Employer_Organisation_Teams_Brand.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md` | [`docs/blueprint/02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md`](../blueprint/02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/EVD_Evidence_Work_History_Credentials.md` | [`docs/blueprint/02_MODULES/EVD_Evidence_Work_History_Credentials.md`](../blueprint/02_MODULES/EVD_Evidence_Work_History_Credentials.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/EVT_Events_Hackathons_Community_Programmes.md` | [`docs/blueprint/02_MODULES/EVT_Events_Hackathons_Community_Programmes.md`](../blueprint/02_MODULES/EVT_Events_Hackathons_Community_Programmes.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/GIG_Freelance_Contract_Project_Work.md` | [`docs/blueprint/02_MODULES/GIG_Freelance_Contract_Project_Work.md`](../blueprint/02_MODULES/GIG_Freelance_Contract_Project_Work.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/IDN_Identity_Authentication_Account.md` | [`docs/blueprint/02_MODULES/IDN_Identity_Authentication_Account.md`](../blueprint/02_MODULES/IDN_Identity_Authentication_Account.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/INS_Institutions_Managed_Learning.md` | [`docs/blueprint/02_MODULES/INS_Institutions_Managed_Learning.md`](../blueprint/02_MODULES/INS_Institutions_Managed_Learning.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/INT_Interviews_Scheduling.md` | [`docs/blueprint/02_MODULES/INT_Interviews_Scheduling.md`](../blueprint/02_MODULES/INT_Interviews_Scheduling.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md` | [`docs/blueprint/02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md`](../blueprint/02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/LRN_Learning_Course_Experience.md` | [`docs/blueprint/02_MODULES/LRN_Learning_Course_Experience.md`](../blueprint/02_MODULES/LRN_Learning_Course_Experience.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/MEN_Mentorship_Coaching_Career_Services.md` | [`docs/blueprint/02_MODULES/MEN_Mentorship_Coaching_Career_Services.md`](../blueprint/02_MODULES/MEN_Mentorship_Coaching_Career_Services.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/MKT_Market_Intelligence_Career_Pathing.md` | [`docs/blueprint/02_MODULES/MKT_Market_Intelligence_Career_Pathing.md`](../blueprint/02_MODULES/MKT_Market_Intelligence_Career_Pathing.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/MSG_Messaging_Realtime_Communication.md` | [`docs/blueprint/02_MODULES/MSG_Messaging_Realtime_Communication.md`](../blueprint/02_MODULES/MSG_Messaging_Realtime_Communication.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/NET_Networking_Community_Referrals.md` | [`docs/blueprint/02_MODULES/NET_Networking_Community_Referrals.md`](../blueprint/02_MODULES/NET_Networking_Community_Referrals.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/NTF_Notifications_Communication.md` | [`docs/blueprint/02_MODULES/NTF_Notifications_Communication.md`](../blueprint/02_MODULES/NTF_Notifications_Communication.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/PLT_Platform_API_Integrations_Media_Files.md` | [`docs/blueprint/02_MODULES/PLT_Platform_API_Integrations_Media_Files.md`](../blueprint/02_MODULES/PLT_Platform_API_Integrations_Media_Files.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/PRF_Profile_Resume_Portfolio.md` | [`docs/blueprint/02_MODULES/PRF_Profile_Resume_Portfolio.md`](../blueprint/02_MODULES/PRF_Profile_Resume_Portfolio.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/PWA_PWA_Offline_Mobile_Extension.md` | [`docs/blueprint/02_MODULES/PWA_PWA_Offline_Mobile_Extension.md`](../blueprint/02_MODULES/PWA_PWA_Offline_Mobile_Extension.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/REP_Gamification_Reputation.md` | [`docs/blueprint/02_MODULES/REP_Gamification_Reputation.md`](../blueprint/02_MODULES/REP_Gamification_Reputation.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/SET_Settings_Privacy_Consent.md` | [`docs/blueprint/02_MODULES/SET_Settings_Privacy_Consent.md`](../blueprint/02_MODULES/SET_Settings_Privacy_Consent.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/SRC_Search_Discovery.md` | [`docs/blueprint/02_MODULES/SRC_Search_Discovery.md`](../blueprint/02_MODULES/SRC_Search_Discovery.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/STU_Instructor_Studio_Content_Production.md` | [`docs/blueprint/02_MODULES/STU_Instructor_Studio_Content_Production.md`](../blueprint/02_MODULES/STU_Instructor_Studio_Content_Production.md) |
| `PRODUCT_BLUEPRINT/02_MODULES/TSF_Trust_Safety_Moderation.md` | [`docs/blueprint/02_MODULES/TSF_Trust_Safety_Moderation.md`](../blueprint/02_MODULES/TSF_Trust_Safety_Moderation.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/BUSINESS_RULE_REGISTER.md` | [`docs/blueprint/09_REGISTERS/BUSINESS_RULE_REGISTER.md`](../blueprint/09_REGISTERS/BUSINESS_RULE_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/DATA_ENTITY_REGISTER.md` | [`docs/blueprint/09_REGISTERS/DATA_ENTITY_REGISTER.md`](../blueprint/09_REGISTERS/DATA_ENTITY_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/EVENT_REGISTER.md` | [`docs/blueprint/09_REGISTERS/EVENT_REGISTER.md`](../blueprint/09_REGISTERS/EVENT_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/FEATURE_REGISTER.md` | [`docs/blueprint/09_REGISTERS/FEATURE_REGISTER.md`](../blueprint/09_REGISTERS/FEATURE_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/NFR_REGISTER.md` | [`docs/blueprint/09_REGISTERS/NFR_REGISTER.md`](../blueprint/09_REGISTERS/NFR_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/OPEN_DECISIONS_REGISTER.md` | [`docs/blueprint/09_REGISTERS/OPEN_DECISIONS_REGISTER.md`](../blueprint/09_REGISTERS/OPEN_DECISIONS_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/RISK_REGISTER.md` | [`docs/blueprint/09_REGISTERS/RISK_REGISTER.md`](../blueprint/09_REGISTERS/RISK_REGISTER.md) |
| `PRODUCT_BLUEPRINT/09_REGISTERS/SCREEN_REGISTER.md` | [`docs/blueprint/09_REGISTERS/SCREEN_REGISTER.md`](../blueprint/09_REGISTERS/SCREEN_REGISTER.md) |
| `docs/system-model/TALENTSPHERE_MASTER_SYSTEM_MODEL.md` | `docs/system-model/MASTER_SYSTEM_MODEL.md`, merged on 2026-11-26 into [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#talentsphere--master-system-model) (see §5) |

## 3. Deleted

145 files. None of them holds documentation that is not kept elsewhere.

### One-line pointer to the full report

Content now in: docs/reports/REPOSITORY_STATE_2026-10.md. 1 files.

<details><summary>File list</summary>

- `REPOSITORY_AUDIT_AND_GITHUB_ISSUE_REPORT.md`

</details>

### Obsidian vault holding only the default welcome note and editor settings

Content now in: nothing (no project content). 7 files.

<details><summary>File list</summary>

- `TalentSphere/.obsidian/app.json`
- `TalentSphere/.obsidian/appearance.json`
- `TalentSphere/.obsidian/core-plugins.json`
- `TalentSphere/.obsidian/graph.json`
- `TalentSphere/.obsidian/workspace.json`
- `TalentSphere/Welcome.md`
- `TalentSphere/create a link.md`

</details>

### Agent tool state (oh-my-claude), not documentation

Content now in: nothing; recoverable from git. 8 files.

<details><summary>File list</summary>

- `Yash_Final_Project_Document/.omc/state/agent-replay-e35fdafe-9a47-4e8f-b74c-b7a0d8a88c69.jsonl`
- `Yash_Final_Project_Document/.omc/state/idle-notif-cooldown.json`
- `Yash_Final_Project_Document/.omc/state/read-budget-warnings.json`
- `Yash_Final_Project_Document/.omc/state/sessions/e35fdafe-9a47-4e8f-b74c-b7a0d8a88c69/last-tool-error-state.json`
- `Yash_Final_Project_Document/.omc/state/sessions/e35fdafe-9a47-4e8f-b74c-b7a0d8a88c69/mission-state.json`
- `Yash_Final_Project_Document/.omc/state/sessions/e35fdafe-9a47-4e8f-b74c-b7a0d8a88c69/pre-tool-advisory-throttle.json`
- `Yash_Final_Project_Document/.omc/state/sessions/e35fdafe-9a47-4e8f-b74c-b7a0d8a88c69/subagent-tracking-state.json`
- `Yash_Final_Project_Document/.omc/state/sessions/e35fdafe-9a47-4e8f-b74c-b7a0d8a88c69/subagent-tracking-state.json.lock`

</details>

### Byte-identical copy of docs/reports/AUDIT_EVIDENCE_2026-10-21.json

Content now in: docs/reports/AUDIT_EVIDENCE_2026-10-21.md. 1 files.

<details><summary>File list</summary>

- `Yash_Final_Project_Document/31_LEGACY_ARCHIVE/docs/reports/AUDIT_EVIDENCE_2026-10-21.json`

</details>

### Index of the system-model files

Content now in: docs/INDEX.md, section "System model". 1 files.

<details><summary>File list</summary>

- `docs/system-model/00-index.md`

</details>

### Output of a knowledge-graph tool run on 2026-10-23 (JSON, HTML, cache); superseded by the generated project-mindmap/

Content now in: project-mindmap/. 127 files.

<details><summary>File list</summary>

- `graphify-out/.graphify_detect.json`
- `graphify-out/.graphify_labels.json`
- `graphify-out/.graphify_labels.json.sig`
- `graphify-out/.graphify_labels.pending.json`
- `graphify-out/.graphify_python`
- `graphify-out/.graphify_root`
- `graphify-out/.rebuild.lock`
- `graphify-out/2026-10-23/.graphify_labels.json`
- `graphify-out/2026-10-23/GRAPH_REPORT.md`
- `graphify-out/2026-10-23/cost.json`
- `graphify-out/2026-10-23/graph.json`
- `graphify-out/2026-10-23/manifest.json`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/069fab2e7ef186b749f3271c8834ba9827a725b043382ece23257539ee1e02bb.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/06bcdcd3eea074bd9035ed1117410bb3898e50c74d1f7180e5672f4647e2e308.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/176d713b78f995d36c80945cfcc878c4f32dbf7e85ceacd5b90743a8db1c66bd.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/17d55c1504389504c0c3377adeb47fc79f5391fc56247d263e701ac38c9e8baa.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/2ad345f6885f0338f3aa3c32b503a05a9b097f0565434169bd445a609d12e89e.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/3b21f3e7bdf536865031eaedc5121ec44e4fc68de2e61f28643e8f6f512e9208.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/41995ee65421a6e1a0c409067aa28c3bf1860bc1a1e3ca3417155cb9802e2d48.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/435d0960c92938ac78e47306703c47bbba4f145d7751347e1a7010b2bf242e58.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/4ed1702dafb0bcf457a07f5c1babe25094f84ed2b883f837ff9f79c9cea8cdb6.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/540b5a3e2786f5195d3fbb49ba0447c255b96854a53bf4522515739a1d49953d.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/5476507581cc7e46ae62b2d4eb8a8129f5ef7615710c7039b69b1f8dc0e95289.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/5e2d321fb1a8e032f452751ab118b6ea9b89863774d2f76c70666753fb4e7d70.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/66d97096c9fb845bb5758646d7ced72f0f17eadb08d8c5f9ba71159a741865d9.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/70316691a9be02e1f1c122f55f33875d96794ab7696d7ae1596234c5c244ee73.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/741eb54da47da6f8797b337b1fb40c573e395a6e750ce07a2ed25b188a425fa4.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/7ca1f4db6284bd2d13476bb4c9f01249230ea49236b9d6d94f352aed0d14487b.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/7d2e36c0bc92edc6cbd366c18271985bd030a4e1edcf179442e5cf3f781563a5.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/8b3f75bac1b7522b1e812516228ed74e89dcdfaf7d86eb8ac63b2773bbc99e94.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9036f1001ffedfc039595b39f0e9b9ccd0236f35fbeb1f0dd042ac2e4782458d.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/92c56c4437f78def8e7bfbc3eac96c5d44828022cf799fc40b7a4f5b9f5ae8f3.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9561e674b3f5fe135f6314ee37bef7040d247dd348d7b71f71ef4d7770baf89a.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/95ded0e1ade0244e5d2e83b53cf6ce5bd780bbb2ea7db7c190139474066ba128.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/96befbc17a773535e3593c45f814f78968e13b4ec14c4b0d4500eea51f30f31f.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9c4d328c2e9143ed1e69d4f712c17bb4cdc146bf935c8364b3ac7f2d215e406d.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9e1cf04f09f4f4cbb334070e6719f71a38a64210a447df8d6d370e8055fc4ffb.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a86ab9c4f3d0e718deee5c42ce3faab57b6ca8bf7342fab7b721ad18472faa5d.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/ab06798834ee0db0973c1bea56c92b460be27198977cf736b2f520fd82e1acde.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/abdcee1af6b6f855219692fc98bd948ecbcde486d48eb10ab47da6ad4e912dae.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/b7657ca668cdebd4d65eb1a8c7a36f74bd38e15615c0296fc44788a4b82edc87.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/bd936cf4362aa50438da5284d65ee1f69e4c10e2dc28b04fd71936ed0682097d.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/bdf804b449ff8337458e1de907b937fe83968404d31a3a82a605980a720e16c6.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/be332a76357a1421666195722142bbcb8197b63ab49acd29b1baf77882d9f32d.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/be6b3b6eca91348fa23ba1eed4da0dbcd7a3185edcea6557c928f88083284255.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/befb82560267b4a81869b6e047eea3fd60e2b32685cbd43bca3c55416c581cd7.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/c206cd05a45044580538808a07ec992178087654b98b827fde3325d7e9cdb0fb.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/c4e0eb21578a7548157dca07e334ba8e85013469d110075c70e2f2256034df35.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/c7b4037efde33ea0a580c7686e2353ea90d3f3efae10eca2222a8a4eac4e9589.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/c95ef604fb0aaa71501e629e164236afe16ade4ae8af517c081f961cfa104d79.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/d3a290b9f882eb4f206de5e6cba89f4587b4c969e660575dc20875e282f20282.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/d5365191e97131bb2c127f7434efc0a29d0d2aac4f02ce20684080ad090f1a5f.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e23fab67121f27e970e2d9300146e7f8f9f4e81cbb855cd183ca04aa78208a29.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/ee270845070acd3a29221b4c2616e0046fab9fae57c742d1c118dccc24f0f2d5.json`
- `graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/ee779f44244be641ad518d2da6a2cdfdddd788f573f7d0dffd681e6d197ab099.json`
- `graphify-out/cache/last_query_stamp`
- `graphify-out/cache/semantic/pab7e20a8ed94/0499de77f63fc028cec750eae63b0e2460c0816f936dad7d98313bdef3ca85f1.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/065b0cca5529a875c21b9383dc42a223a4c5a0c3da5aeeb36114a024ede3bdbf.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/0663855b6a1b98200137f98a9e30ca0b7d70f39020806d2644b258c676a57dd8.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/07c0ee05d4898590ab0acc72afa0936cf75c296977de74ebd9e294508f27c4db.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/147f03e13fd9157ac4a293c3fc00e6217b9149491bca70dd19a22eb55005a4ce.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/173567718368620f9ba43e12c11046de2f20c3c9d6acf3dd8a9420a2bf2f1665.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/2488b924ce6616c4005033e41c1cabb9c36710a4e416b83f1518099b9bf7a2d9.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/2e2aec51a90eb02fd80d7dc2846f0051d0d9822c542beda6a0b9d85892ed8d03.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/34ffd4d457c6f5bafe2e186e0bf69c3970a750d0e92cd154fce6ebd74e4945bf.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/36e6919f1145d86f3542f86a46a9f94d99c421e5252bda8cbb5fc3af62a270e6.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/3aa8d06469f3693716bc1dbdbba506167f9cb443faf33c0ec0f7c3844ca46fc8.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/3d81afa2177fb26e10d07c41c5106e085c26daa790fc75acb4e0f76868dc072f.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/3dfcee3ab6ebc3171ba441913c65f6843ef247b002c591cdaa0b24e7a67937a9.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/3ee4ef16065657b9ed30e8823f25b418cb906c7ac845c9ba6759140fd5b8f4d6.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/475a24e837c71ab1f2ed06ed686886a9ba89d3a2cb109fe15170a89fb330bed8.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/4ca117f92759daa82bf4d14916017dea45695a6f2d6c40e2ccfa2e3421f930d3.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/4cb25570bd5697c8bae6135ea8b1b7226ba6887c8483b7b0e2e257874a67f1f9.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/521a4b77e2317cf32a9c55aa50f9fea9a69d1990601233c9043bf6e709ca4df5.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/566cf9eaa9306bf9540bb91c94a70208886a48d60717a958187554cc5604b64a.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/5cd728c34e32e3265545f006e098068b7baedde17d8702d8527b311c27445a2a.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/5d317ac5982edbe95bc4c52f3a7d144ab0058928ccda3fc60f5818998b16deb9.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/62195d2cc9c6f221b8b26337e4c6286a08c3dff9811ffc415130418aec75ce85.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/621f4a904896c1ea32cd28c387406c8bbbb1041f1dbf86518bcb74fe2a9433e8.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/651b27665feb0ac4b1a02ebdfcb67a0ae631eb9361376aebf8b40ea5f08e9223.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/67950e1c39f0bebbf18dcdc2fe7b9d727c029a50475320427e87c4133df9ea59.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/6983827585ef493ce1a90ca36fa584547c4ff142fb2568e74f6f418a48a35915.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/726ac8bf67bf4231b8b2b56ac598d5cbef07b6e4764e28f194433319b43259e5.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/730e836d69f915fe8e1a675cc9987dafa3c2a26a281212f80ad6748e073c8c4a.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/73245cf554ec19368bde5e8f7a04060e98a943bbddf1ee009e7b577bf4c41c0c.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/76a5a84ea9311458fc997ce7fdd031817932dbdb61c475b4f7d9bf280c0c0ef8.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/7d87516852b8cfd70d4766ff0431a2e8926fbba83ce149fa90e969a0972d0c29.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/80b0d69a198346c05a03180e4901f6ff7d6b3548a27d32c0a3ff74f4c8210f07.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/8385e6756e045231bdc9cff1dc833a1b88c8793e708926a0b72cb5bcfe9963e2.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/8650401169c9b501dc5749a5cb684c60076c5fc7b6c6cbc6e9c90fd66ee89758.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/8b9351f8263e02c46fad09ab687113a40c75e9b9c04dd6c8a3c1106fedc61f86.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/8ba5ae262ee166e00ec0e70adf37ef87cef5d70b117897b2fb4cd5fd1dab278c.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/8eef52b39a76dcf6c0883501af6e708e037ebfd8234296fa853beaa9500e1e5f.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/8fdc974b32e54bbc7b1b68310ea222704110eb20ce467e97057a0498e9916b8a.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/90ef3fc59ca23e1c1ae551fe8fcda8e23768c80c94ec1fc3f8bb612c1fc32058.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/930d69ec97948688c6161caf99d1210fc955ca724d91fa29a03359518f8051cf.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/93a5abca5067d223927da324a016fa06cfb652ded893c3e15a1237bc3a9c7c9c.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/983662273c5a7d38948c60a5f4f8fbc6791fae9ad1102d53cebb125d3eab9aed.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/9cc5a5cdb850d6585b89ed8777b991e15988acbf2079033aadf4c2c5c19c28a8.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/a16c3831086d54fbef56537b415b54ad01a1487fdd612824d5854b0e78925b89.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/a2723877b59385980845733da3d3db18c54dcb7b9524060c07746cfe58c35e5e.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/aa2490bf149243750992a0efb8aa0508309f9f391d7757bd3d499c0294bcc1a2.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/aada9f081153d264df5b03df4de614c8ed5481cd86e5b2a7512205b27dfce71b.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/b1ba2bfd805db4d3819aedc9969b438c4b5edaf58dee8850da36d8308d40efd3.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/b3c8c266f05487925afb25c8a8a9630d1401539aeaf6e7304045e44ac83f2c21.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/b5bf4544e3cd9a778240b16a6bcea31824e04b6aabe6bf22c8b31d1f309cc017.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/c01f40135e1ea4025c57ec5cb0a9a7ac301621375eef812af0cbc656ec257b19.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/d12f00adc51c645b245a404db664530060986b2da84d4ecaec6cc5ab15fd5d37.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/d2e24b20e7520fb4197c9768b9ae3455a06f5522d9e592b47e5a42e84a5b0c1b.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/d9cba50eaa7f2c5808578584f38904f7bc1aa04117a63968ca31bfdd4a3e0c87.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/db4210ff8636265703fade9d2d83e6cca8ddcac2bf770b085049f7945f937f36.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/e1e1a737b424efee2b449df4adf9f407b58fbf813dabba1ea1a559b25a2790bd.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/e449373a2c5a920fdb294a8b608e11834a44862e97fa37201d95fbd6e66170c0.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/e9e82e4eae67b9b9d3b9743350fbc3a8b0418137fd7f2e91ded1542b8110354a.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/ea4fc29b91a9b9a4bd4832aa80b98d72b691af532c2945149847ee2eacf80412.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/eb115ad2cee2067b236b5b45aa5e86d333bfdce092d298680bd5f78104387ba9.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/f0eca1d1bdf987f567c9ab1b9f72e8f2e7586469ec40519d78482b533d80f71a.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/f3e3cbf70e50719f64f59446c68080ad5e2c447c962838a80cf3fcdc833d7326.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/f3fdd00dbbc4fad110922f72a4beaa1c2f5c83cb61f706548e07611724ca7bd9.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/f49a29386fbd5218774fb65a4ef3aae3fae346436d8e7f64283cae89c64cb61d.json`
- `graphify-out/cache/semantic/pab7e20a8ed94/f862ba2bb5a19ec898977c0391dd3b2f9864bd7a87f5bab25f4663ad11c89075.json`
- `graphify-out/cache/stat-index.json`
- `graphify-out/cost.json`
- `graphify-out/graph.html`
- `graphify-out/graph.json`
- `graphify-out/manifest.json`

</details>


## 4. Merged on 2026-11-25 (second round)

131 files. Commit before the change: `2ca2ba8`. Restore any of them with `git checkout 2ca2ba8 -- <path>`.

Each file's full text is kept in the repository at the new location. The `.agents/teamwork/` files are fenced byte for byte under a heading that is their old path; a script compared every block with `git show 2ca2ba8:<path>` and found no differences. `docs/engineering/PROJECT_MAINTENANCE.md` became a section of `OPERATIONS.md` with its headings moved down one level.

`.prettierignore` still lists `.agents/teamwork/`. It is a protected build file, so the stale entry was left; it matches nothing.

| Former file | Now in |
|---|---|
| `docs/engineering/PROJECT_MAINTENANCE.md` | [`docs/quality/OPERATIONS.md`](../quality/OPERATIONS.md#10-project-maintenance-tooling) |
| `.agents/teamwork/ORIGINAL_REQUEST.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkoriginal_requestmd) |
| `.agents/teamwork/auditor_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_1briefingmd) |
| `.agents/teamwork/auditor_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_1contextmd) |
| `.agents/teamwork/auditor_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_1dispatchmd) |
| `.agents/teamwork/auditor_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_1handoffmd) |
| `.agents/teamwork/auditor_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_1progressmd) |
| `.agents/teamwork/auditor_iter2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_iter2contextmd) |
| `.agents/teamwork/auditor_iter2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkauditor_iter2dispatchmd) |
| `.agents/teamwork/challenger_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_1briefingmd) |
| `.agents/teamwork/challenger_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_1contextmd) |
| `.agents/teamwork/challenger_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_1dispatchmd) |
| `.agents/teamwork/challenger_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_1handoffmd) |
| `.agents/teamwork/challenger_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_1progressmd) |
| `.agents/teamwork/challenger_2/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_2briefingmd) |
| `.agents/teamwork/challenger_2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_2contextmd) |
| `.agents/teamwork/challenger_2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_2dispatchmd) |
| `.agents/teamwork/challenger_2/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_2handoffmd) |
| `.agents/teamwork/challenger_2/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_2progressmd) |
| `.agents/teamwork/challenger_iter2_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_iter2_1contextmd) |
| `.agents/teamwork/challenger_iter2_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_iter2_1dispatchmd) |
| `.agents/teamwork/challenger_iter2_2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_iter2_2contextmd) |
| `.agents/teamwork/challenger_iter2_2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkchallenger_iter2_2dispatchmd) |
| `.agents/teamwork/explorer_arch_sec_1/architecture_security_report.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_arch_sec_1architecture_security_reportmd) |
| `.agents/teamwork/explorer_arch_sec_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_arch_sec_1briefingmd) |
| `.agents/teamwork/explorer_arch_sec_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_arch_sec_1dispatchmd) |
| `.agents/teamwork/explorer_arch_sec_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_arch_sec_1handoffmd) |
| `.agents/teamwork/explorer_arch_sec_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_arch_sec_1progressmd) |
| `.agents/teamwork/explorer_features_1/all_routes.txt` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1all_routestxt) |
| `.agents/teamwork/explorer_features_1/analyze_routes.cjs` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1analyze_routescjs) |
| `.agents/teamwork/explorer_features_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_features_1briefingmd) |
| `.agents/teamwork/explorer_features_1/build_traceability_matrix.cjs` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1build_traceability_matrixcjs) |
| `.agents/teamwork/explorer_features_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_features_1dispatchmd) |
| `.agents/teamwork/explorer_features_1/extract_audit_data.cjs` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1extract_audit_datacjs) |
| `.agents/teamwork/explorer_features_1/extract_web_calls.cjs` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1extract_web_callscjs) |
| `.agents/teamwork/explorer_features_1/features_audit_report.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_features_1features_audit_reportmd) |
| `.agents/teamwork/explorer_features_1/features_raw.json` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1features_rawjson) |
| `.agents/teamwork/explorer_features_1/generate_report.cjs` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1generate_reportcjs) |
| `.agents/teamwork/explorer_features_1/group_routes.cjs` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1group_routescjs) |
| `.agents/teamwork/explorer_features_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_features_1handoffmd) |
| `.agents/teamwork/explorer_features_1/migration_tables.json` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1migration_tablesjson) |
| `.agents/teamwork/explorer_features_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_features_1progressmd) |
| `.agents/teamwork/explorer_features_1/routes_with_lines.json` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1routes_with_linesjson) |
| `.agents/teamwork/explorer_features_1/traceability_matrix.json` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1traceability_matrixjson) |
| `.agents/teamwork/explorer_features_1/unique_features.json` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1unique_featuresjson) |
| `.agents/teamwork/explorer_features_1/web_api_calls.json` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkexplorer_features_1web_api_callsjson) |
| `.agents/teamwork/explorer_git_issues_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_git_issues_1briefingmd) |
| `.agents/teamwork/explorer_git_issues_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_git_issues_1dispatchmd) |
| `.agents/teamwork/explorer_git_issues_1/git_reconciliation_report.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_git_issues_1git_reconciliation_reportmd) |
| `.agents/teamwork/explorer_git_issues_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_git_issues_1handoffmd) |
| `.agents/teamwork/explorer_git_issues_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_git_issues_1progressmd) |
| `.agents/teamwork/explorer_survey_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_1briefingmd) |
| `.agents/teamwork/explorer_survey_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_1contextmd) |
| `.agents/teamwork/explorer_survey_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_1dispatchmd) |
| `.agents/teamwork/explorer_survey_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_1handoffmd) |
| `.agents/teamwork/explorer_survey_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_1progressmd) |
| `.agents/teamwork/explorer_survey_2/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_2briefingmd) |
| `.agents/teamwork/explorer_survey_2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_2contextmd) |
| `.agents/teamwork/explorer_survey_2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_2dispatchmd) |
| `.agents/teamwork/explorer_survey_2/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_2handoffmd) |
| `.agents/teamwork/explorer_survey_2/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_2progressmd) |
| `.agents/teamwork/explorer_survey_3/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_3briefingmd) |
| `.agents/teamwork/explorer_survey_3/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_3contextmd) |
| `.agents/teamwork/explorer_survey_3/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_3dispatchmd) |
| `.agents/teamwork/explorer_survey_3/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_3handoffmd) |
| `.agents/teamwork/explorer_survey_3/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkexplorer_survey_3progressmd) |
| `.agents/teamwork/orchestrator_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1briefingmd) |
| `.agents/teamwork/orchestrator_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1contextmd) |
| `.agents/teamwork/orchestrator_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1dispatchmd) |
| `.agents/teamwork/orchestrator_1/GATE_STATUS.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1gate_statusmd) |
| `.agents/teamwork/orchestrator_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1progressmd) |
| `.agents/teamwork/orchestrator_1/PROJECT.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1projectmd) |
| `.agents/teamwork/orchestrator_1/TEST_INFRA.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkorchestrator_1test_inframd) |
| `.agents/teamwork/reviewer_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_1briefingmd) |
| `.agents/teamwork/reviewer_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_1contextmd) |
| `.agents/teamwork/reviewer_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_1dispatchmd) |
| `.agents/teamwork/reviewer_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_1handoffmd) |
| `.agents/teamwork/reviewer_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_1progressmd) |
| `.agents/teamwork/reviewer_2/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_2briefingmd) |
| `.agents/teamwork/reviewer_2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_2contextmd) |
| `.agents/teamwork/reviewer_2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_2dispatchmd) |
| `.agents/teamwork/reviewer_2/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_2handoffmd) |
| `.agents/teamwork/reviewer_2/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_2progressmd) |
| `.agents/teamwork/reviewer_audit_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_audit_1briefingmd) |
| `.agents/teamwork/reviewer_audit_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_audit_1dispatchmd) |
| `.agents/teamwork/reviewer_audit_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_audit_1handoffmd) |
| `.agents/teamwork/reviewer_audit_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_audit_1progressmd) |
| `.agents/teamwork/reviewer_iter2_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_iter2_1contextmd) |
| `.agents/teamwork/reviewer_iter2_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_iter2_1dispatchmd) |
| `.agents/teamwork/reviewer_iter2_2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_iter2_2contextmd) |
| `.agents/teamwork/reviewer_iter2_2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkreviewer_iter2_2dispatchmd) |
| `.agents/teamwork/sentinel/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworksentinelbriefingmd) |
| `.agents/teamwork/sentinel/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworksentinelhandoffmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1briefingmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1dispatchmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/GATE_STATUS.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1gate_statusmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1handoffmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/plan.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1planmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1progressmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/PROJECT.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1projectmd) |
| `.agents/teamwork/teamwork_preview_orchestrator_1/README.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_orchestrator_1readmemd) |
| `.agents/teamwork/teamwork_preview_victory_auditor_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_victory_auditor_1briefingmd) |
| `.agents/teamwork/teamwork_preview_victory_auditor_1/count_routes.js` | [`docs/history/AGENT_TEAMWORK_2026-10_DATA.md`](../history/AGENT_TEAMWORK_2026-10_DATA.md#agentsteamworkteamwork_preview_victory_auditor_1count_routesjs) |
| `.agents/teamwork/teamwork_preview_victory_auditor_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_victory_auditor_1dispatchmd) |
| `.agents/teamwork/teamwork_preview_victory_auditor_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_victory_auditor_1handoffmd) |
| `.agents/teamwork/teamwork_preview_victory_auditor_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_victory_auditor_1progressmd) |
| `.agents/teamwork/teamwork_preview_victory_auditor_1/README.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkteamwork_preview_victory_auditor_1readmemd) |
| `.agents/teamwork/test_writer_e2e_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworktest_writer_e2e_1briefingmd) |
| `.agents/teamwork/test_writer_e2e_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworktest_writer_e2e_1contextmd) |
| `.agents/teamwork/test_writer_e2e_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworktest_writer_e2e_1dispatchmd) |
| `.agents/teamwork/test_writer_e2e_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworktest_writer_e2e_1handoffmd) |
| `.agents/teamwork/test_writer_e2e_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworktest_writer_e2e_1progressmd) |
| `.agents/teamwork/worker_baseline_diag_1/baseline_report.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_baseline_diag_1baseline_reportmd) |
| `.agents/teamwork/worker_baseline_diag_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_baseline_diag_1briefingmd) |
| `.agents/teamwork/worker_baseline_diag_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_baseline_diag_1dispatchmd) |
| `.agents/teamwork/worker_baseline_diag_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_baseline_diag_1handoffmd) |
| `.agents/teamwork/worker_baseline_diag_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_baseline_diag_1progressmd) |
| `.agents/teamwork/worker_impl_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_1briefingmd) |
| `.agents/teamwork/worker_impl_1/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_1contextmd) |
| `.agents/teamwork/worker_impl_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_1dispatchmd) |
| `.agents/teamwork/worker_impl_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_1handoffmd) |
| `.agents/teamwork/worker_impl_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_1progressmd) |
| `.agents/teamwork/worker_impl_2/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_2briefingmd) |
| `.agents/teamwork/worker_impl_2/context.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_2contextmd) |
| `.agents/teamwork/worker_impl_2/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_2dispatchmd) |
| `.agents/teamwork/worker_impl_2/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_2handoffmd) |
| `.agents/teamwork/worker_impl_2/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_impl_2progressmd) |
| `.agents/teamwork/worker_synthesis_1/BRIEFING.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_synthesis_1briefingmd) |
| `.agents/teamwork/worker_synthesis_1/DISPATCH.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_synthesis_1dispatchmd) |
| `.agents/teamwork/worker_synthesis_1/handoff.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_synthesis_1handoffmd) |
| `.agents/teamwork/worker_synthesis_1/progress.md` | [`docs/history/AGENT_TEAMWORK_2026-10.md`](../history/AGENT_TEAMWORK_2026-10.md#agentsteamworkworker_synthesis_1progressmd) |

## 5. Merged on 2026-11-26 (fourth round)

Decided by reading the documents. Commit before the change: `b7d7eb6`. Each moved text sits in its new home under its old title, unchanged except that headings moved down one level; a script compared each block with the original after the move.

| Former file or section | Now in |
|---|---|
| `docs/system-model/MASTER_SYSTEM_MODEL.md` (whole file) | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#talentsphere--master-system-model) |
| `docs/governance/GOVERNANCE.md`, section "TalentSphere — Source Reconciliation v1.0" | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#talentsphere--source-reconciliation-v10) |
| `docs/engineering/TARGET_ARCHITECTURE.md` §11 "Source-Derived Detailed Architecture Corpus" | [`docs/history/PROJECT_HISTORY.md`](../history/PROJECT_HISTORY.md#superseded-target-architecture-corpus-former-target_architecturemd-11) |

## 6. Moved into `docs/` on 2026-11-26 (one folder)

Moved with `git mv`, so `git log --follow` shows each file's history. Content is unchanged except for link paths that the move made wrong. Commit before the change: `f499c66`.

| Former path | Now at |
|---|---|
| `ARCHITECTURE.md` | [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) |
| `SSOT.md` | [`docs/SSOT.md`](../SSOT.md) |
| `project-mindmap/` (whole folder: 164 Markdown files, the `.mmd`, JSON, CSV and DOT data, and the generator scripts in `tools/`) | [`docs/mindmap/`](../mindmap/README.md) |
| `supabase/hosted/README.md` | [`docs/engineering/HOSTED_SUPABASE.md`](../engineering/HOSTED_SUPABASE.md) (the SQL files stay in `supabase/hosted/`) |
