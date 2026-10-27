# API Catalog (Target)

Doc ID: APIC-01 · Owner: Backend Architecture Team · Version 1.0 · Status: Under Review · Relates: ADR-T07, ADR-T08, INV-T01, INV-T02, INV-T10, INV-T15, FF-01, FF-05, FF-06, FF-07 · Companions: API-STD `API_DESIGN_STANDARDS.md`, `contracts/openapi.yaml`, EVC-01, BE-01

> **REV2 folded in (2026-10-27):** rows replaced/added from `API_CATALOG_ADDENDUM.md`; the addendum text stays for overrides in its sections 3-5.

Tags: **[TARGET]** design; nothing is implemented. This catalog lists **230** endpoints across 24 domains; **109** have full OpenAPI 3.1 path and schema definitions in `contracts/openapi.yaml` (identity, evidence, verification, jobs, applications, billing, privacy, plus the file-upload and capabilities routes they depend on). For the others the request/response schema names are reserved [TARGET] and their schemas are authored when the owning module is specified (tracked as the "OpenAPI" column).

The candidate source mapping for root SSOT `SCI-01…SCI-54` is in [SSOT_SERVICE_CONTRACT_CROSSWALK](SSOT_SERVICE_CONTRACT_CROSSWALK.md) and its [row-level CSV](SSOT_SERVICE_CONTRACT_CROSSWALK.csv). It is not an approved API contract or implementation coverage claim; owner disposition remains open under OPEN-46/50.

The [278-row observed route-to-target crosswalk](OBSERVED_ROUTE_TARGET_CROSSWALK.csv) records 9 name-preserving method/path overlaps and 4 same-name-path method mismatches. Among the remaining 265 source routes, 6 have parameter-agnostic path-shape candidates (5 same method, 1 different method) and 259 have no target path-shape match. Parameter-name-insensitive candidates are explicitly separate from direct path matches; no source/target semantic equivalence or implementation coverage is asserted (OPEN-46/50).

All paths are relative to `/api/v1`. Reference-project routes (`API_CONTRACTS.md`) are **[REF]** only and were not copied.

## Legend
| Column | Values |
|---|---|
| AuthN | `S` session cookie (+ `X-CSRF-Token` on unsafe methods) · `R` refresh cookie (+CSRF) · `T` single-use capability token in path/body (referee, reset, invitation, unsubscribe; hash-only at rest, INV-T05) · `SIG` provider signature (Stripe) · `O` optional session (public route that personalises) · `N` none · `+SVC` also accepts a ROLE-SVC service token (client credentials, scoped) |
| Policy action | `<module>.<resource>.<verb>` registered in `packages/policy`; every route has one (FF-01). Public/token routes still declare one so the registry is total |
| Errors | HTTP status; `status:type` adds a specific problem type (catalogue in API-STD §5). Every route can additionally return 401/403/429/500/503 as per the standards; only route-specific errors are listed |
| Pagination | `Cursor` = opaque keyset cursor + `limit` (API-STD §6); lists without it are bounded by definition |
| Idempotency | `Key` accepts `Idempotency-Key`; `Key (required)` rejects absent key (428); `If-Match` required for optimistic concurrency (428/412); `Natural key` is idempotent by resource identity; `n/a` = read-only or token-consuming (single use is the guard) |
| Rate limit | Class from API-STD §9 (RL-AUTH, RL-TOKEN, RL-READ, RL-WRITE, RL-HEAVY, RL-PUBLIC, RL-WEBHOOK) |
| OpenAPI | `Y` full path+schemas present in `contracts/openapi.yaml` · `-` schema names reserved |


## DOM-01 Identity, Sessions & Access

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-01-01 | `api/identity` | MOD-SHELL | POST | `/auth/register` | N | `identity.account.register` | RegisterRequest | AccountCreated | 201; 409 422 429 | - | Key | RL-AUTH | Y |
| API-01-02 | `api/identity` | MOD-SHELL | POST | `/auth/login` | N | `identity.session.create` | LoginRequest | SessionInfo | 200; 401 423 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-03 | `api/identity` | MOD-SHELL | POST | `/auth/passkeys/authentication-options` | N | `identity.passkey.challenge` | PasskeyAuthOptionsRequest | PasskeyOptions | 200; 422 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-04 | `api/identity` | MOD-SHELL | POST | `/auth/passkeys/authentication` | N | `identity.session.create` | PasskeyAssertion | SessionInfo | 200; 401 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-05 | `api/identity` | MOD-SHELL | POST | `/auth/refresh` | R | `identity.session.refresh` | - | SessionInfo | 200; 401 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-06 | `api/identity` | MOD-SHELL | POST | `/auth/logout` | S | `identity.session.revoke` | - | - | 204; 401 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-01-07 | `api/identity` | MOD-ACC | GET | `/auth/sessions` | S | `identity.session.list` | - | SessionSummaryPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-01-08 | `api/identity` | MOD-ACC | DELETE | `/auth/sessions/{sessionId}` | S | `identity.session.revoke_other` | - | - | 204; 401 404 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-01-09 | `api/identity` | MOD-SHELL | POST | `/auth/password/forgot` | N | `identity.password.reset_request` | PasswordForgotRequest | - | 202; 422 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-10 | `api/identity` | MOD-SHELL | POST | `/auth/password/reset` | T | `identity.password.reset_complete` | PasswordResetRequest | - | 204; 404 410 422 429 | - | n/a (no state change or token-consuming) | RL-TOKEN | Y |
| API-01-11 | `api/identity` | MOD-SHELL | POST | `/auth/email/verification` | T | `identity.email.verify` | EmailVerifyRequest | - | 204; 404 410 429 | - | n/a (no state change or token-consuming) | RL-TOKEN | Y |
| API-01-12 | `api/identity` | MOD-SHELL | POST | `/auth/email/verification-requests` | S | `identity.email.verify_resend` | - | - | 202; 401 429 | - | Key | RL-AUTH | Y |
| API-01-13 | `api/identity` | MOD-SHELL | GET | `/auth/sso/{orgSlug}/authorize` | N | `identity.sso.start` | - | redirect | 302; 404 429 | - | - | RL-AUTH | Y |
| API-01-14 | `api/identity` | MOD-SHELL | GET | `/auth/sso/callback` | N | `identity.sso.complete` | - | redirect | 302; 400 401 429 | - | - | RL-AUTH | Y |
| API-01-15 | `api/identity` | MOD-SHELL | GET | `/me` | S | `identity.account.read` | - | Account | 200; 401 | - | - | RL-READ | Y |
| API-01-16 | `api/identity` | MOD-ACC | PATCH | `/me` | S | `identity.account.update` | AccountUpdate | Account | 200; 401 412 422 428 | - | If-Match | RL-WRITE | Y |
| API-01-17 | `api/identity` | MOD-ACC | POST | `/me/password` | S | `identity.password.change` | PasswordChangeRequest | - | 204; 401 403:step-up-required 422 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-18 | `api/identity` | MOD-ACC | POST | `/me/passkeys/registration-options` | S | `identity.passkey.register_options` | - | PasskeyOptions | 200; 401 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-01-19 | `api/identity` | MOD-ACC | POST | `/me/passkeys` | S | `identity.passkey.register` | PasskeyRegistration | Passkey | 201; 401 422 | - | Key | RL-WRITE | Y |
| API-01-20 | `api/identity` | MOD-ACC | GET | `/me/passkeys` | S | `identity.passkey.list` | - | PasskeyList | 200; 401 | - | - | RL-READ | Y |
| API-01-21 | `api/identity` | MOD-ACC | DELETE | `/me/passkeys/{passkeyId}` | S | `identity.passkey.delete` | - | - | 204; 401 404 409 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-01-22 | `packages/policy (served via api/identity)` | MOD-SHELL | GET | `/me/capabilities` | S | `policy.capabilities.read` | - | CapabilitySet | 200; 401 | - | - | RL-READ | Y |

## DOM-02 Organizations, Tenancy & Roles

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-02-01 | `api/orgs` | MOD-HIR | POST | `/orgs` | S | `orgs.org.create` | OrgCreate | Org | 201; 422 | - | Key | RL-WRITE | Y (addendum) |
| API-02-02 | `api/orgs` | MOD-HIR | GET | `/orgs/{orgId}` | S | `orgs.org.read` | - | Org | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-02-03 | `api/orgs` | MOD-ADM | PATCH | `/orgs/{orgId}` | S | `orgs.org.update` | OrgUpdate | Org | 200; 403 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-02-04 | `api/orgs` | MOD-ADM | GET | `/orgs/{orgId}/members` | S | `orgs.member.list` | - | MemberPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-02-05 | `api/orgs` | MOD-ADM | POST | `/orgs/{orgId}/invitations` | S | `orgs.invitation.create` | InvitationCreate | Invitation | 201; 403 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-02-06 | `api/orgs` | MOD-HIR | POST | `/org-invitations/{token}/acceptance` | S | `orgs.invitation.accept` | - | Membership | 200; 404 410 | - | Key | RL-TOKEN | Y (addendum) |
| API-02-07 | `api/orgs` | MOD-ADM | PATCH | `/orgs/{orgId}/members/{memberId}` | S | `orgs.member.change_role` | MemberRoleChange | Membership | 200; 403 409 412 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-02-08 | `api/orgs` | MOD-ADM | DELETE | `/orgs/{orgId}/members/{memberId}` | S | `orgs.member.remove` | - | - | 204; 403 404 409 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-02-09 | `api/orgs` | MOD-ADM | PUT | `/orgs/{orgId}/sso-connection` | S | `orgs.sso.configure` | SsoConnectionPut | SsoConnection | 200; 403 412 422 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-02-10 | `api/orgs` | MOD-ADM | GET | `/orgs/{orgId}/access-review` | S | `orgs.access_review.read` | - | AccessReview | 200; 403 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-02-11 | `api/orgs` | MOD-ADM | POST | `/orgs/{orgId}/access-review/decisions` | S | `orgs.access_review.decide` | AccessReviewDecisions | - | 204; 403 422 | - | Key | RL-WRITE | Y (addendum) |

## DOM-03 Profile, Portfolio & Resume

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-03-01 | `api/profile` | MOD-CAND | GET | `/me/profile` | S | `profile.own.read` | - | Profile | 200; 401 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-03-02 | `api/profile` | MOD-CAND | PATCH | `/me/profile` | S | `profile.own.update` | ProfileUpdate | Profile | 200; 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-03-03 | `api/profile` | MOD-CAND | PUT | `/me/profile/visibility` | S | `profile.visibility.set` | VisibilitySettings | VisibilitySettings | 200; 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-03-04 | `api/profile` | MOD-CAND | GET | `/profiles/{handle}` | O | `profile.public.read` | - | PublicProfile | 200; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-03-05 | `api/profile` | MOD-CAND | GET | `/me/portfolio-items` | S | `profile.portfolio.list` | - | PortfolioItemPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-03-06 | `api/profile` | MOD-CAND | POST | `/me/portfolio-items` | S | `profile.portfolio.create` | PortfolioItemCreate | PortfolioItem | 201; 422 | - | Key | RL-WRITE | Y (addendum) |
| API-03-07 | `api/profile` | MOD-CAND | PATCH | `/me/portfolio-items/{itemId}` | S | `profile.portfolio.update` | PortfolioItemUpdate | PortfolioItem | 200; 404 412 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-03-08 | `api/profile` | MOD-CAND | DELETE | `/me/portfolio-items/{itemId}` | S | `profile.portfolio.delete` | - | - | 204; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-03-09 | `api/profile` | MOD-CAND | GET | `/me/resumes` | S | `profile.resume.list` | - | ResumePage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-03-10 | `api/profile` | MOD-CAND | POST | `/me/resumes` | S | `profile.resume.create` | ResumeCreate | Resume | 201; 422 | - | Key | RL-WRITE | Y (addendum) |
| API-03-11 | `api/profile` | MOD-CAND | POST | `/me/resumes/{resumeId}/exports` | S | `profile.resume.export` | ResumeExportRequest | ExportJob | 202; 404 | - | Key | RL-HEAVY | Y (addendum) |
| API-03-12 | `api/profile` | MOD-CAND | GET | `/me/resumes/{resumeId}/exports/{exportId}` | S | `profile.resume.export_read` | - | ExportJob | 200; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |

## DOM-04 Skills Graph & Taxonomy

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-04-01 | `api/skills` | MOD-CAND, MOD-HIR, MOD-LRN | GET | `/skills` | O | `skills.skill.search` | - | SkillPage | 200;  | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-04-02 | `api/skills` | MOD-CAND | GET | `/skills/{skillId}` | O | `skills.skill.read` | - | Skill | 200; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-04-03 | `api/skills` | MOD-CAND | GET | `/skills/{skillId}/relations` | O | `skills.relation.list` | - | SkillRelationList | 200; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-04-04 | `api/skills` | MOD-CAND | GET | `/me/skills` | S | `skills.competency.list_own` | - | CompetencyPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-04-05 | `api/skills` | MOD-ADM | POST | `/admin/skills` | S | `skills.skill.create` | SkillCreate | Skill | 201; 403 409 422 | - | Key | RL-WRITE | - |
| API-04-06 | `api/skills` | MOD-ADM | POST | `/admin/skills/{skillId}/merge` | S | `skills.skill.merge` | SkillMergeRequest | Skill | 200; 403 404 409 | - | Key | RL-WRITE | - |

## DOM-05 Evidence & Credentials

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-05-01 | `api/evidence` | MOD-CAND | GET | `/me/evidence` | S | `evidence.item.list_own` | - | EvidencePage | 200; 401 | Cursor | - | RL-READ | Y |
| API-05-02 | `api/evidence` | MOD-CAND | POST | `/me/evidence` | S | `evidence.item.create` | EvidenceCreate | EvidenceItem | 201; 422 429 | - | Key | RL-WRITE | Y |
| API-05-03 | `api/evidence` | MOD-CAND | GET | `/evidence/{evidenceId}` | S | `evidence.item.read` | - | EvidenceItem | 200; 403:consent-required 404 | - | - | RL-READ | Y |
| API-05-04 | `api/evidence` | MOD-CAND | PATCH | `/evidence/{evidenceId}` | S | `evidence.item.update` | EvidenceUpdate | EvidenceItem | 200; 404 412 422 428 | - | If-Match | RL-WRITE | Y |
| API-05-05 | `api/evidence` | MOD-CAND | DELETE | `/evidence/{evidenceId}` | S | `evidence.item.withdraw` | - | - | 204; 404 412 428 | - | If-Match | RL-WRITE | Y |
| API-05-06 | `api/evidence` | MOD-CAND | POST | `/evidence/{evidenceId}/artifacts` | S | `evidence.artifact.attach` | ArtifactAttach | EvidenceArtifact | 201; 404 409 422 | - | Key | RL-WRITE | Y |
| API-05-07 | `api/evidence` | MOD-CAND | DELETE | `/evidence/{evidenceId}/artifacts/{artifactId}` | S | `evidence.artifact.remove` | - | - | 204; 404 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-05-08 | `api/evidence` | MOD-CAND | GET | `/evidence/{evidenceId}/artifacts/{artifactId}/download-url` | S | `evidence.artifact.download` | - | SignedUrl | 200; 403:consent-required 404 409 | - | - | RL-READ | Y |
| API-05-09 | `api/evidence` | MOD-CAND | PUT | `/evidence/{evidenceId}/skills` | S | `evidence.skills.set` | EvidenceSkillsPut | EvidenceItem | 200; 404 412 422 428 | - | If-Match | RL-WRITE | Y |
| API-05-10 | `api/evidence` | MOD-CAND | GET | `/evidence/{evidenceId}/attestations` | S | `evidence.attestation.list` | - | AttestationList | 200; 403 404 | - | - | RL-READ | Y |
| API-05-11 | `api/evidence` | MOD-CAND | POST | `/evidence/{evidenceId}/verification-requests` | S | `evidence.verification.request` | VerificationRequestCreate | VerificationRequest | 201; 404 409 422 429 | - | Key | RL-WRITE | Y |
| API-05-12 | `api/evidence` | MOD-ADM | POST | `/evidence/{evidenceId}/revocation` | S | `evidence.item.revoke` | EvidenceRevocation | EvidenceItem | 200; 403 404 409 | - | Key (required) | RL-WRITE | Y |
| API-05-13 | `api/evidence` | MOD-SHELL | GET | `/credentials/{code}` | N | `evidence.credential.verify_public` | - | CredentialVerification | 200; 404 429 | - | - | RL-PUBLIC | Y |
| API-05-14 | `api/evidence` | MOD-CAND | GET | `/me/credentials` | S | `evidence.credential.list_own` | - | CredentialPage | 200; 401 | Cursor | - | RL-READ | Y |

## DOM-06 Verification & Trust

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-06-01 | `api/verification` | MOD-CAND | POST | `/verification/work-claims` | S | `verification.work_claim.create` | WorkClaimCreate | WorkClaim | 201; 422 | - | Key | RL-WRITE | Y |
| API-06-02 | `api/verification` | MOD-CAND | GET | `/verification/work-claims` | S | `verification.work_claim.list` | - | WorkClaimPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-06-03 | `api/verification` | MOD-CAND | GET | `/verification/work-claims/{claimId}` | S | `verification.work_claim.read` | - | WorkClaim | 200; 404 | - | - | RL-READ | Y |
| API-06-04 | `api/verification` | MOD-CAND | PATCH | `/verification/work-claims/{claimId}` | S | `verification.work_claim.update` | WorkClaimUpdate | WorkClaim | 200; 404 409 412 428 | - | If-Match | RL-WRITE | Y |
| API-06-05 | `api/verification` | MOD-CAND | POST | `/verification/work-claims/{claimId}/email-challenges` | S | `verification.email_challenge.send` | EmailChallengeCreate | EmailChallengeStatus | 202; 404 409 422 429 | - | Key | RL-AUTH | Y |
| API-06-06 | `api/verification` | MOD-CAND | POST | `/verification/work-claims/{claimId}/email-challenges/confirmation` | S | `verification.email_challenge.confirm` | EmailChallengeConfirm | WorkClaim | 200; 404 410 422 429 | - | n/a (no state change or token-consuming) | RL-AUTH | Y |
| API-06-07 | `api/verification` | MOD-CAND | POST | `/verification/work-claims/{claimId}/reference-requests` | S | `verification.reference.request` | ReferenceRequestCreate | ReferenceRequest | 201; 404 409 422 429 | - | Key | RL-WRITE | Y |
| API-06-08 | `api/verification` | MOD-CAND | GET | `/verification/reference-requests/{requestId}` | S | `verification.reference.read` | - | ReferenceRequest | 200; 404 | - | - | RL-READ | Y |
| API-06-09 | `api/verification` | MOD-CAND | POST | `/verification/reference-requests/{requestId}/reminders` | S | `verification.reference.remind` | - | ReferenceRequest | 200; 404 409:reminder-limit-reached 429 | - | Key | RL-WRITE | Y |
| API-06-10 | `api/verification` | MOD-CAND | DELETE | `/verification/reference-requests/{requestId}` | S | `verification.reference.cancel` | - | - | 204; 404 409 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-06-11 | `api/verification` | MOD-SHELL | GET | `/referee/requests/{token}` | T | `verification.referee.view` | - | RefereeRequestView | 200; 404 410 429 | - | - | RL-TOKEN | Y |
| API-06-12 | `api/verification` | MOD-SHELL | POST | `/referee/requests/{token}/response` | T | `verification.referee.respond` | RefereeResponse | RefereeReceipt | 201; 404 410 422 429 | - | Key | RL-TOKEN | Y |
| API-06-13 | `api/verification` | MOD-SHELL | POST | `/referee/requests/{token}/decline` | T | `verification.referee.decline` | RefereeDecline | RefereeReceipt | 200; 404 410 429 | - | Key | RL-TOKEN | Y |
| API-06-14 | `api/verification` | MOD-ADM | GET | `/verification/requests` | S | `verification.request.list_queue` | - | VerificationRequestPage | 200; 403 | Cursor | - | RL-READ | Y |
| API-06-15 | `api/verification` | MOD-CAND | GET | `/verification/requests/{requestId}` | S | `verification.request.read` | - | VerificationRequest | 200; 403 404 | - | - | RL-READ | Y |
| API-06-16 | `api/verification` | MOD-ADM | POST | `/verification/requests/{requestId}/decision` | S | `verification.request.decide` | VerificationDecision | VerificationRequest | 200; 403 404 409 412 422 428 | - | Key + If-Match | RL-WRITE | Y |
| API-06-17 | `api/verification` | MOD-CAND | POST | `/verification/disputes` | S | `verification.dispute.open` | DisputeCreate | Dispute | 201; 404 422 | - | Key | RL-WRITE | Y |
| API-06-18 | `api/verification` | MOD-ADM | POST | `/verification/disputes/{disputeId}/resolution` | S | `verification.dispute.resolve` | DisputeResolution | Dispute | 200; 403 404 409 412 428 | - | Key + If-Match | RL-WRITE | Y |

## DOM-07 Assessment, Challenges & Integrity

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-07-01 | `api/assessment` | MOD-LRN | GET | `/assessments` | S | `assessment.assessment.list` | - | AssessmentPage | 200; 401 | Cursor | - | RL-READ | - |
| API-07-02 | `api/assessment` | MOD-LRN | GET | `/assessments/{assessmentId}` | S | `assessment.assessment.read` | - | Assessment | 200; 404 | - | - | RL-READ | - |
| API-07-03 | `api/assessment` | MOD-LRN | POST | `/assessments/{assessmentId}/attempts` | S | `assessment.attempt.start` | AttemptStart | Attempt | 201; 403 404 409 429 | - | Key | RL-WRITE | - |
| API-07-04 | `api/assessment` | MOD-LRN | GET | `/attempts/{attemptId}` | S | `assessment.attempt.read` | - | Attempt | 200; 404 | - | - | RL-READ | - |
| API-07-05 | `api/assessment` | MOD-LRN | PUT | `/attempts/{attemptId}/answers/{questionId}` | S | `assessment.answer.save` | AnswerPut | Answer | 200; 404 409 412 428 | - | If-Match | RL-WRITE | - |
| API-07-06 | `api/assessment` | MOD-LRN | POST | `/attempts/{attemptId}/submission` | S | `assessment.attempt.submit` | SubmissionRequest | Attempt | 202; 404 409 422 | - | Key | RL-WRITE | - |
| API-07-07 | `api/assessment` | MOD-LRN | GET | `/attempts/{attemptId}/result` | S | `assessment.attempt.result` | - | AttemptResult | 200; 404 409 | - | - | RL-READ | - |
| API-07-08 | `api/assessment` | MOD-LRN | POST | `/attempts/{attemptId}/integrity-signals` | S | `assessment.integrity.signal` | IntegritySignalBatch | - | 202; 404 409 429 | - | n/a (no state change or token-consuming) | RL-WRITE | - |
| API-07-09 | `api/assessment` | MOD-LRN | POST | `/attempts/{attemptId}/appeals` | S | `assessment.attempt.appeal` | AppealCreate | Appeal | 201; 404 409 422 | - | Key | RL-WRITE | - |
| API-07-10 | `api/assessment` | MOD-ADM | GET | `/integrity/flags` | S | `assessment.flag.list` | - | IntegrityFlagPage | 200; 403 | Cursor | - | RL-READ | - |
| API-07-11 | `api/assessment` | MOD-ADM | POST | `/integrity/flags/{flagId}/review` | S | `assessment.flag.review` | FlagReview | IntegrityFlag | 200; 403 404 409 412 428 | - | Key + If-Match | RL-WRITE | - |
| API-07-12 | `api/assessment` | MOD-LRN | POST | `/instructor/assessments` | S | `assessment.assessment.create` | AssessmentCreate | Assessment | 201; 403 422 | - | Key | RL-WRITE | - |
| API-07-13 | `api/assessment` | MOD-LRN | PATCH | `/instructor/assessments/{assessmentId}` | S | `assessment.assessment.update` | AssessmentUpdate | Assessment | 200; 403 404 412 428 | - | If-Match | RL-WRITE | - |
| API-07-14 | `api/assessment` | MOD-LRN | POST | `/instructor/assessments/{assessmentId}/publication` | S | `assessment.assessment.publish` | - | Assessment | 200; 403 404 409 422 | - | Key | RL-WRITE | - |

## DOM-08 Learning

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-08-01 | `api/learning` | MOD-LRN | GET | `/courses` | O | `learning.course.list` | - | CoursePage | 200; 429 | Cursor | - | RL-PUBLIC | - |
| API-08-02 | `api/learning` | MOD-LRN | GET | `/courses/{courseId}` | O | `learning.course.read` | - | Course | 200; 404 | - | - | RL-PUBLIC | - |
| API-08-03 | `api/learning` | MOD-LRN | POST | `/courses/{courseId}/enrollments` | S | `learning.enrollment.create` | - | Enrollment | 201; 402:entitlement-required 404 409 | - | Key | RL-WRITE | - |
| API-08-04 | `api/learning` | MOD-LRN | GET | `/me/enrollments` | S | `learning.enrollment.list_own` | - | EnrollmentPage | 200; 401 | Cursor | - | RL-READ | - |
| API-08-05 | `api/learning` | MOD-LRN | POST | `/enrollments/{enrollmentId}/lesson-completions` | S | `learning.progress.complete` | LessonCompletion | Enrollment | 200; 404 409 | - | Key | RL-WRITE | - |
| API-08-06 | `api/learning` | MOD-LRN | GET | `/me/learning-paths` | S | `learning.path.list_own` | - | LearningPathPage | 200; 401 | Cursor | - | RL-READ | - |
| API-08-07 | `api/learning` | MOD-LRN | POST | `/instructor/courses` | S | `learning.course.create` | CourseCreate | Course | 201; 403 422 | - | Key | RL-WRITE | - |
| API-08-08 | `api/learning` | MOD-LRN | PATCH | `/instructor/courses/{courseId}` | S | `learning.course.update` | CourseUpdate | Course | 200; 403 404 412 428 | - | If-Match | RL-WRITE | - |
| API-08-09 | `api/learning` | MOD-LRN | POST | `/instructor/courses/{courseId}/publication` | S | `learning.course.publish` | - | Course | 200; 403 404 409 422 | - | Key | RL-WRITE | - |

## DOM-09 Opportunities

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-09-01 | `api/jobs` | MOD-OPP | GET | `/jobs` | O | `jobs.job.list_public` | - | JobPublicPage | 200; 429 | Cursor | - | RL-PUBLIC | Y |
| API-09-02 | `api/jobs` | MOD-OPP | GET | `/jobs/{jobId}` | O | `jobs.job.read_public` | - | JobPublicView | 200; 404 | - | - | RL-PUBLIC | Y |
| API-09-03 | `api/jobs` | MOD-HIR | GET | `/orgs/{orgId}/jobs` | S+SVC | `jobs.job.list_org` | - | JobPage | 200; 403 | Cursor | - | RL-READ | Y |
| API-09-04 | `api/jobs` | MOD-HIR | POST | `/orgs/{orgId}/jobs` | S+SVC | `jobs.job.create` | JobCreate | Job | 201; 402:entitlement-required 403 422 | - | Key | RL-WRITE | Y |
| API-09-05 | `api/jobs` | MOD-HIR | PATCH | `/jobs/{jobId}` | S+SVC | `jobs.job.update` | JobUpdate | Job | 200; 403 404 412 422 428 | - | If-Match | RL-WRITE | Y |
| API-09-06 | `api/jobs` | MOD-HIR | POST | `/jobs/{jobId}/publication` | S+SVC | `jobs.job.publish` | PublicationRequest | Job | 200; 402:entitlement-required 403 404 409 422 | - | Key | RL-WRITE | Y |
| API-09-07 | `api/jobs` | MOD-HIR | POST | `/jobs/{jobId}/closure` | S+SVC | `jobs.job.close` | ClosureRequest | Job | 200; 403 404 409 | - | Key | RL-WRITE | Y |
| API-09-08 | `api/jobs` | MOD-OPP | PUT | `/me/saved-jobs/{jobId}` | S | `jobs.saved_job.save` | - | SavedJob | 200; 404 | - | Natural key | RL-WRITE | Y |
| API-09-09 | `api/jobs` | MOD-OPP | DELETE | `/me/saved-jobs/{jobId}` | S | `jobs.saved_job.remove` | - | - | 204; 404 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-09-10 | `api/jobs` | MOD-OPP | GET | `/me/saved-jobs` | S | `jobs.saved_job.list` | - | SavedJobPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-09-11 | `api/jobs` | MOD-OPP | GET | `/me/saved-searches` | S | `jobs.saved_search.list` | - | SavedSearchPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-09-12 | `api/jobs` | MOD-OPP | POST | `/me/saved-searches` | S | `jobs.saved_search.create` | SavedSearchCreate | SavedSearch | 201; 422 429 | - | Key | RL-WRITE | Y |
| API-09-13 | `api/jobs` | MOD-OPP | DELETE | `/me/saved-searches/{searchId}` | S | `jobs.saved_search.delete` | - | - | 204; 404 | - | n/a (no state change or token-consuming) | RL-WRITE | Y |
| API-09-14 | `api/jobs` | MOD-HIR | GET | `/orgs/{orgId}/job-templates` | S | `jobs.template.list` | - | JobTemplatePage | 200; 403 | Cursor | - | RL-READ | Y |
| API-09-15 | `api/jobs` | MOD-HIR | POST | `/orgs/{orgId}/job-templates` | S | `jobs.template.create` | JobTemplateCreate | JobTemplate | 201; 403 422 | - | Key | RL-WRITE | Y |

## DOM-10 Applications & Hiring Pipeline

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-10-01 | `api/applications` | MOD-OPP | POST | `/jobs/{jobId}/applications` | S | `applications.application.submit` | ApplicationSubmit | Application | 201; 403:consent-required 404 409:duplicate-application 422 429 | - | Key (required) | RL-WRITE | Y |
| API-10-02 | `api/applications` | MOD-OPP | GET | `/me/applications` | S | `applications.application.list_own` | - | ApplicationPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-10-03 | `api/applications` | MOD-OPP | GET | `/applications/{applicationId}` | S | `applications.application.read` | - | Application | 200; 403 404 | - | - | RL-READ | Y |
| API-10-04 | `api/applications` | MOD-OPP | PUT | `/me/application-drafts/{jobId}` | S | `applications.draft.save` | ApplicationDraftPut | ApplicationDraft | 200; 404 412 422 428 | - | If-Match | RL-WRITE | Y |
| API-10-05 | `api/applications` | MOD-OPP | GET | `/me/application-drafts/{jobId}` | S | `applications.draft.read` | - | ApplicationDraft | 200; 404 | - | - | RL-READ | Y |
| API-10-06 | `api/applications` | MOD-OPP | POST | `/applications/{applicationId}/withdrawal` | S | `applications.application.withdraw` | - | Application | 200; 404 409 | - | Key | RL-WRITE | Y |
| API-10-07 | `api/applications` | MOD-HIR | GET | `/orgs/{orgId}/jobs/{jobId}/applications` | S+SVC | `applications.pipeline.list` | - | PipelineApplicationPage | 200; 403 404 | Cursor | - | RL-READ | Y |
| API-10-08 | `api/applications` | MOD-HIR | POST | `/applications/{applicationId}/stage-transitions` | S | `applications.stage.transition` | StageTransitionRequest | Application | 200; 403 404 409:state-transition-invalid 412 428 | - | Key + If-Match | RL-WRITE | Y |
| API-10-09 | `api/applications` | MOD-OPP | GET | `/applications/{applicationId}/timeline` | S | `applications.timeline.read` | - | TimelinePage | 200; 403 404 | Cursor | - | RL-READ | Y |
| API-10-10 | `api/applications` | MOD-HIR | POST | `/applications/{applicationId}/notes` | S | `applications.note.create` | NoteCreate | Note | 201; 403 404 422 | - | Key | RL-WRITE | Y |
| API-10-11 | `api/applications` | MOD-HIR | GET | `/applications/{applicationId}/notes` | S | `applications.note.list` | - | NotePage | 200; 403 404 | Cursor | - | RL-READ | Y |
| API-10-12 | `api/applications` | MOD-HIR | GET | `/applications/{applicationId}/evidence` | S | `applications.evidence.view` | - | ApplicationEvidenceView | 200; 403:consent-required 404 | - | - | RL-READ | Y |
| API-10-13 | `api/applications` | MOD-HIR | POST | `/applications/{applicationId}/interviews` | S | `applications.interview.schedule` | InterviewCreate | Interview | 201; 403 404 409 422 | - | Key | RL-WRITE | Y |
| API-10-14 | `api/applications` | MOD-HIR | PATCH | `/interviews/{interviewId}` | S | `applications.interview.update` | InterviewUpdate | Interview | 200; 403 404 412 428 | - | If-Match | RL-WRITE | Y |
| API-10-15 | `api/applications` | MOD-HIR | POST | `/interviews/{interviewId}/scorecards` | S | `applications.scorecard.submit` | ScorecardCreate | Scorecard | 201; 403 404 409 422 | - | Key | RL-WRITE | Y |

## DOM-11 Matching, Search & Recommendations

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-11-01 | `api/search` | MOD-OPP | GET | `/search/jobs` | O | `search.jobs.query` | - | JobSearchResultPage | 200; 422 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-02 | `api/search` | MOD-HIR | GET | `/search/candidates` | S | `search.candidates.query` | - | CandidateSearchResultPage | 200; 402 403 422 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-03 | `api/matching` | MOD-OPP | GET | `/me/recommendations/jobs` | S | `matching.recommendation.list` | - | JobRecommendationPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-04 | `api/matching` | MOD-OPP | GET | `/jobs/{jobId}/match-explanation` | S | `matching.explanation.read_own` | - | MatchExplanation | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-11-05 | `api/matching` | MOD-HIR | GET | `/orgs/{orgId}/jobs/{jobId}/shortlist` | S | `matching.shortlist.read` | - | ShortlistPage | 200; 402 403 404 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-06 | `api/matching` | MOD-HIR | GET | `/applications/{applicationId}/match-explanation` | S | `matching.explanation.read_org` | - | MatchExplanation | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |

## DOM-12 Career Intelligence

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-12-01 | `api/careerintel` | MOD-CAND | GET | `/me/career/readiness` | S | `careerintel.readiness.read` | - | ReadinessSnapshot | 200; 401 | - | - | RL-READ | - |
| API-12-02 | `api/careerintel` | MOD-CAND | GET | `/me/career/transitions` | S | `careerintel.transition.list` | - | TransitionSuggestionPage | 200; 401 | Cursor | - | RL-READ | - |
| API-12-03 | `api/careerintel` | MOD-CAND | GET | `/careerintel/salary-bands` | S | `careerintel.salary.list` | - | SalaryBandPage | 200; 401 | Cursor | - | RL-READ | - |
| API-12-04 | `api/careerintel` | MOD-CAND | PUT | `/me/career/goals` | S | `careerintel.goal.set` | CareerGoalPut | CareerGoal | 200; 412 422 428 | - | If-Match | RL-WRITE | - |

## DOM-13 Messaging & Collaboration

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-13-01 | `api/messaging` | MOD-MSG | GET | `/conversations` | S | `messaging.conversation.list` | - | ConversationPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-13-02 | `api/messaging` | MOD-MSG | POST | `/conversations` | S | `messaging.conversation.create` | ConversationCreate | Conversation | 201; 402 403 422 | - | Key | RL-WRITE | Y (addendum) |
| API-13-03 | `api/messaging` | MOD-MSG | GET | `/conversations/{conversationId}/messages` | S | `messaging.message.list` | - | MessagePage | 200; 403 404 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-13-04 | `api/messaging` | MOD-MSG | POST | `/conversations/{conversationId}/messages` | S | `messaging.message.send` | MessageCreate | Message | 201; 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-13-05 | `api/messaging` | MOD-MSG | POST | `/conversations/{conversationId}/read-markers` | S | `messaging.conversation.mark_read` | ReadMarker | - | 204; 404 | - | Natural key | RL-WRITE | Y (addendum) |

## DOM-14 Networking & Community (phase 3, conditional)

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-14-01 | `api/network` | MOD-MSG | GET | `/network/connections` | S | `network.connection.list` | - | ConnectionPage | 200; 401 | Cursor | - | RL-READ | - |
| API-14-02 | `api/network` | MOD-MSG | POST | `/network/connection-requests` | S | `network.connection.request` | ConnectionRequestCreate | Connection | 201; 409 422 429 | - | Key | RL-WRITE | - |
| API-14-03 | `api/network` | MOD-MSG | POST | `/network/connection-requests/{requestId}/response` | S | `network.connection.respond` | ConnectionResponse | Connection | 200; 404 409 | - | Key | RL-WRITE | - |

## DOM-15 Notifications & Engagement

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-15-01 | `api/notify` | MOD-MSG | GET | `/notifications` | S | `notify.notification.list` | - | NotificationPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-15-02 | `api/notify` | MOD-MSG | POST | `/notifications/{notificationId}/read-markers` | S | `notify.notification.mark_read` | - | - | 204; 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-15-03 | `api/notify` | MOD-MSG | POST | `/notifications/read-all` | S | `notify.notification.mark_all_read` | - | - | 204; 401 | - | Natural key | RL-WRITE | Y (addendum) |
| API-15-04 | `api/notify` | MOD-ACC | GET | `/me/notification-preferences` | S | `notify.preference.read` | - | NotificationPreferences | 200; 401 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-15-05 | `api/notify` | MOD-ACC | PUT | `/me/notification-preferences` | S | `notify.preference.set` | NotificationPreferencesPut | NotificationPreferences | 200; 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-15-06 | `api/notify` | MOD-MSG | POST | `/me/push-subscriptions` | S | `notify.push.subscribe` | PushSubscriptionCreate | PushSubscription | 201; 422 | - | Key | RL-WRITE | Y (addendum) |
| API-15-07 | `api/notify` | MOD-MSG | DELETE | `/me/push-subscriptions/{subscriptionId}` | S | `notify.push.unsubscribe` | - | - | 204; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-15-08 | `api/notify` | MOD-SHELL | POST | `/notifications/unsubscribe/{token}` | T | `notify.unsubscribe.one_click` | UnsubscribeRequest | - | 204; 404 410 | - | Natural key | RL-TOKEN | Y (addendum) |
| API-15-09 | `api/notify` | infra | POST | `/webhooks/email` | SIG | `notify.webhook.receive` | EmailProviderEvent | WebhookAck | 200; 400 401 | - | Natural key | RL-WEBHOOK | - |

## DOM-16 Billing, Plans & Entitlements

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-16-01 | `api/billing` | MOD-ACC | GET | `/billing/plans` | O | `billing.plan.list` | - | PlanList | 200; 429 | - | - | RL-PUBLIC | Y |
| API-16-02 | `api/billing` | MOD-ACC | GET | `/me/entitlements` | S | `billing.entitlement.read_own` | - | EntitlementSet | 200; 401 | - | - | RL-READ | Y |
| API-16-03 | `api/billing` | MOD-ACC | GET | `/orgs/{orgId}/billing/subscription` | S | `billing.subscription.read` | - | Subscription | 200; 403 | - | - | RL-READ | Y |
| API-16-04 | `api/billing` | MOD-ACC | POST | `/orgs/{orgId}/billing/checkout-sessions` | S | `billing.checkout.create_org` | CheckoutSessionCreate | CheckoutSession | 201; 403 409 422 503 | - | Key (required) | RL-WRITE | Y |
| API-16-05 | `api/billing` | MOD-ACC | POST | `/me/billing/checkout-sessions` | S | `billing.checkout.create_own` | CheckoutSessionCreate | CheckoutSession | 201; 409 422 503 | - | Key (required) | RL-WRITE | Y |
| API-16-06 | `api/billing` | MOD-ACC | POST | `/orgs/{orgId}/billing/portal-sessions` | S | `billing.portal.create_org` | PortalSessionCreate | PortalSession | 201; 403 409 503 | - | Key (required) | RL-WRITE | Y |
| API-16-07 | `api/billing` | MOD-ACC | POST | `/me/billing/portal-sessions` | S | `billing.portal.create_own` | PortalSessionCreate | PortalSession | 201; 409 503 | - | Key (required) | RL-WRITE | Y |
| API-16-08 | `api/billing` | MOD-ACC | GET | `/orgs/{orgId}/billing/invoices` | S | `billing.invoice.list` | - | InvoicePage | 200; 403 | Cursor | - | RL-READ | Y |
| API-16-09 | `api/billing` | MOD-ACC | POST | `/webhooks/stripe` | SIG | `billing.webhook.receive` | StripeEventPayload | WebhookAck | 200; 400 401 | - | Natural key | RL-WEBHOOK | Y |

## DOM-17 AI Gateway & Governance

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-17-01 | `api/ai` | MOD-CAND, MOD-LRN, MOD-OPP | POST | `/ai/suggestions` | S | `ai.suggestion.create` | AiSuggestionCreate | AiSuggestion | 201; 402:entitlement-required 403:ai-prohibited 403:consent-required 429 503 | - | Key | RL-HEAVY | - |
| API-17-02 | `api/ai` | MOD-CAND | GET | `/ai/suggestions/{suggestionId}` | S | `ai.suggestion.read` | - | AiSuggestion | 200; 404 | - | - | RL-READ | - |
| API-17-03 | `api/ai` | MOD-CAND | POST | `/ai/suggestions/{suggestionId}/disposition` | S | `ai.suggestion.dispose` | AiDisposition | AiSuggestion | 200; 404 409 | - | Key | RL-WRITE | - |
| API-17-04 | `api/ai` | MOD-CAND | GET | `/me/ai/usage` | S | `ai.usage.read_own` | - | AiUsage | 200; 401 | - | - | RL-READ | - |
| API-17-05 | `api/ai` | MOD-ADM | GET | `/admin/ai/budgets` | S | `ai.budget.list` | - | AiBudgetPage | 200; 403 | Cursor | - | RL-READ | - |
| API-17-06 | `api/ai` | MOD-ADM | PUT | `/admin/ai/budgets/{scope}/{scopeKey}` | S | `ai.budget.set` | AiBudgetPut | AiBudget | 200; 403 412 422 428 | - | If-Match | RL-WRITE | - |

## DOM-18 Institutions (B2B2C)

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-18-01 | `api/institutions` | MOD-ADM | GET | `/institutions/{institutionId}` | S | `institutions.institution.read` | - | Institution | 200; 403 404 | - | - | RL-READ | - |
| API-18-02 | `api/institutions` | MOD-ADM | GET | `/institutions/{institutionId}/cohorts` | S | `institutions.cohort.list` | - | CohortPage | 200; 403 | Cursor | - | RL-READ | - |
| API-18-03 | `api/institutions` | MOD-ADM | POST | `/institutions/{institutionId}/cohorts` | S | `institutions.cohort.create` | CohortCreate | Cohort | 201; 403 422 | - | Key | RL-WRITE | - |
| API-18-04 | `api/institutions` | MOD-ADM | GET | `/institutions/{institutionId}/cohorts/{cohortId}/coverage` | S | `institutions.cohort.coverage` | - | CohortCoverage | 200; 403 404 | - | - | RL-HEAVY | - |
| API-18-05 | `api/institutions` | MOD-ADM | POST | `/institutions/{institutionId}/credentials` | S | `institutions.credential.issue` | InstitutionCredentialIssue | Credential | 201; 403 404 422 | - | Key | RL-WRITE | - |
| API-18-06 | `api/institutions` | MOD-ADM | POST | `/institutions/{institutionId}/member-imports` | S | `institutions.member.import` | MemberImportCreate | ImportJob | 202; 403 413 422 | - | Key | RL-HEAVY | - |

## DOM-19 Trust, Safety & Moderation

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-19-01 | `api/safety` | MOD-SHELL | POST | `/reports` | S | `safety.report.create` | ReportCreate | Report | 201; 404 422 | - | Key | RL-WRITE | Y (addendum) |
| API-19-02 | `api/safety` | MOD-ADM | GET | `/admin/moderation/cases` | S | `safety.case.list` | - | ModerationCasePage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-19-03 | `api/safety` | MOD-ADM | POST | `/admin/moderation/cases/{caseId}/decision` | S | `safety.case.decide` | ModerationDecision | ModerationCase | 200; 403 404 409 412 428 | - | Key | RL-WRITE | Y (addendum) |
| API-19-04 | `api/safety` | MOD-SHELL | POST | `/moderation/cases/{caseId}/appeals` | S | `safety.appeal.create` | AppealCreate | Appeal | 201; 404 409 422 | - | Key | RL-WRITE | Y (addendum) |

## DOM-20 Administration, Support & Back Office

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-20-01 | `api/admin` | MOD-ADM | POST | `/admin/support-access-grants` | S | `admin.support_grant.create` | SupportGrantCreate | SupportGrant | 201; 403 422 | - | Key | RL-WRITE | Y (addendum) |
| API-20-02 | `api/admin` | MOD-ADM | DELETE | `/admin/support-access-grants/{grantId}` | S | `admin.support_grant.revoke` | - | - | 204; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-20-03 | `api/admin` | MOD-ADM | GET | `/admin/support-access-grants` | S | `admin.support_grant.list` | - | SupportGrantPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-04 | `api/admin` | MOD-ADM | GET | `/admin/users/{accountId}/summary` | S | `admin.user.summary` | - | UserSupportSummary | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-05 | `api/admin` | MOD-ADM | GET | `/admin/audit-events` | S | `admin.audit.list` | - | AuditEventPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-06 | `api/admin` | MOD-ADM | GET | `/admin/feature-flags` | S | `admin.flag.list` | - | FeatureFlagList | 200; 403 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-07 | `api/admin` | MOD-ADM | PUT | `/admin/feature-flags/{flagKey}` | S | `admin.flag.set` | FeatureFlagPut | FeatureFlag | 200; 403 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |

## DOM-21 Analytics & Reporting

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-21-01 | `api/analytics` | MOD-HIR | GET | `/orgs/{orgId}/analytics/funnel` | S | `analytics.funnel.read` | - | FunnelReport | 200; 403 422 | - | - | RL-HEAVY | - |
| API-21-02 | `api/analytics` | MOD-SHELL | POST | `/analytics/events` | S | `analytics.event.record` | AnalyticsEventBatch | - | 202; 403:consent-required 422 429 | - | n/a (no state change or token-consuming) | RL-WRITE | - |

## DOM-22 Privacy, Consent & Data Rights

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-22-01 | `api/privacy` | MOD-ACC | GET | `/me/consents` | S | `privacy.consent.list` | - | ConsentStateList | 200; 401 | - | - | RL-READ | Y |
| API-22-02 | `api/privacy` | MOD-ACC | PUT | `/me/consents/{scope}` | S | `privacy.consent.set` | ConsentPut | ConsentState | 200; 401 422 | - | Natural key | RL-WRITE | Y |
| API-22-03 | `api/privacy` | MOD-ACC | GET | `/me/consents/history` | S | `privacy.consent.history` | - | ConsentHistoryPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-22-04 | `api/privacy` | MOD-ACC | POST | `/me/data-exports` | S | `privacy.export.request` | DataExportCreate | DataExport | 202; 403:step-up-required 409 429 | - | Key (required) | RL-HEAVY | Y |
| API-22-05 | `api/privacy` | MOD-ACC | GET | `/me/data-exports` | S | `privacy.export.list` | - | DataExportPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-22-06 | `api/privacy` | MOD-ACC | GET | `/me/data-exports/{exportId}` | S | `privacy.export.read` | - | DataExport | 200; 404 | - | - | RL-READ | Y |
| API-22-07 | `api/privacy` | MOD-ACC | GET | `/me/data-exports/{exportId}/download-url` | S | `privacy.export.download` | - | SignedUrl | 200; 404 409 410 | - | - | RL-READ | Y |
| API-22-08 | `api/privacy` | MOD-ACC | POST | `/me/erasure-requests` | S | `privacy.erasure.request` | ErasureRequestCreate | ErasureRequest | 202; 403:step-up-required 409 422 | - | Key (required) | RL-WRITE | Y |
| API-22-09 | `api/privacy` | MOD-ACC | GET | `/me/erasure-requests/{requestId}` | S | `privacy.erasure.read` | - | ErasureRequest | 200; 404 | - | - | RL-READ | Y |
| API-22-10 | `api/privacy` | MOD-ACC | POST | `/me/erasure-requests/{requestId}/cancellation` | S | `privacy.erasure.cancel` | - | ErasureRequest | 200; 404 409 | - | Key | RL-WRITE | Y |
| API-22-11 | `api/privacy` | MOD-ACC | POST | `/me/data-rights-requests` | S | `privacy.rights.request` | DataRightsRequestCreate | DataRightsRequest | 202; 422 429 | - | Key | RL-WRITE | Y |
| API-22-12 | `api/privacy` | MOD-ACC | GET | `/me/data-rights-requests` | S | `privacy.rights.list` | - | DataRightsRequestPage | 200; 401 | Cursor | - | RL-READ | Y |
| API-22-13 | `api/privacy` | MOD-ACC | GET | `/me/access-log` | S | `privacy.access_log.list` | - | AccessLogPage | 200; 401 | Cursor | - | RL-READ | Y |

## DOM-23 Integrations & Developer Platform

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-23-01 | `api/integrations` | MOD-ADM | GET | `/orgs/{orgId}/webhook-endpoints` | S | `integrations.webhook.list` | - | WebhookEndpointList | 200; 403 | - | - | RL-READ | - |
| API-23-02 | `api/integrations` | MOD-ADM | POST | `/orgs/{orgId}/webhook-endpoints` | S | `integrations.webhook.create` | WebhookEndpointCreate | WebhookEndpoint | 201; 403 422 | - | Key | RL-WRITE | - |
| API-23-03 | `api/integrations` | MOD-ADM | DELETE | `/orgs/{orgId}/webhook-endpoints/{endpointId}` | S | `integrations.webhook.delete` | - | - | 204; 403 404 | - | n/a (no state change or token-consuming) | RL-WRITE | - |
| API-23-04 | `api/integrations` | MOD-ADM | POST | `/orgs/{orgId}/webhook-endpoints/{endpointId}/tests` | S | `integrations.webhook.test` | - | WebhookTestResult | 200; 403 404 429 | - | Key | RL-HEAVY | - |
| API-23-05 | `api/integrations` | MOD-ADM | GET | `/orgs/{orgId}/api-clients` | S | `integrations.client.list` | - | ApiClientList | 200; 403 | - | - | RL-READ | - |
| API-23-06 | `api/integrations` | MOD-ADM | POST | `/orgs/{orgId}/api-clients` | S | `integrations.client.create` | ApiClientCreate | ApiClientSecret | 201; 403 422 | - | Key | RL-WRITE | - |
| API-23-07 | `api/integrations` | MOD-ADM | DELETE | `/orgs/{orgId}/api-clients/{clientId}` | S | `integrations.client.revoke` | - | - | 204; 403 404 | - | n/a (no state change or token-consuming) | RL-WRITE | - |
| API-23-08 | `api/integrations` | infra | POST | `/oauth/token` | N | `integrations.token.issue` | ServiceTokenRequest | ServiceToken | 200; 400 401 429 | - | n/a (no state change or token-consuming) | RL-AUTH | - |
| API-23-09 | `api/integrations` | MOD-ADM | POST | `/imports` | S+SVC | `integrations.import.create` | ImportCreate | ImportJob | 202; 403 413 422 429 | - | Key | RL-HEAVY | - |
| API-23-10 | `api/integrations` | MOD-ADM | GET | `/imports/{importId}` | S+SVC | `integrations.import.read` | - | ImportJob | 200; 403 404 | - | - | RL-READ | - |

## DOM-24 Platform (flags, media, job queue, observability)

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-24-01 | `api/platform` | MOD-CAND, MOD-LRN, MOD-ACC | POST | `/files/upload-intents` | S | `platform.file.intent` | UploadIntentRequest | UploadIntent | 201; 413 415 422 429 | - | Key | RL-WRITE | Y |
| API-24-02 | `api/platform` | MOD-CAND, MOD-LRN, MOD-ACC | POST | `/files/{fileId}/completion` | S | `platform.file.complete` | FileCompleteRequest | FileObject | 202; 404 409 422 | - | Key | RL-WRITE | Y |
| API-24-03 | `api/platform` | MOD-CAND, MOD-LRN, MOD-ACC | GET | `/files/{fileId}` | S | `platform.file.read` | - | FileObject | 200; 404 | - | - | RL-READ | Y |
| API-24-04 | `api/platform` | infra | GET | `/healthz` | N | `platform.health.live` | - | HealthStatus | 200; - | - | - | RL-PUBLIC | - |
| API-24-05 | `api/platform` | infra | GET | `/readyz` | N | `platform.health.ready` | - | ReadyStatus | 200; 503 | - | - | RL-PUBLIC | - |
| API-24-06 | `api/platform` | MOD-ADM | GET | `/admin/jobs` | S | `platform.job.list` | - | BackgroundJobPage | 200; 403 | Cursor | - | RL-READ | - |
| API-24-07 | `api/platform` | MOD-ADM | GET | `/admin/jobs/{jobId}` | S | `platform.job.read` | - | BackgroundJob | 200; 403 404 | - | - | RL-READ | - |
| API-24-08 | `api/platform` | MOD-ADM | POST | `/admin/jobs/{jobId}/cancellation` | S | `platform.job.cancel` | - | BackgroundJob | 200; 403 404 409 | - | Key | RL-WRITE | - |
| API-24-09 | `api/platform` | MOD-ADM | POST | `/admin/jobs/{jobId}/retry` | S | `platform.job.retry` | - | BackgroundJob | 200; 403 404 409 | - | Key | RL-WRITE | - |
| API-24-10 | `api/platform` | MOD-ADM | GET | `/admin/dead-letters` | S | `platform.deadletter.list` | - | BackgroundJobPage | 200; 403 | Cursor | - | RL-READ | - |

## Operations added by the REV2 pass (folded 2026-10-27)

Rows below were defined in `API_CATALOG_ADDENDUM.md` and are defined in `contracts/openapi.yaml` (merged). Counts in the summary below pre-date this fold.

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| API-01-23 | `api/identity` | MOD-SHELL | POST | `/auth/step-up/challenges` | S | `identity.stepup.challenge` | StepUpChallengeRequest | StepUpChallenge | 200; 401 422 429 | - | Key | RL-AUTH | Y (addendum) |
| API-01-24 | `api/identity` | MOD-SHELL | POST | `/auth/step-up/verification` | S | `identity.stepup.verify` | StepUpVerifyRequest | SessionInfo | 200; 401 422 429 | - | n/a (read-only, token-consuming or state-guarded) | RL-AUTH | Y (addendum) |
| API-01-25 | `api/identity` | MOD-SHELL | POST | `/auth/sso/discovery` | N | `identity.sso.discover` | SsoDiscoveryRequest | SsoDiscovery | 200; 422 429 | - | n/a (read-only, token-consuming or state-guarded) | RL-AUTH | Y (addendum) |
| API-01-26 | `api/identity` | MOD-SHELL | POST | `/auth/recovery/requests` | N | `identity.recovery.request` | RecoveryRequest | AcceptedReceipt | 202; 422 429 | - | Key | RL-AUTH | Y (addendum) |
| API-01-27 | `api/identity` | MOD-SHELL | POST | `/auth/recovery/completion` | T | `identity.recovery.complete` | RecoveryCompletion | - | 204; 404 410 422 429 | - | n/a (read-only, token-consuming or state-guarded) | RL-TOKEN | Y (addendum) |
| API-01-28 | `api/identity` | MOD-ACC | POST | `/me/email-change-requests` | S | `identity.email.change_request` | EmailChangeRequest | AcceptedReceipt | 202; 401 403 409 422 429 | - | Key | RL-AUTH | Y (addendum) |
| API-01-29 | `api/identity` | MOD-SHELL | POST | `/auth/email/change-confirmation` | T | `identity.email.change_confirm` | EmailChangeConfirmRequest | - | 204; 404 410 422 429 | - | n/a (read-only, token-consuming or state-guarded) | RL-TOKEN | Y (addendum) |
| API-01-30 | `api/identity` | MOD-ACC | PATCH | `/me/passkeys/{passkeyId}` | S | `identity.passkey.rename` | PasskeyRename | Passkey | 200; 401 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-01-31 | `api/identity` | MOD-ACC | DELETE | `/auth/sessions` | S | `identity.session.revoke_others` | - | - | 204; 401 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-01-32 | `api/identity` | MOD-ACC | GET | `/me/preferences` | S | `identity.preferences.read` | - | Preferences | 200; 401 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-01-33 | `api/identity` | MOD-ACC | PUT | `/me/preferences` | S | `identity.preferences.set` | PreferencesPut | Preferences | 200; 401 412 422 428 | - | Natural key | RL-WRITE | Y (addendum) |
| API-01-34 | `api/identity` | MOD-ACC | POST | `/me/deactivation` | S | `identity.account.deactivate` | DeactivationRequest | Account | 200; 401 403 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-02-12 | `api/orgs` | MOD-HIR | POST | `/orgs/{orgId}/ownership-transfer` | S | `orgs.owner.transfer` | OwnershipTransferRequest | OwnershipTransfer | 200; 401 403 404 409 412 422 428 | - | Key (required) | RL-WRITE | Y (addendum) |
| API-02-13 | `api/orgs` | MOD-HIR | POST | `/orgs/{orgId}/verification-submissions` | S | `orgs.verification.submit` | OrgVerificationSubmit | OrgVerification | 202; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-02-14 | `api/orgs` | MOD-ADM | POST | `/admin/org-verifications/{orgId}/decisions` | S | `orgs.verification.decide` | OrgVerificationDecision | OrgVerification | 200; 401 403 404 409 412 422 428 | - | Key | RL-WRITE | Y (addendum) |
| API-03-13 | `api/profile` | MOD-CAND | PUT | `/me/profile/skills/{skillId}` | S | `profile.skill.put` | ProfileSkillPut | ProfileSkill | 200; 401 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-03-14 | `api/profile` | MOD-CAND | DELETE | `/me/profile/skills/{skillId}` | S | `profile.skill.remove` | - | - | 204; 401 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-03-15 | `api/profile` | MOD-CAND | PUT | `/me/portfolio-items/order` | S | `profile.portfolio.reorder` | PortfolioOrderPut | PortfolioOrder | 200; 401 404 412 422 428 | - | Natural key | RL-WRITE | Y (addendum) |
| API-03-16 | `api/profile` | MOD-CAND | GET | `/me/profile/preview` | S | `profile.preview.read` | - | ProfilePreview | 200; 401 422 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-05-15 | `api/evidence` | MOD-CAND | GET | `/evidence/{evidenceId}/provenance` | S | `evidence.provenance.read` | - | EvidenceProvenance | 200; 401 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-06-19 | `api/verification` | MOD-CAND | POST | `/verification/disputes/{disputeId}/responses` | S | `verification.dispute.respond` | DisputeResponseCreate | DisputeResponse | 201; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-06-20 | `api/verification` | MOD-SHELL | POST | `/referee/requests/{token}/reports` | T | `verification.referee.report` | RefereeReportCreate | RefereeReportReceipt | 201; 404 410 422 429 | - | Key | RL-TOKEN | Y (addendum) |
| API-06-21 | `api/verification` | MOD-SHELL | POST | `/referee/requests/{token}/link-requests` | T | `verification.referee.resend_link` | RefereeLinkRequest | AcceptedReceipt | 202; 422 429 | - | Key | RL-TOKEN | Y (addendum) |
| API-09-16 | `api/jobs` | MOD-OPP | PATCH | `/me/saved-searches/{searchId}` | S | `jobs.saved_search.update` | SavedSearchUpdate | SavedSearch | 200; 401 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-09-17 | `api/jobs` | MOD-OPP | PUT | `/me/hidden-jobs/{jobId}` | S | `jobs.hidden_job.put` | - | HiddenJob | 200; 401 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-09-18 | `api/jobs` | MOD-OPP | PUT | `/me/followed-orgs/{orgId}` | S | `jobs.followed_org.put` | - | FollowedOrg | 200; 401 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-09-19 | `api/jobs` | MOD-HIR | POST | `/jobs/{jobId}/pauses` | S | `jobs.job.pause` | JobPauseRequest | Job | 200; 401 403 404 409 412 428 | - | Key | RL-WRITE | Y (addendum) |
| API-09-20 | `api/jobs` | MOD-HIR | POST | `/jobs/{jobId}/resumptions` | S | `jobs.job.resume` | - | Job | 200; 401 403 404 409 412 428 | - | Key | RL-WRITE | Y (addendum) |
| API-09-21 | `api/jobs` | MOD-HIR | PUT | `/jobs/{jobId}/schedule` | S | `jobs.job.schedule` | JobSchedulePut | Job | 200; 401 403 404 409 412 422 428 | - | Natural key | RL-WRITE | Y (addendum) |
| API-09-22 | `api/jobs` | MOD-HIR | POST | `/jobs/{jobId}/review-decisions` | S | `jobs.job.review_decide` | JobReviewDecision | Job | 200; 401 403 404 409 412 422 428 | - | Key | RL-WRITE | Y (addendum) |
| API-09-23 | `api/jobs` | MOD-HIR | POST | `/jobs/{jobId}/clones` | S | `jobs.job.clone` | JobCloneRequest | Job | 201; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-10-16 | `api/applications` | MOD-OPP | POST | `/interviews/{interviewId}/slot-selection` | S | `applications.interview.select_slot` | InterviewSlotSelection | Interview | 200; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-10-17 | `api/applications` | MOD-HIR | POST | `/interviews/{interviewId}/slot-proposals` | S | `applications.interview.propose_slots` | SlotProposalCreate | Interview | 200; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-10-18 | `api/applications` | MOD-OPP | POST | `/applications/{applicationId}/offer-response` | S | `applications.offer.respond` | OfferResponse | Application | 200; 401 403 404 409 412 422 428 | - | Key (required) | RL-WRITE | Y (addendum) |
| API-10-19 | `api/applications` | MOD-HIR | PUT | `/applications/{applicationId}/assignee` | S | `applications.assignee.put` | AssigneePut | Assignee | 200; 401 403 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-10-20 | `api/applications` | MOD-HIR | POST | `/applications/{applicationId}/offers` | S | `applications.offer.create` | OfferCreate | Offer | 201; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-10-21 | `api/applications` | MOD-HIR | POST | `/applications/{applicationId}/offers/{offerId}/delivery` | S | `applications.offer.deliver` | - | Application | 200; 401 403 404 409 412 428 | - | Key (required) | RL-WRITE | Y (addendum) |
| API-10-22 | `api/applications` | MOD-HIR | POST | `/orgs/{orgId}/jobs/{jobId}/applications/stage-transitions` | S | `applications.stage.transition_bulk` | BulkStageTransitionRequest | OperationAccepted | 202; 401 403 404 422 428 | - | Key (required) | RL-HEAVY | Y (addendum) |
| API-10-23 | `api/applications` | MOD-HIR | GET | `/orgs/{orgId}/jobs/{jobId}/applications/comparison` | S | `applications.comparison.read` | - | ComparisonView | 200; 401 403 404 422 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-11-07 | `api/matching` | MOD-HIR | PUT | `/orgs/{orgId}/jobs/{jobId}/shortlist/{candidateRef}` | S | `matching.shortlist.put` | ShortlistPut | ShortlistEntry | 200; 401 403 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-11-08 | `api/search` | MOD-SHELL | GET | `/search/workspace` | S | `search.workspace.query` | - | WorkspaceSearchPage | 200; 401 422 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-13-06 | `api/messaging` | MOD-MSG | PUT | `/conversations/{conversationId}/mute` | S | `messaging.conversation.mute` | MutePut | ConversationFlags | 200; 401 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-13-07 | `api/messaging` | MOD-MSG | PUT | `/conversations/{conversationId}/archive` | S | `messaging.conversation.archive` | ArchivePut | ConversationFlags | 200; 401 404 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-13-08 | `api/messaging` | MOD-MSG | POST | `/first-contact-requests/{requestId}/response` | S | `messaging.first_contact.respond` | FirstContactResponse | FirstContactRequest | 200; 401 403 404 409 412 422 428 | - | Key | RL-WRITE | Y (addendum) |
| API-13-09 | `api/messaging` | MOD-MSG | PATCH | `/conversations/{conversationId}/messages/{messageId}` | S | `messaging.message.edit` | MessageEdit | Message | 200; 401 403 404 409 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-13-10 | `api/messaging` | MOD-MSG | PUT | `/conversations/{conversationId}/messages/{messageId}` | S | `messaging.message.put` | MessagePut | Message | 200; 401 403 404 409 422 | - | Natural key | RL-WRITE | Y (addendum) |
| API-13-11 | `api/messaging` | MOD-MSG | DELETE | `/conversations/{conversationId}/messages/{messageId}` | S | `messaging.message.delete` | - | - | 204; 401 403 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-13-12 | `api/messaging` | MOD-MSG | PUT | `/me/blocked-accounts/{accountRef}` | S | `messaging.block.put` | - | BlockedAccount | 200; 401 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-13-13 | `api/messaging` | MOD-MSG | DELETE | `/me/blocked-accounts/{accountRef}` | S | `messaging.block.remove` | - | - | 204; 401 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-13-14 | `api/messaging` | MOD-HIR | POST | `/orgs/{orgId}/messages/bulk` | S | `messaging.message.bulk_send` | BulkMessageRequest | OperationAccepted | 202; 401 403 404 422 428 | - | Key (required) | RL-HEAVY | Y (addendum) |
| API-13-15 | `api/messaging` | MOD-HIR | POST | `/first-contact-requests` | S | `messaging.first_contact.send` | FirstContactCreate | FirstContactRequest | 201; 401 403 404 409 422 428 | - | Key (required) | RL-WRITE | Y (addendum) |
| API-13-16 | `api/messaging` | MOD-HIR | POST | `/first-contact-requests/{requestId}/withdrawal` | S | `messaging.first_contact.withdraw` | - | FirstContactRequest | 200; 401 403 404 409 412 428 | - | Key | RL-WRITE | Y (addendum) |
| API-13-17 | `api/messaging` | MOD-MSG | GET | `/me/first-contact-requests` | S | `messaging.first_contact.list_own` | - | FirstContactRequestPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-18 | `api/admin` | MOD-ADM | POST | `/admin/support-access-grants/{grantId}/approval` | S | `admin.support_grant.decide` | SupportGrantDecision | SupportGrant | 200; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-22-14 | `api/privacy` | MOD-HIR | POST | `/consent-requests` | S | `privacy.consent_request.create` | ConsentRequestCreate | ConsentRequest | 201; 401 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-22-15 | `api/privacy` | MOD-ADM | POST | `/admin/data-rights-requests/{requestId}/transitions` | S | `privacy.rights.transition` | DataRightsTransition | DataRightsRequest | 200; 401 403 404 409 412 422 428 | - | Key | RL-WRITE | Y (addendum) |
| API-22-16 | `api/privacy` | MOD-ADM | GET | `/admin/data-rights-requests` | S | `privacy.rights.list_queue` | - | DataRightsRequestAdminPage | 200; 401 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-24-11 | `api/platform` | MOD-HIR | GET | `/operations/{operationId}` | S | `platform.operation.read` | - | Operation | 200; 401 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-24-12 | `api/platform` | MOD-HIR | POST | `/operations/{operationId}/cancellation` | S | `platform.operation.cancel` | - | Operation | 200; 401 403 404 409 | - | Natural key | RL-WRITE | Y (addendum) |
| API-24-13 | `api/platform` | MOD-SHELL | POST | `/feedback` | S | `platform.feedback.create` | FeedbackCreate | FeedbackReceipt | 201; 401 422 | - | Key | RL-WRITE | Y (addendum) |
| API-05-16 | `api/evidence` | MOD-CAND | POST | `/me/evidence/from-enrollment` | S | `evidence.item.create_from_course` | EvidenceFromEnrollment | EvidenceItem | 201; 404 409 422 | - | Key | RL-WRITE | - |
| API-05-17 | `api/evidence` | MOD-LRN | POST | `/me/evidence/from-attempt` | S | `evidence.item.create_from_attempt` | EvidenceFromAttempt | EvidenceItem | 201; 404 409 422 | - | Key | RL-WRITE | - |
| API-05-18 | `api/evidence` | MOD-LRN | POST | `/instructor/enrollments/{enrollmentId}/outcome-confirmation` | S | `evidence.instructor.signoff` | InstructorSignoff | EvidenceItem | 201; 403 404 409 422 | - | Key | RL-WRITE | - |
| API-07-15 | `api/assessment` | MOD-LRN | PUT | `/attempts/{attemptId}/questions/{questionId}/flag` | S | `assessment.question.flag` | QuestionFlagPut | Answer | 200; 404 409 | - | Natural key | RL-WRITE | - |
| API-07-16 | `api/assessment` | MOD-LRN | POST | `/attempts/{attemptId}/code-runs` | S | `assessment.code.run` | CodeRunRequest | CodeRunResult | 202; 404 409 429 | - | Key | RL-HEAVY | - |
| API-07-17 | `api/assessment` | MOD-LRN | POST | `/attempts/{attemptId}/pauses` | S | `assessment.attempt.pause` | - | Attempt | 200; 404 409 | - | Key | RL-WRITE | - |
| API-07-18 | `api/assessment` | MOD-LRN | POST | `/assessments/{assessmentId}/accommodation-requests` | S | `assessment.accommodation.request` | AccommodationRequestCreate | AccommodationRequest | 201; 404 409 422 | - | Key | RL-WRITE | - |
| API-08-10 | `api/learning` | MOD-LRN | GET | `/courses/{courseId}/lessons/{lessonId}` | S | `learning.lesson.read` | - | Lesson | 200; 403 404 | - | - | RL-READ | - |
| API-08-11 | `api/learning` | MOD-LRN | POST | `/enrollments/{enrollmentId}/quiz-submissions` | S | `learning.quiz.submit` | QuizSubmission | QuizResult | 200; 404 409 422 | - | Key | RL-WRITE | - |
| API-08-12 | `api/learning` | MOD-LRN | PUT | `/enrollments/{enrollmentId}/lessons/{lessonId}/note` | S | `learning.note.put` | LessonNotePut | LessonNote | 200; 404 422 | - | Natural key | RL-WRITE | - |
| API-08-13 | `api/learning` | MOD-LRN | POST | `/courses/{courseId}/reviews` | S | `learning.review.create` | ReviewCreate | Review | 201; 403 404 409 422 | - | Key | RL-WRITE | - |
| API-08-14 | `api/learning` | MOD-LRN | POST | `/learning-paths/{pathId}/enrollments` | S | `learning.path.start` | - | LearningPathEnrollment | 201; 404 409 | - | Key | RL-WRITE | - |
| API-08-15 | `api/learning` | MOD-LRN | PUT | `/instructor/courses/{courseId}/lessons/{lessonId}` | S | `learning.lesson.put` | LessonPut | Lesson | 200; 404 412 422 428 | - | If-Match | RL-WRITE | - |
| API-08-16 | `api/learning` | MOD-LRN | DELETE | `/instructor/courses/{courseId}/publication` | S | `learning.course.unpublish` | - | Course | 200; 404 409 | - | If-Match | RL-WRITE | - |
| API-08-17 | `api/learning` | MOD-LRN | POST | `/courses/{courseId}/reviews/{reviewId}/replies` | S | `learning.review.reply` | ReviewReplyCreate | ReviewReply | 201; 403 404 422 | - | Key | RL-WRITE | - |
| API-16-10 | `api/billing` | MOD-ACC | GET | `/billing/checkout-sessions/{sessionId}` | S | `billing.checkout.read` | - | CheckoutSession | 200; 404 | - | - | RL-READ | - |
| API-16-11 | `api/billing` | MOD-ACC | POST | `/orgs/{orgId}/billing/subscription/cancellation` | S | `billing.subscription.cancel` | - | Subscription | 200; 404 409 428 | - | Key (required) | RL-WRITE | - |
| API-16-12 | `api/billing` | MOD-ACC | PUT | `/orgs/{orgId}/billing/seats` | S | `billing.seats.set` | SeatCountPut | Subscription | 200; 404 409 412 422 | - | If-Match | RL-WRITE | - |
| API-16-13 | `api/billing` | MOD-ACC | GET | `/orgs/{orgId}/billing/invoices/{invoiceId}/download-url` | S | `billing.invoice.download` | - | SignedUrl | 200; 404 | - | - | RL-READ | - |
| API-16-14 | `api/billing` | MOD-ACC | POST | `/me/billing/refund-requests` | S | `billing.refund.request` | RefundRequestCreate | RefundRequest | 201; 404 409 422 | - | Key (required) | RL-WRITE | - |
| API-16-15 | `api/billing` | MOD-HIR | PUT | `/orgs/{orgId}/billing/seats/{accountId}` | S | `billing.seat.assign` | - | Seat | 200; 404 409 | - | Natural key | RL-WRITE | - |
| API-18-07 | `api/institutions` | MOD-INS | POST | `/institutions/{institutionId}/cohorts/{cohortId}/notices` | S | `institutions.notice.publish` | CohortNoticeCreate | CohortNotice | 201; 403 404 422 | - | Key | RL-WRITE | - |
| API-18-08 | `api/institutions` | MOD-INS | POST | `/institutions/{institutionId}/cohorts/{cohortId}/invitations` | S | `institutions.invitation.create` | CohortInvitationCreate | CohortInvitationBatch | 202; 403 404 422 | - | Key | RL-HEAVY | - |
| API-18-09 | `api/institutions` | MOD-INS | POST | `/institutions/{institutionId}/credentials/{credentialId}/revocation` | S | `institutions.credential.revoke` | InstitutionCredentialRevoke | Credential | 200; 403 404 409 | - | Key + If-Match | RL-WRITE | - |
| API-18-10 | `api/institutions` | MOD-INS | POST | `/institutions/{institutionId}/reports` | S | `institutions.report.export` | InstitutionReportCreate | ExportJob | 202; 403 404 422 | - | Key | RL-HEAVY | - |
| API-19-05 | `api/safety` | MOD-ADM | GET | `/admin/moderation/cases/{caseId}` | S | `safety.case.read` | - | ModerationCase | 200; 403 404 | - | - | RL-READ | - |
| API-19-06 | `api/safety` | MOD-ADM | POST | `/admin/moderation/cases/{caseId}/information-requests` | S | `safety.case.request_info` | InformationRequestCreate | ModerationCase | 200; 403 404 409 422 | - | Key | RL-WRITE | - |
| API-19-07 | `api/safety` | MOD-ADM | POST | `/admin/moderation/appeals/{appealId}/decision` | S | `safety.appeal.decide` | AppealDecision | Appeal | 200; 403 404 409 422 | - | Key + If-Match | RL-WRITE | - |
| API-20-08 | `api/admin` | MOD-ADM | POST | `/admin/notices` | S | `admin.notice.publish` | PlatformNoticeCreate | PlatformNotice | 201; 403 422 | - | Key | RL-WRITE | - |
| API-20-09 | `api/admin` | MOD-HIR | POST | `/orgs/{orgId}/audit-exports` | S | `orgs.audit.export` | AuditExportCreate | ExportJob | 202; 403 404 422 | - | Key | RL-HEAVY | - |
| API-20-10 | `api/admin` | MOD-ADM | POST | `/admin/users/{accountId}/field-reveals` | S | `admin.user.reveal_field` | FieldRevealRequest | FieldReveal | 200; 403 404 422 | - | Key | RL-WRITE | - |
| API-20-11 | `api/admin` | MOD-ADM | POST | `/admin/support-cases/{caseId}/notes` | S | `admin.case.add_note` | CaseNoteCreate | CaseNote | 201; 403 404 422 | - | Key | RL-WRITE | - |
| API-20-12 | `api/admin` | MOD-ADM | POST | `/admin/support-cases/{caseId}/escalation` | S | `admin.case.escalate` | EscalationCreate | SupportCase | 200; 403 404 409 | - | Key | RL-WRITE | - |
| API-20-13 | `api/admin` | MOD-ADM | GET | `/admin/directory` | S | `admin.directory.search` | - | DirectoryPage | 200; 403 422 | Cursor | - | RL-HEAVY | - |
| API-20-14 | `api/admin` | MOD-ADM | PUT | `/admin/accounts/{accountId}/platform-roles/{role}` | S | `admin.role.grant` | - | PlatformRoleGrant | 200; 403 404 409 | - | Natural key | RL-WRITE | - |
| API-20-15 | `api/admin` | MOD-ADM | DELETE | `/admin/accounts/{accountId}/platform-roles/{role}` | S | `admin.role.revoke` | - | - | 204; 403 404 | - | Natural key | RL-WRITE | - |
| API-20-16 | `api/admin` | MOD-ADM | POST | `/admin/role-reviews/{reviewId}/attestation` | S | `admin.role_review.attest` | RoleReviewAttest | RoleReview | 200; 403 404 409 | - | Key | RL-WRITE | - |
| API-20-17 | `api/admin` | MOD-ADM | POST | `/admin/audit-exports` | S | `admin.audit.export` | AuditExportCreate | ExportJob | 202; 403 422 | - | Key | RL-HEAVY | - |
| API-21-03 | `api/analytics` | MOD-HIR | POST | `/orgs/{orgId}/exports` | S | `analytics.export.create` | OrgExportCreate | ExportJob | 202; 403 404 422 | - | Key | RL-HEAVY | - |
| API-23-11 | `api/integrations` | MOD-ACC | PUT | `/me/integrations/{provider}` | S | `integrations.connection.put` | IntegrationConnect | IntegrationConnection | 200; 404 422 | - | Natural key | RL-WRITE | - |
| API-23-12 | `api/integrations` | MOD-ACC | DELETE | `/me/integrations/{provider}` | S | `integrations.connection.delete` | - | - | 204; 404 | - | Natural key | RL-WRITE | - |
| API-24-14 | `api/platform` | MOD-ADM | POST | `/admin/remotes/{remoteId}/rollback` | S | `platform.remote.rollback` | RemoteRollback | RemoteState | 200; 403 404 409 | - | Key | RL-WRITE | - |
| API-24-15 | `api/platform` | MOD-ADM | POST | `/admin/remotes/{remoteId}/pin` | S | `platform.remote.pin` | RemotePin | RemoteState | 200; 403 404 409 | - | Key | RL-WRITE | - |

## Summary by domain

| Domain | Endpoints | In OpenAPI |
|---|---|---|
| DOM-01 Identity, Sessions & Access | 22 | 22 |
| DOM-02 Organizations, Tenancy & Roles | 11 | 0 |
| DOM-03 Profile, Portfolio & Resume | 12 | 0 |
| DOM-04 Skills Graph & Taxonomy | 6 | 0 |
| DOM-05 Evidence & Credentials | 14 | 14 |
| DOM-06 Verification & Trust | 18 | 18 |
| DOM-07 Assessment, Challenges & Integrity | 14 | 0 |
| DOM-08 Learning | 9 | 0 |
| DOM-09 Opportunities | 15 | 15 |
| DOM-10 Applications & Hiring Pipeline | 15 | 15 |
| DOM-11 Matching, Search & Recommendations | 6 | 0 |
| DOM-12 Career Intelligence | 4 | 0 |
| DOM-13 Messaging & Collaboration | 5 | 0 |
| DOM-14 Networking & Community (phase 3, conditional) | 3 | 0 |
| DOM-15 Notifications & Engagement | 9 | 0 |
| DOM-16 Billing, Plans & Entitlements | 9 | 9 |
| DOM-17 AI Gateway & Governance | 6 | 0 |
| DOM-18 Institutions (B2B2C) | 6 | 0 |
| DOM-19 Trust, Safety & Moderation | 4 | 0 |
| DOM-20 Administration, Support & Back Office | 7 | 0 |
| DOM-21 Analytics & Reporting | 2 | 0 |
| DOM-22 Privacy, Consent & Data Rights | 13 | 13 |
| DOM-23 Integrations & Developer Platform | 10 | 0 |
| DOM-24 Platform (flags, media, job queue, observability) | 10 | 3 |
| **Total** | **230** | **109** |

## Coverage checks (mechanical)
- Every row has a policy action (229 distinct actions; some routes share an action when they are two doors to one capability, e.g. `identity.session.create`). FF-01 passes by construction.
- Unsafe methods: 131; of these 84 accept `Idempotency-Key` or are naturally idempotent, 21 are guarded by `If-Match` only, and the remainder are token-consuming, deletions of an already-addressed resource, or logout (idempotent by HTTP semantics; FF-07 lint accepts `idempotent:'http'` for DELETE and for token-consuming routes with a justification in the route registry).
- AuthN mix: N: 11, O: 10, R: 1, S: 192, S+SVC: 8, SIG: 2, T: 6.
- Cross-tenant canary (FF-05) is generated from every row whose path contains `{orgId}`, `{institutionId}` or a resource id loaded by a tenant-owned repository.

## Notes
- Webhook receivers (`POST /webhooks/stripe`) are in the catalog but not callable by the product UI; their security is the signature, not the cookie.
- `GET /healthz` and `GET /readyz` are unversioned operational routes mounted at the root in deployment; they are listed under `/api/v1` here only for completeness of the policy registry.
- Admin routes (`/admin/*`) are served only to remote MOD-ADM and are additionally IP/network-policy restricted at the edge [TARGET]; the authoritative control is policy + grants.
- Endpoints for DOM-14 are **phase 3, conditional** (DOMAIN_ARCHITECTURE §6).
- Search/Match: `GET /search/jobs` and `GET /jobs` are deliberately separate: the former ranks (heavier limit class), the latter filters deterministically (cheap, cacheable).
