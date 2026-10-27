# API Catalog Addendum (APIC-02)

Doc ID: APIC-02 · Owner: Backend Architecture Team · Version 1.0 · Status: Under Review · Relates: APIC-01 `API_CATALOG.md`, API-STD, MAP-01 `ACTION_TO_OPERATION_MAP.md`, REVW-08, REVW-09, REVW-12, REVW-14, REVW-34

> **Rows folded into `API_CATALOG.md` on 2026-10-27.** Sections 3-5 (overrides) still apply; the OpenAPI addendum is merged into `contracts/openapi.yaml`.

Supersession: supersedes nothing; it adds rows and states overrides. APIC-01 stays as published; where this addendum states an override, readers apply it. All **[TARGET]**; nothing is implemented.

## 1. Scope

New rows keep the APIC-01 column legend and numbering (the next free number per domain; no existing id is renumbered). Section 2 lists the **117** operations that have full OpenAPI definitions in `contracts/openapi.addendum.yaml` (OpenAPI = `Y (addendum)`): 60 new rows and 57 existing APIC-01 rows in P0 domains (orgs, profile, skills read, search, matching, messaging, notifications) that previously had only reserved schema names. Section 3 lists **43** catalogue-only rows for later phases (OpenAPI = `-`). Combined: 333 catalog rows, 226 with an OpenAPI operation (109 in `openapi.yaml` + 117 in the addendum).

## 2. Operations defined in the addendum (P0 domains)

### 2.1 New rows (ids not in APIC-01): 60

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

### 2.2 Existing APIC-01 rows that had no OpenAPI definition and now have one: 57

Method, path, policy action, consumer, AuthN, rate class and idempotency are those of APIC-01 (read from it by the generator); only the OpenAPI column changes from `-` to `Y (addendum)`.

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
| API-04-01 | `api/skills` | MOD-CAND, MOD-HIR, MOD-LRN | GET | `/skills` | O | `skills.skill.search` | - | SkillPage | 200;  | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-04-02 | `api/skills` | MOD-CAND | GET | `/skills/{skillId}` | O | `skills.skill.read` | - | Skill | 200; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-04-03 | `api/skills` | MOD-CAND | GET | `/skills/{skillId}/relations` | O | `skills.relation.list` | - | SkillRelationList | 200; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-PUBLIC | Y (addendum) |
| API-04-04 | `api/skills` | MOD-CAND | GET | `/me/skills` | S | `skills.competency.list_own` | - | CompetencyPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-11-01 | `api/search` | MOD-OPP | GET | `/search/jobs` | O | `search.jobs.query` | - | JobSearchResultPage | 200; 422 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-02 | `api/search` | MOD-HIR | GET | `/search/candidates` | S | `search.candidates.query` | - | CandidateSearchResultPage | 200; 402 403 422 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-03 | `api/matching` | MOD-OPP | GET | `/me/recommendations/jobs` | S | `matching.recommendation.list` | - | JobRecommendationPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-04 | `api/matching` | MOD-OPP | GET | `/jobs/{jobId}/match-explanation` | S | `matching.explanation.read_own` | - | MatchExplanation | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-11-05 | `api/matching` | MOD-HIR | GET | `/orgs/{orgId}/jobs/{jobId}/shortlist` | S | `matching.shortlist.read` | - | ShortlistPage | 200; 402 403 404 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-HEAVY | Y (addendum) |
| API-11-06 | `api/matching` | MOD-HIR | GET | `/applications/{applicationId}/match-explanation` | S | `matching.explanation.read_org` | - | MatchExplanation | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-13-01 | `api/messaging` | MOD-MSG | GET | `/conversations` | S | `messaging.conversation.list` | - | ConversationPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-13-02 | `api/messaging` | MOD-MSG | POST | `/conversations` | S | `messaging.conversation.create` | ConversationCreate | Conversation | 201; 402 403 422 | - | Key | RL-WRITE | Y (addendum) |
| API-13-03 | `api/messaging` | MOD-MSG | GET | `/conversations/{conversationId}/messages` | S | `messaging.message.list` | - | MessagePage | 200; 403 404 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-13-04 | `api/messaging` | MOD-MSG | POST | `/conversations/{conversationId}/messages` | S | `messaging.message.send` | MessageCreate | Message | 201; 403 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-13-05 | `api/messaging` | MOD-MSG | POST | `/conversations/{conversationId}/read-markers` | S | `messaging.conversation.mark_read` | ReadMarker | - | 204; 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-15-01 | `api/notify` | MOD-MSG | GET | `/notifications` | S | `notify.notification.list` | - | NotificationPage | 200; 401 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-15-02 | `api/notify` | MOD-MSG | POST | `/notifications/{notificationId}/read-markers` | S | `notify.notification.mark_read` | - | - | 204; 404 | - | Natural key | RL-WRITE | Y (addendum) |
| API-15-03 | `api/notify` | MOD-MSG | POST | `/notifications/read-all` | S | `notify.notification.mark_all_read` | - | - | 204; 401 | - | Natural key | RL-WRITE | Y (addendum) |
| API-15-04 | `api/notify` | MOD-ACC | GET | `/me/notification-preferences` | S | `notify.preference.read` | - | NotificationPreferences | 200; 401 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-15-05 | `api/notify` | MOD-ACC | PUT | `/me/notification-preferences` | S | `notify.preference.set` | NotificationPreferencesPut | NotificationPreferences | 200; 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-15-06 | `api/notify` | MOD-MSG | POST | `/me/push-subscriptions` | S | `notify.push.subscribe` | PushSubscriptionCreate | PushSubscription | 201; 422 | - | Key | RL-WRITE | Y (addendum) |
| API-15-07 | `api/notify` | MOD-MSG | DELETE | `/me/push-subscriptions/{subscriptionId}` | S | `notify.push.unsubscribe` | - | - | 204; 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-15-08 | `api/notify` | MOD-SHELL | POST | `/notifications/unsubscribe/{token}` | T | `notify.unsubscribe.one_click` | UnsubscribeRequest | - | 204; 404 410 | - | Natural key | RL-TOKEN | Y (addendum) |
| API-19-01 | `api/safety` | MOD-SHELL | POST | `/reports` | S | `safety.report.create` | ReportCreate | Report | 201; 404 422 | - | Key | RL-WRITE | Y (addendum) |
| API-19-02 | `api/safety` | MOD-ADM | GET | `/admin/moderation/cases` | S | `safety.case.list` | - | ModerationCasePage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-19-03 | `api/safety` | MOD-ADM | POST | `/admin/moderation/cases/{caseId}/decision` | S | `safety.case.decide` | ModerationDecision | ModerationCase | 200; 403 404 409 412 428 | - | Key | RL-WRITE | Y (addendum) |
| API-19-04 | `api/safety` | MOD-SHELL | POST | `/moderation/cases/{caseId}/appeals` | S | `safety.appeal.create` | AppealCreate | Appeal | 201; 404 409 422 | - | Key | RL-WRITE | Y (addendum) |
| API-20-01 | `api/admin` | MOD-ADM | POST | `/admin/support-access-grants` | S | `admin.support_grant.create` | SupportGrantCreate | SupportGrant | 201; 403 422 | - | Key | RL-WRITE | Y (addendum) |
| API-20-02 | `api/admin` | MOD-ADM | DELETE | `/admin/support-access-grants/{grantId}` | S | `admin.support_grant.revoke` | - | - | 204; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |
| API-20-03 | `api/admin` | MOD-ADM | GET | `/admin/support-access-grants` | S | `admin.support_grant.list` | - | SupportGrantPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-04 | `api/admin` | MOD-ADM | GET | `/admin/users/{accountId}/summary` | S | `admin.user.summary` | - | UserSupportSummary | 200; 403 404 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-05 | `api/admin` | MOD-ADM | GET | `/admin/audit-events` | S | `admin.audit.list` | - | AuditEventPage | 200; 403 | Cursor | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-06 | `api/admin` | MOD-ADM | GET | `/admin/feature-flags` | S | `admin.flag.list` | - | FeatureFlagList | 200; 403 | - | n/a (read-only, token-consuming or state-guarded) | RL-READ | Y (addendum) |
| API-20-07 | `api/admin` | MOD-ADM | PUT | `/admin/feature-flags/{flagKey}` | S | `admin.flag.set` | FeatureFlagPut | FeatureFlag | 200; 403 412 422 428 | - | n/a (read-only, token-consuming or state-guarded) | RL-WRITE | Y (addendum) |

## 3. Catalogue-only rows (later phases) and consumer overrides

| API ID | Owner module | Consumer remote | Method | Path | AuthN | Policy action | Request | Response | Errors | Pagination | Idempotency | Rate limit | OpenAPI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
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

Notes on the catalogue-only rows: API-05-16: Ph2 (learning depth). API-05-17: Ph2; only a passed, auto-graded or runner-verified attempt (INV-T04). API-05-18: Ph2; mints rung authority_verified with issuer_class=instructor only if instructor != learner and the independence checks pass (REVW-12). API-07-15: Ph2; online-only (REVW-15). API-07-16: Ph2; runner flag off by default. API-07-17: Ph2; only where the assessment allows pause. API-07-18: Ph2. API-08-10: Ph2. API-08-11: Ph2. API-08-12: Ph2; queued-write eligible (REVW-15). API-08-13: Ph2. API-08-14: Ph2. API-08-15: Ph2. API-08-16: Ph2; publication is a state of the course (SM-COURSE pending, REVW-20). API-08-17: Ph2. API-16-10: Ph2; never grants entitlement (INV-T17). API-16-11: Ph2; sets cancel_at_period_end, state canceling via webhook. API-16-12: Ph2. API-16-13: Ph2. API-16-14: Ph2. API-16-15: Ph2. API-18-07: Ph3 (institutions conditional). API-18-08: Ph3. API-18-09: Ph3; human actor (SM-00 U6). API-18-10: Ph3; small-count suppression (PRIVACY section 3). API-19-05: Ph2. API-19-06: Ph2. API-19-07: Ph2; reviewer differs from original decider. API-20-08: Ph2. API-20-09: Ph2. API-20-10: Ph1 support minimum; needs live support grant (BR-T041). API-20-11: Ph1 support minimum. API-20-12: Ph1 support minimum. API-20-13: Ph1 support minimum; masked fields only. API-20-14: Ph1; step-up and second approver for privileged roles. API-20-15: Ph1. API-20-16: Ph2. API-20-17: Ph2. API-21-03: Ph2; aggregates and the caller's own org data only. API-23-11: Ph3. API-23-12: Ph3. API-24-14: Only when MF_MODE=federated is activated (REV-RES REVW-07). API-24-15: Only when MF_MODE=federated is activated.

### 3.1 Consumer-remote overrides (REVW-08, backend part)

REV-RES splits MOD-ADM into **MOD-ADM** (platform back-office: support, moderation, admin, auditor, flags) and **MOD-INS** (`mf-institution`, `/institution/*`: institution customers, faculty, proctors). Back-office code is served only behind an authenticated edge rule, so customer-facing rows must not name MOD-ADM. Overrides to APIC-01's Consumer column, derived from the screen each action lives on in ACTION_REGISTRY:

| API IDs | APIC-01 consumer | Consumer now | Reason |
|---|---|---|---|
| API-18-01 to API-18-06 and all new API-18-xx | MOD-ADM | **MOD-INS** | Institution workspace (ADM-17 to ADM-22 are institution screens) |
| API-02-05 (faculty and proctor invitations in an institution) | MOD-ADM | MOD-HIR (org) and **MOD-INS** (institution context) | ACT-INS-07 |
| API-02-03, 02-04, 02-07 to 02-11 (organization settings, members, SSO, access review) | MOD-ADM | **MOD-HIR** | Customer org administration lives on HIR-15 to HIR-17 screens |
| API-23-01 to 23-07, 23-09, 23-10 (webhook endpoints, API clients, imports of an org) | MOD-ADM | **MOD-HIR** | Customer-owned settings; not back-office |
| API-06-14, 06-16, 06-18; 07-10, 07-11; 19-02 to 19-04; 20-xx; 17-05, 17-06; 04-05, 04-06; 24-06 to 24-10 | MOD-ADM | MOD-ADM (unchanged) | Platform back-office |

### 3.2 Deferred domain (REVW-34, API part)

DOM-14 networking (API-14-01 to API-14-03, paths `/network/*`) is **deferred to Ph4** (ROADMAP WP-COMMUNITY; FEAT-14-01 phase 4). The three rows stay in APIC-01 for history but are **removed from the launch registries**: they get no route in the Ph1 to Ph3 route registry, no OpenAPI path, no policy action in the launch `actions.ts`, and ACT-NET-01 to ACT-NET-03 are marked DEFERRED in MAP-01. The header "phase 3, conditional" in APIC-01 DOM-14 is superseded by "Ph4, deferred". The public developer API (DOM-23) phase is Ph3 (WP-INTEGRATIONS-API); FEAT-23-01/02 "phase 4" is stale.

### 3.3 Problem type alignment (REVW-19 and SM-00)

SM-00 U2 and several acceptance criteria say `409 invalid_transition`; API-STD section 5 and every OpenAPI response say `state-transition-invalid`. **Canonical: `state-transition-invalid`** (kebab-case slug like every other problem type; RFC 9457 `type` is `/problems/state-transition-invalid`). SM-00 U2, SPEC-G2 AC-05-05-05 and SPEC-G4 AC-10-05-03/04 should be amended to the canonical slug; until then they read as the same type. Listed for the governance agent.

### 3.4 Idempotency declaration (REVW-14)

FF-07 is reworded to: every unsafe route **accepts `Idempotency-Key` or declares a natural key** (route registry field `idempotent: 'natural'` with the key named, or `idempotent: 'none'` with a stated reason for token-consuming and credential routes); a route flagged `queuedOp: true` additionally needs the 14-day `queued` retention class or a natural key (BACKEND_ARCHITECTURE_REV2 section 4). Checked on the merged contract: **25** unsafe operations of `openapi.yaml` carry no `Idempotency-Key` parameter (the REVW-14 count). Their declarations, to be added as `x-idempotency` by the owner of `openapi.yaml`:

| Declaration | Operations |
|---|---|
| `natural`: set-to-absent or set-to-value; a repeat has the same outcome | API-01-06 (logout), 01-08, 01-21, 05-07, 06-10, 09-09, 09-13 (DELETE of a resource by identity) |
| `natural` guarded by `If-Match`: a repeat after success returns 412; the client treats 412 whose current state equals the intended state as success. When the outbox activates (ADR-T10 trigger) every one of these that enters the offline queue must also accept `Idempotency-Key` (lint fails until it does) | API-01-16, 05-04, 05-05, 05-09, 06-04, 09-05, 10-04, 10-14 |
| `none`: token-consuming or credential routes, single use or a state check is the guard | API-01-02, 01-03, 01-04, 01-05, 01-09, 01-10, 01-11, 01-17, 01-18, 06-06 |

The addendum operations carry an `x-idempotency` extension stating which of the three applies, and the 26 APIC-01 rows marked `n/a` fall into the same table. Host rule (HC-01): a remote passes one key per user intent and the host never invents a fresh key per call.

## 4. Evidence issuer class (REVW-12, backend part)

`issuer_class` ∈ {`platform`, `institution`, `employer_org`, `instructor`} is mandatory on every `authority_verified` rung. Contract: `contracts/schemas/EvidenceIssuer.schema.json` and the components `IssuerClass`, `EvidenceIssuer`, `EvidenceItemWithIssuer`, `EvidenceProvenance` in `openapi.addendum.yaml`; operation API-05-15 returns provenance with the issuer; API-05-18 (Ph2) is the instructor sign-off. Database part: PHYSICAL_DESIGN_REV2 section 6. `EvidenceItemWithIssuer` supersedes the `EvidenceItem` response for new clients; merge the optional `issuer` field into `EvidenceItem` in the next contract revision.

## 5. Event envelope (REVW-44)

`EventEnvelope.actor` gains `human` (boolean, producer-derived). "Human actor" in SM-00 U6 and INV-T09 means `human = true` and `kind ∈ {user, support}`. Changed in place in `EventEnvelope.schema.json`, `asyncapi.yaml` and EVENT_CATALOG section 1 earlier in this pass (see the report).

## 6. Validators run on the contracts (this pass)

All runs were made from a temporary directory **outside the repository** (installed there: `@redocly/cli` 1.25.15 and `@asyncapi/parser` 3.4.0); nothing was installed into the repository. Because `openapi.addendum.yaml` is a fragment whose `$ref`s point at components of `openapi.yaml`, it is validated **after a merge** that a script performs in the temporary directory (assertions: no operationId, `x-api-id` or schema-name clash; no method clash on a shared path).

| Check | Tool | Outcome |
|---|---|---|
| YAML load of `openapi.yaml`, `openapi.addendum.yaml`, `asyncapi.yaml` | PyYAML 6.0.3 | all three load |
| `openapi.yaml` alone | `redocly lint` (built-in `recommended` ruleset, no custom config) | valid, 0 errors, 0 warnings |
| `openapi.yaml` + addendum merged (226 operations: 109 + 117) | `redocly lint` (same ruleset) | **valid, 0 errors, 1 warning**: `no-ambiguous-paths` between `/notifications/{notificationId}/read-markers` and `/notifications/unsubscribe/{token}` (both are existing APIC-01 rows, API-15-02 and API-15-08, whose paths were not changed here; a request to `/notifications/unsubscribe/read-markers` would match both). Proposed fix for the catalog owner: move the token route to `/unsubscribe/{token}` |
| `asyncapi.yaml` (after the envelope `actor.human` edit) | `@asyncapi/parser` 3.4.0 | valid; 1 informational hint (`asyncapi-latest-version`: the document is 3.0.0, the parser suggests 3.1.0) |
| JSON Schema files in `contracts/schemas` (4, including the new `EvidenceIssuer.schema.json` and the edited `EventEnvelope.schema.json`) | `jsonschema` 4.26.0 `Draft202012Validator.check_schema` | all four are valid 2020-12 schemas |
| Enum-vs-SM check (FF-11 style) on the merged contract | script that parses persisted state sets from `STATE_MACHINES.md` and `STATE_MACHINES_REV2.md` and compares every `x-state-machine` enum | 23 enums matched, 0 mismatches (15 in `openapi.yaml`, 8 added here); `BulkStageTransitionRequest.toState` uses `x-state-machine-subset` because it is a deliberate subset |
| Route lint on the merged contract | script | every one of the 226 operations has `x-policy-action`; 25 unsafe operations of `openapi.yaml` have no `Idempotency-Key` parameter and no `x-idempotency` (classified in section 3.4); all 117 addendum operations declare one |

**Not run:** `oasdiff` (FF-06) and an AsyncAPI generator or CLI lint (only the parser ran); no SQL was executed (the DDL in `PHYSICAL_DESIGN_REV2.md` is unparsed and unrun: no PostgreSQL instance was available); `redocly` was not run on the addendum alone because its references need the base file.
