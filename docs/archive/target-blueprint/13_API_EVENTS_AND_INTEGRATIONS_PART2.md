# Target blueprint 13: Api Events And Integrations (part 2 of 4)

> **Status.** Archive: proposal, not ratified. A greenfield redesign blueprint written in October 2026. Every area was Draft, Under Review or Revision Required (its own document status) and no test was run against it. Its content was mined into `docs/blueprint/`; `SSOT.md` remains the source of intent. Module federation described here was not adopted: the built system is a modular monolith (`ARCHITECTURE.md`).
>
> **What this file holds.** All files of the former `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/` folder, in order.
>
> **Merged on 2026-11-25** from the files listed below; each one is a section under its original title. Nothing was removed; the originals are in git history at commit `08387ec`.

Parts: [part 1](13_API_EVENTS_AND_INTEGRATIONS.md) · [part 2](13_API_EVENTS_AND_INTEGRATIONS_PART2.md) · [part 3](13_API_EVENTS_AND_INTEGRATIONS_PART3.md) · [part 4](13_API_EVENTS_AND_INTEGRATIONS_PART4.md)

| Section | Former file |
|---|---|
| OBSERVED_ROUTE_TARGET_CROSSWALK.csv | `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_ROUTE_TARGET_CROSSWALK.csv` |
| SSOT Interface Contract Crosswalk | `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.md` |
| SSOT_INTERFACE_CONTRACT_CROSSWALK.csv | `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.csv` |
| SSOT Service Contract Crosswalk | `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.md` |
| SSOT_SERVICE_CONTRACT_CROSSWALK.csv | `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.csv` |
| asyncapi.yaml | `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/asyncapi.yaml` |

## OBSERVED_ROUTE_TARGET_CROSSWALK.csv

_Former file: `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/OBSERVED_ROUTE_TARGET_CROSSWALK.csv`._

Converted from CSV (278 rows).

| EvidenceID | SourceDocumentID | SourceEvidenceID | SourcePath | SourceRevision | SourceSHA256 | SourceLineAnchor | SourceInventoryRow | SourceSnapshotAnchor | SourceAnchorCheck | MethodAndPath | RequestSchemaOrValidation | SourceRegistry | TargetDocumentID | TargetPath | CandidateTargetAPIIDs | CandidateTargetMethodAndPath | PathShapeComparison | PathShapeCandidateAPIIDs | PathShapeCandidateMethodAndPath | ComparisonRule | Comparison | ResidualOrConflict | VerificationState | OwnerDisposition |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EVD-000519 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L129 | OBSERVED_REFERENCE_API_INVENTORY.csv:L2 | S:743 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /health | handler | S | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000520 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L130 | OBSERVED_REFERENCE_API_INVENTORY.csv:L3 | S:751 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/health | handler | S | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000521 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L131 | OBSERVED_REFERENCE_API_INVENTORY.csv:L4 | S:785 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/feature-flags | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000522 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L132 | OBSERVED_REFERENCE_API_INVENTORY.csv:L5 | S:967 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/auth/register | RegisterInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-01-01 | POST /auth/register | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000523 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L133 | OBSERVED_REFERENCE_API_INVENTORY.csv:L6 | S:1007 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/auth/login | LoginInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-01-02 | POST /auth/login | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000524 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L134 | OBSERVED_REFERENCE_API_INVENTORY.csv:L7 | S:1066 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/auth/password | ChangePasswordInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000525 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L135 | OBSERVED_REFERENCE_API_INVENTORY.csv:L8 | S:1137 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/auth/sign-out | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000526 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L136 | OBSERVED_REFERENCE_API_INVENTORY.csv:L9 | S:1163 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/auth/sign-out-others | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000527 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L137 | OBSERVED_REFERENCE_API_INVENTORY.csv:L10 | S:1191 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/auth/session | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000528 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L138 | OBSERVED_REFERENCE_API_INVENTORY.csv:L11 | S:1212 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/profile/me | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000529 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L139 | OBSERVED_REFERENCE_API_INVENTORY.csv:L12 | S:1221 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/profile/me | UpdateProfileInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000530 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L140 | OBSERVED_REFERENCE_API_INVENTORY.csv:L13 | S:1236 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/profile/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000531 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L141 | OBSERVED_REFERENCE_API_INVENTORY.csv:L14 | S:1368 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/evidence | CreateEvidenceInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000532 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L142 | OBSERVED_REFERENCE_API_INVENTORY.csv:L15 | S:1412 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/evidence/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | same-route-shape-parameter-names-differ | API-05-03 | GET /evidence/{evidenceId} | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | Parameter-agnostic path shape overlaps the listed target candidate(s), and the HTTP method matches, but parameter names differ. This is a structural candidate only; schemas, authorization, errors, idempotency and lifecycle are not compared. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000533 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L143 | OBSERVED_REFERENCE_API_INVENTORY.csv:L16 | S:1445 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/evidence/mine | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000534 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L144 | OBSERVED_REFERENCE_API_INVENTORY.csv:L17 | S:1453 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/evidence/subject/:subjectId | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000535 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L145 | OBSERVED_REFERENCE_API_INVENTORY.csv:L18 | S:1497 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/evidence/:id/verify | VerifyEvidenceInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000536 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L146 | OBSERVED_REFERENCE_API_INVENTORY.csv:L19 | S:1545 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/evidence/:id/dispute | DisputeEvidenceInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000537 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L147 | OBSERVED_REFERENCE_API_INVENTORY.csv:L20 | S:1586 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/evidence/:id/revoke | RevokeEvidenceInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000538 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L148 | OBSERVED_REFERENCE_API_INVENTORY.csv:L21 | S:1627 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/evidence/:id/verify-public | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000539 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L149 | OBSERVED_REFERENCE_API_INVENTORY.csv:L22 | S:1642 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-04-01 | GET /skills | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000540 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L150 | OBSERVED_REFERENCE_API_INVENTORY.csv:L23 | S:1646 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills | CreateSkillInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-04-01 | GET /skills | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-path-only-method-mismatch | Normalized path overlaps a target catalog entry but the HTTP method differs; this is not an operation match. No semantic mapping is inferred. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000541 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L151 | OBSERVED_REFERENCE_API_INVENTORY.csv:L24 | S:1676 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/relationships | CreateSkillRelationshipInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000542 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L152 | OBSERVED_REFERENCE_API_INVENTORY.csv:L25 | S:1705 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills/:id/graph | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000543 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L153 | OBSERVED_REFERENCE_API_INVENTORY.csv:L26 | S:1748 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/organizations | CreateOrganizationInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000544 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L154 | OBSERVED_REFERENCE_API_INVENTORY.csv:L27 | S:1782 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/organizations/mine | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000545 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L155 | OBSERVED_REFERENCE_API_INVENTORY.csv:L28 | S:1795 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/organizations/:id/jobs | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000546 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L156 | OBSERVED_REFERENCE_API_INVENTORY.csv:L29 | S:1819 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/organizations/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000547 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L157 | OBSERVED_REFERENCE_API_INVENTORY.csv:L30 | S:1831 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/organizations/:id/members | AddOrganizationMemberInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000548 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L158 | OBSERVED_REFERENCE_API_INVENTORY.csv:L31 | S:1878 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs | CreateJobInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-09-01 | GET /jobs | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-path-only-method-mismatch | Normalized path overlaps a target catalog entry but the HTTP method differs; this is not an operation match. No semantic mapping is inferred. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000549 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L159 | OBSERVED_REFERENCE_API_INVENTORY.csv:L32 | S:1944 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-09-01 | GET /jobs | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000550 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L160 | OBSERVED_REFERENCE_API_INVENTORY.csv:L33 | S:1958 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | same-route-shape-parameter-names-differ | API-09-02 | GET /jobs/{jobId} | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | Parameter-agnostic path shape overlaps the listed target candidate(s), and the HTTP method matches, but parameter names differ. This is a structural candidate only; schemas, authorization, errors, idempotency and lifecycle are not compared. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000551 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L161 | OBSERVED_REFERENCE_API_INVENTORY.csv:L34 | S:1978 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/jobs/:id/status | UpdateJobStatusInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000552 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L162 | OBSERVED_REFERENCE_API_INVENTORY.csv:L35 | S:2019 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/job-templates | CreateJobTemplateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000553 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L163 | OBSERVED_REFERENCE_API_INVENTORY.csv:L36 | S:2086 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/job-templates | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000554 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L164 | OBSERVED_REFERENCE_API_INVENTORY.csv:L37 | S:2127 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/job-templates/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000555 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L165 | OBSERVED_REFERENCE_API_INVENTORY.csv:L38 | S:2153 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/job-templates/:id | UpdateJobTemplateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000556 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L166 | OBSERVED_REFERENCE_API_INVENTORY.csv:L39 | S:2237 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/job-templates/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000557 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L167 | OBSERVED_REFERENCE_API_INVENTORY.csv:L40 | S:2284 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/job-templates/:id/instantiate | InstantiateJobFromTemplateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000558 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L168 | OBSERVED_REFERENCE_API_INVENTORY.csv:L41 | S:2362 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs/:id/save-as-template | SaveJobAsTemplateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000559 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L169 | OBSERVED_REFERENCE_API_INVENTORY.csv:L42 | S:2425 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/salaries/reports | SubmitSalaryReportInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000560 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L170 | OBSERVED_REFERENCE_API_INVENTORY.csv:L43 | S:2487 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/salaries/reports/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000561 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L171 | OBSERVED_REFERENCE_API_INVENTORY.csv:L44 | S:2493 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/salaries/reports/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000562 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L172 | OBSERVED_REFERENCE_API_INVENTORY.csv:L45 | S:2525 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/salaries/benchmarks | SalaryBenchmarkQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000563 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L173 | OBSERVED_REFERENCE_API_INVENTORY.csv:L46 | S:2543 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/salaries/company/:companyName | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000564 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L174 | OBSERVED_REFERENCE_API_INVENTORY.csv:L47 | S:2555 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs/:id/apply | SubmitApplicationInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000565 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L175 | OBSERVED_REFERENCE_API_INVENTORY.csv:L48 | S:2651 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/applications/my | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000566 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L176 | OBSERVED_REFERENCE_API_INVENTORY.csv:L49 | S:2675 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/applications/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | same-route-shape-parameter-names-differ | API-10-03 | GET /applications/{applicationId} | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | Parameter-agnostic path shape overlaps the listed target candidate(s), and the HTTP method matches, but parameter names differ. This is a structural candidate only; schemas, authorization, errors, idempotency and lifecycle are not compared. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000567 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L177 | OBSERVED_REFERENCE_API_INVENTORY.csv:L50 | S:2700 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/:id/applications | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | same-route-shape-parameter-names-differ | API-10-01 | POST /jobs/{jobId}/applications | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | Parameter-agnostic path shape overlaps the listed target candidate(s), but parameter names and HTTP method differ. This is not an operation match; no semantic mapping is inferred. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000568 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L178 | OBSERVED_REFERENCE_API_INVENTORY.csv:L51 | S:2751 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/applications/:id/transition | TransitionApplicationInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000569 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L179 | OBSERVED_REFERENCE_API_INVENTORY.csv:L52 | S:2841 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/applications/:id/feedback | CreateApplicationFeedbackInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000570 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L180 | OBSERVED_REFERENCE_API_INVENTORY.csv:L53 | S:2926 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/applications/:id/feedback | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000571 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L181 | OBSERVED_REFERENCE_API_INVENTORY.csv:L54 | S:2967 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/applications/:id/feedback/request | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000572 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L182 | OBSERVED_REFERENCE_API_INVENTORY.csv:L55 | S:3019 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/organizations/:orgId/feedback-templates | CreateFeedbackTemplateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000573 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L183 | OBSERVED_REFERENCE_API_INVENTORY.csv:L56 | S:3063 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/organizations/:orgId/feedback-templates | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000574 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L184 | OBSERVED_REFERENCE_API_INVENTORY.csv:L57 | S:3085 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/feedback/aggregate-insights | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000575 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L185 | OBSERVED_REFERENCE_API_INVENTORY.csv:L58 | S:3095 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/freshness | RegisterSkillFreshnessInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000576 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L186 | OBSERVED_REFERENCE_API_INVENTORY.csv:L59 | S:3136 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills/freshness/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000577 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L187 | OBSERVED_REFERENCE_API_INVENTORY.csv:L60 | S:3147 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/candidates/:candidateProfileId/skills/freshness | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000578 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L188 | OBSERVED_REFERENCE_API_INVENTORY.csv:L61 | S:3186 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/:skillId/reverify | ReverifySkillInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000579 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L189 | OBSERVED_REFERENCE_API_INVENTORY.csv:L62 | S:3239 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/freshness/refresh-all | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000580 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L190 | OBSERVED_REFERENCE_API_INVENTORY.csv:L63 | S:3275 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/questions | CreateInterviewQuestionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000581 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L191 | OBSERVED_REFERENCE_API_INVENTORY.csv:L64 | S:3317 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/interviews/questions | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000582 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L192 | OBSERVED_REFERENCE_API_INVENTORY.csv:L65 | S:3390 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments | ScheduleInterviewAssessmentInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000583 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L193 | OBSERVED_REFERENCE_API_INVENTORY.csv:L66 | S:3486 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/interviews/assessments/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000584 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L194 | OBSERVED_REFERENCE_API_INVENTORY.csv:L67 | S:3518 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/join | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000585 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L195 | OBSERVED_REFERENCE_API_INVENTORY.csv:L68 | S:3546 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/consent | SetRecordingConsentInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000586 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L196 | OBSERVED_REFERENCE_API_INVENTORY.csv:L69 | S:3567 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/end | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000587 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L197 | OBSERVED_REFERENCE_API_INVENTORY.csv:L70 | S:3603 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/code | ExecuteInterviewCodeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000588 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L198 | OBSERVED_REFERENCE_API_INVENTORY.csv:L71 | S:3653 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/scorecard | SubmitInterviewScorecardInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000589 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L199 | OBSERVED_REFERENCE_API_INVENTORY.csv:L72 | S:3729 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/scorecard/compensate | CompensateInterviewScorecardInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000590 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L200 | OBSERVED_REFERENCE_API_INVENTORY.csv:L73 | S:3789 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/interviews/assessments/:id/scorecards | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000591 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L201 | OBSERVED_REFERENCE_API_INVENTORY.csv:L74 | S:3821 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/ai-feedback | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000592 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L202 | OBSERVED_REFERENCE_API_INVENTORY.csv:L75 | S:3841 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/interviews/assessments/:id/review | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000593 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L203 | OBSERVED_REFERENCE_API_INVENTORY.csv:L76 | S:3867 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/signals | AddReputationSignalInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000594 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L204 | OBSERVED_REFERENCE_API_INVENTORY.csv:L77 | S:3930 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/reputation/users/:userId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000595 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L205 | OBSERVED_REFERENCE_API_INVENTORY.csv:L78 | S:4002 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/reputation/my/signals | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000596 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L206 | OBSERVED_REFERENCE_API_INVENTORY.csv:L79 | S:4008 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/recovery | StartRecoveryPlanInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000597 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L207 | OBSERVED_REFERENCE_API_INVENTORY.csv:L80 | S:4039 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/recovery/:planId/tasks/:taskId/complete | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000598 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L208 | OBSERVED_REFERENCE_API_INVENTORY.csv:L81 | S:4104 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/recalculate-all | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000599 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L209 | OBSERVED_REFERENCE_API_INVENTORY.csv:L82 | S:4159 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/reputation/instructors/:instructorId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000600 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L210 | OBSERVED_REFERENCE_API_INVENTORY.csv:L83 | S:4186 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/instructors/:instructorId/metrics | SubmitInstructorMetricsInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000601 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L211 | OBSERVED_REFERENCE_API_INVENTORY.csv:L84 | S:4240 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/instructors/:instructorId/endorse | CreateInstructorEndorsementInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000602 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L212 | OBSERVED_REFERENCE_API_INVENTORY.csv:L85 | S:4290 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/instructors/:instructorId/reviews | SubmitInstructorReviewInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000603 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L213 | OBSERVED_REFERENCE_API_INVENTORY.csv:L86 | S:4322 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/instructors/recompute | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000604 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L214 | OBSERVED_REFERENCE_API_INVENTORY.csv:L87 | S:4353 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/reputation/organizations/:organizationId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000605 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L215 | OBSERVED_REFERENCE_API_INVENTORY.csv:L88 | S:4376 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/organizations/:organizationId/reviews | SubmitEmployerReviewInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000606 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L216 | OBSERVED_REFERENCE_API_INVENTORY.csv:L89 | S:4460 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/reputation/organizations/:organizationId/metrics | SubmitEmployerMetricsInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000607 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L217 | OBSERVED_REFERENCE_API_INVENTORY.csv:L90 | S:4505 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/reputation/organizations/:organizationId/reviews | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000608 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L218 | OBSERVED_REFERENCE_API_INVENTORY.csv:L91 | S:4534 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/challenges | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000609 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L219 | OBSERVED_REFERENCE_API_INVENTORY.csv:L92 | S:4539 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/challenges/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000610 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L220 | OBSERVED_REFERENCE_API_INVENTORY.csv:L93 | S:4551 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/challenges | CreateChallengeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000611 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L221 | OBSERVED_REFERENCE_API_INVENTORY.csv:L94 | S:4583 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/challenges/:id/start-session | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000612 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L222 | OBSERVED_REFERENCE_API_INVENTORY.csv:L95 | S:4616 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/challenges/:id/submit | SubmitChallengeSolutionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000613 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L223 | OBSERVED_REFERENCE_API_INVENTORY.csv:L96 | S:4719 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/ai/assistant/query | AIAssistantQueryInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000614 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L224 | OBSERVED_REFERENCE_API_INVENTORY.csv:L97 | S:4737 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/xp/ledger | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000615 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L225 | OBSERVED_REFERENCE_API_INVENTORY.csv:L98 | S:4764 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/courses | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-08-01 | GET /courses | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000616 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L226 | OBSERVED_REFERENCE_API_INVENTORY.csv:L99 | S:4796 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/courses | CreateCourseInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-08-01 | GET /courses | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-path-only-method-mismatch | Normalized path overlaps a target catalog entry but the HTTP method differs; this is not an operation match. No semantic mapping is inferred. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000617 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L227 | OBSERVED_REFERENCE_API_INVENTORY.csv:L100 | S:4843 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/courses/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | same-route-shape-parameter-names-differ | API-08-02 | GET /courses/{courseId} | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | Parameter-agnostic path shape overlaps the listed target candidate(s), and the HTTP method matches, but parameter names differ. This is a structural candidate only; schemas, authorization, errors, idempotency and lifecycle are not compared. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000618 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L228 | OBSERVED_REFERENCE_API_INVENTORY.csv:L101 | S:4886 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/courses/:id/modules | CreateCourseModuleInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000619 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L229 | OBSERVED_REFERENCE_API_INVENTORY.csv:L102 | S:4931 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/modules/:id/lessons | CreateLessonInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000620 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L230 | OBSERVED_REFERENCE_API_INVENTORY.csv:L103 | S:4991 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/courses/:id/publish | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000621 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L231 | OBSERVED_REFERENCE_API_INVENTORY.csv:L104 | S:5033 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/courses/:id/enroll | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000622 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L232 | OBSERVED_REFERENCE_API_INVENTORY.csv:L105 | S:5066 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/courses/:id/progress | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000623 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L233 | OBSERVED_REFERENCE_API_INVENTORY.csv:L106 | S:5101 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/lessons/:id/complete | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000624 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L234 | OBSERVED_REFERENCE_API_INVENTORY.csv:L107 | S:5264 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/certificates/:certificateNumber | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000625 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L235 | OBSERVED_REFERENCE_API_INVENTORY.csv:L108 | S:5287 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/verify/:hash | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000626 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L236 | OBSERVED_REFERENCE_API_INVENTORY.csv:L109 | S:5335 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/certificates/verify/:hash | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000627 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L237 | OBSERVED_REFERENCE_API_INVENTORY.csv:L110 | S:5357 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/certificates/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000628 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L238 | OBSERVED_REFERENCE_API_INVENTORY.csv:L111 | S:5382 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/certificates/:certificateNumber/revoke | RevokeCertificateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000629 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L239 | OBSERVED_REFERENCE_API_INVENTORY.csv:L112 | S:5518 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/threads | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000630 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L240 | OBSERVED_REFERENCE_API_INVENTORY.csv:L113 | S:5550 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/threads | CreateThreadInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000631 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L241 | OBSERVED_REFERENCE_API_INVENTORY.csv:L114 | S:5641 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/threads/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000632 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L242 | OBSERVED_REFERENCE_API_INVENTORY.csv:L115 | S:5684 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/threads/:id/messages | SendMessageInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000633 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L243 | OBSERVED_REFERENCE_API_INVENTORY.csv:L116 | S:5745 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/threads/:id/read | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000634 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L244 | OBSERVED_REFERENCE_API_INVENTORY.csv:L117 | S:5773 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/notifications | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-15-01 | GET /notifications | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000635 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L245 | OBSERVED_REFERENCE_API_INVENTORY.csv:L118 | S:5804 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/notifications/summary | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000636 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L246 | OBSERVED_REFERENCE_API_INVENTORY.csv:L119 | S:5813 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/notifications/mark-read | MarkNotificationsReadInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000637 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L247 | OBSERVED_REFERENCE_API_INVENTORY.csv:L120 | S:5843 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/notifications/preferences | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000638 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L248 | OBSERVED_REFERENCE_API_INVENTORY.csv:L121 | S:5859 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/notifications/preferences | UpdateNotificationPreferencesInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000639 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L249 | OBSERVED_REFERENCE_API_INVENTORY.csv:L122 | S:5918 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/ai/conversations | CreateAIConversationInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000640 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L250 | OBSERVED_REFERENCE_API_INVENTORY.csv:L123 | S:5932 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/ai/conversations | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000641 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L251 | OBSERVED_REFERENCE_API_INVENTORY.csv:L124 | S:5938 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/ai/conversations/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000642 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L252 | OBSERVED_REFERENCE_API_INVENTORY.csv:L125 | S:5958 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/ai/career-assistant/chat | AIChatInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000643 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L253 | OBSERVED_REFERENCE_API_INVENTORY.csv:L126 | S:6051 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/ai/usage | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000644 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L254 | OBSERVED_REFERENCE_API_INVENTORY.csv:L127 | S:6066 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/resumes | CreateResumeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000645 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L255 | OBSERVED_REFERENCE_API_INVENTORY.csv:L128 | S:6080 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/resumes | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000646 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L256 | OBSERVED_REFERENCE_API_INVENTORY.csv:L129 | S:6086 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/resumes/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000647 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L257 | OBSERVED_REFERENCE_API_INVENTORY.csv:L130 | S:6105 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/resumes/:id | UpdateResumeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000648 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L258 | OBSERVED_REFERENCE_API_INVENTORY.csv:L131 | S:6136 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/resumes/:id/export | ExportResumeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000649 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L259 | OBSERVED_REFERENCE_API_INVENTORY.csv:L132 | S:6177 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/resumes/:id/exports | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000650 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L260 | OBSERVED_REFERENCE_API_INVENTORY.csv:L133 | S:6205 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/resumes/exports/:exportId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000651 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L261 | OBSERVED_REFERENCE_API_INVENTORY.csv:L134 | S:6242 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/connections/request | RequestConnectionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000652 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L262 | OBSERVED_REFERENCE_API_INVENTORY.csv:L135 | S:6306 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/connections | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000653 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L263 | OBSERVED_REFERENCE_API_INVENTORY.csv:L136 | S:6353 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/connections/status/:targetUserId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000654 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L264 | OBSERVED_REFERENCE_API_INVENTORY.csv:L137 | S:6375 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/connections/:id/respond | RespondConnectionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000655 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L265 | OBSERVED_REFERENCE_API_INVENTORY.csv:L138 | S:6443 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/connections/:id/withdraw | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000656 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L266 | OBSERVED_REFERENCE_API_INVENTORY.csv:L139 | S:6479 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/connections/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000657 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L267 | OBSERVED_REFERENCE_API_INVENTORY.csv:L140 | S:6546 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/networking/warm-intros/preferences | UpdateWarmIntroPreferencesInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000658 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L268 | OBSERVED_REFERENCE_API_INVENTORY.csv:L141 | S:6573 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/networking/warm-intros/preferences | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000659 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L269 | OBSERVED_REFERENCE_API_INVENTORY.csv:L142 | S:6588 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/networking/warm-intros/paths | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000660 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L270 | OBSERVED_REFERENCE_API_INVENTORY.csv:L143 | S:6614 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/networking/warm-intros/requests | CreateWarmIntroRequestInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000661 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L271 | OBSERVED_REFERENCE_API_INVENTORY.csv:L144 | S:6693 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/networking/warm-intros/requests/incoming | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000662 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L272 | OBSERVED_REFERENCE_API_INVENTORY.csv:L145 | S:6702 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/networking/warm-intros/requests/outgoing | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000663 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L273 | OBSERVED_REFERENCE_API_INVENTORY.csv:L146 | S:6711 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/networking/warm-intros/requests/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000664 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L274 | OBSERVED_REFERENCE_API_INVENTORY.csv:L147 | S:6737 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/networking/warm-intros/requests/:id/respond | RespondWarmIntroRequestInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000665 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L275 | OBSERVED_REFERENCE_API_INVENTORY.csv:L148 | S:6818 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/referrals/requests | CreateReferralRequestInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000666 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L276 | OBSERVED_REFERENCE_API_INVENTORY.csv:L149 | S:6898 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/referrals/requests/incoming | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000667 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L277 | OBSERVED_REFERENCE_API_INVENTORY.csv:L150 | S:6907 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/referrals/requests/outgoing | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000668 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L278 | OBSERVED_REFERENCE_API_INVENTORY.csv:L151 | S:6916 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/referrals/requests/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000669 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L279 | OBSERVED_REFERENCE_API_INVENTORY.csv:L152 | S:6941 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/referrals/requests/:id/respond | RespondReferralRequestInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000670 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L280 | OBSERVED_REFERENCE_API_INVENTORY.csv:L153 | S:7055 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/referrals/outcomes | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000671 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L281 | OBSERVED_REFERENCE_API_INVENTORY.csv:L154 | S:7109 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/endorsements | CreateSkillEndorsementInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000672 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L282 | OBSERVED_REFERENCE_API_INVENTORY.csv:L155 | S:7200 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills/endorsements/recipients/:recipientId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000673 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L283 | OBSERVED_REFERENCE_API_INVENTORY.csv:L156 | S:7227 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/skills/endorsements/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000674 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L284 | OBSERVED_REFERENCE_API_INVENTORY.csv:L157 | S:7257 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills/endorsements/my/given | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000675 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L285 | OBSERVED_REFERENCE_API_INVENTORY.csv:L158 | S:7285 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills/forecast/top-growth | TopEmergingSkillsQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000676 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L286 | OBSERVED_REFERENCE_API_INVENTORY.csv:L159 | S:7330 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/:skillId/market-signals | RecordSkillMarketSignalInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000677 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L287 | OBSERVED_REFERENCE_API_INVENTORY.csv:L160 | S:7382 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/skills/:skillId/forecast | QuerySkillForecastInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000678 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L288 | OBSERVED_REFERENCE_API_INVENTORY.csv:L161 | S:7421 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/skills/:skillId/forecast/generate | GenerateSkillForecastInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000679 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L289 | OBSERVED_REFERENCE_API_INVENTORY.csv:L162 | S:7493 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/career/transitions | RecordCareerTransitionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000680 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L290 | OBSERVED_REFERENCE_API_INVENTORY.csv:L163 | S:7552 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/career/transitions/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000681 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L291 | OBSERVED_REFERENCE_API_INVENTORY.csv:L164 | S:7570 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/career/benchmarks | QueryCareerBenchmarksQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000682 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L292 | OBSERVED_REFERENCE_API_INVENTORY.csv:L165 | S:7613 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/career/transition-probability | CalculateTransitionProbabilityInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000683 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L293 | OBSERVED_REFERENCE_API_INVENTORY.csv:L166 | S:7646 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/career/pathways | CareerProgressionPathwaysQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000684 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L294 | OBSERVED_REFERENCE_API_INVENTORY.csv:L167 | S:7670 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/career/milestones/readiness | EvaluateMilestoneReadinessInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000685 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L295 | OBSERVED_REFERENCE_API_INVENTORY.csv:L168 | S:7725 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/learning/impact/outcomes | RecordLearningOutcomeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000686 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L296 | OBSERVED_REFERENCE_API_INVENTORY.csv:L169 | S:7803 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/learning/impact/courses/:courseId | QueryLearningImpactInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000687 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L297 | OBSERVED_REFERENCE_API_INVENTORY.csv:L170 | S:7836 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/learning/impact/courses/:courseId/compute | ComputeLearningImpactInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000688 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L298 | OBSERVED_REFERENCE_API_INVENTORY.csv:L171 | S:7882 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/learning/impact/dashboard | LearningImpactDashboardQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000689 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L299 | OBSERVED_REFERENCE_API_INVENTORY.csv:L172 | S:7911 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/recruiter/talent-pools | CreateTalentPoolInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000690 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L300 | OBSERVED_REFERENCE_API_INVENTORY.csv:L173 | S:7961 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/talent-pools | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000691 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L301 | OBSERVED_REFERENCE_API_INVENTORY.csv:L174 | S:8001 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/talent-pools/:poolId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000692 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L302 | OBSERVED_REFERENCE_API_INVENTORY.csv:L175 | S:8028 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/recruiter/talent-pools/:poolId/members | AddPoolMemberInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000693 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L303 | OBSERVED_REFERENCE_API_INVENTORY.csv:L176 | S:8120 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/recruiter/talent-pools/:poolId/members/:memberId | UpdatePoolMemberStatusInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000694 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L304 | OBSERVED_REFERENCE_API_INVENTORY.csv:L177 | S:8167 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/talent-pools/:poolId/intelligence | QueryPoolIntelligenceInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000695 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L305 | OBSERVED_REFERENCE_API_INVENTORY.csv:L178 | S:8375 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/recruiter/discovery/behavioral/compute | ComputeBehavioralProfileInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000696 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L306 | OBSERVED_REFERENCE_API_INVENTORY.csv:L179 | S:8426 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/discovery/behavioral | DiscoverBehavioralTalentQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000697 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L307 | OBSERVED_REFERENCE_API_INVENTORY.csv:L180 | S:8481 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/discovery/behavioral/:candidateId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000698 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L308 | OBSERVED_REFERENCE_API_INVENTORY.csv:L181 | S:8603 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/recruiter/talent-segmentation/classify | ClassifyCandidateInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000699 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L309 | OBSERVED_REFERENCE_API_INVENTORY.csv:L182 | S:8676 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/talent-segmentation/segments | QuerySegmentDistributionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000700 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L310 | OBSERVED_REFERENCE_API_INVENTORY.csv:L183 | S:8701 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/talent-segmentation/candidates | FilterSegmentedTalentQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000701 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L311 | OBSERVED_REFERENCE_API_INVENTORY.csv:L184 | S:8764 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/recruiter/talent-segmentation/candidates/:candidateId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000702 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L312 | OBSERVED_REFERENCE_API_INVENTORY.csv:L185 | S:8832 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/alumni/affiliations | CreateAlumniAffiliationInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000703 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L313 | OBSERVED_REFERENCE_API_INVENTORY.csv:L186 | S:8902 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/alumni/affiliations/:id/verify | VerifyAlumniAffiliationInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000704 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L314 | OBSERVED_REFERENCE_API_INVENTORY.csv:L187 | S:8997 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/alumni/affiliations/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000705 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L315 | OBSERVED_REFERENCE_API_INVENTORY.csv:L188 | S:9007 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/alumni/institutions/:institutionId/directory | QueryAlumniDirectoryInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000706 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L316 | OBSERVED_REFERENCE_API_INVENTORY.csv:L189 | S:9070 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/alumni/institutions/:institutionId/groups | CreateAlumniGroupInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000707 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L317 | OBSERVED_REFERENCE_API_INVENTORY.csv:L190 | S:9115 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/alumni/institutions/:institutionId/groups | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000708 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L318 | OBSERVED_REFERENCE_API_INVENTORY.csv:L191 | S:9146 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/alumni/groups/:id/join | JoinAlumniGroupInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000709 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L319 | OBSERVED_REFERENCE_API_INVENTORY.csv:L192 | S:9200 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/alumni/groups/:id/members | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000710 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L320 | OBSERVED_REFERENCE_API_INVENTORY.csv:L193 | S:9227 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/alumni/mentorship/request | RequestAlumniMentorshipInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000711 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L321 | OBSERVED_REFERENCE_API_INVENTORY.csv:L194 | S:9278 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/alumni/mentorship/:id/respond | RespondAlumniMentorshipInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000712 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L322 | OBSERVED_REFERENCE_API_INVENTORY.csv:L195 | S:9306 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/alumni/mentorship/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000713 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L323 | OBSERVED_REFERENCE_API_INVENTORY.csv:L196 | S:9323 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/activity/events | RecordActivityEventInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000714 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L324 | OBSERVED_REFERENCE_API_INVENTORY.csv:L197 | S:9360 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/activity/events | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000715 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L325 | OBSERVED_REFERENCE_API_INVENTORY.csv:L198 | S:9385 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/activity/scores/me | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000716 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L326 | OBSERVED_REFERENCE_API_INVENTORY.csv:L199 | S:9394 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/activity/users/:userId/score | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000717 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L327 | OBSERVED_REFERENCE_API_INVENTORY.csv:L200 | S:9424 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/activity/recalculate | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000718 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L328 | OBSERVED_REFERENCE_API_INVENTORY.csv:L201 | S:9437 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/portfolio/projects | CreatePortfolioProjectInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000719 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L329 | OBSERVED_REFERENCE_API_INVENTORY.csv:L202 | S:9462 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/portfolio/projects | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000720 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L330 | OBSERVED_REFERENCE_API_INVENTORY.csv:L203 | S:9468 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/portfolio/projects/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000721 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L331 | OBSERVED_REFERENCE_API_INVENTORY.csv:L204 | S:9496 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/portfolio/projects/:id | UpdatePortfolioProjectInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000722 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L332 | OBSERVED_REFERENCE_API_INVENTORY.csv:L205 | S:9535 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/portfolio/projects/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000723 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L333 | OBSERVED_REFERENCE_API_INVENTORY.csv:L206 | S:9574 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/portfolio/showcase/:targetUserId | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000724 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L334 | OBSERVED_REFERENCE_API_INVENTORY.csv:L207 | S:9648 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/gamification/summary | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000725 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L335 | OBSERVED_REFERENCE_API_INVENTORY.csv:L208 | S:9672 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/gamification/transactions | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000726 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L336 | OBSERVED_REFERENCE_API_INVENTORY.csv:L209 | S:9678 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/gamification/badges | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000727 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L337 | OBSERVED_REFERENCE_API_INVENTORY.csv:L210 | S:9692 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/gamification/leaderboard | GetLeaderboardQuerySchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000728 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L338 | OBSERVED_REFERENCE_API_INVENTORY.csv:L211 | S:9734 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/gamification/claim-activity | ClaimGamificationActivityInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000729 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L339 | OBSERVED_REFERENCE_API_INVENTORY.csv:L212 | S:9873 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/settings | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000730 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L340 | OBSERVED_REFERENCE_API_INVENTORY.csv:L213 | S:9883 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/settings | UpdateUserSettingsInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000731 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L341 | OBSERVED_REFERENCE_API_INVENTORY.csv:L214 | S:9926 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/settings/export | RequestDataExportInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000732 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L342 | OBSERVED_REFERENCE_API_INVENTORY.csv:L215 | S:10031 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/settings/export/latest | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000733 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L343 | OBSERVED_REFERENCE_API_INVENTORY.csv:L216 | S:10041 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/settings/erasure/request | RequestErasureInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000734 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L344 | OBSERVED_REFERENCE_API_INVENTORY.csv:L217 | S:10066 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/settings/erasure/status | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000735 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L345 | OBSERVED_REFERENCE_API_INVENTORY.csv:L218 | S:10079 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/settings/erasure/cancel | CancelErasureInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000736 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L346 | OBSERVED_REFERENCE_API_INVENTORY.csv:L219 | S:10101 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/settings/erasure/execute | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000737 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L347 | OBSERVED_REFERENCE_API_INVENTORY.csv:L220 | S:10320, B:245 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/billing/checkout | CreateCheckoutSessionInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000738 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L348 | OBSERVED_REFERENCE_API_INVENTORY.csv:L221 | S:10324, B:297 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/billing/portal | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000739 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L349 | OBSERVED_REFERENCE_API_INVENTORY.csv:L222 | S:10328, B:320 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/billing/stripe-webhook | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000740 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L350 | OBSERVED_REFERENCE_API_INVENTORY.csv:L223 | S:10377 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/billing/plans | handler | S | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-16-01 | GET /billing/plans | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000741 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L351 | OBSERVED_REFERENCE_API_INVENTORY.csv:L224 | S:10387 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/billing/subscription | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000742 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L352 | OBSERVED_REFERENCE_API_INVENTORY.csv:L225 | S:10417 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/billing/subscribe | SubscribePlanInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000743 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L353 | OBSERVED_REFERENCE_API_INVENTORY.csv:L226 | S:10531 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/billing/cancel | CancelSubscriptionInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000744 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L354 | OBSERVED_REFERENCE_API_INVENTORY.csv:L227 | S:10580 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/billing/invoices | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000745 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L355 | OBSERVED_REFERENCE_API_INVENTORY.csv:L228 | S:10610 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/billing/webhook | ProcessPaymentWebhookInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000746 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L356 | OBSERVED_REFERENCE_API_INVENTORY.csv:L229 | S:10684 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/admin/users | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000747 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L357 | OBSERVED_REFERENCE_API_INVENTORY.csv:L230 | S:10720 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/admin/users/:id/status | AdminUpdateUserStatusInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000748 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L358 | OBSERVED_REFERENCE_API_INVENTORY.csv:L231 | S:10777 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/admin/users/:id/roles | AdminUpdateUserRolesInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000749 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L359 | OBSERVED_REFERENCE_API_INVENTORY.csv:L232 | S:10832 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/admin/feature-flags | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-20-06 | GET /admin/feature-flags | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000750 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L360 | OBSERVED_REFERENCE_API_INVENTORY.csv:L233 | S:10844 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PUT /api/v1/admin/feature-flags/:key | AdminToggleFeatureFlagInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | same-route-shape-parameter-names-differ | API-20-07 | PUT /admin/feature-flags/{flagKey} | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | Parameter-agnostic path shape overlaps the listed target candidate(s), and the HTTP method matches, but parameter names differ. This is a structural candidate only; schemas, authorization, errors, idempotency and lifecycle are not compared. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000751 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L361 | OBSERVED_REFERENCE_API_INVENTORY.csv:L234 | S:10886 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/admin/audit-logs | AdminQueryAuditLogsSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000752 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L362 | OBSERVED_REFERENCE_API_INVENTORY.csv:L235 | S:10908 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/admin/health-diagnostics | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000753 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L363 | OBSERVED_REFERENCE_API_INVENTORY.csv:L236 | S:10960 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/admin/maintenance | AdminSetMaintenanceModeInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000754 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L364 | OBSERVED_REFERENCE_API_INVENTORY.csv:L237 | S:10989 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/search | SearchQueryInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000755 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L365 | OBSERVED_REFERENCE_API_INVENTORY.csv:L238 | S:11237 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/search/autocomplete | AutocompleteQueryInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000756 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L366 | OBSERVED_REFERENCE_API_INVENTORY.csv:L239 | S:11315 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/search/commands | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000757 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L367 | OBSERVED_REFERENCE_API_INVENTORY.csv:L240 | S:11325 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/search/history | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000758 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L368 | OBSERVED_REFERENCE_API_INVENTORY.csv:L241 | S:11335 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/search/history | ClearSearchHistoryInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000759 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L369 | OBSERVED_REFERENCE_API_INVENTORY.csv:L242 | S:11358 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/moderation/scan | ScanContentInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000760 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L370 | OBSERVED_REFERENCE_API_INVENTORY.csv:L243 | S:11365 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/moderation/reports | CreateModerationReportInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000761 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L371 | OBSERVED_REFERENCE_API_INVENTORY.csv:L244 | S:11433 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/moderation/reports/my | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000762 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L372 | OBSERVED_REFERENCE_API_INVENTORY.csv:L245 | S:11458 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/moderation/reports | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000763 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L373 | OBSERVED_REFERENCE_API_INVENTORY.csv:L246 | S:11480 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/moderation/reports/:id | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000764 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L374 | OBSERVED_REFERENCE_API_INVENTORY.csv:L247 | S:11501 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/moderation/reports/:id/status | UpdateModerationReportStatusInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000765 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L375 | OBSERVED_REFERENCE_API_INVENTORY.csv:L248 | S:11524 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/moderation/reports/:id/resolve | ResolveModerationReportInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000766 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L376 | OBSERVED_REFERENCE_API_INVENTORY.csv:L249 | S:11661 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/moderation/reports/:id/appeal | CreateModerationAppealInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000767 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L377 | OBSERVED_REFERENCE_API_INVENTORY.csv:L250 | S:11698 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/moderation/appeals | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000768 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L378 | OBSERVED_REFERENCE_API_INVENTORY.csv:L251 | S:11707 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/moderation/appeals/:id/review | ReviewModerationAppealInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000769 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L379 | OBSERVED_REFERENCE_API_INVENTORY.csv:L252 | S:11756 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs/saved-searches | CreateSavedSearchInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000770 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L380 | OBSERVED_REFERENCE_API_INVENTORY.csv:L253 | S:11774 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/saved-searches | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000771 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L381 | OBSERVED_REFERENCE_API_INVENTORY.csv:L254 | S:11781 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/saved-searches/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000772 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L382 | OBSERVED_REFERENCE_API_INVENTORY.csv:L255 | S:11798 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/jobs/saved-searches/:id | UpdateSavedSearchInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000773 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L383 | OBSERVED_REFERENCE_API_INVENTORY.csv:L256 | S:11818 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/jobs/saved-searches/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000774 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L384 | OBSERVED_REFERENCE_API_INVENTORY.csv:L257 | S:11836 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs/saved-searches/:id/run | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000775 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L385 | OBSERVED_REFERENCE_API_INVENTORY.csv:L258 | S:11855 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/alerts | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000776 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L386 | OBSERVED_REFERENCE_API_INVENTORY.csv:L259 | S:11864 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PATCH /api/v1/jobs/alerts/:id/read | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000777 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L387 | OBSERVED_REFERENCE_API_INVENTORY.csv:L260 | S:11883 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs/:id/save | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000778 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L388 | OBSERVED_REFERENCE_API_INVENTORY.csv:L261 | S:11900 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/jobs/:id/save | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000779 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L389 | OBSERVED_REFERENCE_API_INVENTORY.csv:L262 | S:11911 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/saved | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000780 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L390 | OBSERVED_REFERENCE_API_INVENTORY.csv:L263 | S:11924 | Current source index row matches route, request-schema label, registry label and snapshot anchor | PUT /api/v1/jobs/:jobId/draft | SaveApplicationDraftInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000781 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L391 | OBSERVED_REFERENCE_API_INVENTORY.csv:L264 | S:11990 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/jobs/:jobId/draft | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000782 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L392 | OBSERVED_REFERENCE_API_INVENTORY.csv:L265 | S:12020 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/jobs/:jobId/draft | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000783 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L393 | OBSERVED_REFERENCE_API_INVENTORY.csv:L266 | S:12046 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/jobs/:jobId/draft/restore | RestoreApplicationDraftVersionInputSchema | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000784 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L394 | OBSERVED_REFERENCE_API_INVENTORY.csv:L267 | S:12087 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/applications/drafts | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000785 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L395 | OBSERVED_REFERENCE_API_INVENTORY.csv:L268 | S:12113 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/analytics/events | `RecordAnalyticsEventBatchInputSchema`, `RecordAnalyticsEventInputSchema` | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-21-02 | POST /analytics/events | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-exact-method-path | Normalized method and path overlap the target catalog entry. Request/response schemas, authorization, policy, errors, idempotency, persistence, lifecycle, and ownership semantics were not compared; this is not contract equivalence. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000786 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L396 | OBSERVED_REFERENCE_API_INVENTORY.csv:L269 | S:12174 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/analytics/events | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md | API-21-02 | POST /analytics/events | same-named-path |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | candidate-path-only-method-mismatch | Normalized path overlaps a target catalog entry but the HTTP method differs; this is not an operation match. No semantic mapping is inferred. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000787 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L397 | OBSERVED_REFERENCE_API_INVENTORY.csv:L270 | S:12193 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/analytics/kpis | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000788 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L398 | OBSERVED_REFERENCE_API_INVENTORY.csv:L271 | S:12240 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/candidates/work-history | CreateWorkHistoryInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000789 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L399 | OBSERVED_REFERENCE_API_INVENTORY.csv:L272 | S:12296 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/candidates/work-history/:id/verify-email | VerifyWorkHistoryEmailInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000790 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L400 | OBSERVED_REFERENCE_API_INVENTORY.csv:L273 | S:12424 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/candidates/work-history/:id/references/request | RequestEmploymentReferenceInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000791 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L401 | OBSERVED_REFERENCE_API_INVENTORY.csv:L274 | S:12522 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/references/:refId | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000792 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L402 | OBSERVED_REFERENCE_API_INVENTORY.csv:L275 | S:12558 | Current source index row matches route, request-schema label, registry label and snapshot anchor | POST /api/v1/candidates/work-history/references/:refId/submit | SubmitEmploymentReferenceInputSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000793 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L403 | OBSERVED_REFERENCE_API_INVENTORY.csv:L276 | S:12715 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/candidates/:candidateId/work-history | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000794 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L404 | OBSERVED_REFERENCE_API_INVENTORY.csv:L277 | S:12764 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/candidates/:candidateId/work-history-graph | QueryWorkHistoryGraphSchema | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000795 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L405 | OBSERVED_REFERENCE_API_INVENTORY.csv:L278 | S:12808 | Current source index row matches route, request-schema label, registry label and snapshot anchor | DELETE /api/v1/candidates/work-history/:id | handler | P | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |
| EVD-000796 | DOC-000135 | EVD-000135 | docs/engineering/API_CONTRACTS.md | 431c425a (source cross-check recorded 2026-10-23) | 0d13fbb3e0f06582a007a90bb047c2e5dd5e952e2ed88555fb3f69111a2265fe | API_CONTRACTS.md:L406 | OBSERVED_REFERENCE_API_INVENTORY.csv:L279 | S:12862 | Current source index row matches route, request-schema label, registry label and snapshot anchor | GET /api/v1/internal/worker-jobs | handler | E | APIC-01 | 13_API_EVENTS_AND_INTEGRATIONS/API_CATALOG.md |  |  | no-route-shape-match |  |  | Primary named-path comparison removes the source /api/vN prefix and normalizes :param to {param}, preserving parameter names; it compares case-sensitive paths and HTTP methods. Secondary path-shape comparison ignores parameter names and prefers target candidates with the same method where available; otherwise it retains shape candidates with method mismatches. Neither comparison asserts semantic API equivalence. | no-direct-normalized-path-match | No path-shape overlap exists in the 230-entry target API catalog. This route-surface result does not establish feature absence or an implementation gap; semantic candidates are withheld pending owner review. | Static documentation comparison only; current code behavior, runtime, authorization and contract equivalence not revalidated. | OPEN-46/OPEN-50 owner review required; candidate path mapping only; no adoption or implementation claim. |

## SSOT Interface Contract Crosswalk

_Former file: `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.md`._

Doc ID: APIC-03 · Status: Candidate mapping; owner review required · Date: 2026-10-25

This crosswalk compares root SSOT `CON-001…CON-016` (§23.3) with proposed target API, migration, privacy, and observability specifications. It preserves the source contract IDs and records candidate destinations; it does not establish approval or runtime behavior.

| Disposition       | Count | Notes                                                                              |
| ----------------- | ----: | ---------------------------------------------------------------------------------- |
| Aligned candidate |     8 | Similar target contracts exist, with residuals documented in the row-level CSV.    |
| Partial candidate |     6 | Related controls exist, but exact coverage remains incomplete or unverified.       |
| Conflict          |     2 | Cursor default differs (20 vs 25); stale-write response differs (409 vs ETag/412). |

The [row-level crosswalk](#ssot_interface_contract_crosswalkcsv) includes each source contract statement, target section, and unresolved condition. “Aligned candidate” means the written design appears similar at the stated level; it is not an owner-approved equivalence decision or evidence that controls run.

OPEN-46 remains open for envelope, pagination default, deprecation lifecycle, timeout/serialization choices, and owner disposition of the crosswalk. The source requires minimum six-month deprecation while the target currently proposes 90 days; this is not resolved by the 16-row interface comparison.

## SSOT_INTERFACE_CONTRACT_CROSSWALK.csv

_Former file: `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_INTERFACE_CONTRACT_CROSSWALK.csv`._

Converted from CSV (16 rows).

| Source ID | Source contract | Candidate target destination | Disposition | Residual / rationale |
|---|---|---|---|---|
| CON-001 | Error contract: RFC 9457 | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?5 | Aligned candidate | RFC 9457 problem+json is specified for errors. Source success/list envelope remains a separate unresolved question. |
| CON-002 | API versioning: path-versioned; additive within major | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?3 | Aligned candidate | Path-versioning and additive compatible changes align; target supports parallel versions. Source identity not carried as CON ID. |
| CON-003 | Pagination: cursor-based; limit default 20, max 100 | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?6 | Conflict | Both use keyset cursors and max 100, but default is 20 in source and 25 in target. |
| CON-004 | Filtering & sorting: allow-listed; sort keys indexed | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?7 | Aligned candidate | Allow-listed filters and sort keys are specified; source adds indexed sort-key constraint that needs explicit target verification. |
| CON-005 | Idempotency: `Idempotency-Key` on non-idempotent writes; 24h replay | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?8; API_CATALOG.md | Partial candidate | Target requires Idempotency-Key on POST; source says non-idempotent writes and 24h replay. Target has 7-day payment-adjacent keys; classify route coverage and preserve replay contract. |
| CON-006 | Rate limiting: per-class budgets; 429 + Retry-After | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?9 | Aligned candidate | Target defines rate classes and 429 Retry-After. Numeric rate budgets differ as target starting values and require calibration. |
| CON-007 | Webhooks: HMAC signed; timestamp + replay window | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?4, ?13 | Aligned candidate | Target requires raw-body provider signature verification, timestamps and replay dedupe; source specifically states HMAC + replay window. Verify one contract across inbound/outbound providers. |
| CON-008 | Retry / timeout: 10s default (AI 30s); exponential backoff | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ??5, 11 | Partial candidate | Target defines 504, retry safety and async operations; the source default 10s and AI 30s timeout values are not established as common target limits. |
| CON-009 | Time: UTC; ISO-8601 with offset | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?2 | Partial candidate | Both specify UTC timestamps; source ISO-8601 with offset, target RFC 3339 UTC with Z. Select wire representation and parsing rules. |
| CON-010 | Money: integer minor units + ISO-4217 | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?2 | Aligned candidate | Target states integer minor units plus ISO-4217, matching the source money representation. |
| CON-011 | Files / uploads: allow-list + MIME sniff + size caps + AV | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ??2, 5; API_CATALOG.md DOM-24 | Partial candidate | Target upload intents, size/MIME errors, signed URLs and AV controls overlap; source allow-list, MIME sniffing and caps need exact crosswalk to file pipeline and tests. |
| CON-012 | Concurrency: optimistic locking; stale write → 409 | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?10 | Conflict | Source maps stale optimistic write to 409; target uses If-Match/412 for stale ETag and 409 for uniqueness/state conflicts. |
| CON-013 | Migrations: forward-only in production | 12_DATA_AND_DATABASE/MIGRATION_POLICY.md ??1, 3, 5 | Aligned candidate | Both favor forward-only production migration; target still permits documented reversible DDL-only inverse and uses explicit recovery categories. |
| CON-014 | Caching: only derived reads; keys include tenant + actor | 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?10 | Partial candidate | Target defines cache headers and service-worker restrictions, but source requires only derived reads and keys including tenant+actor; no full rule-by-rule equivalence established. |
| CON-015 | Data lifecycle: retention windows; erasure propagates | 14_SECURITY_PRIVACY_COMPLIANCE/PRIVACY_AND_DATA_LIFECYCLE_DESIGN.md; 12_DATA_AND_DATABASE/CONCEPTUAL_AND_LOGICAL_MODEL.md | Partial candidate | Target has retention and erasure contracts, but source windows/propagation are not yet mapped by DATA identity; map retention classes and deletion dependencies. |
| CON-016 | Logging / telemetry: structured JSON; redacted | 17_DEVOPS_AND_INFRASTRUCTURE/OBSERVABILITY_DESIGN.md; 13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md ?5 | Aligned candidate | Structured telemetry and redaction/trace identifiers are represented; target adds explicit fields and log controls. Verify each sink and sensitive field class before claiming runtime behavior. |

## SSOT Service Contract Crosswalk

_Former file: `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.md`._

Doc ID: APIC-02 · Status: Candidate mapping; owner review required · Date: 2026-10-25

This crosswalk compares the root SSOT's 54 service contract identities to the proposed target API catalog. It preserves each source operation, actor and idempotency key. Candidate API IDs indicate a possible destination for review; they do not prove semantic equivalence, adoption, or implementation.

### Coverage summary

| Source SCI contracts | Candidate mapping | Count | Meaning                                                                                                                                                                   |
| -------------------- | ----------------: | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCI-01…SCI-54        | Partial candidate |    33 | Related target endpoint(s) exist, but the row records a material gap in identity, lifecycle, actor, or idempotency behavior.                                              |
| SCI-01…SCI-54        | No specific match |    21 | No sufficiently specific endpoint was identified in the current target API catalog. This does not prove that the product capability is absent from all other target docs. |

The row-level evidence is in [SSOT_SERVICE_CONTRACT_CROSSWALK.csv](#ssot_service_contract_crosswalkcsv). All 33 candidate API IDs resolve against [API_CATALOG.md](13_API_EVENTS_AND_INTEGRATIONS.md#api-catalog-target). No direct match is marked exact because source and target idempotency, lifecycle, or resource semantics still need owner review.

### High-impact no-match groups

- Institution operations: batch course assignment and explicit seat assign/revoke/reassign (SCI-11/12).
- Learning/media: assignment submission and peer review (SCI-22/23); Q&A (SCI-28); playlist import is only a generic-import candidate (SCI-14).
- Commerce and migration: creator payout settlement (SCI-27); migration abort/rollback is only partially adjacent to generic import/job operations (SCI-25).
- Community and growth: contests (SCI-29…31), publishing/newsletters (SCI-33/34), emerging skills and relationship validation (SCI-45/46), introductions (SCI-47/48), feedback (SCI-49/50), freshness (SCI-51), referrals (SCI-53), alumni (SCI-54).
- Media and assessment: recording lifecycle (SCI-39).

### Decisions required

OPEN-46 governs API identity, envelope and compatibility decisions; OPEN-50 governs broader source-register reconciliation. Owners should confirm each candidate, split or merge target endpoints where necessary, identify explicit out-of-scope operations, or add target contracts where approved. Preserve source idempotency keys and actor constraints in that review. The candidate map does not supersede the protected root `SSOT.md` or authorize deleting source material.

### Limits

This comparison covers the API catalog only. It does not search every feature spec for implicit behavior, establish API behavior outside that catalog, or prove implementation. “No specific match” means only that this catalog contains no sufficiently specific endpoint candidate.

## SSOT_SERVICE_CONTRACT_CROSSWALK.csv

_Former file: `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/SSOT_SERVICE_CONTRACT_CROSSWALK.csv`._

Converted from CSV (54 rows).

| Source ID | Operation | Actor | Source idempotency | Candidate target API IDs | Disposition | Residual / rationale |
|---|---|---|---|---|---|---|
| SCI-01 | Create job | Org recruiter | Client `jobIdempotencyKey` | API-09-04 | Partial candidate | Job creation is present; source jobIdempotencyKey and full source lifecycle contract are not mapped. |
| SCI-02 | Apply to job | Candidate | Natural (unique job+applicant) | API-10-01 | Partial candidate | Application submission exists; source natural-key duplicate semantics differ from target required idempotency key. |
| SCI-03 | Send message | Participant | `clientMessageId` | API-13-04 | Partial candidate | Message send exists; clientMessageId is not confirmed equivalent to target Idempotency-Key. |
| SCI-04 | Submit challenge | Candidate | Submission idempotency key | API-07-03; API-07-06 | Partial candidate | Assessment attempt/submission is present; challenge-specific payload, execution, and idempotency are not shown equivalent. |
| SCI-05 | AI suggest | Authed user | Deterministic heuristic | API-17-01 | Partial candidate | AI suggestion endpoint exists; deterministic heuristic behavior and source authorization/consent rules need reconciliation. |
| SCI-06 | Payment webhook | Stripe | Stripe `event.id` | API-16-09 | Partial candidate | Stripe webhook exists; source event.id idempotency contract must be compared to target natural-key handling. |
| SCI-07 | Moderate content | Moderator/Admin | Action key | API-19-03 | Partial candidate | Moderation decision exists; source action-key behavior and full moderation lifecycle are not mapped. |
| SCI-08 | Enroll in course | Learner | Partial unique active | API-08-03 | Partial candidate | Course enrollment exists; source partial unique active constraint and re-enrollment semantics are not mapped. |
| SCI-09 | Purchase license pool | Institution Admin | PO + Stripe event ID | API-16-04; API-18-01 | Partial candidate | Org checkout and institution read exist; license-pool purchase, PO association, and settlement lifecycle are absent from these routes. |
| SCI-10 | Bulk import students | Institution Admin | import_batch_id + row hash | API-18-06; API-23-09 | Partial candidate | Institution member/import jobs exist; import_batch_id + row hash and source per-row processing contract are not confirmed. |
| SCI-11 | Batch course assignment | Institution Admin | (pool_id, batch_id) |  | No specific match | No batch course-assignment API appears in the target catalog. |
| SCI-12 | Seat assign/revoke/reassign | Institution Admin | (pool_id, learner_id) | API-18-02; API-18-03 | Partial candidate | Institution cohorts exist; seat assign/revoke/reassign and progress-retention semantics are not represented by these endpoints. |
| SCI-13 | Add media source | Course Author | (content_item_id, provider, external_id) | API-08-07; API-08-08 | Partial candidate | Course create/update exists; MediaSource identity and provider/external-id uniqueness are not mapped to a target media contract. |
| SCI-14 | Import playlist | Course Author | (playlist_source_id, import_run_id) | API-23-09 | Partial candidate | Generic import job exists; playlist-source parsing and import-run identity are not specified. |
| SCI-15 | Reorder content | Course Author | Client operation ID | API-08-08 | Partial candidate | Course update exists; content reorder operation/idempotency and conflict behavior are not explicit. |
| SCI-16 | Record playback progress | Learner | (learner_id, content_item_id) | API-08-05 | Partial candidate | Lesson completion exists; playback position/progress keyed by learner and content item is a different contract. |
| SCI-17 | Certificate issue / verify | System / Public | UNIQUE(enrollment_id) | API-05-13; API-18-05 | Partial candidate | Public credential verification and institution credential issue exist; generic enrollment-based issue lifecycle is not confirmed. |
| SCI-18 | Graduate learner | System / Learner | (learner_id, transition_id) |  | No specific match | No graduation transition endpoint or progress/evidence severance contract appears in the target API catalog. |
| SCI-19 | Create course version | Course Author | Version key | API-08-07; API-08-08 | Partial candidate | Course CRUD exists; immutable version creation and version-key semantics are not specified. |
| SCI-20 | Submit course for review | Course Author | Submission id | API-08-09 | Partial candidate | Course publication exists; submit-for-review, reviewer decision, and submission-id semantics are not represented. |
| SCI-21 | Attempt quiz | Learner | (quiz, user, attempt_no) | API-07-03; API-07-06 | Partial candidate | Assessment attempt and submit exist; quiz identity, attempt_no, and retry rules are not mapped. |
| SCI-22 | Submit assignment | Learner | (assignment, learner, attempt_no) |  | No specific match | No assignment submission endpoint or assignment attempt contract appears in the target API catalog. |
| SCI-23 | Assign peer review | System | (submission, reviewer) |  | No specific match | No system-issued peer-review assignment endpoint or reviewer uniqueness contract appears in the target API catalog. |
| SCI-24 | Enrol in path | Learner | (path, user) active | API-08-06 | Partial candidate | Learning paths can be listed; path enrollment/create contract and active uniqueness are not explicit. |
| SCI-25 | Abort / rollback migration | System / User | (migration_id, stage) | API-23-09; API-24-08; API-24-09 | Partial candidate | Generic import and job operations exist; migration-specific abort, rollback stages, and recovery guarantees are absent. |
| SCI-26 | Purchase course | Learner | PaymentIntent id | API-16-05 | Partial candidate | User checkout exists; course purchase and PaymentIntent idempotency are not distinguished. |
| SCI-27 | Submit payout settlement | System | (period, creator) |  | No specific match | No creator payout settlement endpoint or period/creator idempotency contract appears in the target API catalog. |
| SCI-28 | Q&A post / accept answer | Learner / Instructor | Client post id |  | No specific match | No Q&A post/answer acceptance endpoints appear in the target API catalog. |
| SCI-29 | Create contest | Instructor / Org | Contest key |  | No specific match | No contest creation endpoint appears in the target API catalog. |
| SCI-30 | Register for contest | Learner | (contest, user) |  | No specific match | No contest registration endpoint appears in the target API catalog. |
| SCI-31 | Submit contest entry | Learner | (contest, challenge, user, submission_key) |  | No specific match | No contest entry submission endpoint appears in the target API catalog. |
| SCI-32 | Attempt certification | Learner | (certification, user, attempt_no) | API-07-03; API-07-06 | Partial candidate | Assessment attempt endpoints exist; certification identity, attempt number, and certification-specific rules are not mapped. |
| SCI-33 | Publish post | Author | Client post id |  | No specific match | No post publishing endpoint appears in the target API catalog; network connection APIs do not establish post coverage. |
| SCI-34 | Send newsletter issue | Author | Issue key |  | No specific match | No newsletter issue/send endpoint appears in the target API catalog. |
| SCI-35 | Skill CRUD / relationship / market signal / traversal | Admin / Public | — | API-04-01; API-04-03; API-04-05; API-04-06 | Partial candidate | Skill search/read/relations/create/merge partially overlap; market signals, traversal, full CRUD and source role scopes are not mapped. |
| SCI-36 | Career graph query / benchmark / opt-in | Candidate | — | API-12-01; API-12-02 | Partial candidate | Readiness/transitions exist; career graph query, benchmark, and opt-in lifecycle are not mapped. |
| SCI-37 | Salary submission / aggregate / withdrawal | Candidate | Submission key | API-12-03 | Partial candidate | Salary bands can be read; salary submission, aggregation controls, and withdrawal are absent. |
| SCI-38 | Assessment lifecycle | Recruiter/Interviewer | Assessment id | API-07-12; API-07-13; API-07-14; API-10-13; API-10-14 | Partial candidate | Assessment authoring and interview scheduling/update exist; recruiter/interviewer assessment lifecycle and source assessment-id semantics need mapping. |
| SCI-39 | Recording lifecycle | Recruiter/Interviewer | Recording id |  | No specific match | No interview recording lifecycle endpoints or recording-id policy appear in the target API catalog. |
| SCI-40 | Readiness computation / gap analysis | Candidate | Recompute key | API-12-01 | Partial candidate | Readiness snapshot read exists; compute/recompute idempotency and gap-analysis output are not mapped. |
| SCI-41 | Recruiter search / pool CRUD | Recruiter | — | API-11-02 | Partial candidate | Recruiter candidate search exists; recruiter search-pool CRUD and source pool behavior are not represented. |
| SCI-42 | Credential issue / verify / revoke / endorse | System / Public / Peer | UNIQUE(enrollment) | API-05-12; API-05-13; API-18-05 | Partial candidate | Evidence revocation, public credential verification, and institution credential issue exist; credential endorse and generic issue/revoke linkage are incomplete. |
| SCI-43 | Correlation query / instructor analytics | Instructor / Admin | — | API-21-01 | Partial candidate | Funnel analytics exists; correlation query and instructor analytics data contract are not mapped. |
| SCI-44 | Exam CRUD | Admin | — | API-07-12; API-07-13; API-07-14 | Partial candidate | Assessment create/update/publish exists; admin exam-specific CRUD, exam lifecycle, and policy are not confirmed. |
| SCI-45 | Emerging skill proposal | System | — |  | No specific match | No emerging-skill proposal endpoint appears in the target API catalog. |
| SCI-46 | Relationship validation | System | — |  | No specific match | No skill relationship validation endpoint or system validation contract appears in the target API catalog. |
| SCI-47 | Introduction path discovery | Candidate | — |  | No specific match | No introduction-path discovery endpoint appears in the target API catalog. |
| SCI-48 | Introduction request lifecycle | Candidate | (path_id, requester) |  | No specific match | No introduction-request lifecycle endpoint appears in the target API catalog. |
| SCI-49 | Feedback CRUD | Recruiter | Feedback key |  | No specific match | No recruiter feedback CRUD endpoint appears in the target API catalog; application notes are not assumed equivalent. |
| SCI-50 | Feedback request | Candidate | Request key |  | No specific match | No candidate feedback-request endpoint appears in the target API catalog. |
| SCI-51 | Freshness query | Candidate | — |  | No specific match | No candidate freshness-query endpoint appears in the target API catalog. |
| SCI-52 | Re-verification | Candidate | Verification key | API-06-01; API-06-04; API-06-16 | Partial candidate | Work-claim create/update and verification decision exist; generic re-verification and VerificationKey semantics are not established. |
| SCI-53 | Referral request lifecycle | Candidate | (job_id, referrer_id) |  | No specific match | No referral-request lifecycle endpoint appears in the target API catalog. |
| SCI-54 | Alumni affiliation / group lifecycle | User | Affiliation key |  | No specific match | No alumni affiliation/group lifecycle endpoint appears in the target API catalog. |

## asyncapi.yaml

_Former file: `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS/contracts/asyncapi.yaml`._

Converted from `.yaml`; the content is unchanged inside the code block.

```yaml
# Generated from the event definition source of truth; keep in sync with EVENT_CATALOG.md rows.
asyncapi: 3.0.0
info:
  title: TalentSphere Domain Events
  version: 1.0.0-draft
  description: Target design contract [TARGET]. Events are written to outbox_event in the producing transaction and delivered
    at-least-once through the Postgres-backed job engine (ADR-T05, ADR-T09). Consumers dedupe on event_id. Not implemented;
    design only.
defaultContentType: application/json
servers:
  outbox:
    host: postgres-outbox.internal
    protocol: postgres-outbox
    description: 'Logical server: outbox_event table + background_job fan-out (not a network broker). Protocol string is descriptive.'
channels:
  accountRegistered:
    address: account.registered
    messages:
      AccountRegistered:
        $ref: '#/components/messages/AccountRegistered'
  accountEmailVerified:
    address: account.email_verified
    messages:
      AccountEmailVerified:
        $ref: '#/components/messages/AccountEmailVerified'
  sessionRevoked:
    address: session.revoked
    messages:
      SessionRevoked:
        $ref: '#/components/messages/SessionRevoked'
  passwordChanged:
    address: password.changed
    messages:
      PasswordChanged:
        $ref: '#/components/messages/PasswordChanged'
  passkeyRegistered:
    address: passkey.registered
    messages:
      PasskeyRegistered:
        $ref: '#/components/messages/PasskeyRegistered'
  accountLocked:
    address: account.locked
    messages:
      AccountLocked:
        $ref: '#/components/messages/AccountLocked'
  accountDeactivated:
    address: account.deactivated
    messages:
      AccountDeactivated:
        $ref: '#/components/messages/AccountDeactivated'
  orgCreated:
    address: org.created
    messages:
      OrgCreated:
        $ref: '#/components/messages/OrgCreated'
  orgMemberAdded:
    address: org.member.added
    messages:
      OrgMemberAdded:
        $ref: '#/components/messages/OrgMemberAdded'
  orgMemberRoleChanged:
    address: org.member.role_changed
    messages:
      OrgMemberRoleChanged:
        $ref: '#/components/messages/OrgMemberRoleChanged'
  orgMemberRemoved:
    address: org.member.removed
    messages:
      OrgMemberRemoved:
        $ref: '#/components/messages/OrgMemberRemoved'
  orgSsoConfigured:
    address: org.sso.configured
    messages:
      OrgSsoConfigured:
        $ref: '#/components/messages/OrgSsoConfigured'
  profileUpdated:
    address: profile.updated
    messages:
      ProfileUpdated:
        $ref: '#/components/messages/ProfileUpdated'
  profileVisibilityChanged:
    address: profile.visibility_changed
    messages:
      ProfileVisibilityChanged:
        $ref: '#/components/messages/ProfileVisibilityChanged'
  skillCreated:
    address: skill.created
    messages:
      SkillCreated:
        $ref: '#/components/messages/SkillCreated'
  skillMerged:
    address: skill.merged
    messages:
      SkillMerged:
        $ref: '#/components/messages/SkillMerged'
  evidenceCreated:
    address: evidence.created
    messages:
      EvidenceCreated:
        $ref: '#/components/messages/EvidenceCreated'
  evidenceUpdated:
    address: evidence.updated
    messages:
      EvidenceUpdated:
        $ref: '#/components/messages/EvidenceUpdated'
  evidenceArtifactScanned:
    address: evidence.artifact.scanned
    messages:
      EvidenceArtifactScanned:
        $ref: '#/components/messages/EvidenceArtifactScanned'
  evidenceVerificationRequested:
    address: evidence.verification_requested
    messages:
      EvidenceVerificationRequested:
        $ref: '#/components/messages/EvidenceVerificationRequested'
  evidenceVerified:
    address: evidence.verified
    messages:
      EvidenceVerified:
        $ref: '#/components/messages/EvidenceVerified'
  evidenceRevoked:
    address: evidence.revoked
    messages:
      EvidenceRevoked:
        $ref: '#/components/messages/EvidenceRevoked'
  credentialIssued:
    address: credential.issued
    messages:
      CredentialIssued:
        $ref: '#/components/messages/CredentialIssued'
  credentialRevoked:
    address: credential.revoked
    messages:
      CredentialRevoked:
        $ref: '#/components/messages/CredentialRevoked'
  verificationRequested:
    address: verification.requested
    messages:
      VerificationRequested:
        $ref: '#/components/messages/VerificationRequested'
  verificationCompleted:
    address: verification.completed
    messages:
      VerificationCompleted:
        $ref: '#/components/messages/VerificationCompleted'
  referenceRequested:
    address: reference.requested
    messages:
      ReferenceRequested:
        $ref: '#/components/messages/ReferenceRequested'
  referenceResponded:
    address: reference.responded
    messages:
      ReferenceResponded:
        $ref: '#/components/messages/ReferenceResponded'
  referenceExpired:
    address: reference.expired
    messages:
      ReferenceExpired:
        $ref: '#/components/messages/ReferenceExpired'
  workclaimEmployerEmailConfirmed:
    address: workclaim.employer_email_confirmed
    messages:
      WorkclaimEmployerEmailConfirmed:
        $ref: '#/components/messages/WorkclaimEmployerEmailConfirmed'
  verificationDisputed:
    address: verification.disputed
    messages:
      VerificationDisputed:
        $ref: '#/components/messages/VerificationDisputed'
  attemptStarted:
    address: attempt.started
    messages:
      AttemptStarted:
        $ref: '#/components/messages/AttemptStarted'
  attemptSubmitted:
    address: attempt.submitted
    messages:
      AttemptSubmitted:
        $ref: '#/components/messages/AttemptSubmitted'
  assessmentPassed:
    address: assessment.passed
    messages:
      AssessmentPassed:
        $ref: '#/components/messages/AssessmentPassed'
  assessmentFailed:
    address: assessment.failed
    messages:
      AssessmentFailed:
        $ref: '#/components/messages/AssessmentFailed'
  integrityFlagRaised:
    address: integrity.flag.raised
    messages:
      IntegrityFlagRaised:
        $ref: '#/components/messages/IntegrityFlagRaised'
  integrityFlagReviewed:
    address: integrity.flag.reviewed
    messages:
      IntegrityFlagReviewed:
        $ref: '#/components/messages/IntegrityFlagReviewed'
  attemptAppealed:
    address: attempt.appealed
    messages:
      AttemptAppealed:
        $ref: '#/components/messages/AttemptAppealed'
  enrollmentCreated:
    address: enrollment.created
    messages:
      EnrollmentCreated:
        $ref: '#/components/messages/EnrollmentCreated'
  courseCompleted:
    address: course.completed
    messages:
      CourseCompleted:
        $ref: '#/components/messages/CourseCompleted'
  coursePublished:
    address: course.published
    messages:
      CoursePublished:
        $ref: '#/components/messages/CoursePublished'
  jobPublished:
    address: job.published
    messages:
      JobPublished:
        $ref: '#/components/messages/JobPublished'
  jobUpdated:
    address: job.updated
    messages:
      JobUpdated:
        $ref: '#/components/messages/JobUpdated'
  jobClosed:
    address: job.closed
    messages:
      JobClosed:
        $ref: '#/components/messages/JobClosed'
  jobExpired:
    address: job.expired
    messages:
      JobExpired:
        $ref: '#/components/messages/JobExpired'
  applicationSubmitted:
    address: application.submitted
    messages:
      ApplicationSubmitted:
        $ref: '#/components/messages/ApplicationSubmitted'
  applicationWithdrawn:
    address: application.withdrawn
    messages:
      ApplicationWithdrawn:
        $ref: '#/components/messages/ApplicationWithdrawn'
  applicationStageChanged:
    address: application.stage.changed
    messages:
      ApplicationStageChanged:
        $ref: '#/components/messages/ApplicationStageChanged'
  interviewScheduled:
    address: interview.scheduled
    messages:
      InterviewScheduled:
        $ref: '#/components/messages/InterviewScheduled'
  interviewCompleted:
    address: interview.completed
    messages:
      InterviewCompleted:
        $ref: '#/components/messages/InterviewCompleted'
  conversationCreated:
    address: conversation.created
    messages:
      ConversationCreated:
        $ref: '#/components/messages/ConversationCreated'
  messageSent:
    address: message.sent
    messages:
      MessageSent:
        $ref: '#/components/messages/MessageSent'
  notificationEmailBounced:
    address: notification.email.bounced
    messages:
      NotificationEmailBounced:
        $ref: '#/components/messages/NotificationEmailBounced'
  notificationDelivered:
    address: notification.delivered
    messages:
      NotificationDelivered:
        $ref: '#/components/messages/NotificationDelivered'
  subscriptionChanged:
    address: subscription.changed
    messages:
      SubscriptionChanged:
        $ref: '#/components/messages/SubscriptionChanged'
  entitlementChanged:
    address: entitlement.changed
    messages:
      EntitlementChanged:
        $ref: '#/components/messages/EntitlementChanged'
  paymentFailed:
    address: payment.failed
    messages:
      PaymentFailed:
        $ref: '#/components/messages/PaymentFailed'
  invoicePaid:
    address: invoice.paid
    messages:
      InvoicePaid:
        $ref: '#/components/messages/InvoicePaid'
  aiRequestCompleted:
    address: ai.request.completed
    messages:
      AiRequestCompleted:
        $ref: '#/components/messages/AiRequestCompleted'
  aiBudgetExceeded:
    address: ai.budget.exceeded
    messages:
      AiBudgetExceeded:
        $ref: '#/components/messages/AiBudgetExceeded'
  credentialIssuedByInstitution:
    address: credential.issued_by_institution
    messages:
      CredentialIssuedByInstitution:
        $ref: '#/components/messages/CredentialIssuedByInstitution'
  reportFiled:
    address: report.filed
    messages:
      ReportFiled:
        $ref: '#/components/messages/ReportFiled'
  caseResolved:
    address: case.resolved
    messages:
      CaseResolved:
        $ref: '#/components/messages/CaseResolved'
  supportAccessGranted:
    address: support_access.granted
    messages:
      SupportAccessGranted:
        $ref: '#/components/messages/SupportAccessGranted'
  supportAccessExpired:
    address: support_access.expired
    messages:
      SupportAccessExpired:
        $ref: '#/components/messages/SupportAccessExpired'
  featureFlagChanged:
    address: feature_flag.changed
    messages:
      FeatureFlagChanged:
        $ref: '#/components/messages/FeatureFlagChanged'
  consentChanged:
    address: consent.changed
    messages:
      ConsentChanged:
        $ref: '#/components/messages/ConsentChanged'
  dataexportReady:
    address: dataexport.ready
    messages:
      DataexportReady:
        $ref: '#/components/messages/DataexportReady'
  erasureRequested:
    address: erasure.requested
    messages:
      ErasureRequested:
        $ref: '#/components/messages/ErasureRequested'
  erasureModuleCompleted:
    address: erasure.module_completed
    messages:
      ErasureModuleCompleted:
        $ref: '#/components/messages/ErasureModuleCompleted'
  erasureCompleted:
    address: erasure.completed
    messages:
      ErasureCompleted:
        $ref: '#/components/messages/ErasureCompleted'
  importCompleted:
    address: import.completed
    messages:
      ImportCompleted:
        $ref: '#/components/messages/ImportCompleted'
  fileScanned:
    address: file.scanned
    messages:
      FileScanned:
        $ref: '#/components/messages/FileScanned'
  jobDeadLettered:
    address: job.dead_lettered
    messages:
      JobDeadLettered:
        $ref: '#/components/messages/JobDeadLettered'
operations:
  publishAccountRegistered:
    action: send
    channel:
      $ref: '#/channels/accountRegistered'
    summary: identity publishes account.registered via transactional outbox
    messages:
    - $ref: '#/channels/accountRegistered/messages/AccountRegistered'
    x-consumers:
    - notify
    - privacy
    - analytics
  receiveAccountRegisteredByNotify:
    action: receive
    channel:
      $ref: '#/channels/accountRegistered'
    summary: notify consumes account.registered (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/accountRegistered/messages/AccountRegistered'
  receiveAccountRegisteredByPrivacy:
    action: receive
    channel:
      $ref: '#/channels/accountRegistered'
    summary: privacy consumes account.registered (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/accountRegistered/messages/AccountRegistered'
  receiveAccountRegisteredByAnalytics:
    action: receive
    channel:
      $ref: '#/channels/accountRegistered'
    summary: analytics consumes account.registered (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/accountRegistered/messages/AccountRegistered'
  publishAccountEmailVerified:
    action: send
    channel:
      $ref: '#/channels/accountEmailVerified'
    summary: identity publishes account.email_verified via transactional outbox
    messages:
    - $ref: '#/channels/accountEmailVerified/messages/AccountEmailVerified'
    x-consumers:
    - profile
    - notify
  publishSessionRevoked:
    action: send
    channel:
      $ref: '#/channels/sessionRevoked'
    summary: identity publishes session.revoked via transactional outbox
    messages:
    - $ref: '#/channels/sessionRevoked/messages/SessionRevoked'
    x-consumers:
    - notify
    - safety
  publishPasswordChanged:
    action: send
    channel:
      $ref: '#/channels/passwordChanged'
    summary: identity publishes password.changed via transactional outbox
    messages:
    - $ref: '#/channels/passwordChanged/messages/PasswordChanged'
    x-consumers:
    - notify
  publishPasskeyRegistered:
    action: send
    channel:
      $ref: '#/channels/passkeyRegistered'
    summary: identity publishes passkey.registered via transactional outbox
    messages:
    - $ref: '#/channels/passkeyRegistered/messages/PasskeyRegistered'
    x-consumers:
    - notify
  publishAccountLocked:
    action: send
    channel:
      $ref: '#/channels/accountLocked'
    summary: identity publishes account.locked via transactional outbox
    messages:
    - $ref: '#/channels/accountLocked/messages/AccountLocked'
    x-consumers:
    - notify
    - safety
  publishAccountDeactivated:
    action: send
    channel:
      $ref: '#/channels/accountDeactivated'
    summary: identity publishes account.deactivated via transactional outbox
    messages:
    - $ref: '#/channels/accountDeactivated/messages/AccountDeactivated'
    x-consumers:
    - profile
    - search
    - matching
    - messaging
  publishOrgCreated:
    action: send
    channel:
      $ref: '#/channels/orgCreated'
    summary: orgs publishes org.created via transactional outbox
    messages:
    - $ref: '#/channels/orgCreated/messages/OrgCreated'
    x-consumers:
    - billing
    - analytics
  publishOrgMemberAdded:
    action: send
    channel:
      $ref: '#/channels/orgMemberAdded'
    summary: orgs publishes org.member.added via transactional outbox
    messages:
    - $ref: '#/channels/orgMemberAdded/messages/OrgMemberAdded'
    x-consumers:
    - notify
    - billing
    - policy-cache
  publishOrgMemberRoleChanged:
    action: send
    channel:
      $ref: '#/channels/orgMemberRoleChanged'
    summary: orgs publishes org.member.role_changed via transactional outbox
    messages:
    - $ref: '#/channels/orgMemberRoleChanged/messages/OrgMemberRoleChanged'
    x-consumers:
    - notify
    - applications
  publishOrgMemberRemoved:
    action: send
    channel:
      $ref: '#/channels/orgMemberRemoved'
    summary: orgs publishes org.member.removed via transactional outbox
    messages:
    - $ref: '#/channels/orgMemberRemoved/messages/OrgMemberRemoved'
    x-consumers:
    - applications
    - billing
    - messaging
  publishOrgSsoConfigured:
    action: send
    channel:
      $ref: '#/channels/orgSsoConfigured'
    summary: orgs publishes org.sso.configured via transactional outbox
    messages:
    - $ref: '#/channels/orgSsoConfigured/messages/OrgSsoConfigured'
    x-consumers:
    - identity
    - audit
  publishProfileUpdated:
    action: send
    channel:
      $ref: '#/channels/profileUpdated'
    summary: profile publishes profile.updated via transactional outbox
    messages:
    - $ref: '#/channels/profileUpdated/messages/ProfileUpdated'
    x-consumers:
    - search
    - matching
    - careerintel
  publishProfileVisibilityChanged:
    action: send
    channel:
      $ref: '#/channels/profileVisibilityChanged'
    summary: profile publishes profile.visibility_changed via transactional outbox
    messages:
    - $ref: '#/channels/profileVisibilityChanged/messages/ProfileVisibilityChanged'
    x-consumers:
    - search
    - matching
  publishSkillCreated:
    action: send
    channel:
      $ref: '#/channels/skillCreated'
    summary: skills publishes skill.created via transactional outbox
    messages:
    - $ref: '#/channels/skillCreated/messages/SkillCreated'
    x-consumers:
    - search
    - matching
  publishSkillMerged:
    action: send
    channel:
      $ref: '#/channels/skillMerged'
    summary: skills publishes skill.merged via transactional outbox
    messages:
    - $ref: '#/channels/skillMerged/messages/SkillMerged'
    x-consumers:
    - evidence
    - jobs
    - search
    - matching
    - careerintel
  publishEvidenceCreated:
    action: send
    channel:
      $ref: '#/channels/evidenceCreated'
    summary: evidence publishes evidence.created via transactional outbox
    messages:
    - $ref: '#/channels/evidenceCreated/messages/EvidenceCreated'
    x-consumers:
    - verification
    - search
    - careerintel
  receiveEvidenceCreatedByVerification:
    action: receive
    channel:
      $ref: '#/channels/evidenceCreated'
    summary: verification consumes evidence.created (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceCreated/messages/EvidenceCreated'
  receiveEvidenceCreatedBySearch:
    action: receive
    channel:
      $ref: '#/channels/evidenceCreated'
    summary: search consumes evidence.created (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceCreated/messages/EvidenceCreated'
  receiveEvidenceCreatedByCareerintel:
    action: receive
    channel:
      $ref: '#/channels/evidenceCreated'
    summary: careerintel consumes evidence.created (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceCreated/messages/EvidenceCreated'
  publishEvidenceUpdated:
    action: send
    channel:
      $ref: '#/channels/evidenceUpdated'
    summary: evidence publishes evidence.updated via transactional outbox
    messages:
    - $ref: '#/channels/evidenceUpdated/messages/EvidenceUpdated'
    x-consumers:
    - verification
    - search
  publishEvidenceArtifactScanned:
    action: send
    channel:
      $ref: '#/channels/evidenceArtifactScanned'
    summary: evidence publishes evidence.artifact.scanned via transactional outbox
    messages:
    - $ref: '#/channels/evidenceArtifactScanned/messages/EvidenceArtifactScanned'
    x-consumers:
    - notify
    - search
  publishEvidenceVerificationRequested:
    action: send
    channel:
      $ref: '#/channels/evidenceVerificationRequested'
    summary: evidence publishes evidence.verification_requested via transactional outbox
    messages:
    - $ref: '#/channels/evidenceVerificationRequested/messages/EvidenceVerificationRequested'
    x-consumers:
    - verification
  publishEvidenceVerified:
    action: send
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: evidence publishes evidence.verified via transactional outbox
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
    x-consumers:
    - matching
    - search
    - careerintel
    - notify
    - applications
    - skills
  receiveEvidenceVerifiedByMatching:
    action: receive
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: matching consumes evidence.verified (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
  receiveEvidenceVerifiedBySearch:
    action: receive
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: search consumes evidence.verified (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
  receiveEvidenceVerifiedByCareerintel:
    action: receive
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: careerintel consumes evidence.verified (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
  receiveEvidenceVerifiedByNotify:
    action: receive
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: notify consumes evidence.verified (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
  receiveEvidenceVerifiedByApplications:
    action: receive
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: applications consumes evidence.verified (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
  receiveEvidenceVerifiedBySkills:
    action: receive
    channel:
      $ref: '#/channels/evidenceVerified'
    summary: skills consumes evidence.verified (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceVerified/messages/EvidenceVerified'
  publishEvidenceRevoked:
    action: send
    channel:
      $ref: '#/channels/evidenceRevoked'
    summary: evidence publishes evidence.revoked via transactional outbox
    messages:
    - $ref: '#/channels/evidenceRevoked/messages/EvidenceRevoked'
    x-consumers:
    - skills
    - matching
    - applications
    - notify
    - search
  receiveEvidenceRevokedBySkills:
    action: receive
    channel:
      $ref: '#/channels/evidenceRevoked'
    summary: skills consumes evidence.revoked (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceRevoked/messages/EvidenceRevoked'
  receiveEvidenceRevokedByMatching:
    action: receive
    channel:
      $ref: '#/channels/evidenceRevoked'
    summary: matching consumes evidence.revoked (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceRevoked/messages/EvidenceRevoked'
  receiveEvidenceRevokedByApplications:
    action: receive
    channel:
      $ref: '#/channels/evidenceRevoked'
    summary: applications consumes evidence.revoked (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceRevoked/messages/EvidenceRevoked'
  receiveEvidenceRevokedByNotify:
    action: receive
    channel:
      $ref: '#/channels/evidenceRevoked'
    summary: notify consumes evidence.revoked (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceRevoked/messages/EvidenceRevoked'
  receiveEvidenceRevokedBySearch:
    action: receive
    channel:
      $ref: '#/channels/evidenceRevoked'
    summary: search consumes evidence.revoked (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/evidenceRevoked/messages/EvidenceRevoked'
  publishCredentialIssued:
    action: send
    channel:
      $ref: '#/channels/credentialIssued'
    summary: evidence publishes credential.issued via transactional outbox
    messages:
    - $ref: '#/channels/credentialIssued/messages/CredentialIssued'
    x-consumers:
    - notify
  publishCredentialRevoked:
    action: send
    channel:
      $ref: '#/channels/credentialRevoked'
    summary: evidence publishes credential.revoked via transactional outbox
    messages:
    - $ref: '#/channels/credentialRevoked/messages/CredentialRevoked'
    x-consumers:
    - notify
    - search
  publishVerificationRequested:
    action: send
    channel:
      $ref: '#/channels/verificationRequested'
    summary: verification publishes verification.requested via transactional outbox
    messages:
    - $ref: '#/channels/verificationRequested/messages/VerificationRequested'
    x-consumers:
    - notify
    - admin
  publishVerificationCompleted:
    action: send
    channel:
      $ref: '#/channels/verificationCompleted'
    summary: verification publishes verification.completed via transactional outbox
    messages:
    - $ref: '#/channels/verificationCompleted/messages/VerificationCompleted'
    x-consumers:
    - evidence
    - notify
  receiveVerificationCompletedByEvidence:
    action: receive
    channel:
      $ref: '#/channels/verificationCompleted'
    summary: evidence consumes verification.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/verificationCompleted/messages/VerificationCompleted'
  receiveVerificationCompletedByNotify:
    action: receive
    channel:
      $ref: '#/channels/verificationCompleted'
    summary: notify consumes verification.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/verificationCompleted/messages/VerificationCompleted'
  publishReferenceRequested:
    action: send
    channel:
      $ref: '#/channels/referenceRequested'
    summary: verification publishes reference.requested via transactional outbox
    messages:
    - $ref: '#/channels/referenceRequested/messages/ReferenceRequested'
    x-consumers:
    - notify
  publishReferenceResponded:
    action: send
    channel:
      $ref: '#/channels/referenceResponded'
    summary: verification publishes reference.responded via transactional outbox
    messages:
    - $ref: '#/channels/referenceResponded/messages/ReferenceResponded'
    x-consumers:
    - verification
    - notify
  receiveReferenceRespondedByVerification:
    action: receive
    channel:
      $ref: '#/channels/referenceResponded'
    summary: verification consumes reference.responded (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/referenceResponded/messages/ReferenceResponded'
  receiveReferenceRespondedByNotify:
    action: receive
    channel:
      $ref: '#/channels/referenceResponded'
    summary: notify consumes reference.responded (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/referenceResponded/messages/ReferenceResponded'
  publishReferenceExpired:
    action: send
    channel:
      $ref: '#/channels/referenceExpired'
    summary: verification publishes reference.expired via transactional outbox
    messages:
    - $ref: '#/channels/referenceExpired/messages/ReferenceExpired'
    x-consumers:
    - evidence
    - notify
  publishWorkclaimEmployerEmailConfirmed:
    action: send
    channel:
      $ref: '#/channels/workclaimEmployerEmailConfirmed'
    summary: verification publishes workclaim.employer_email_confirmed via transactional outbox
    messages:
    - $ref: '#/channels/workclaimEmployerEmailConfirmed/messages/WorkclaimEmployerEmailConfirmed'
    x-consumers:
    - evidence
  publishVerificationDisputed:
    action: send
    channel:
      $ref: '#/channels/verificationDisputed'
    summary: verification publishes verification.disputed via transactional outbox
    messages:
    - $ref: '#/channels/verificationDisputed/messages/VerificationDisputed'
    x-consumers:
    - safety
    - evidence
  publishAttemptStarted:
    action: send
    channel:
      $ref: '#/channels/attemptStarted'
    summary: assessment publishes attempt.started via transactional outbox
    messages:
    - $ref: '#/channels/attemptStarted/messages/AttemptStarted'
    x-consumers:
    - analytics
    - ai
  publishAttemptSubmitted:
    action: send
    channel:
      $ref: '#/channels/attemptSubmitted'
    summary: assessment publishes attempt.submitted via transactional outbox
    messages:
    - $ref: '#/channels/attemptSubmitted/messages/AttemptSubmitted'
    x-consumers:
    - notify
  publishAssessmentPassed:
    action: send
    channel:
      $ref: '#/channels/assessmentPassed'
    summary: assessment publishes assessment.passed via transactional outbox
    messages:
    - $ref: '#/channels/assessmentPassed/messages/AssessmentPassed'
    x-consumers:
    - evidence
    - learning
    - notify
  receiveAssessmentPassedByEvidence:
    action: receive
    channel:
      $ref: '#/channels/assessmentPassed'
    summary: evidence consumes assessment.passed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/assessmentPassed/messages/AssessmentPassed'
  receiveAssessmentPassedByLearning:
    action: receive
    channel:
      $ref: '#/channels/assessmentPassed'
    summary: learning consumes assessment.passed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/assessmentPassed/messages/AssessmentPassed'
  receiveAssessmentPassedByNotify:
    action: receive
    channel:
      $ref: '#/channels/assessmentPassed'
    summary: notify consumes assessment.passed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/assessmentPassed/messages/AssessmentPassed'
  publishAssessmentFailed:
    action: send
    channel:
      $ref: '#/channels/assessmentFailed'
    summary: assessment publishes assessment.failed via transactional outbox
    messages:
    - $ref: '#/channels/assessmentFailed/messages/AssessmentFailed'
    x-consumers:
    - notify
  publishIntegrityFlagRaised:
    action: send
    channel:
      $ref: '#/channels/integrityFlagRaised'
    summary: assessment publishes integrity.flag.raised via transactional outbox
    messages:
    - $ref: '#/channels/integrityFlagRaised/messages/IntegrityFlagRaised'
    x-consumers:
    - safety
  publishIntegrityFlagReviewed:
    action: send
    channel:
      $ref: '#/channels/integrityFlagReviewed'
    summary: assessment publishes integrity.flag.reviewed via transactional outbox
    messages:
    - $ref: '#/channels/integrityFlagReviewed/messages/IntegrityFlagReviewed'
    x-consumers:
    - notify
  publishAttemptAppealed:
    action: send
    channel:
      $ref: '#/channels/attemptAppealed'
    summary: assessment publishes attempt.appealed via transactional outbox
    messages:
    - $ref: '#/channels/attemptAppealed/messages/AttemptAppealed'
    x-consumers:
    - safety
    - notify
  publishEnrollmentCreated:
    action: send
    channel:
      $ref: '#/channels/enrollmentCreated'
    summary: learning publishes enrollment.created via transactional outbox
    messages:
    - $ref: '#/channels/enrollmentCreated/messages/EnrollmentCreated'
    x-consumers:
    - analytics
    - notify
  publishCourseCompleted:
    action: send
    channel:
      $ref: '#/channels/courseCompleted'
    summary: learning publishes course.completed via transactional outbox
    messages:
    - $ref: '#/channels/courseCompleted/messages/CourseCompleted'
    x-consumers:
    - evidence
    - notify
    - careerintel
  receiveCourseCompletedByEvidence:
    action: receive
    channel:
      $ref: '#/channels/courseCompleted'
    summary: evidence consumes course.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/courseCompleted/messages/CourseCompleted'
  receiveCourseCompletedByNotify:
    action: receive
    channel:
      $ref: '#/channels/courseCompleted'
    summary: notify consumes course.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/courseCompleted/messages/CourseCompleted'
  receiveCourseCompletedByCareerintel:
    action: receive
    channel:
      $ref: '#/channels/courseCompleted'
    summary: careerintel consumes course.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/courseCompleted/messages/CourseCompleted'
  publishCoursePublished:
    action: send
    channel:
      $ref: '#/channels/coursePublished'
    summary: learning publishes course.published via transactional outbox
    messages:
    - $ref: '#/channels/coursePublished/messages/CoursePublished'
    x-consumers:
    - search
  publishJobPublished:
    action: send
    channel:
      $ref: '#/channels/jobPublished'
    summary: jobs publishes job.published via transactional outbox
    messages:
    - $ref: '#/channels/jobPublished/messages/JobPublished'
    x-consumers:
    - search
    - matching
    - notify
    - applications
  receiveJobPublishedBySearch:
    action: receive
    channel:
      $ref: '#/channels/jobPublished'
    summary: search consumes job.published (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobPublished/messages/JobPublished'
  receiveJobPublishedByMatching:
    action: receive
    channel:
      $ref: '#/channels/jobPublished'
    summary: matching consumes job.published (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobPublished/messages/JobPublished'
  receiveJobPublishedByNotify:
    action: receive
    channel:
      $ref: '#/channels/jobPublished'
    summary: notify consumes job.published (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobPublished/messages/JobPublished'
  receiveJobPublishedByApplications:
    action: receive
    channel:
      $ref: '#/channels/jobPublished'
    summary: applications consumes job.published (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobPublished/messages/JobPublished'
  publishJobUpdated:
    action: send
    channel:
      $ref: '#/channels/jobUpdated'
    summary: jobs publishes job.updated via transactional outbox
    messages:
    - $ref: '#/channels/jobUpdated/messages/JobUpdated'
    x-consumers:
    - search
    - matching
  publishJobClosed:
    action: send
    channel:
      $ref: '#/channels/jobClosed'
    summary: jobs publishes job.closed via transactional outbox
    messages:
    - $ref: '#/channels/jobClosed/messages/JobClosed'
    x-consumers:
    - applications
    - search
    - matching
    - notify
  receiveJobClosedByApplications:
    action: receive
    channel:
      $ref: '#/channels/jobClosed'
    summary: applications consumes job.closed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobClosed/messages/JobClosed'
  receiveJobClosedBySearch:
    action: receive
    channel:
      $ref: '#/channels/jobClosed'
    summary: search consumes job.closed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobClosed/messages/JobClosed'
  receiveJobClosedByMatching:
    action: receive
    channel:
      $ref: '#/channels/jobClosed'
    summary: matching consumes job.closed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobClosed/messages/JobClosed'
  receiveJobClosedByNotify:
    action: receive
    channel:
      $ref: '#/channels/jobClosed'
    summary: notify consumes job.closed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/jobClosed/messages/JobClosed'
  publishJobExpired:
    action: send
    channel:
      $ref: '#/channels/jobExpired'
    summary: jobs publishes job.expired via transactional outbox
    messages:
    - $ref: '#/channels/jobExpired/messages/JobExpired'
    x-consumers:
    - search
    - notify
  publishApplicationSubmitted:
    action: send
    channel:
      $ref: '#/channels/applicationSubmitted'
    summary: applications publishes application.submitted via transactional outbox
    messages:
    - $ref: '#/channels/applicationSubmitted/messages/ApplicationSubmitted'
    x-consumers:
    - notify
    - matching
    - analytics
    - messaging
  receiveApplicationSubmittedByNotify:
    action: receive
    channel:
      $ref: '#/channels/applicationSubmitted'
    summary: notify consumes application.submitted (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationSubmitted/messages/ApplicationSubmitted'
  receiveApplicationSubmittedByMatching:
    action: receive
    channel:
      $ref: '#/channels/applicationSubmitted'
    summary: matching consumes application.submitted (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationSubmitted/messages/ApplicationSubmitted'
  receiveApplicationSubmittedByAnalytics:
    action: receive
    channel:
      $ref: '#/channels/applicationSubmitted'
    summary: analytics consumes application.submitted (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationSubmitted/messages/ApplicationSubmitted'
  receiveApplicationSubmittedByMessaging:
    action: receive
    channel:
      $ref: '#/channels/applicationSubmitted'
    summary: messaging consumes application.submitted (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationSubmitted/messages/ApplicationSubmitted'
  publishApplicationWithdrawn:
    action: send
    channel:
      $ref: '#/channels/applicationWithdrawn'
    summary: applications publishes application.withdrawn via transactional outbox
    messages:
    - $ref: '#/channels/applicationWithdrawn/messages/ApplicationWithdrawn'
    x-consumers:
    - notify
    - analytics
    - messaging
  publishApplicationStageChanged:
    action: send
    channel:
      $ref: '#/channels/applicationStageChanged'
    summary: applications publishes application.stage.changed via transactional outbox
    messages:
    - $ref: '#/channels/applicationStageChanged/messages/ApplicationStageChanged'
    x-consumers:
    - notify
    - analytics
    - messaging
  receiveApplicationStageChangedByNotify:
    action: receive
    channel:
      $ref: '#/channels/applicationStageChanged'
    summary: notify consumes application.stage.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationStageChanged/messages/ApplicationStageChanged'
  receiveApplicationStageChangedByAnalytics:
    action: receive
    channel:
      $ref: '#/channels/applicationStageChanged'
    summary: analytics consumes application.stage.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationStageChanged/messages/ApplicationStageChanged'
  receiveApplicationStageChangedByMessaging:
    action: receive
    channel:
      $ref: '#/channels/applicationStageChanged'
    summary: messaging consumes application.stage.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/applicationStageChanged/messages/ApplicationStageChanged'
  publishInterviewScheduled:
    action: send
    channel:
      $ref: '#/channels/interviewScheduled'
    summary: applications publishes interview.scheduled via transactional outbox
    messages:
    - $ref: '#/channels/interviewScheduled/messages/InterviewScheduled'
    x-consumers:
    - notify
    - messaging
  publishInterviewCompleted:
    action: send
    channel:
      $ref: '#/channels/interviewCompleted'
    summary: applications publishes interview.completed via transactional outbox
    messages:
    - $ref: '#/channels/interviewCompleted/messages/InterviewCompleted'
    x-consumers:
    - notify
  publishConversationCreated:
    action: send
    channel:
      $ref: '#/channels/conversationCreated'
    summary: messaging publishes conversation.created via transactional outbox
    messages:
    - $ref: '#/channels/conversationCreated/messages/ConversationCreated'
    x-consumers:
    - notify
  publishMessageSent:
    action: send
    channel:
      $ref: '#/channels/messageSent'
    summary: messaging publishes message.sent via transactional outbox
    messages:
    - $ref: '#/channels/messageSent/messages/MessageSent'
    x-consumers:
    - notify
    - safety
    - analytics
  publishNotificationEmailBounced:
    action: send
    channel:
      $ref: '#/channels/notificationEmailBounced'
    summary: notify publishes notification.email.bounced via transactional outbox
    messages:
    - $ref: '#/channels/notificationEmailBounced/messages/NotificationEmailBounced'
    x-consumers:
    - identity
    - notify
  publishNotificationDelivered:
    action: send
    channel:
      $ref: '#/channels/notificationDelivered'
    summary: notify publishes notification.delivered via transactional outbox
    messages:
    - $ref: '#/channels/notificationDelivered/messages/NotificationDelivered'
    x-consumers:
    - analytics
  publishSubscriptionChanged:
    action: send
    channel:
      $ref: '#/channels/subscriptionChanged'
    summary: billing publishes subscription.changed via transactional outbox
    messages:
    - $ref: '#/channels/subscriptionChanged/messages/SubscriptionChanged'
    x-consumers:
    - notify
    - orgs
  publishEntitlementChanged:
    action: send
    channel:
      $ref: '#/channels/entitlementChanged'
    summary: billing publishes entitlement.changed via transactional outbox
    messages:
    - $ref: '#/channels/entitlementChanged/messages/EntitlementChanged'
    x-consumers:
    - jobs
    - search
    - ai
    - notify
  receiveEntitlementChangedByJobs:
    action: receive
    channel:
      $ref: '#/channels/entitlementChanged'
    summary: jobs consumes entitlement.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/entitlementChanged/messages/EntitlementChanged'
  receiveEntitlementChangedBySearch:
    action: receive
    channel:
      $ref: '#/channels/entitlementChanged'
    summary: search consumes entitlement.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/entitlementChanged/messages/EntitlementChanged'
  receiveEntitlementChangedByAi:
    action: receive
    channel:
      $ref: '#/channels/entitlementChanged'
    summary: ai consumes entitlement.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/entitlementChanged/messages/EntitlementChanged'
  receiveEntitlementChangedByNotify:
    action: receive
    channel:
      $ref: '#/channels/entitlementChanged'
    summary: notify consumes entitlement.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/entitlementChanged/messages/EntitlementChanged'
  publishPaymentFailed:
    action: send
    channel:
      $ref: '#/channels/paymentFailed'
    summary: billing publishes payment.failed via transactional outbox
    messages:
    - $ref: '#/channels/paymentFailed/messages/PaymentFailed'
    x-consumers:
    - notify
  publishInvoicePaid:
    action: send
    channel:
      $ref: '#/channels/invoicePaid'
    summary: billing publishes invoice.paid via transactional outbox
    messages:
    - $ref: '#/channels/invoicePaid/messages/InvoicePaid'
    x-consumers:
    - notify
  publishAiRequestCompleted:
    action: send
    channel:
      $ref: '#/channels/aiRequestCompleted'
    summary: ai publishes ai.request.completed via transactional outbox
    messages:
    - $ref: '#/channels/aiRequestCompleted/messages/AiRequestCompleted'
    x-consumers:
    - billing
    - analytics
  publishAiBudgetExceeded:
    action: send
    channel:
      $ref: '#/channels/aiBudgetExceeded'
    summary: ai publishes ai.budget.exceeded via transactional outbox
    messages:
    - $ref: '#/channels/aiBudgetExceeded/messages/AiBudgetExceeded'
    x-consumers:
    - notify
  publishCredentialIssuedByInstitution:
    action: send
    channel:
      $ref: '#/channels/credentialIssuedByInstitution'
    summary: institutions publishes credential.issued_by_institution via transactional outbox
    messages:
    - $ref: '#/channels/credentialIssuedByInstitution/messages/CredentialIssuedByInstitution'
    x-consumers:
    - evidence
    - notify
  publishReportFiled:
    action: send
    channel:
      $ref: '#/channels/reportFiled'
    summary: safety publishes report.filed via transactional outbox
    messages:
    - $ref: '#/channels/reportFiled/messages/ReportFiled'
    x-consumers:
    - safety
  publishCaseResolved:
    action: send
    channel:
      $ref: '#/channels/caseResolved'
    summary: safety publishes case.resolved via transactional outbox
    messages:
    - $ref: '#/channels/caseResolved/messages/CaseResolved'
    x-consumers:
    - notify
    - profile
    - jobs
    - messaging
  publishSupportAccessGranted:
    action: send
    channel:
      $ref: '#/channels/supportAccessGranted'
    summary: admin publishes support_access.granted via transactional outbox
    messages:
    - $ref: '#/channels/supportAccessGranted/messages/SupportAccessGranted'
    x-consumers:
    - audit
    - notify
  publishSupportAccessExpired:
    action: send
    channel:
      $ref: '#/channels/supportAccessExpired'
    summary: admin publishes support_access.expired via transactional outbox
    messages:
    - $ref: '#/channels/supportAccessExpired/messages/SupportAccessExpired'
    x-consumers:
    - audit
  publishFeatureFlagChanged:
    action: send
    channel:
      $ref: '#/channels/featureFlagChanged'
    summary: admin publishes feature_flag.changed via transactional outbox
    messages:
    - $ref: '#/channels/featureFlagChanged/messages/FeatureFlagChanged'
    x-consumers:
    - audit
  publishConsentChanged:
    action: send
    channel:
      $ref: '#/channels/consentChanged'
    summary: privacy publishes consent.changed via transactional outbox
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
    x-consumers:
    - search
    - matching
    - applications
    - ai
    - analytics
    - notify
  receiveConsentChangedBySearch:
    action: receive
    channel:
      $ref: '#/channels/consentChanged'
    summary: search consumes consent.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
  receiveConsentChangedByMatching:
    action: receive
    channel:
      $ref: '#/channels/consentChanged'
    summary: matching consumes consent.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
  receiveConsentChangedByApplications:
    action: receive
    channel:
      $ref: '#/channels/consentChanged'
    summary: applications consumes consent.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
  receiveConsentChangedByAi:
    action: receive
    channel:
      $ref: '#/channels/consentChanged'
    summary: ai consumes consent.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
  receiveConsentChangedByAnalytics:
    action: receive
    channel:
      $ref: '#/channels/consentChanged'
    summary: analytics consumes consent.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
  receiveConsentChangedByNotify:
    action: receive
    channel:
      $ref: '#/channels/consentChanged'
    summary: notify consumes consent.changed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/consentChanged/messages/ConsentChanged'
  publishDataexportReady:
    action: send
    channel:
      $ref: '#/channels/dataexportReady'
    summary: privacy publishes dataexport.ready via transactional outbox
    messages:
    - $ref: '#/channels/dataexportReady/messages/DataexportReady'
    x-consumers:
    - notify
  publishErasureRequested:
    action: send
    channel:
      $ref: '#/channels/erasureRequested'
    summary: privacy publishes erasure.requested via transactional outbox
    messages:
    - $ref: '#/channels/erasureRequested/messages/ErasureRequested'
    x-consumers:
    - identity
    - profile
    - evidence
    - verification
    - assessment
    - learning
    - applications
    - messaging
    - notify
    - billing
    - ai
    - analytics
    - search
    - matching
    - platform
  publishErasureModuleCompleted:
    action: send
    channel:
      $ref: '#/channels/erasureModuleCompleted'
    summary: each-module publishes erasure.module_completed via transactional outbox
    messages:
    - $ref: '#/channels/erasureModuleCompleted/messages/ErasureModuleCompleted'
    x-consumers:
    - privacy
  publishErasureCompleted:
    action: send
    channel:
      $ref: '#/channels/erasureCompleted'
    summary: privacy publishes erasure.completed via transactional outbox
    messages:
    - $ref: '#/channels/erasureCompleted/messages/ErasureCompleted'
    x-consumers:
    - notify
    - audit
  receiveErasureCompletedByNotify:
    action: receive
    channel:
      $ref: '#/channels/erasureCompleted'
    summary: notify consumes erasure.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/erasureCompleted/messages/ErasureCompleted'
  receiveErasureCompletedByAudit:
    action: receive
    channel:
      $ref: '#/channels/erasureCompleted'
    summary: audit consumes erasure.completed (idempotent via consumer_inbox)
    messages:
    - $ref: '#/channels/erasureCompleted/messages/ErasureCompleted'
  publishImportCompleted:
    action: send
    channel:
      $ref: '#/channels/importCompleted'
    summary: integrations publishes import.completed via transactional outbox
    messages:
    - $ref: '#/channels/importCompleted/messages/ImportCompleted'
    x-consumers:
    - notify
  publishFileScanned:
    action: send
    channel:
      $ref: '#/channels/fileScanned'
    summary: platform publishes file.scanned via transactional outbox
    messages:
    - $ref: '#/channels/fileScanned/messages/FileScanned'
    x-consumers:
    - evidence
    - profile
    - learning
  publishJobDeadLettered:
    action: send
    channel:
      $ref: '#/channels/jobDeadLettered'
    summary: platform publishes job.dead_lettered via transactional outbox
    messages:
    - $ref: '#/channels/jobDeadLettered/messages/JobDeadLettered'
    x-consumers:
    - admin
components:
  messages:
    AccountRegistered:
      name: account.registered
      title: EVT-01-01 account.registered
      contentType: application/json
      summary: account.registered v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: account.registered
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AccountRegisteredData'
      x-event-id: EVT-01-01
      x-core: true
      x-delivery-class: EC-STD
    AccountEmailVerified:
      name: account.email_verified
      title: EVT-01-02 account.email_verified
      contentType: application/json
      summary: account.email_verified v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: account.email_verified
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AccountEmailVerifiedData'
      x-event-id: EVT-01-02
      x-core: false
      x-delivery-class: EC-STD
    SessionRevoked:
      name: session.revoked
      title: EVT-01-03 session.revoked
      contentType: application/json
      summary: session.revoked v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: session.revoked
            version:
              const: 1
            data:
              $ref: '#/components/schemas/SessionRevokedData'
      x-event-id: EVT-01-03
      x-core: false
      x-delivery-class: EC-STD
    PasswordChanged:
      name: password.changed
      title: EVT-01-04 password.changed
      contentType: application/json
      summary: password.changed v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: password.changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/PasswordChangedData'
      x-event-id: EVT-01-04
      x-core: false
      x-delivery-class: EC-STD
    PasskeyRegistered:
      name: passkey.registered
      title: EVT-01-05 passkey.registered
      contentType: application/json
      summary: passkey.registered v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: passkey.registered
            version:
              const: 1
            data:
              $ref: '#/components/schemas/PasskeyRegisteredData'
      x-event-id: EVT-01-05
      x-core: false
      x-delivery-class: EC-STD
    AccountLocked:
      name: account.locked
      title: EVT-01-06 account.locked
      contentType: application/json
      summary: account.locked v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: account.locked
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AccountLockedData'
      x-event-id: EVT-01-06
      x-core: false
      x-delivery-class: EC-STD
    AccountDeactivated:
      name: account.deactivated
      title: EVT-01-07 account.deactivated
      contentType: application/json
      summary: account.deactivated v1 produced by identity
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: account.deactivated
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AccountDeactivatedData'
      x-event-id: EVT-01-07
      x-core: false
      x-delivery-class: EC-STD
    OrgCreated:
      name: org.created
      title: EVT-02-01 org.created
      contentType: application/json
      summary: org.created v1 produced by orgs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: org.created
            version:
              const: 1
            data:
              $ref: '#/components/schemas/OrgCreatedData'
      x-event-id: EVT-02-01
      x-core: false
      x-delivery-class: EC-ORD
    OrgMemberAdded:
      name: org.member.added
      title: EVT-02-02 org.member.added
      contentType: application/json
      summary: org.member.added v1 produced by orgs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: org.member.added
            version:
              const: 1
            data:
              $ref: '#/components/schemas/OrgMemberAddedData'
      x-event-id: EVT-02-02
      x-core: false
      x-delivery-class: EC-ORD
    OrgMemberRoleChanged:
      name: org.member.role_changed
      title: EVT-02-03 org.member.role_changed
      contentType: application/json
      summary: org.member.role_changed v1 produced by orgs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: org.member.role_changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/OrgMemberRoleChangedData'
      x-event-id: EVT-02-03
      x-core: false
      x-delivery-class: EC-ORD
    OrgMemberRemoved:
      name: org.member.removed
      title: EVT-02-04 org.member.removed
      contentType: application/json
      summary: org.member.removed v1 produced by orgs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: org.member.removed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/OrgMemberRemovedData'
      x-event-id: EVT-02-04
      x-core: false
      x-delivery-class: EC-ORD
    OrgSsoConfigured:
      name: org.sso.configured
      title: EVT-02-05 org.sso.configured
      contentType: application/json
      summary: org.sso.configured v1 produced by orgs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: org.sso.configured
            version:
              const: 1
            data:
              $ref: '#/components/schemas/OrgSsoConfiguredData'
      x-event-id: EVT-02-05
      x-core: false
      x-delivery-class: EC-ORD
    ProfileUpdated:
      name: profile.updated
      title: EVT-03-01 profile.updated
      contentType: application/json
      summary: profile.updated v1 produced by profile
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: profile.updated
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ProfileUpdatedData'
      x-event-id: EVT-03-01
      x-core: false
      x-delivery-class: EC-ORD
    ProfileVisibilityChanged:
      name: profile.visibility_changed
      title: EVT-03-02 profile.visibility_changed
      contentType: application/json
      summary: profile.visibility_changed v1 produced by profile
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: profile.visibility_changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ProfileVisibilityChangedData'
      x-event-id: EVT-03-02
      x-core: false
      x-delivery-class: EC-ORD
    SkillCreated:
      name: skill.created
      title: EVT-04-01 skill.created
      contentType: application/json
      summary: skill.created v1 produced by skills
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: skill.created
            version:
              const: 1
            data:
              $ref: '#/components/schemas/SkillCreatedData'
      x-event-id: EVT-04-01
      x-core: false
      x-delivery-class: EC-ORD
    SkillMerged:
      name: skill.merged
      title: EVT-04-02 skill.merged
      contentType: application/json
      summary: skill.merged v1 produced by skills
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: skill.merged
            version:
              const: 1
            data:
              $ref: '#/components/schemas/SkillMergedData'
      x-event-id: EVT-04-02
      x-core: false
      x-delivery-class: EC-ORD
    EvidenceCreated:
      name: evidence.created
      title: EVT-05-01 evidence.created
      contentType: application/json
      summary: evidence.created v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: evidence.created
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EvidenceCreatedData'
      x-event-id: EVT-05-01
      x-core: true
      x-delivery-class: EC-ORD
    EvidenceUpdated:
      name: evidence.updated
      title: EVT-05-02 evidence.updated
      contentType: application/json
      summary: evidence.updated v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: evidence.updated
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EvidenceUpdatedData'
      x-event-id: EVT-05-02
      x-core: false
      x-delivery-class: EC-ORD
    EvidenceArtifactScanned:
      name: evidence.artifact.scanned
      title: EVT-05-03 evidence.artifact.scanned
      contentType: application/json
      summary: evidence.artifact.scanned v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: evidence.artifact.scanned
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EvidenceArtifactScannedData'
      x-event-id: EVT-05-03
      x-core: false
      x-delivery-class: EC-ORD
    EvidenceVerificationRequested:
      name: evidence.verification_requested
      title: EVT-05-04 evidence.verification_requested
      contentType: application/json
      summary: evidence.verification_requested v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: evidence.verification_requested
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EvidenceVerificationRequestedData'
      x-event-id: EVT-05-04
      x-core: false
      x-delivery-class: EC-ORD
    EvidenceVerified:
      name: evidence.verified
      title: EVT-05-05 evidence.verified
      contentType: application/json
      summary: evidence.verified v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: evidence.verified
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EvidenceVerifiedData'
      x-event-id: EVT-05-05
      x-core: true
      x-delivery-class: EC-ORD
    EvidenceRevoked:
      name: evidence.revoked
      title: EVT-05-06 evidence.revoked
      contentType: application/json
      summary: evidence.revoked v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: evidence.revoked
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EvidenceRevokedData'
      x-event-id: EVT-05-06
      x-core: true
      x-delivery-class: EC-ORD+EC-CRIT
    CredentialIssued:
      name: credential.issued
      title: EVT-05-07 credential.issued
      contentType: application/json
      summary: credential.issued v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: credential.issued
            version:
              const: 1
            data:
              $ref: '#/components/schemas/CredentialIssuedData'
      x-event-id: EVT-05-07
      x-core: false
      x-delivery-class: EC-STD
    CredentialRevoked:
      name: credential.revoked
      title: EVT-05-08 credential.revoked
      contentType: application/json
      summary: credential.revoked v1 produced by evidence
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: credential.revoked
            version:
              const: 1
            data:
              $ref: '#/components/schemas/CredentialRevokedData'
      x-event-id: EVT-05-08
      x-core: false
      x-delivery-class: EC-STD
    VerificationRequested:
      name: verification.requested
      title: EVT-06-01 verification.requested
      contentType: application/json
      summary: verification.requested v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: verification.requested
            version:
              const: 1
            data:
              $ref: '#/components/schemas/VerificationRequestedData'
      x-event-id: EVT-06-01
      x-core: false
      x-delivery-class: EC-STD
    VerificationCompleted:
      name: verification.completed
      title: EVT-06-02 verification.completed
      contentType: application/json
      summary: verification.completed v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: verification.completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/VerificationCompletedData'
      x-event-id: EVT-06-02
      x-core: true
      x-delivery-class: EC-CRIT
    ReferenceRequested:
      name: reference.requested
      title: EVT-06-03 reference.requested
      contentType: application/json
      summary: reference.requested v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: reference.requested
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ReferenceRequestedData'
      x-event-id: EVT-06-03
      x-core: false
      x-delivery-class: EC-STD
    ReferenceResponded:
      name: reference.responded
      title: EVT-06-04 reference.responded
      contentType: application/json
      summary: reference.responded v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: reference.responded
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ReferenceRespondedData'
      x-event-id: EVT-06-04
      x-core: true
      x-delivery-class: EC-STD
    ReferenceExpired:
      name: reference.expired
      title: EVT-06-05 reference.expired
      contentType: application/json
      summary: reference.expired v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: reference.expired
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ReferenceExpiredData'
      x-event-id: EVT-06-05
      x-core: false
      x-delivery-class: EC-STD
    WorkclaimEmployerEmailConfirmed:
      name: workclaim.employer_email_confirmed
      title: EVT-06-06 workclaim.employer_email_confirmed
      contentType: application/json
      summary: workclaim.employer_email_confirmed v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: workclaim.employer_email_confirmed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/WorkclaimEmployerEmailConfirmedData'
      x-event-id: EVT-06-06
      x-core: false
      x-delivery-class: EC-STD
    VerificationDisputed:
      name: verification.disputed
      title: EVT-06-07 verification.disputed
      contentType: application/json
      summary: verification.disputed v1 produced by verification
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: verification.disputed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/VerificationDisputedData'
      x-event-id: EVT-06-07
      x-core: false
      x-delivery-class: EC-STD
    AttemptStarted:
      name: attempt.started
      title: EVT-07-01 attempt.started
      contentType: application/json
      summary: attempt.started v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: attempt.started
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AttemptStartedData'
      x-event-id: EVT-07-01
      x-core: false
      x-delivery-class: EC-STD
    AttemptSubmitted:
      name: attempt.submitted
      title: EVT-07-02 attempt.submitted
      contentType: application/json
      summary: attempt.submitted v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: attempt.submitted
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AttemptSubmittedData'
      x-event-id: EVT-07-02
      x-core: false
      x-delivery-class: EC-STD
    AssessmentPassed:
      name: assessment.passed
      title: EVT-07-03 assessment.passed
      contentType: application/json
      summary: assessment.passed v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: assessment.passed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AssessmentPassedData'
      x-event-id: EVT-07-03
      x-core: true
      x-delivery-class: EC-CRIT
    AssessmentFailed:
      name: assessment.failed
      title: EVT-07-04 assessment.failed
      contentType: application/json
      summary: assessment.failed v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: assessment.failed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AssessmentFailedData'
      x-event-id: EVT-07-04
      x-core: false
      x-delivery-class: EC-STD
    IntegrityFlagRaised:
      name: integrity.flag.raised
      title: EVT-07-05 integrity.flag.raised
      contentType: application/json
      summary: integrity.flag.raised v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: integrity.flag.raised
            version:
              const: 1
            data:
              $ref: '#/components/schemas/IntegrityFlagRaisedData'
      x-event-id: EVT-07-05
      x-core: false
      x-delivery-class: EC-STD
    IntegrityFlagReviewed:
      name: integrity.flag.reviewed
      title: EVT-07-06 integrity.flag.reviewed
      contentType: application/json
      summary: integrity.flag.reviewed v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: integrity.flag.reviewed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/IntegrityFlagReviewedData'
      x-event-id: EVT-07-06
      x-core: false
      x-delivery-class: EC-STD
    AttemptAppealed:
      name: attempt.appealed
      title: EVT-07-07 attempt.appealed
      contentType: application/json
      summary: attempt.appealed v1 produced by assessment
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: attempt.appealed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AttemptAppealedData'
      x-event-id: EVT-07-07
      x-core: false
      x-delivery-class: EC-STD
    EnrollmentCreated:
      name: enrollment.created
      title: EVT-08-01 enrollment.created
      contentType: application/json
      summary: enrollment.created v1 produced by learning
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: enrollment.created
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EnrollmentCreatedData'
      x-event-id: EVT-08-01
      x-core: false
      x-delivery-class: EC-STD
    CourseCompleted:
      name: course.completed
      title: EVT-08-02 course.completed
      contentType: application/json
      summary: course.completed v1 produced by learning
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: course.completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/CourseCompletedData'
      x-event-id: EVT-08-02
      x-core: true
      x-delivery-class: EC-STD
    CoursePublished:
      name: course.published
      title: EVT-08-03 course.published
      contentType: application/json
      summary: course.published v1 produced by learning
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: course.published
            version:
              const: 1
            data:
              $ref: '#/components/schemas/CoursePublishedData'
      x-event-id: EVT-08-03
      x-core: false
      x-delivery-class: EC-STD
    JobPublished:
      name: job.published
      title: EVT-09-01 job.published
      contentType: application/json
      summary: job.published v1 produced by jobs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: job.published
            version:
              const: 1
            data:
              $ref: '#/components/schemas/JobPublishedData'
      x-event-id: EVT-09-01
      x-core: true
      x-delivery-class: EC-ORD
    JobUpdated:
      name: job.updated
      title: EVT-09-02 job.updated
      contentType: application/json
      summary: job.updated v1 produced by jobs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: job.updated
            version:
              const: 1
            data:
              $ref: '#/components/schemas/JobUpdatedData'
      x-event-id: EVT-09-02
      x-core: false
      x-delivery-class: EC-ORD
    JobClosed:
      name: job.closed
      title: EVT-09-03 job.closed
      contentType: application/json
      summary: job.closed v1 produced by jobs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: job.closed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/JobClosedData'
      x-event-id: EVT-09-03
      x-core: true
      x-delivery-class: EC-ORD
    JobExpired:
      name: job.expired
      title: EVT-09-04 job.expired
      contentType: application/json
      summary: job.expired v1 produced by jobs
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: job.expired
            version:
              const: 1
            data:
              $ref: '#/components/schemas/JobExpiredData'
      x-event-id: EVT-09-04
      x-core: false
      x-delivery-class: EC-ORD
    ApplicationSubmitted:
      name: application.submitted
      title: EVT-10-01 application.submitted
      contentType: application/json
      summary: application.submitted v1 produced by applications
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: application.submitted
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ApplicationSubmittedData'
      x-event-id: EVT-10-01
      x-core: true
      x-delivery-class: EC-ORD
    ApplicationWithdrawn:
      name: application.withdrawn
      title: EVT-10-02 application.withdrawn
      contentType: application/json
      summary: application.withdrawn v1 produced by applications
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: application.withdrawn
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ApplicationWithdrawnData'
      x-event-id: EVT-10-02
      x-core: false
      x-delivery-class: EC-ORD
    ApplicationStageChanged:
      name: application.stage.changed
      title: EVT-10-03 application.stage.changed
      contentType: application/json
      summary: application.stage.changed v1 produced by applications
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: application.stage.changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ApplicationStageChangedData'
      x-event-id: EVT-10-03
      x-core: true
      x-delivery-class: EC-ORD
    InterviewScheduled:
      name: interview.scheduled
      title: EVT-10-04 interview.scheduled
      contentType: application/json
      summary: interview.scheduled v1 produced by applications
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: interview.scheduled
            version:
              const: 1
            data:
              $ref: '#/components/schemas/InterviewScheduledData'
      x-event-id: EVT-10-04
      x-core: false
      x-delivery-class: EC-STD
    InterviewCompleted:
      name: interview.completed
      title: EVT-10-05 interview.completed
      contentType: application/json
      summary: interview.completed v1 produced by applications
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: interview.completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/InterviewCompletedData'
      x-event-id: EVT-10-05
      x-core: false
      x-delivery-class: EC-STD
    ConversationCreated:
      name: conversation.created
      title: EVT-13-01 conversation.created
      contentType: application/json
      summary: conversation.created v1 produced by messaging
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: conversation.created
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ConversationCreatedData'
      x-event-id: EVT-13-01
      x-core: false
      x-delivery-class: EC-STD
    MessageSent:
      name: message.sent
      title: EVT-13-02 message.sent
      contentType: application/json
      summary: message.sent v1 produced by messaging
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: message.sent
            version:
              const: 1
            data:
              $ref: '#/components/schemas/MessageSentData'
      x-event-id: EVT-13-02
      x-core: false
      x-delivery-class: EC-STD
    NotificationEmailBounced:
      name: notification.email.bounced
      title: EVT-15-01 notification.email.bounced
      contentType: application/json
      summary: notification.email.bounced v1 produced by notify
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: notification.email.bounced
            version:
              const: 1
            data:
              $ref: '#/components/schemas/NotificationEmailBouncedData'
      x-event-id: EVT-15-01
      x-core: false
      x-delivery-class: EC-STD
    NotificationDelivered:
      name: notification.delivered
      title: EVT-15-02 notification.delivered
      contentType: application/json
      summary: notification.delivered v1 produced by notify
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: notification.delivered
            version:
              const: 1
            data:
              $ref: '#/components/schemas/NotificationDeliveredData'
      x-event-id: EVT-15-02
      x-core: false
      x-delivery-class: EC-STD
    SubscriptionChanged:
      name: subscription.changed
      title: EVT-16-01 subscription.changed
      contentType: application/json
      summary: subscription.changed v1 produced by billing
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: subscription.changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/SubscriptionChangedData'
      x-event-id: EVT-16-01
      x-core: false
      x-delivery-class: EC-ORD+EC-CRIT
    EntitlementChanged:
      name: entitlement.changed
      title: EVT-16-02 entitlement.changed
      contentType: application/json
      summary: entitlement.changed v1 produced by billing
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: entitlement.changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/EntitlementChangedData'
      x-event-id: EVT-16-02
      x-core: true
      x-delivery-class: EC-ORD+EC-CRIT
    PaymentFailed:
      name: payment.failed
      title: EVT-16-03 payment.failed
      contentType: application/json
      summary: payment.failed v1 produced by billing
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: payment.failed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/PaymentFailedData'
      x-event-id: EVT-16-03
      x-core: false
      x-delivery-class: EC-STD
    InvoicePaid:
      name: invoice.paid
      title: EVT-16-04 invoice.paid
      contentType: application/json
      summary: invoice.paid v1 produced by billing
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: invoice.paid
            version:
              const: 1
            data:
              $ref: '#/components/schemas/InvoicePaidData'
      x-event-id: EVT-16-04
      x-core: false
      x-delivery-class: EC-STD
    AiRequestCompleted:
      name: ai.request.completed
      title: EVT-17-01 ai.request.completed
      contentType: application/json
      summary: ai.request.completed v1 produced by ai
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: ai.request.completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AiRequestCompletedData'
      x-event-id: EVT-17-01
      x-core: false
      x-delivery-class: EC-STD
    AiBudgetExceeded:
      name: ai.budget.exceeded
      title: EVT-17-02 ai.budget.exceeded
      contentType: application/json
      summary: ai.budget.exceeded v1 produced by ai
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: ai.budget.exceeded
            version:
              const: 1
            data:
              $ref: '#/components/schemas/AiBudgetExceededData'
      x-event-id: EVT-17-02
      x-core: false
      x-delivery-class: EC-STD
    CredentialIssuedByInstitution:
      name: credential.issued_by_institution
      title: EVT-18-01 credential.issued_by_institution
      contentType: application/json
      summary: credential.issued_by_institution v1 produced by institutions
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: credential.issued_by_institution
            version:
              const: 1
            data:
              $ref: '#/components/schemas/CredentialIssuedByInstitutionData'
      x-event-id: EVT-18-01
      x-core: false
      x-delivery-class: EC-STD
    ReportFiled:
      name: report.filed
      title: EVT-19-01 report.filed
      contentType: application/json
      summary: report.filed v1 produced by safety
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: report.filed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ReportFiledData'
      x-event-id: EVT-19-01
      x-core: false
      x-delivery-class: EC-STD
    CaseResolved:
      name: case.resolved
      title: EVT-19-02 case.resolved
      contentType: application/json
      summary: case.resolved v1 produced by safety
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: case.resolved
            version:
              const: 1
            data:
              $ref: '#/components/schemas/CaseResolvedData'
      x-event-id: EVT-19-02
      x-core: false
      x-delivery-class: EC-STD
    SupportAccessGranted:
      name: support_access.granted
      title: EVT-20-01 support_access.granted
      contentType: application/json
      summary: support_access.granted v1 produced by admin
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: support_access.granted
            version:
              const: 1
            data:
              $ref: '#/components/schemas/SupportAccessGrantedData'
      x-event-id: EVT-20-01
      x-core: false
      x-delivery-class: EC-STD
    SupportAccessExpired:
      name: support_access.expired
      title: EVT-20-02 support_access.expired
      contentType: application/json
      summary: support_access.expired v1 produced by admin
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: support_access.expired
            version:
              const: 1
            data:
              $ref: '#/components/schemas/SupportAccessExpiredData'
      x-event-id: EVT-20-02
      x-core: false
      x-delivery-class: EC-STD
    FeatureFlagChanged:
      name: feature_flag.changed
      title: EVT-20-03 feature_flag.changed
      contentType: application/json
      summary: feature_flag.changed v1 produced by admin
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: feature_flag.changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/FeatureFlagChangedData'
      x-event-id: EVT-20-03
      x-core: false
      x-delivery-class: EC-STD
    ConsentChanged:
      name: consent.changed
      title: EVT-22-01 consent.changed
      contentType: application/json
      summary: consent.changed v1 produced by privacy
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: consent.changed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ConsentChangedData'
      x-event-id: EVT-22-01
      x-core: true
      x-delivery-class: EC-ORD
    DataexportReady:
      name: dataexport.ready
      title: EVT-22-02 dataexport.ready
      contentType: application/json
      summary: dataexport.ready v1 produced by privacy
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: dataexport.ready
            version:
              const: 1
            data:
              $ref: '#/components/schemas/DataexportReadyData'
      x-event-id: EVT-22-02
      x-core: false
      x-delivery-class: EC-STD
    ErasureRequested:
      name: erasure.requested
      title: EVT-22-03 erasure.requested
      contentType: application/json
      summary: erasure.requested v1 produced by privacy
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: erasure.requested
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ErasureRequestedData'
      x-event-id: EVT-22-03
      x-core: false
      x-delivery-class: EC-CRIT
    ErasureModuleCompleted:
      name: erasure.module_completed
      title: EVT-22-04 erasure.module_completed
      contentType: application/json
      summary: erasure.module_completed v1 produced by each-module
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: erasure.module_completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ErasureModuleCompletedData'
      x-event-id: EVT-22-04
      x-core: false
      x-delivery-class: EC-CRIT
    ErasureCompleted:
      name: erasure.completed
      title: EVT-22-05 erasure.completed
      contentType: application/json
      summary: erasure.completed v1 produced by privacy
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: erasure.completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ErasureCompletedData'
      x-event-id: EVT-22-05
      x-core: true
      x-delivery-class: EC-CRIT
    ImportCompleted:
      name: import.completed
      title: EVT-23-01 import.completed
      contentType: application/json
      summary: import.completed v1 produced by integrations
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: import.completed
            version:
              const: 1
            data:
              $ref: '#/components/schemas/ImportCompletedData'
      x-event-id: EVT-23-01
      x-core: false
      x-delivery-class: EC-STD
    FileScanned:
      name: file.scanned
      title: EVT-24-01 file.scanned
      contentType: application/json
      summary: file.scanned v1 produced by platform
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: file.scanned
            version:
              const: 1
            data:
              $ref: '#/components/schemas/FileScannedData'
      x-event-id: EVT-24-01
      x-core: false
      x-delivery-class: EC-STD
    JobDeadLettered:
      name: job.dead_lettered
      title: EVT-24-02 job.dead_lettered
      contentType: application/json
      summary: job.dead_lettered v1 produced by platform
      payload:
        allOf:
        - $ref: '#/components/schemas/EventEnvelope'
        - type: object
          properties:
            type:
              const: job.dead_lettered
            version:
              const: 1
            data:
              $ref: '#/components/schemas/JobDeadLetteredData'
      x-event-id: EVT-24-02
      x-core: false
      x-delivery-class: EC-ORD
  schemas:
    EventEnvelope:
      title: EventEnvelope
      description: Envelope for every domain event written to outbox_event and delivered at-least-once (BE-01 section 6).
        Envelope fields mirror outbox columns (snake_case); data fields mirror REST DTOs (camelCase). Consumers MUST dedupe
        on event_id.
      type: object
      additionalProperties: false
      required:
      - event_id
      - type
      - version
      - occurred_at
      - trace_id
      - tenant
      - aggregate
      - data
      properties:
        event_id:
          type: string
          format: uuid
          description: UUIDv7; dedupe key for consumer_inbox
        type:
          type: string
          pattern: ^[a-z][a-z_]*(\.[a-z_]+)+$
          description: Dotted lowercase event type, e.g. evidence.verified
        version:
          type: integer
          minimum: 1
          description: Schema version of data for this type
        occurred_at:
          type: string
          format: date-time
        trace_id:
          type: string
          pattern: ^[0-9a-f]{32}$
          description: W3C trace-id hex of the originating request
        tenant:
          type: object
          additionalProperties: false
          properties:
            org_id:
              type:
              - string
              - 'null'
              format: uuid
            institution_id:
              type:
              - string
              - 'null'
              format: uuid
          description: Both null for tenant-less (self-scoped or platform) events. Consumers MUST NOT widen scope beyond this
            tenant (INV-T03).
        aggregate:
          type: object
          additionalProperties: false
          required:
          - type
          - id
          - seq
          properties:
            type:
              type: string
            id:
              type: string
              format: uuid
            seq:
              type: integer
              minimum: 1
              description: Per-aggregate monotonic sequence (best-effort ordering)
        actor:
          type: object
          additionalProperties: false
          required:
          - kind
          - human
          properties:
            kind:
              type: string
              enum:
              - user
              - service
              - system
              - support
              - referee
            human:
              type: boolean
              description: 'Derived by the producer, never client-supplied: true for kind user, support, referee; false for service, system. SM-00 U6 / INV-T09 "human actor" = human true and kind in (user, support) (REVW-44)'
            account_id:
              type:
              - string
              - 'null'
              format: uuid
        correlation_id:
          type:
          - string
          - 'null'
          description: Request id that started the causal chain
        causation_id:
          type:
          - string
          - 'null'
          format: uuid
          description: event_id of the event that caused this one, if any
        data:
          type: object
          description: Type-specific payload; no direct personal data beyond ids (consumers fetch through owner interfaces
            under policy)
    AccountRegisteredData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        intendedUse:
          type: string
          enum:
          - candidate
          - employer
          - instructor
          - institution
        termsVersion:
          type: string
        locale:
          type: string
      required:
      - accountId
      - intendedUse
      - termsVersion
      additionalProperties: false
    AccountEmailVerifiedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        verifiedAt:
          type: string
          format: date-time
      required:
      - accountId
      - verifiedAt
      additionalProperties: false
    SessionRevokedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        sessionId:
          type: string
          format: uuid
        reason:
          type: string
          enum:
          - user
          - admin
          - password_change
          - reuse_detected
          - expiry
          - erasure
        familyRevoked:
          type: boolean
      required:
      - accountId
      - sessionId
      - reason
      - familyRevoked
      additionalProperties: false
    PasswordChangedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        method:
          type: string
          enum:
          - change
          - reset
        changedAt:
          type: string
          format: date-time
      required:
      - accountId
      - method
      - changedAt
      additionalProperties: false
    PasskeyRegisteredData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        passkeyId:
          type: string
          format: uuid
      required:
      - accountId
      - passkeyId
      additionalProperties: false
    AccountLockedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        reason:
          type: string
          enum:
          - credential_stuffing
          - admin
          - risk
        until:
          type: string
          format: date-time
      required:
      - accountId
      - reason
      additionalProperties: false
    AccountDeactivatedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        deactivatedAt:
          type: string
          format: date-time
      required:
      - accountId
      - deactivatedAt
      additionalProperties: false
    OrgCreatedData:
      type: object
      properties:
        orgId:
          type: string
          format: uuid
        kind:
          type: string
          enum:
          - employer
          - institution
        createdBy:
          type: string
          format: uuid
      required:
      - orgId
      - kind
      - createdBy
      additionalProperties: false
    OrgMemberAddedData:
      type: object
      properties:
        orgId:
          type: string
          format: uuid
        memberId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        role:
          type: string
      required:
      - orgId
      - memberId
      - accountId
      - role
      additionalProperties: false
    OrgMemberRoleChangedData:
      type: object
      properties:
        orgId:
          type: string
          format: uuid
        memberId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        fromRole:
          type: string
        toRole:
          type: string
      required:
      - orgId
      - memberId
      - accountId
      - fromRole
      - toRole
      additionalProperties: false
    OrgMemberRemovedData:
      type: object
      properties:
        orgId:
          type: string
          format: uuid
        memberId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
      required:
      - orgId
      - memberId
      - accountId
      additionalProperties: false
    OrgSsoConfiguredData:
      type: object
      properties:
        orgId:
          type: string
          format: uuid
        protocol:
          type: string
          enum:
          - oidc
          - saml
        enforced:
          type: boolean
      required:
      - orgId
      - protocol
      - enforced
      additionalProperties: false
    ProfileUpdatedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        changedFields:
          type: array
          items:
            type: string
        version:
          type: integer
      required:
      - accountId
      - changedFields
      - version
      additionalProperties: false
    ProfileVisibilityChangedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        visibility:
          type: string
          enum:
          - private
          - members
          - public
      required:
      - accountId
      - visibility
      additionalProperties: false
    SkillCreatedData:
      type: object
      properties:
        skillId:
          type: string
          format: uuid
        slug:
          type: string
      required:
      - skillId
      - slug
      additionalProperties: false
    SkillMergedData:
      type: object
      properties:
        fromSkillId:
          type: string
          format: uuid
        intoSkillId:
          type: string
          format: uuid
      required:
      - fromSkillId
      - intoSkillId
      additionalProperties: false
    EvidenceCreatedData:
      type: object
      properties:
        evidenceId:
          type: string
          format: uuid
        ownerAccountId:
          type: string
          format: uuid
        kind:
          type: string
        source:
          type: string
          enum:
          - self
          - course
          - assessment
          - institution
          - import
        rung:
          type: string
          enum:
          - claimed
          - artifact_backed
          - peer_attested
          - authority_verified
      required:
      - evidenceId
      - ownerAccountId
      - kind
      - source
      - rung
      additionalProperties: false
    EvidenceUpdatedData:
      type: object
      properties:
        evidenceId:
          type: string
          format: uuid
        ownerAccountId:
          type: string
          format: uuid
        changedFields:
          type: array
          items:
            type: string
        rungBefore:
          type: string
        rungAfter:
          type: string
      required:
      - evidenceId
      - ownerAccountId
      - changedFields
      - rungBefore
      - rungAfter
      additionalProperties: false
    EvidenceArtifactScannedData:
      type: object
      properties:
        evidenceId:
          type: string
          format: uuid
        fileId:
          type: string
          format: uuid
        result:
          type: string
          enum:
          - clean
          - infected
          - rejected
      required:
      - evidenceId
      - fileId
      - result
      additionalProperties: false
    EvidenceVerificationRequestedData:
      type: object
      properties:
        evidenceId:
          type: string
          format: uuid
        verificationRequestId:
          type: string
          format: uuid
        method:
          type: string
      required:
      - evidenceId
      - verificationRequestId
      - method
      additionalProperties: false
    EvidenceVerifiedData:
      type: object
      properties:
        evidenceId:
          type: string
          format: uuid
        ownerAccountId:
          type: string
          format: uuid
        rung:
          type: string
          enum:
          - artifact_backed
          - peer_attested
          - authority_verified
        attestationId:
          type: string
          format: uuid
        method:
          type: string
      required:
      - evidenceId
      - ownerAccountId
      - rung
      - attestationId
      - method
      additionalProperties: false
    EvidenceRevokedData:
      type: object
      properties:
        evidenceId:
          type: string
          format: uuid
        ownerAccountId:
          type: string
          format: uuid
        reason:
          type: string
        revokedByKind:
          type: string
          enum:
          - owner
          - authority
          - moderator
          - admin
      required:
      - evidenceId
      - ownerAccountId
      - reason
      - revokedByKind
      additionalProperties: false
    CredentialIssuedData:
      type: object
      properties:
        credentialId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
        issuerKind:
          type: string
          enum:
          - platform
          - institution
          - external
      required:
      - credentialId
      - evidenceId
      - issuerKind
      additionalProperties: false
    CredentialRevokedData:
      type: object
      properties:
        credentialId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
        reason:
          type: string
      required:
      - credentialId
      - evidenceId
      - reason
      additionalProperties: false
    VerificationRequestedData:
      type: object
      properties:
        verificationRequestId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
        method:
          type: string
        expiresAt:
          type: string
          format: date-time
      required:
      - verificationRequestId
      - evidenceId
      - method
      additionalProperties: false
    VerificationCompletedData:
      type: object
      properties:
        verificationRequestId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
        decision:
          type: string
          x-state-machine: SM-VERIFICATION
          description: Terminal SM-VERIFICATION state reached (revocation is a separate event, evidence.revoked).
          enum:
          - verified
          - failed
          - expired
          - cancelled
        method:
          type: string
        decidedByKind:
          type: string
          enum:
          - system
          - referee
          - authority
          - platform_reviewer
      required:
      - verificationRequestId
      - evidenceId
      - decision
      - method
      - decidedByKind
      additionalProperties: false
    ReferenceRequestedData:
      type: object
      properties:
        referenceRequestId:
          type: string
          format: uuid
        verificationRequestId:
          type: string
          format: uuid
        expiresAt:
          type: string
          format: date-time
      required:
      - referenceRequestId
      - verificationRequestId
      - expiresAt
      additionalProperties: false
    ReferenceRespondedData:
      type: object
      properties:
        referenceRequestId:
          type: string
          format: uuid
        verificationRequestId:
          type: string
          format: uuid
        outcome:
          type: string
          description: SM-REFERENCE outcome recorded with state submitted (t3); DT-04 maps it to the rung effect.
          enum:
          - confirm
          - dispute
          - decline
          - unknown_candidate
      required:
      - referenceRequestId
      - verificationRequestId
      - outcome
      additionalProperties: false
    ReferenceExpiredData:
      type: object
      properties:
        referenceRequestId:
          type: string
          format: uuid
        verificationRequestId:
          type: string
          format: uuid
      required:
      - referenceRequestId
      - verificationRequestId
      additionalProperties: false
    WorkclaimEmployerEmailConfirmedData:
      type: object
      properties:
        workClaimId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
        employerDomain:
          type: string
      required:
      - workClaimId
      - evidenceId
      - employerDomain
      additionalProperties: false
    VerificationDisputedData:
      type: object
      properties:
        disputeId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
      required:
      - disputeId
      - evidenceId
      additionalProperties: false
    AttemptStartedData:
      type: object
      properties:
        attemptId:
          type: string
          format: uuid
        assessmentId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        aiMode:
          type: string
          enum:
          - AI_PROHIBITED
          - AI_RESTRICTED
          - AI_ALLOWED
      required:
      - attemptId
      - assessmentId
      - accountId
      - aiMode
      additionalProperties: false
    AttemptSubmittedData:
      type: object
      properties:
        attemptId:
          type: string
          format: uuid
        assessmentId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        requiresRunner:
          type: boolean
      required:
      - attemptId
      - assessmentId
      - accountId
      - requiresRunner
      additionalProperties: false
    AssessmentPassedData:
      type: object
      properties:
        attemptId:
          type: string
          format: uuid
        assessmentId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        score:
          type: number
        verificationBasis:
          type: string
          enum:
          - auto_graded_objective
          - runner_verified
          - human_graded
      required:
      - attemptId
      - assessmentId
      - accountId
      - score
      - verificationBasis
      additionalProperties: false
    AssessmentFailedData:
      type: object
      properties:
        attemptId:
          type: string
          format: uuid
        assessmentId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        score:
          type: number
      required:
      - attemptId
      - assessmentId
      - accountId
      additionalProperties: false
    IntegrityFlagRaisedData:
      type: object
      properties:
        flagId:
          type: string
          format: uuid
        attemptId:
          type: string
          format: uuid
        severity:
          type: string
          enum:
          - low
          - medium
          - high
        signalKinds:
          type: array
          items:
            type: string
      required:
      - flagId
      - attemptId
      - severity
      - signalKinds
      additionalProperties: false
    IntegrityFlagReviewedData:
      type: object
      properties:
        flagId:
          type: string
          format: uuid
        attemptId:
          type: string
          format: uuid
        outcome:
          type: string
          enum:
          - cleared
          - confirmed
        reviewedBy:
          type: string
          format: uuid
      required:
      - flagId
      - attemptId
      - outcome
      - reviewedBy
      additionalProperties: false
    AttemptAppealedData:
      type: object
      properties:
        attemptId:
          type: string
          format: uuid
        appealId:
          type: string
          format: uuid
      required:
      - attemptId
      - appealId
      additionalProperties: false
    EnrollmentCreatedData:
      type: object
      properties:
        enrollmentId:
          type: string
          format: uuid
        courseId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
      required:
      - enrollmentId
      - courseId
      - accountId
      additionalProperties: false
    CourseCompletedData:
      type: object
      properties:
        enrollmentId:
          type: string
          format: uuid
        courseId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        completedAt:
          type: string
          format: date-time
      required:
      - enrollmentId
      - courseId
      - accountId
      - completedAt
      additionalProperties: false
    CoursePublishedData:
      type: object
      properties:
        courseId:
          type: string
          format: uuid
        instructorAccountId:
          type: string
          format: uuid
      required:
      - courseId
      - instructorAccountId
      additionalProperties: false
    JobPublishedData:
      type: object
      properties:
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
        publishedAt:
          type: string
          format: date-time
        skillIds:
          type: array
          items:
            type: string
            format: uuid
      required:
      - jobId
      - orgId
      - publishedAt
      - skillIds
      additionalProperties: false
    JobUpdatedData:
      type: object
      properties:
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
        version:
          type: integer
        changedFields:
          type: array
          items:
            type: string
      required:
      - jobId
      - orgId
      - version
      - changedFields
      additionalProperties: false
    JobClosedData:
      type: object
      properties:
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
        reason:
          type: string
          description: filled, cancelled and expired are SM-JOB close_reason values (state closed, t8). taken_down is the SM-JOB state reached by t9 and is announced here because the job leaves the public feed.
          enum:
          - filled
          - cancelled
          - expired
          - taken_down
      required:
      - jobId
      - orgId
      - reason
      additionalProperties: false
    JobExpiredData:
      type: object
      properties:
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
      required:
      - jobId
      - orgId
      additionalProperties: false
    ApplicationSubmittedData:
      type: object
      properties:
        applicationId:
          type: string
          format: uuid
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
        candidateAccountId:
          type: string
          format: uuid
        evidenceIds:
          type: array
          items:
            type: string
            format: uuid
        consentSnapshotId:
          type: string
          format: uuid
      required:
      - applicationId
      - jobId
      - orgId
      - candidateAccountId
      - evidenceIds
      - consentSnapshotId
      additionalProperties: false
    ApplicationWithdrawnData:
      type: object
      properties:
        applicationId:
          type: string
          format: uuid
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
        candidateAccountId:
          type: string
          format: uuid
      required:
      - applicationId
      - jobId
      - orgId
      - candidateAccountId
      additionalProperties: false
    ApplicationStageChangedData:
      type: object
      properties:
        applicationId:
          type: string
          format: uuid
        jobId:
          type: string
          format: uuid
        orgId:
          type: string
          format: uuid
        fromStage:
          type: string
        toStage:
          type: string
        fromState:
          type: string
          x-state-machine: SM-APPLICATION
          enum:
          - submitted
          - in_review
          - shortlisted
          - interviewing
          - offer_extended
          - hired
          - rejected
          - withdrawn
          - offer_declined
        toState:
          type: string
          x-state-machine: SM-APPLICATION
          enum:
          - submitted
          - in_review
          - shortlisted
          - interviewing
          - offer_extended
          - hired
          - rejected
          - withdrawn
          - offer_declined
        actorAccountId:
          type: string
          format: uuid
      required:
      - applicationId
      - jobId
      - orgId
      - fromStage
      - toStage
      - fromState
      - toState
      - actorAccountId
      additionalProperties: false
    InterviewScheduledData:
      type: object
      properties:
        interviewId:
          type: string
          format: uuid
        applicationId:
          type: string
          format: uuid
        scheduledAt:
          type: string
          format: date-time
      required:
      - interviewId
      - applicationId
      - scheduledAt
      additionalProperties: false
    InterviewCompletedData:
      type: object
      properties:
        interviewId:
          type: string
          format: uuid
        applicationId:
          type: string
          format: uuid
      required:
      - interviewId
      - applicationId
      additionalProperties: false
    ConversationCreatedData:
      type: object
      properties:
        conversationId:
          type: string
          format: uuid
        kind:
          type: string
          enum:
          - direct
          - application
          - outreach
        participantIds:
          type: array
          items:
            type: string
            format: uuid
      required:
      - conversationId
      - kind
      - participantIds
      additionalProperties: false
    MessageSentData:
      type: object
      properties:
        messageId:
          type: string
          format: uuid
        conversationId:
          type: string
          format: uuid
        senderAccountId:
          type: string
          format: uuid
      required:
      - messageId
      - conversationId
      - senderAccountId
      additionalProperties: false
    NotificationEmailBouncedData:
      type: object
      properties:
        emailHash:
          type: string
        reason:
          type: string
          enum:
          - bounce
          - complaint
        providerEventId:
          type: string
      required:
      - emailHash
      - reason
      - providerEventId
      additionalProperties: false
    NotificationDeliveredData:
      type: object
      properties:
        notificationId:
          type: string
          format: uuid
        channel:
          type: string
          enum:
          - in_app
          - email
          - push
      required:
      - notificationId
      - channel
      additionalProperties: false
    SubscriptionChangedData:
      type: object
      properties:
        subscriptionId:
          type: string
          format: uuid
        subjectKind:
          type: string
          enum:
          - account
          - org
        subjectId:
          type: string
          format: uuid
        state:
          type: string
          x-state-machine: SM-SUBSCRIPTION
          enum:
          - incomplete
          - active
          - canceling
          - past_due
          - unpaid
          - canceled
          - incomplete_expired
        planKey:
          type: string
        stripeEventId:
          type: string
      required:
      - subscriptionId
      - subjectKind
      - subjectId
      - state
      - planKey
      - stripeEventId
      additionalProperties: false
    EntitlementChangedData:
      type: object
      properties:
        subjectKind:
          type: string
          enum:
          - account
          - org
        subjectId:
          type: string
          format: uuid
        changedKeys:
          type: array
          items:
            type: string
        computedAt:
          type: string
          format: date-time
      required:
      - subjectKind
      - subjectId
      - changedKeys
      - computedAt
      additionalProperties: false
    PaymentFailedData:
      type: object
      properties:
        subscriptionId:
          type: string
          format: uuid
        subjectKind:
          type: string
        subjectId:
          type: string
          format: uuid
        attempt:
          type: integer
      required:
      - subscriptionId
      - subjectKind
      - subjectId
      additionalProperties: false
    InvoicePaidData:
      type: object
      properties:
        invoiceId:
          type: string
          format: uuid
        subjectKind:
          type: string
        subjectId:
          type: string
          format: uuid
        amountPaidMinor:
          type: integer
        currency:
          type: string
      required:
      - invoiceId
      - subjectKind
      - subjectId
      - amountPaidMinor
      - currency
      additionalProperties: false
    AiRequestCompletedData:
      type: object
      properties:
        requestId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        purpose:
          type: string
        model:
          type: string
        costMicros:
          type: integer
      required:
      - requestId
      - accountId
      - purpose
      - model
      - costMicros
      additionalProperties: false
    AiBudgetExceededData:
      type: object
      properties:
        scope:
          type: string
          enum:
          - global
          - plan
          - org
          - account
        scopeKey:
          type: string
        period:
          type: string
          enum:
          - day
          - month
      required:
      - scope
      - scopeKey
      - period
      additionalProperties: false
    CredentialIssuedByInstitutionData:
      type: object
      properties:
        institutionId:
          type: string
          format: uuid
        cohortId:
          type: string
          format: uuid
        subjectAccountId:
          type: string
          format: uuid
        evidenceId:
          type: string
          format: uuid
      required:
      - institutionId
      - subjectAccountId
      - evidenceId
      additionalProperties: false
    ReportFiledData:
      type: object
      properties:
        reportId:
          type: string
          format: uuid
        subjectType:
          type: string
        subjectId:
          type: string
          format: uuid
        reasonCode:
          type: string
      required:
      - reportId
      - subjectType
      - subjectId
      - reasonCode
      additionalProperties: false
    CaseResolvedData:
      type: object
      properties:
        caseId:
          type: string
          format: uuid
        subjectType:
          type: string
        subjectId:
          type: string
          format: uuid
        action:
          type: string
        appealable:
          type: boolean
      required:
      - caseId
      - subjectType
      - subjectId
      - action
      - appealable
      additionalProperties: false
    SupportAccessGrantedData:
      type: object
      properties:
        grantId:
          type: string
          format: uuid
        granteeAccountId:
          type: string
          format: uuid
        subjectAccountId:
          type: string
          format: uuid
        scope:
          type: string
        expiresAt:
          type: string
          format: date-time
      required:
      - grantId
      - granteeAccountId
      - subjectAccountId
      - scope
      - expiresAt
      additionalProperties: false
    SupportAccessExpiredData:
      type: object
      properties:
        grantId:
          type: string
          format: uuid
      required:
      - grantId
      additionalProperties: false
    FeatureFlagChangedData:
      type: object
      properties:
        flagKey:
          type: string
        enabled:
          type: boolean
        changedBy:
          type: string
          format: uuid
      required:
      - flagKey
      - enabled
      - changedBy
      additionalProperties: false
    ConsentChangedData:
      type: object
      properties:
        accountId:
          type: string
          format: uuid
        scope:
          description: Canonical consent scope id (00_CONTROL_CENTRE/CONSENT_SCOPE_CATALOGUE.md); same enum as openapi ConsentScope.
          type: string
        granted:
          type: boolean
        targetType:
          type: string
        targetId:
          type: string
          format: uuid
        granteeType:
          type: string
        granteeId:
          type: string
          format: uuid
        expiresAt:
          type: string
          format: date-time
        policyVersion:
          type: string
        consentEpoch:
          type: integer
      required:
      - accountId
      - scope
      - granted
      - policyVersion
      - consentEpoch
      additionalProperties: false
    DataexportReadyData:
      type: object
      properties:
        requestId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        expiresAt:
          type: string
          format: date-time
      required:
      - requestId
      - accountId
      - expiresAt
      additionalProperties: false
    ErasureRequestedData:
      type: object
      properties:
        requestId:
          type: string
          format: uuid
        accountId:
          type: string
          format: uuid
        scheduledFor:
          type: string
          format: date-time
      required:
      - requestId
      - accountId
      - scheduledFor
      additionalProperties: false
    ErasureModuleCompletedData:
      type: object
      properties:
        requestId:
          type: string
          format: uuid
        module:
          type: string
        outcome:
          type: string
          enum:
          - done
          - retained
          - failed
        retainedReason:
          type: string
      required:
      - requestId
      - module
      - outcome
      additionalProperties: false
    ErasureCompletedData:
      type: object
      properties:
        requestId:
          type: string
          format: uuid
        erasedAccountId:
          type: string
          format: uuid
        completedAt:
          type: string
          format: date-time
        retainedCategories:
          type: array
          items:
            type: string
      required:
      - requestId
      - erasedAccountId
      - completedAt
      - retainedCategories
      additionalProperties: false
    ImportCompletedData:
      type: object
      properties:
        importJobId:
          type: string
          format: uuid
        adapterKey:
          type: string
        created:
          type: integer
        failed:
          type: integer
      required:
      - importJobId
      - adapterKey
      - created
      - failed
      additionalProperties: false
    FileScannedData:
      type: object
      properties:
        fileId:
          type: string
          format: uuid
        result:
          type: string
          enum:
          - clean
          - infected
          - rejected
        purpose:
          type: string
      required:
      - fileId
      - result
      - purpose
      additionalProperties: false
    JobDeadLetteredData:
      type: object
      properties:
        jobId:
          type: string
          format: uuid
        kind:
          type: string
        attempts:
          type: integer
      required:
      - jobId
      - kind
      - attempts
      additionalProperties: false
```
