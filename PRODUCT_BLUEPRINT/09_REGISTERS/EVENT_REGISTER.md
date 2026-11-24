<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

# Domain Event Register

Events emitted and consumed per module.

**Total: 900.**

## ADM

Source: [02_MODULES/ADM_Admin_Console_Support_Operations.md](../02_MODULES/ADM_Admin_Console_Support_Operations.md)

| ID          | Event name                        | Trigger                                              | Consumers                                                                                |
| ----------- | --------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| EVT-ADM-001 | `admin.action.performed`          | Any admin mutation (generic envelope)                | actor, role, action, target, reasonCode, outcome, requestId · audit store, anomaly rules |
| EVT-ADM-002 | `admin.session.started`           | Staff sign-in success                                | staffId, method, network, deviceId · audit, anomaly rules                                |
| EVT-ADM-003 | `admin.session.stepup_completed`  | Step-up success                                      | staffId, validUntil · audit                                                              |
| EVT-ADM-004 | `admin.session.blocked`           | Impossible travel, lockout, policy block             | staffId, reason · SAD alerts, audit                                                      |
| EVT-ADM-005 | `admin.staff.invited`             | Staff invitation sent                                | email hash, role, expiry · audit                                                         |
| EVT-ADM-006 | `admin.staff.role_changed`        | Role assignment applied or removed                   | staffId, role, before, after · audit, access review                                      |
| EVT-ADM-007 | `admin.staff.disabled`            | Staff identity disabled                              | staffId, reason · IDN (revoke sessions), audit                                           |
| EVT-ADM-008 | `admin.account.suspended`         | Account suspended                                    | accountId, reason, expectedUndoUntil · IDN, NTF, TSF, audit                              |
| EVT-ADM-009 | `admin.account.reinstated`        | Account reinstated                                   | accountId · IDN, NTF, audit                                                              |
| EVT-ADM-010 | `admin.account.merged`            | Merge executed                                       | survivorId, retiredId, counts · all owning modules, audit                                |
| EVT-ADM-011 | `admin.account.force_logged_out`  | Sessions revoked by staff                            | accountId · IDN, audit                                                                   |
| EVT-ADM-012 | `admin.org.approved`              | Org approved                                         | orgId · EMP, JOB, NTF                                                                    |
| EVT-ADM-013 | `admin.org.suspended`             | Org suspended                                        | orgId, reason class, cascade counts · EMP, JOB, ATS, MSG, NTF                            |
| EVT-ADM-014 | `admin.org.ownership_transferred` | Ownership transfer executed                          | orgId, from, to · EMP, NTF                                                               |
| EVT-ADM-015 | `admin.grant.requested`           | Grant requested                                      | grantId, class, subject type · approvers, audit                                          |
| EVT-ADM-016 | `admin.grant.activated`           | Grant active                                         | grantId, expiresAt · audit                                                               |
| EVT-ADM-017 | `admin.grant.ended`               | Grant expired or revoked                             | grantId, endReason · audit                                                               |
| EVT-ADM-018 | `admin.pii.viewed`                | Unmasked field read                                  | grantId, subjectId, fields · audit, SET privacy center                                   |
| EVT-ADM-019 | `admin.approval.requested`        | Two-person request created                           | requestId, actionClass · approvers, audit                                                |
| EVT-ADM-020 | `admin.approval.decided`          | Approved, rejected, expired, stale, executed, failed | requestId, outcome · requester, audit                                                    |
| EVT-ADM-021 | `admin.breakglass.invoked`        | Break-glass started                                  | grantId, incidentId, scope · SAD paging, audit                                           |
| EVT-ADM-022 | `admin.breakglass.reviewed`       | Review decision                                      | grantId, outcome · audit, SAD                                                            |
| EVT-ADM-023 | `admin.flag.changed`              | Flag version applied                                 | key, env, versionBefore, versionAfter · flag SDKs, ANL, audit                            |
| EVT-ADM-024 | `admin.killswitch.activated`      | Switch on                                            | key, reason, incidentId · all call sites, status, audit                                  |
| EVT-ADM-025 | `admin.killswitch.deactivated`    | Switch off                                           | key, ramp state · all call sites, audit                                                  |
| EVT-ADM-026 | `admin.config.changed`            | Config version applied                               | key, versionBefore, versionAfter, class · services, audit                                |
| EVT-ADM-027 | `admin.announcement.published`    | Announcement live                                    | id, audience, type · NTF, web and PWA clients                                            |
| EVT-ADM-028 | `admin.maintenance.started`       | Window begins                                        | windowId, scope · all services, PWA                                                      |
| EVT-ADM-029 | `admin.maintenance.ended`         | Window ends                                          | windowId · all services, PWA                                                             |
| EVT-ADM-030 | `support.ticket.created`          | Ticket created                                       | ticketId, category, requesterKind · queue router, ANL                                    |
| EVT-ADM-031 | `support.ticket.replied`          | Public reply                                         | ticketId, direction · NTF, SLA                                                           |
| EVT-ADM-032 | `support.ticket.resolved`         | Resolved                                             | ticketId, resolutionCode · CSAT, NTF                                                     |
| EVT-ADM-033 | `support.ticket.sla_breached`     | SLA target missed                                    | ticketId, policyId, cause · SUP-L alerts, ANL                                            |
| EVT-ADM-034 | `support.viewas.started`          | View-as active                                       | sessionId, ticketId · user app banner, audit                                             |
| EVT-ADM-035 | `support.viewas.ended`            | View-as ended                                        | sessionId, reason, pageCount · NTF summary, audit                                        |
| EVT-ADM-036 | `support.csat.submitted`          | Rating received                                      | ticketId, score · SUP-L tasks, ANL                                                       |
| EVT-ADM-037 | `support.problem.linked`          | Ticket linked to problem                             | problemId, ticketId · problem counters                                                   |
| EVT-ADM-038 | `admin.cms.published`             | CMS page or article published                        | pageKey, version · CDN invalidation, search index                                        |
| EVT-ADM-039 | `legal.version.published`         | Legal version scheduled or effective                 | docType, version, changeClass, effectiveAt · SET (re-consent), NTF                       |
| EVT-ADM-040 | `admin.datarequest.opened`        | Case created                                         | caseId, type, dueAt · SET, SLA reminders                                                 |
| EVT-ADM-041 | `admin.datarequest.completed`     | Case completed                                       | caseId, outcome · SET, audit                                                             |
| EVT-ADM-042 | `admin.export.created`            | Export generated                                     | exportId, rowCount, table · anomaly rules, audit                                         |
| EVT-ADM-043 | `admin.bulk.completed`            | Bulk run ended                                       | runId, counts, outcome · audit                                                           |
| EVT-ADM-044 | `admin.job.replayed`              | Dead job replayed or cancelled                       | jobId, kind, action · PLT, audit                                                         |
| EVT-ADM-045 | `admin.incident.declared`         | Incident declared                                    | incidentId, severity, components · paging, status page, banner                           |
| EVT-ADM-046 | `admin.incident.resolved`         | Incident resolved                                    | incidentId, impact · status page, review scheduler                                       |
| EVT-ADM-047 | `admin.alert.anomaly_detected`    | Anomaly rule triggered                               | ruleId, actorId, severity · SAD queue                                                    |
| EVT-ADM-048 | `admin.accessreview.completed`    | Campaign closed                                      | campaignId, removals · audit                                                             |
| EVT-ADM-049 | `admin.audit.integrity_failed`    | Chain check fails or ingestion gap                   | range, firstMismatch · SAD paging                                                        |
| EVT-ADM-050 | `admin.finance.refund_decided`    | Refund approved or denied                            | orderId, amount, decision · BIL, NTF                                                     |

## AIC

Source: [02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md](../02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md)

| ID          | Event name                    | Trigger                | Consumers                              |
| ----------- | ----------------------------- | ---------------------- | -------------------------------------- |
| EVT-AIC-001 | aic.assistant.turn_completed  | FR-AIC-001             | session id, request id · ANL           |
| EVT-AIC-002 | aic.assistant.refused         | FR-AIC-009             | category · ANL, TSF                    |
| EVT-AIC-003 | aic.settings.updated          | FR-AIC-002, FR-AIC-030 | member, diff · SET                     |
| EVT-AIC-004 | aic.resume.feedback_generated | FR-AIC-003             | resume ref · PRF                       |
| EVT-AIC-005 | aic.suggestion.accepted       | FR-AIC-008             | suggestion id, target · PRF, EVD, ANL  |
| EVT-AIC-006 | aic.suggestion.rejected       | FR-AIC-008             | suggestion id · ANL                    |
| EVT-AIC-007 | aic.practice.completed        | FR-AIC-004             | session id · ANL                       |
| EVT-AIC-008 | aic.plan.created              | FR-AIC-005             | plan id · MEN, LRN                     |
| EVT-AIC-009 | aic.plan.updated              | FR-AIC-005             | plan id · LRN                          |
| EVT-AIC-010 | aic.skillgap.generated        | FR-AIC-006             | target · LRN                           |
| EVT-AIC-011 | aic.draft.generated           | FR-AIC-007             | type · ANL                             |
| EVT-AIC-012 | aic.match.candidate_view      | FR-AIC-010             | job ref · ANL                          |
| EVT-AIC-013 | aic.match.recruiter_view      | FR-AIC-011             | job ref, candidate set size · ATS, ANL |
| EVT-AIC-014 | aic.explanation.viewed        | FR-AIC-012             | match id · ANL                         |
| EVT-AIC-015 | aic.preferences.updated       | FR-AIC-013             | member · JOB                           |
| EVT-AIC-016 | aic.skills.extracted          | FR-AIC-014             | owner ref · PRF, JOB                   |
| EVT-AIC-017 | aic.feedback.submitted        | FR-AIC-015             | match id, issue · ANL                  |
| EVT-AIC-018 | aic.review.requested          | FR-AIC-015             | application ref · ATS, NTF             |
| EVT-AIC-019 | aic.fairness.report_generated | FR-AIC-016             | report id · ADM                        |
| EVT-AIC-020 | aic.recommendation.shown      | FR-AIC-017 to 020      | recommendation id · ANL                |
| EVT-AIC-021 | aic.recommendation.dismissed  | FR-AIC-020             | id, reason · ANL                       |
| EVT-AIC-022 | aic.recommendation.engaged    | FR-AIC-020             | id · ANL                               |
| EVT-AIC-023 | aic.engine.switched           | FR-AIC-021             | capability, engine · ADM               |
| EVT-AIC-024 | aic.request.completed         | FR-AIC-022             | request id, outcome · ANL, BIL         |
| EVT-AIC-025 | aic.request.denied            | FR-AIC-022             | capability, reason · ANL               |
| EVT-AIC-026 | aic.guardrail.blocked         | FR-AIC-023             | rule · SAD                             |
| EVT-AIC-027 | aic.model.status_changed      | FR-AIC-024             | model, from, to · ADM                  |
| EVT-AIC-028 | aic.provenance.recorded       | FR-AIC-025             | request id · ADM                       |
| EVT-AIC-029 | aic.injection.detected        | FR-AIC-026             | request id · TSF, SAD                  |
| EVT-AIC-030 | aic.quota.warning             | FR-AIC-027             | member, family · NTF                   |
| EVT-AIC-031 | aic.quota.exhausted           | FR-AIC-027             | member, family · NTF                   |
| EVT-AIC-032 | aic.provider.circuit_opened   | FR-AIC-028             | provider · ADM                         |
| EVT-AIC-033 | aic.output.blocked            | FR-AIC-029             | category · TSF                         |
| EVT-AIC-034 | aic.assessment.denied         | FR-AIC-031             | attempt id · ASM                       |
| EVT-AIC-035 | aic.evaluation.completed      | FR-AIC-032             | run id, gate · ADM                     |
| EVT-AIC-036 | aic.incident.opened           | FR-AIC-033             | incident id, severity · ADM, SAD       |
| EVT-AIC-037 | aic.provider.connected        | FR-AIC-034             | member, provider · SET                 |

## ANL

Source: [02_MODULES/ANL_Analytics_Reporting_Insights.md](../02_MODULES/ANL_Analytics_Reporting_Insights.md)

| ID          | Event name                          | Trigger                          | Consumers                            |
| ----------- | ----------------------------------- | -------------------------------- | ------------------------------------ |
| EVT-ANL-001 | analytics.metric.published          | Metric certified or new version  | metricId, version                    |
| EVT-ANL-002 | analytics.metric.deprecated         | Metric deprecated                | metricId, successorId                |
| EVT-ANL-003 | analytics.dashboard.published       | Dashboard published or certified | dashboardId, state                   |
| EVT-ANL-004 | analytics.report.saved              | Report saved                     | reportId                             |
| EVT-ANL-005 | analytics.schedule.created          | Schedule created                 | scheduleId, cadence                  |
| EVT-ANL-006 | analytics.report.delivered          | Scheduled run delivered          | scheduleId, recipientCount, status   |
| EVT-ANL-007 | analytics.export.requested          | Export requested                 | jobId, format                        |
| EVT-ANL-008 | analytics.export.ready              | Export ready                     | jobId                                |
| EVT-ANL-009 | analytics.alert.fired               | Alert opened                     | ruleId, metricId                     |
| EVT-ANL-010 | analytics.quality.failed            | Reconciliation failure           | metricId, difference                 |
| EVT-ANL-011 | analytics.pipeline.lagging          | Lag or reject rate breach        | sourceModule, lag                    |
| EVT-ANL-012 | analytics.consent.changed           | Analytics consent changed        | purpose, state                       |
| EVT-ANL-013 | analytics.erasure.completed         | Erasure done                     | requestRef                           |
| EVT-ANL-014 | analytics.experiment.approved       | Experiment approved              | experimentId, riskClass              |
| EVT-ANL-015 | analytics.experiment.started        | Experiment launched              | experimentId                         |
| EVT-ANL-016 | analytics.experiment.exposed        | Variant applied                  | experimentId, variant (pseudonymous) |
| EVT-ANL-017 | analytics.experiment.halted         | Guardrail breach or kill         | experimentId, reason                 |
| EVT-ANL-018 | analytics.experiment.decided        | Decision recorded                | experimentId, decision               |
| EVT-ANL-019 | analytics.access.approved           | Analyst access approved          | requestId, joinApproved              |
| EVT-ANL-020 | analytics.access.revoked            | Access revoked or expired        | requestId                            |
| EVT-ANL-021 | analytics.fairness.finding_recorded | Fairness review outcome          | modelVersion, outcome                |
| EVT-ANL-022 | analytics.policy.changed            | Suppression policy changed       | parameter, decisionRecordId          |
| EVT-ANL-023 | analytics.api.grant_changed         | API or embed grant changed       | grantId, state                       |
| EVT-ANL-024 | analytics.dashboard.shared          | Snapshot link created            | dashboardId, expiresAt               |

## ASM

Source: [02_MODULES/ASM_Assessments_Challenges_Integrity.md](../02_MODULES/ASM_Assessments_Challenges_Integrity.md)

| ID          | Event name                         | Trigger                                                        | Consumers                                                                         |
| ----------- | ---------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| EVT-ASM-001 | `assessment.attempt.started`       | Attempt created                                                | attemptId, versionId, context, policyHash · AI gateway (restriction), ANL         |
| EVT-ASM-002 | `assessment.attempt.submitted`     | Submit or deadline                                             | attemptId, autoSubmitted · grading                                                |
| EVT-ASM-003 | `assessment.attempt.graded`        | Final grade (passed or failed)                                 | attemptId, score, passed, versionId, context, courseRef · LRN, EVD, ATS, REP, NTF |
| EVT-ASM-004 | `assessment.attempt.unverified`    | Runner unavailable                                             | attemptId, reason · NTF, ops                                                      |
| EVT-ASM-005 | `assessment.attempt.voided`        | Void decision                                                  | attemptId, reasonClass · LRN, EVD, ATS, REP                                       |
| EVT-ASM-006 | `assessment.attempt.abandoned`     | Inactivity or cancel                                           | attemptId · ANL                                                                   |
| EVT-ASM-007 | `assessment.challenge.solved`      | Challenge passed (graded or practice, flagged assisted or not) | accountId, challengeId, assisted · REP, AIC                                       |
| EVT-ASM-008 | `assessment.evidence.requested`    | Qualifying pass                                                | attemptId, skills, levels, issuerRef · EVD                                        |
| EVT-ASM-009 | `assessment.integrity.flagged`     | Case opened                                                    | caseId, attemptId, priority · MOD queue, NTF                                      |
| EVT-ASM-010 | `assessment.integrity.decided`     | Case decision                                                  | caseId, decision · EVD, LRN, ATS, NTF                                             |
| EVT-ASM-011 | `assessment.appeal.filed`          | Appeal filed                                                   | appealId · MOD queue                                                              |
| EVT-ASM-012 | `assessment.appeal.decided`        | Appeal decided                                                 | appealId, outcome · NTF, EVD                                                      |
| EVT-ASM-013 | `assessment.accommodation.granted` | Grant active                                                   | accountId, scope (no details) · ASM internal                                      |
| EVT-ASM-014 | `assessment.version.published`     | Publish                                                        | versionId, state · catalogs                                                       |
| EVT-ASM-015 | `assessment.version.eligible`      | Evidence-eligible                                              | versionId · EVD, catalogs                                                         |
| EVT-ASM-016 | `assessment.version.retired`       | Retired                                                        | versionId · LRN, STU                                                              |
| EVT-ASM-017 | `assessment.item.retired`          | Item retired                                                   | itemId · authors                                                                  |
| EVT-ASM-018 | `assessment.item.stats_updated`    | Nightly stats                                                  | itemVersionId, aggregates · STU, authors                                          |
| EVT-ASM-019 | `assessment.item.flagged`          | Flag raised                                                    | itemId, reason · authors                                                          |
| EVT-ASM-020 | `assessment.regrade.applied`       | Regrade done                                                   | assessmentId, affected, changes · LRN, EVD, NTF                                   |
| EVT-ASM-021 | `assessment.certification.issued`  | Certification issued                                           | recordId, definitionId · EVD, PRF, REP, NTF                                       |
| EVT-ASM-022 | `assessment.certification.revoked` | Revoked                                                        | recordId, reasonClass · EVD, PRF, ATS                                             |
| EVT-ASM-023 | `assessment.certification.expired` | Validity ended                                                 | recordId · EVD, PRF                                                               |
| EVT-ASM-024 | `assessment.exam.registered`       | Registered                                                     | registrationId · NTF, proctoring                                                  |
| EVT-ASM-025 | `assessment.exam.cancelled`        | Cancelled                                                      | registrationId · NTF, seats                                                       |
| EVT-ASM-026 | `assessment.assignment.invited`    | Employer invitation                                            | assignmentId · NTF                                                                |
| EVT-ASM-027 | `assessment.assignment.completed`  | Completed and consented                                        | assignmentId, scope · ATS                                                         |
| EVT-ASM-028 | `assessment.share.created`         | Share created                                                  | shareId, scope · audit                                                            |
| EVT-ASM-029 | `assessment.share.revoked`         | Revoked                                                        | shareId · recipients                                                              |
| EVT-ASM-030 | `assessment.contest.started`       | Contest live                                                   | contestId · ANL                                                                   |
| EVT-ASM-031 | `assessment.contest.ended`         | Contest ended                                                  | contestId · leaderboard                                                           |
| EVT-ASM-032 | `assessment.leaderboard.updated`   | Board refreshed                                                | board · ANL                                                                       |
| EVT-ASM-033 | `assessment.ai_restriction.set`    | Restriction written                                            | principal, until · AI gateway                                                     |
| EVT-ASM-034 | `assessment.proctoring.flagged`    | Vendor flag                                                    | attemptId, flagType · integrity queue                                             |
| EVT-ASM-035 | `assessment.runner.degraded`       | Pool unhealthy                                                 | pool, severity · ops                                                              |

## ATS

Source: [02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md](../02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)

| ID          | Event name                            | Trigger                | Consumers                                  |
| ----------- | ------------------------------------- | ---------------------- | ------------------------------------------ |
| EVT-ATS-001 | `ats.requisition.created`             | FR-ATS-001             | ANL (planned)                              |
| EVT-ATS-002 | `ats.requisition.approved`            | FR-ATS-002             | Authoring, BIL (planned)                   |
| EVT-ATS-003 | `ats.requisition.filled`              | FR-ATS-040             | ATS posting closer, ANL                    |
| EVT-ATS-004 | `ats.posting.published`               | FR-ATS-008             | JOB projection, search index, distribution |
| EVT-ATS-005 | `ats.posting.paused`                  | FR-ATS-010             | JOB                                        |
| EVT-ATS-006 | `ats.posting.closed`                  | FR-ATS-010             | JOB, NTF                                   |
| EVT-ATS-007 | `ats.posting.taken_down`              | TSF path               | JOB, EMP                                   |
| EVT-ATS-008 | `ats.application.stage_changed`       | FR-ATS-020             | JOB (status), INT, NTF, ANL                |
| EVT-ATS-009 | `ats.application.rejected`            | FR-ATS-022             | JOB, NTF, ANL                              |
| EVT-ATS-010 | `ats.application.hired`               | FR-ATS-040             | EMP webhooks, EVD (planned), ANL           |
| EVT-ATS-011 | `ats.bulk_action.completed`           | FR-ATS-021             | NTF                                        |
| EVT-ATS-012 | `ats.scorecard.requested`             | FR-ATS-027             | NTF                                        |
| EVT-ATS-013 | `ats.scorecard.submitted`             | FR-ATS-027             | ATS summary                                |
| EVT-ATS-014 | `ats.note.created`                    | FR-ATS-025             | NTF (mentions)                             |
| EVT-ATS-015 | `ats.offer.submitted`                 | FR-ATS-036             | Approvals                                  |
| EVT-ATS-016 | `ats.offer.extended`                  | FR-ATS-038             | JOB, NTF                                   |
| EVT-ATS-017 | `ats.offer.revised`                   | FR-ATS-039             | JOB                                        |
| EVT-ATS-018 | `ats.offer.rescinded`                 | FR-ATS-039             | JOB, NTF                                   |
| EVT-ATS-019 | `ats.offer.decided`                   | JOB acceptance command | ATS, NTF                                   |
| EVT-ATS-020 | `ats.approval.decided`                | FR-ATS-002, 037        | ATS                                        |
| EVT-ATS-021 | `ats.pool.member_added`               | FR-ATS-031             | NTF                                        |
| EVT-ATS-022 | `ats.outreach.sent`                   | FR-ATS-033             | MSG, ANL                                   |
| EVT-ATS-023 | `ats.duplicate.merged`                | FR-ATS-034             | Search index                               |
| EVT-ATS-024 | `ats.sla.breached`                    | FR-ATS-041             | NTF, ANL                                   |
| EVT-ATS-025 | `ats.rights.requested` / `.fulfilled` | FR-ATS-045             | SET (planned)                              |
| EVT-ATS-026 | `ats.data.purged`                     | FR-ATS-044             | Search index, ANL                          |
| EVT-ATS-027 | `ats.ai.output_generated`             | FR-ATS-047             | ANL, audit                                 |
| EVT-ATS-028 | `ats.automation.executed`             | FR-ATS-012             | audit                                      |
| EVT-ATS-029 | `ats.application.viewed`              | FR-ATS-015             | JOB (if employer opt-in)                   |

## BGV

Source: [02_MODULES/BGV_Verification_Background_Checks.md](../02_MODULES/BGV_Verification_Background_Checks.md)

| ID          | Event name                 | Trigger                           | Consumers                                            |
| ----------- | -------------------------- | --------------------------------- | ---------------------------------------------------- |
| EVT-BGV-001 | `bgv.request.created`      | Recruiter confirms                | requestId, applicationRef, packageVersion · ATS, NTF |
| EVT-BGV-002 | `bgv.consent.given`        | Candidate consents                | requestId, types · SET ledger, ATS                   |
| EVT-BGV-003 | `bgv.consent.declined`     | Candidate declines                | requestId · ATS                                      |
| EVT-BGV-004 | `bgv.consent.withdrawn`    | Withdrawal                        | requestId, stage · ATS, SET ledger                   |
| EVT-BGV-005 | `bgv.order.placed`         | Vendor order created              | itemId, vendor · BIL                                 |
| EVT-BGV-006 | `bgv.item.status_changed`  | Item status update                | itemId, from, to (no content) · ATS, NTF             |
| EVT-BGV-007 | `bgv.request.completed`    | All items final                   | requestId, statusSummary · ATS, NTF                  |
| EVT-BGV-008 | `bgv.request.cancelled`    | Cancellation                      | requestId, reason · ATS, BIL                         |
| EVT-BGV-009 | `bgv.request.expired`      | Expiry                            | requestId · ATS                                      |
| EVT-BGV-010 | `bgv.report.viewed`        | Adjudicator views                 | requestId, viewerRef, reason · NTF (opt-in), audit   |
| EVT-BGV-011 | `bgv.adjudication.started` | Case opened                       | caseId · ATS                                         |
| EVT-BGV-012 | `bgv.adverse.pre_sent`     | Pre-adverse sent                  | caseId, sentAt · ATS, NTF                            |
| EVT-BGV-013 | `bgv.adverse.final_sent`   | Final notice sent                 | caseId · ATS                                         |
| EVT-BGV-014 | `bgv.adjudication.cleared` | Proceed decision                  | caseId · ATS                                         |
| EVT-BGV-015 | `bgv.dispute.opened`       | Candidate dispute                 | disputeId · NTF, vendor adapter                      |
| EVT-BGV-016 | `bgv.dispute.resolved`     | Outcome                           | disputeId, outcome · ATS, NTF                        |
| EVT-BGV-017 | `bgv.identity.verified`    | Identity success                  | assuranceId, level · PRF, NTF                        |
| EVT-BGV-018 | `bgv.identity.failed`      | Identity failure                  | sessionId · NTF                                      |
| EVT-BGV-019 | `bgv.identity.expired`     | Validity end or name change       | assuranceId · PRF, SRC                               |
| EVT-BGV-020 | `bgv.identity.shared`      | Shared with employer              | assuranceId, orgId · audit                           |
| EVT-BGV-021 | `bgv.reference.completed`  | Reference submitted               | referenceId · NTF                                    |
| EVT-BGV-022 | `bgv.portable.created`     | Portable verification             | verificationId, type · EVD, PRF                      |
| EVT-BGV-023 | `bgv.vendor.degraded`      | SLA breach or circuit open        | vendorId · ADM                                       |
| EVT-BGV-024 | `bgv.retention.disposed`   | Disposal job                      | dataClass, counts · audit                            |
| EVT-BGV-025 | `bgv.rulepack.published`   | Rule pack effective               | jurisdiction, version · ATS, EMP                     |
| EVT-BGV-026 | `bgv.fairhiring.alert`     | Non-uniform or missing assessment | orgId, type · EAD notifications                      |

## BIL

Source: [02_MODULES/BIL_Billing_Plans_Entitlements.md](../02_MODULES/BIL_Billing_Plans_Entitlements.md)

| ID          | Event name                          | Trigger                                        | Consumers                                                 |
| ----------- | ----------------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| EVT-BIL-001 | `bil.plan.published`                | Price version published                        | plan_version_id · ANL, SRC                                |
| EVT-BIL-002 | `bil.checkout.completed`            | Webhook confirms checkout                      | account_id, subscription_id · NTF, ANL                    |
| EVT-BIL-003 | `bil.subscription.activated`        | State `active`                                 | subscription_id, plan · all modules via entitlement cache |
| EVT-BIL-004 | `bil.subscription.changed`          | Plan or quantity changed                       | from, to, effective · NTF, ANL                            |
| EVT-BIL-005 | `bil.subscription.cancel_scheduled` | Cancel at period end set                       | end date · NTF                                            |
| EVT-BIL-006 | `bil.subscription.ended`            | State `canceled` or `expired`                  | subscription_id · all modules                             |
| EVT-BIL-007 | `bil.subscription.paused`           | Paused                                         | window · NTF                                              |
| EVT-BIL-008 | `bil.trial.started`                 | Trial begins                                   | trial_end · NTF                                           |
| EVT-BIL-009 | `bil.trial.converted`               | Trial to active                                | subscription_id · ANL                                     |
| EVT-BIL-010 | `bil.invoice.finalized`             | Invoice opened                                 | invoice_id · NTF, ledger                                  |
| EVT-BIL-011 | `bil.invoice.paid`                  | Invoice paid                                   | invoice_id, amount · NTF, ledger                          |
| EVT-BIL-012 | `bil.payment.failed`                | Payment attempt fails                          | invoice_id, code · NTF                                    |
| EVT-BIL-013 | `bil.payment.recovered`             | Dunning recovered                              | subscription_id · NTF                                     |
| EVT-BIL-014 | `bil.dunning.degraded`              | Access degraded                                | subscription_id · all modules                             |
| EVT-BIL-015 | `bil.entitlements.changed`          | Any change to an actor's resolved entitlements | subject, keys · all modules                               |
| EVT-BIL-016 | `bil.coupon.redeemed`               | Redemption                                     | coupon_id, account · ANL                                  |
| EVT-BIL-017 | `bil.refund.requested`              | Request created                                | refund_id · NTF                                           |
| EVT-BIL-018 | `bil.refund.completed`              | Provider confirms                              | refund_id, amount · LRN, ledger, payouts                  |
| EVT-BIL-019 | `bil.refund.denied`                 | Denied                                         | refund_id · NTF                                           |
| EVT-BIL-020 | `bil.dispute.opened`                | Chargeback received                            | dispute_id · FIN queue                                    |
| EVT-BIL-021 | `bil.dispute.closed`                | Outcome                                        | dispute_id, outcome · ledger, payouts                     |
| EVT-BIL-022 | `bil.usage.threshold`               | 80 or 100 percent used                         | subject, key · NTF                                        |
| EVT-BIL-023 | `bil.usage.limit_reached`           | Limit hit                                      | subject, key · ANL                                        |
| EVT-BIL-024 | `bil.pool.activated`                | Seat pool active                               | pool_id, institution_id · INS                             |
| EVT-BIL-025 | `bil.pool.expiring`                 | 60, 30, 7 days                                 | pool_id · INS, NTF                                        |
| EVT-BIL-026 | `bil.pool.expired`                  | Pool expired                                   | pool_id · INS                                             |
| EVT-BIL-027 | `bil.seat.assigned`                 | Team seat assigned                             | user, org · NTF                                           |
| EVT-BIL-028 | `bil.purchase.status_changed`       | Purchase request state change                  | request_id, state · NTF                                   |
| EVT-BIL-029 | `bil.contract.activated`            | Contract start                                 | contract_id · all modules                                 |
| EVT-BIL-030 | `bil.contract.renewal_due`          | Notice windows                                 | contract_id · NTF                                         |
| EVT-BIL-031 | `bil.order.paid`                    | One-time order paid                            | order_id, items · LRN, MEN, ASM, GIG                      |
| EVT-BIL-032 | `bil.order.fulfilled`               | Fulfillment done                               | order_id · NTF                                            |
| EVT-BIL-033 | `bil.payout.paid`                   | Payout paid                                    | user, amount · NTF                                        |
| EVT-BIL-034 | `bil.payout.failed`                 | Payout failed                                  | user · NTF                                                |
| EVT-BIL-035 | `bil.adjustment.executed`           | Adjustment posted                              | adjustment_id · ledger                                    |
| EVT-BIL-036 | `bil.ledger.posted`                 | Journal posted                                 | journal_id · ERP hook                                     |
| EVT-BIL-037 | `bil.recon.discrepancy`             | Items remain after run                         | run_id, count · FIN                                       |
| EVT-BIL-038 | `bil.webhook.dead_lettered`         | Event dead-lettered                            | event_id · on-call                                        |
| EVT-BIL-039 | `bil.price.change_notice`           | Price increase scheduled                       | subscriptions affected · NTF                              |
| EVT-BIL-040 | `bil.region.country_change`         | Country change scheduled                       | account · NTF                                             |

## EMP

Source: [02_MODULES/EMP_Employer_Organisation_Teams_Brand.md](../02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)

| ID          | Event name                             | Trigger         | Consumers                             |
| ----------- | -------------------------------------- | --------------- | ------------------------------------- |
| EVT-EMP-001 | `emp.org.created`                      | FR-EMP-001      | ANL (planned), ADM                    |
| EVT-EMP-002 | `emp.org.verified`                     | FR-EMP-002      | ATS (publish gate), JOB, TSF          |
| EVT-EMP-003 | `emp.org.verification_rejected`        | FR-EMP-002      | NTF                                   |
| EVT-EMP-004 | `emp.org.suspended`                    | FR-EMP-030      | ATS, JOB (listings hidden), INT       |
| EVT-EMP-005 | `emp.org.restored`                     | FR-EMP-030      | ATS, JOB                              |
| EVT-EMP-006 | `emp.org.closed`                       | FR-EMP-033      | ATS, JOB, BIL                         |
| EVT-EMP-007 | `emp.profile.published`                | FR-EMP-004      | Search index, JOB                     |
| EVT-EMP-008 | `emp.claim.granted`                    | FR-EMP-009      | JOB (imports)                         |
| EVT-EMP-009 | `emp.member.invited`                   | FR-EMP-010      | NTF                                   |
| EVT-EMP-010 | `emp.member.added`                     | FR-EMP-010      | ATS, INT                              |
| EVT-EMP-011 | `emp.member.removed`                   | FR-EMP-010, 027 | ATS (reassign), INT (calendar revoke) |
| EVT-EMP-012 | `emp.role.changed`                     | FR-EMP-012      | audit                                 |
| EVT-EMP-013 | `emp.seat.assigned` / `.released`      | FR-EMP-011      | BIL                                   |
| EVT-EMP-014 | `emp.policy.updated`                   | FR-EMP-014, 015 | ATS, INT                              |
| EVT-EMP-015 | `emp.agency.activated` / `.terminated` | FR-EMP-017      | ATS                                   |
| EVT-EMP-016 | `emp.review.published`                 | FR-EMP-019      | Search index, reputation              |
| EVT-EMP-017 | `emp.review.responded`                 | FR-EMP-020      | NTF                                   |
| EVT-EMP-018 | `emp.experience.rated`                 | FR-EMP-021      | reputation                            |
| EVT-EMP-019 | `emp.reputation.updated`               | FR-EMP-022      | JOB                                   |
| EVT-EMP-020 | `emp.dpa.signed`                       | FR-EMP-024      | ATS (access gate)                     |
| EVT-EMP-021 | `emp.webhook.disabled`                 | FR-EMP-025      | NTF                                   |
| EVT-EMP-022 | `emp.apikey.created` / `.revoked`      | FR-EMP-026      | audit                                 |
| EVT-EMP-023 | `emp.sso.enforced`                     | FR-EMP-027      | IDN (planned)                         |
| EVT-EMP-024 | `emp.lookalike.flagged`                | FR-EMP-029      | TSF                                   |
| EVT-EMP-025 | `emp.export.requested`                 | FR-EMP-033      | PLT                                   |
| EVT-EMP-026 | `emp.interview_experience.published`   | FR-EMP-034      | SRC, NTF                              |
| EVT-EMP-027 | `emp.culture_profile.updated`          | FR-EMP-035      | NTF, SRC                              |

## ENT

Source: [02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md](../02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)

| ID          | Event name                           | Trigger                        | Consumers                                                   |
| ----------- | ------------------------------------ | ------------------------------ | ----------------------------------------------------------- |
| EVT-ENT-001 | enterprise.workspace.activated       | Workspace activated            | tenantId                                                    |
| EVT-ENT-002 | enterprise.workspace.suspended       | Entitlement lapse              | tenantId, reason                                            |
| EVT-ENT-003 | enterprise.sso.configured            | SSO enabled                    | tenantId, protocol                                          |
| EVT-ENT-004 | enterprise.member.provisioned        | SCIM, HRIS or JIT creation     | memberId, source                                            |
| EVT-ENT-005 | enterprise.member.linked             | Employee linked                | memberId                                                    |
| EVT-ENT-006 | enterprise.member.unlinked           | Employee unlinked              | memberId                                                    |
| EVT-ENT-007 | enterprise.member.deprovisioned      | Termination or SCIM deactivate | memberId, source                                            |
| EVT-ENT-008 | enterprise.hris.sync_completed       | Sync run ends                  | runId, counts                                               |
| EVT-ENT-009 | enterprise.skill.endorsed            | Manager endorsement            | entryId                                                     |
| EVT-ENT-010 | enterprise.posting.published         | Posting opened                 | postingId, visibility                                       |
| EVT-ENT-011 | enterprise.application.submitted     | Internal application           | applicationId (no applicant detail to non-hiring consumers) |
| EVT-ENT-012 | enterprise.application.stage_changed | Stage change                   | applicationId, from, to                                     |
| EVT-ENT-013 | enterprise.transfer.requested        | Transfer handoff               | applicationId, releaseDate                                  |
| EVT-ENT-014 | enterprise.transfer.confirmed        | HRIS confirmation              | applicationId                                               |
| EVT-ENT-015 | enterprise.gig.assigned              | Gig assignment approved        | gigId, memberId                                             |
| EVT-ENT-016 | enterprise.learning.assigned         | Assignment created             | assignmentId, mandatory                                     |
| EVT-ENT-017 | enterprise.learning.completed        | Completion                     | assignmentId                                                |
| EVT-ENT-018 | enterprise.compliance.overdue        | Overdue                        | assignmentId, requirementId                                 |
| EVT-ENT-019 | enterprise.compliance.waived         | Waiver                         | assignmentId, approverId                                    |
| EVT-ENT-020 | enterprise.request.decided           | Learning request decided       | requestId, decision                                         |
| EVT-ENT-021 | enterprise.review.locked             | Talent review cycle locked     | cycleId                                                     |
| EVT-ENT-022 | enterprise.access.logged             | Individual-level read          | memberId, dataClass, purposeCode                            |
| EVT-ENT-023 | enterprise.export.generated          | Export                         | jobId, level                                                |
| EVT-ENT-024 | enterprise.region.policy_changed     | Regional enablement            | country, feature                                            |
| EVT-ENT-025 | enterprise.member.purged             | Retention purge                | memberId, scope                                             |

## EVD

Source: [02_MODULES/EVD_Evidence_Work_History_Credentials.md](../02_MODULES/EVD_Evidence_Work_History_Credentials.md)

| ID          | Event name                             | Trigger                            | Consumers                                               |
| ----------- | -------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| EVT-EVD-001 | `evd.claim.created`                    | Skill claim created                | claimId, skillId · SRC, ANL                             |
| EVT-EVD-002 | `evd.evidence.rung_changed`            | Rung recomputed                    | evidenceId, from, to, issuerClass · SRC, JOB, ATS, NTF  |
| EVT-EVD-003 | `evd.artifact.added`                   | Artifact accepted                  | evidenceId, type · ANL                                  |
| EVT-EVD-004 | `evd.evidence.created_from_assessment` | ASM event processed                | evidenceId, attemptId · SRC, NTF                        |
| EVT-EVD-005 | `evd.evidence.created_from_course`     | LRN event processed                | evidenceId, courseId · SRC, NTF                         |
| EVT-EVD-006 | `evd.review.submitted`                 | Project review submitted           | reviewId, projectId · NTF                               |
| EVT-EVD-007 | `evd.workhistory.requested`            | Request sent                       | verificationId · NTF                                    |
| EVT-EVD-008 | `evd.workhistory.verified`             | Confirmed (or accepted correction) | verificationId, entryId, class · PRF, SRC, BGV          |
| EVT-EVD-009 | `evd.workhistory.corrected`            | Employer correction                | verificationId, fields · PRF                            |
| EVT-EVD-010 | `evd.workhistory.expired`              | Expiry                             | verificationId · NTF                                    |
| EVT-EVD-011 | `evd.reference.submitted`              | Reference completed                | referenceId · NTF                                       |
| EVT-EVD-012 | `evd.endorsement.added`                | Endorsement saved                  | endorsementId, skillId · NTF, REP                       |
| EVT-EVD-013 | `evd.endorsement.withdrawn`            | Withdrawn                          | endorsementId · SRC                                     |
| EVT-EVD-014 | `evd.credential.issued`                | Issuance                           | credentialId, issuerId · PRF, NTF, SRC, REP             |
| EVT-EVD-015 | `evd.credential.imported`              | Import verified                    | credentialId, method · SRC                              |
| EVT-EVD-016 | `evd.credential.status_changed`        | Suspend, revoke, expire, lift      | credentialId, status · PRF, SRC, JOB, ATS, API webhooks |
| EVT-EVD-017 | `evd.credential.expiring`              | Reminder offsets                   | credentialId, days · NTF                                |
| EVT-EVD-018 | `evd.credential.exported`              | Export                             | credentialIds, format · ANL                             |
| EVT-EVD-019 | `evd.credential.verified`              | Public or API verification         | credentialId, channel · NTF (opt-in), ANL               |
| EVT-EVD-020 | `evd.share.created`                    | Link created                       | linkId, purpose · SET consent ledger                    |
| EVT-EVD-021 | `evd.share.accessed`                   | Access logged                      | linkId, orgId · NTF (opt-in), ATS                       |
| EVT-EVD-022 | `evd.share.revoked`                    | Revoked                            | linkId · SET consent ledger                             |
| EVT-EVD-023 | `evd.dispute.opened`                   | Dispute opened                     | disputeId, target · NTF, ADM                            |
| EVT-EVD-024 | `evd.dispute.decided`                  | Decision                           | disputeId, outcome · NTF, SRC                           |
| EVT-EVD-025 | `evd.impact.completed`                 | Impact job done                    | reportId · NTF, ATS                                     |
| EVT-EVD-026 | `evd.issuer.status_changed`            | Approved, suspended                | issuerId · ADM                                          |
| EVT-EVD-027 | `evd.erasure.completed`                | Sweep finished                     | reportId · SET                                          |

## EVT

Source: [02_MODULES/EVT_Events_Hackathons_Community_Programmes.md](../02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)

| ID          | Event name                         | Trigger                 | Consumers                           |
| ----------- | ---------------------------------- | ----------------------- | ----------------------------------- |
| EVT-EVT-001 | events.event.created               | Draft created or cloned | eventId, type, hostId, cloned       |
| EVT-EVT-002 | events.event.submitted_for_review  | Submit                  | eventId                             |
| EVT-EVT-003 | events.event.published             | Publish or approve      | eventId, visibility                 |
| EVT-EVT-004 | events.event.updated               | Edit after publish      | eventId, material, changedFields    |
| EVT-EVT-005 | events.event.cancelled             | Cancel or takedown      | eventId, reasonClass                |
| EVT-EVT-006 | events.event.started               | Scheduler               | eventId                             |
| EVT-EVT-007 | events.event.ended                 | Scheduler               | eventId                             |
| EVT-EVT-008 | events.registration.created        | Registration            | registrationId, eventId, ticketType |
| EVT-EVT-009 | events.registration.confirmed      | Seat confirmed          | registrationId                      |
| EVT-EVT-010 | events.registration.waitlisted     | Waitlist join           | registrationId, position            |
| EVT-EVT-011 | events.registration.offer_issued   | Seat offer              | registrationId, expiresAt           |
| EVT-EVT-012 | events.registration.cancelled      | Cancel                  | registrationId, refundMinor         |
| EVT-EVT-013 | events.registration.checked_in     | Scan or join            | registrationId, method              |
| EVT-EVT-014 | events.registration.no_show_marked | After end               | registrationId                      |
| EVT-EVT-015 | events.recording.published         | Recording available     | eventId, access                     |
| EVT-EVT-016 | events.certificate.issued          | Certificate issued      | registrationId, credentialId        |
| EVT-EVT-017 | events.booth.confirmed             | Booth confirmed         | boothId, employerOrgId              |
| EVT-EVT-018 | events.booth_visit.consented       | Candidate shares        | boothId, scopeClass                 |
| EVT-EVT-019 | events.hackathon.opened            | Registration opens      | hackathonId                         |
| EVT-EVT-020 | events.team.created                | Team created            | teamId, hackathonId                 |
| EVT-EVT-021 | events.team.locked                 | Lock                    | teamId                              |
| EVT-EVT-022 | events.submission.submitted        | Submit                  | submissionId                        |
| EVT-EVT-023 | events.score.recorded              | Judge finalizes         | submissionId, judgeId (internal)    |
| EVT-EVT-024 | events.results.published           | Publish                 | hackathonId                         |
| EVT-EVT-025 | events.report.filed                | Report                  | targetType, reasonClass             |
| EVT-EVT-026 | events.attendee.removed            | Host removes            | registrationId, reasonClass         |
| EVT-EVT-027 | events.series.created              | Series created          | seriesId                            |
| EVT-EVT-028 | events.feedback.submitted          | Survey response         | eventId (no identity)               |
| EVT-EVT-029 | events.interview_slot.booked       | Fair slot booked        | boothId, slotId                     |
| EVT-EVT-030 | events.sponsor.linked              | Sponsor approved        | eventId, orgId                      |

## GIG

Source: [02_MODULES/GIG_Freelance_Contract_Project_Work.md](../02_MODULES/GIG_Freelance_Contract_Project_Work.md)

| ID          | Event name                         | Trigger                   | Consumers                      |
| ----------- | ---------------------------------- | ------------------------- | ------------------------------ |
| EVT-GIG-001 | `gig.freelancer.activated`         | State `active`            | user_id · SRC, NTF             |
| EVT-GIG-002 | `gig.freelancer.suspended`         | Suspension                | user_id · BIL, NTF             |
| EVT-GIG-003 | `gig.listing.submitted`            | Listing submitted         | listing_id · TSF               |
| EVT-GIG-004 | `gig.listing.published`            | Published                 | listing_id · SRC, NTF          |
| EVT-GIG-005 | `gig.listing.closed`               | Closed or expired         | listing_id, reason · NTF       |
| EVT-GIG-006 | `gig.invitation.sent`              | Invitation                | invitation_id · NTF            |
| EVT-GIG-007 | `gig.proposal.submitted`           | Proposal                  | proposal_id · NTF, BIL         |
| EVT-GIG-008 | `gig.proposal.declined`            | Declined                  | proposal_id · NTF              |
| EVT-GIG-009 | `gig.offer.sent`                   | Offer sent                | contract_id · NTF              |
| EVT-GIG-010 | `gig.contract.activated`           | Both accepted             | contract_id · BIL, ANL         |
| EVT-GIG-011 | `gig.contract.completed`           | Completed                 | contract_id · EVD, PRF         |
| EVT-GIG-012 | `gig.contract.terminated`          | Terminated or cancelled   | contract_id · BIL              |
| EVT-GIG-013 | `gig.milestone.submitted`          | Submission                | milestone_id · NTF             |
| EVT-GIG-014 | `gig.milestone.accepted`           | Accepted (manual or auto) | milestone_id, mode · BIL       |
| EVT-GIG-015 | `gig.milestone.revision_requested` | Revision                  | milestone_id · NTF             |
| EVT-GIG-016 | `gig.change.agreed`                | Change agreed             | change_id · BIL                |
| EVT-GIG-017 | `gig.payment.released`             | Earning event posted      | milestone_id · BIL, NTF        |
| EVT-GIG-018 | `gig.payment.failed`               | Client charge failed      | milestone_id · BIL, TSF        |
| EVT-GIG-019 | `gig.dispute.opened`               | Dispute opened            | dispute_id · FIN, TSF          |
| EVT-GIG-020 | `gig.dispute.decided`              | Decision                  | dispute_id, outcome · BIL, REP |
| EVT-GIG-021 | `gig.review.published`             | Reviews revealed          | contract_id · REP, PRF         |
| EVT-GIG-022 | `gig.evidence.confirmed`           | Client-confirmed evidence | contract_id · EVD              |
| EVT-GIG-023 | `gig.flag.raised`                  | Compliance flag           | flag_id, type · TSF, ADM       |
| EVT-GIG-024 | `gig.hire.accepted`                | Conversion accepted       | conversion_id · JOB, ATS       |
| EVT-GIG-025 | `gig.learning.completed`           | Learning project sign-off | project_id · EVD, INS          |
| EVT-GIG-026 | `gig.timesheet.approved`           | Time approved (gated)     | timesheet_id · BIL             |
| EVT-GIG-027 | `gig.nda.accepted`                 | NDA accepted              | contract_id · audit            |
| EVT-GIG-028 | `gig.tax.status_changed`           | Tax form state change     | user_id · NTF                  |

## IDN

Source: [02_MODULES/IDN_Identity_Authentication_Account.md](../02_MODULES/IDN_Identity_Authentication_Account.md)

| ID          | Event name                      | Trigger             | Consumers                             |
| ----------- | ------------------------------- | ------------------- | ------------------------------------- |
| EVT-IDN-001 | idn.account.registered          | t1 / t1b            | account id, method, region            |
| EVT-IDN-002 | idn.account.verified            | t2                  | account id                            |
| EVT-IDN-003 | idn.account.purged              | t3                  | event-only, no row remains            |
| EVT-IDN-004 | idn.account.suspended           | t4                  | account id, case ref                  |
| EVT-IDN-005 | idn.account.restored            | t5                  | account id                            |
| EVT-IDN-006 | idn.account.deactivated         | t6                  | account id                            |
| EVT-IDN-007 | idn.account.reactivated         | t7                  | account id                            |
| EVT-IDN-008 | idn.account.erasure_pending     | t8                  | account id, request ref               |
| EVT-IDN-009 | idn.account.erased              | t10                 | opaque subject ref                    |
| EVT-IDN-010 | idn.session.created             | t1 session          | session id, assurance, method         |
| EVT-IDN-011 | idn.session.revoked             | revoke              | session id, reason, actor             |
| EVT-IDN-012 | idn.session.reuse_detected      | BR-IDN-009          | family id                             |
| EVT-IDN-013 | idn.login.failed                | failed attempt      | account key hash, bucket              |
| EVT-IDN-014 | idn.credential.password_changed | change or reset     | account id                            |
| EVT-IDN-015 | idn.credential.passkey_added    | add                 | account id, credential name           |
| EVT-IDN-016 | idn.credential.passkey_removed  | remove              | account id                            |
| EVT-IDN-017 | idn.credential.passkey_suspect  | counter regression  | account id                            |
| EVT-IDN-018 | idn.mfa.enabled                 | enroll              | account id, type                      |
| EVT-IDN-019 | idn.mfa.disabled                | disable             | account id                            |
| EVT-IDN-020 | idn.mfa.recovery_code_used      | use                 | account id                            |
| EVT-IDN-021 | idn.email.changed               | change              | account id                            |
| EVT-IDN-022 | idn.phone.verified              | verify              | account id                            |
| EVT-IDN-023 | idn.device.new_sign_in          | unrecognized device | account id, device label              |
| EVT-IDN-024 | idn.recovery.requested          | recovery t1         | request ref                           |
| EVT-IDN-025 | idn.recovery.completed          | recovery t4         | request ref                           |
| EVT-IDN-026 | idn.role.granted                | grant               | account, role, scope                  |
| EVT-IDN-027 | idn.role.revoked                | revoke              | account, role, scope                  |
| EVT-IDN-028 | idn.role.switched               | switch              | account, from, to                     |
| EVT-IDN-029 | idn.invitation.sent             | send                | org, role                             |
| EVT-IDN-030 | idn.invitation.accepted         | accept              | org, account                          |
| EVT-IDN-031 | idn.identity.linked             | link                | account, provider                     |
| EVT-IDN-032 | idn.identity.unlinked           | unlink              | account, provider                     |
| EVT-IDN-033 | idn.sso.enforced                | enforce             | org                                   |
| EVT-IDN-034 | idn.support.access_started      | impersonation t4    | agent ref, subject ref, scope, ticket |
| EVT-IDN-035 | idn.support.access_ended        | impersonation end   | grant id                              |
| EVT-IDN-036 | idn.abuse.attack_detected       | BR-IDN-030          | endpoint, range                       |
| EVT-IDN-037 | idn.policy.accepted             | acceptance          | account, policy, version              |
| EVT-IDN-038 | idn.age.attestation_failed      | failed age gate     | no personal data                      |

## INS

Source: [02_MODULES/INS_Institutions_Managed_Learning.md](../02_MODULES/INS_Institutions_Managed_Learning.md)

| ID          | Event name                             | Trigger                    | Consumers                                            |
| ----------- | -------------------------------------- | -------------------------- | ---------------------------------------------------- |
| EVT-INS-001 | `ins.institution.created`              | Application tenant created | institution_id, applicant · ADM, ANL                 |
| EVT-INS-002 | `ins.institution.submitted`            | Application submitted      | institution_id, case_id · ADM, NTF                   |
| EVT-INS-003 | `ins.institution.verified`             | Verification approved      | institution_id · NTF, BIL, ANL                       |
| EVT-INS-004 | `ins.institution.rejected`             | Verification rejected      | institution_id, reason_code · NTF                    |
| EVT-INS-005 | `ins.institution.suspended`            | Suspended by platform      | institution_id, reason · NTF, LRN                    |
| EVT-INS-006 | `ins.staff.invited`                    | Staff invited              | grant_id, role, scope · NTF                          |
| EVT-INS-007 | `ins.staff.joined`                     | Staff accepted             | grant_id · NTF                                       |
| EVT-INS-008 | `ins.staff.deactivated`                | Grant deactivated          | grant_id · IDN, NTF                                  |
| EVT-INS-009 | `ins.batch.created`                    | Batch created              | batch_id, program_id · ANL                           |
| EVT-INS-010 | `ins.student.invited`                  | Invitation created         | invitation_id, source · NTF                          |
| EVT-INS-011 | `ins.student.activated`                | Membership active          | membership_id, affiliation_verified · NTF, NET, PRF  |
| EVT-INS-012 | `ins.student.suspended`                | Suspended                  | membership_id, reason · LRN, NTF                     |
| EVT-INS-013 | `ins.student.withdrawn`                | Withdrawn                  | membership_id, reason · LRN, NTF                     |
| EVT-INS-014 | `ins.import.confirmed`                 | Import confirmed           | import_id, counts · ANL                              |
| EVT-INS-015 | `ins.import.completed`                 | Import finished            | import_id, report_ref · NTF                          |
| EVT-INS-016 | `ins.course.assigned`                  | Course assigned to batch   | assignment_id, batch_id, course_ref · LRN, NTF       |
| EVT-INS-017 | `ins.seat.assigned`                    | Seat assigned              | seat_id, membership_id · LRN, BIL                    |
| EVT-INS-018 | `ins.seat.revoked`                     | Seat revoked               | seat_id, grace_ends_at · LRN, NTF                    |
| EVT-INS-019 | `ins.seat.released`                    | Seat released to pool      | seat_id · BIL, LRN                                   |
| EVT-INS-020 | `ins.seats.low`                        | Free seats under threshold | pool_ref, free · NTF                                 |
| EVT-INS-021 | `ins.certificate.issued`               | Certificate issued         | certificate_id, membership_id · EVD, NTF, PRF        |
| EVT-INS-022 | `ins.certificate.revoked`              | Certificate revoked        | certificate_id, reason · EVD, NTF                    |
| EVT-INS-023 | `ins.atrisk.flagged`                   | Flag raised                | flag_id, rule · NTF                                  |
| EVT-INS-024 | `ins.case.opened`                      | Intervention opened        | case_id · NTF                                        |
| EVT-INS-025 | `ins.case.resolved`                    | Case resolved              | case_id, outcome · ANL                               |
| EVT-INS-026 | `ins.drive.published`                  | Drive published            | drive_id, eligible_count · NTF, JOB                  |
| EVT-INS-027 | `ins.drive.cancelled`                  | Drive cancelled            | drive_id · NTF                                       |
| EVT-INS-028 | `ins.drive.application_status_changed` | Application state change   | application_id, from, to · NTF, ATS                  |
| EVT-INS-029 | `ins.consent.granted`                  | Showcase consent granted   | consent_id, scope · SET, NTF                         |
| EVT-INS-030 | `ins.consent.revoked`                  | Showcase consent revoked   | consent_id · SET, NTF                                |
| EVT-INS-031 | `ins.outcome.reported`                 | Outcome recorded           | outcome_id · NTF                                     |
| EVT-INS-032 | `ins.outcome.confirmed`                | Student confirmed          | outcome_id · ANL, PRF                                |
| EVT-INS-033 | `ins.report.generated`                 | Report run ready           | run_id · NTF                                         |
| EVT-INS-034 | `ins.graduation.completed`             | Transition done            | transition_id, retained_summary · NET, PRF, EVD, ANL |
| EVT-INS-035 | `ins.guardian.consent_changed`         | Guardian choice changes    | consent_id, state · SET, LRN                         |
| EVT-INS-036 | `ins.records.disclosed`                | Disclosure logged          | entry_id · audit                                     |
| EVT-INS-037 | `ins.offboarding.started`              | Offboarding began          | request_id · BIL, NTF                                |
| EVT-INS-038 | `ins.offboarding.completed`            | Purge finished             | request_id · ADM                                     |
| EVT-INS-039 | `ins.sync.run_completed`               | Sync run done              | run counts · ANL                                     |
| EVT-INS-040 | `ins.employer.partnered`               | Partnership accepted       | partnership_id · NTF                                 |
| EVT-INS-041 | `ins.funding.listing_published`        | Funding listing published  | listing_id, visibility, institution_id · NTF, SRC    |

## INT

Source: [02_MODULES/INT_Interviews_Scheduling.md](../02_MODULES/INT_Interviews_Scheduling.md)

| ID          | Event name                    | Trigger         | Consumers                        |
| ----------- | ----------------------------- | --------------- | -------------------------------- |
| EVT-INT-001 | `int.invite.issued`           | FR-INT-007      | JOB (invite card), NTF (planned) |
| EVT-INT-002 | `int.interview.scheduled`     | FR-INT-008      | ATS, JOB, NTF, calendar sync     |
| EVT-INT-003 | `int.interview.rescheduled`   | FR-INT-012      | ATS, JOB, NTF                    |
| EVT-INT-004 | `int.interview.cancelled`     | FR-INT-013      | ATS, JOB, NTF                    |
| EVT-INT-005 | `int.interview.started`       | FR-INT-019      | ANL (planned)                    |
| EVT-INT-006 | `int.interview.completed`     | FR-INT-019      | ATS (scorecard requests), ANL    |
| EVT-INT-007 | `int.interview.no_show`       | FR-INT-031      | ATS, NTF, ANL                    |
| EVT-INT-008 | `int.negotiation.received`    | FR-INT-009      | NTF                              |
| EVT-INT-009 | `int.reminder.sent`           | FR-INT-017      | ANL                              |
| EVT-INT-010 | `int.consent.recorded`        | FR-INT-021, 024 | SET (planned), audit             |
| EVT-INT-011 | `int.recording.available`     | FR-INT-021      | NTF                              |
| EVT-INT-012 | `int.recording.deleted`       | FR-INT-033      | audit, SET                       |
| EVT-INT-013 | `int.transcript.ready`        | FR-INT-024      | NTF                              |
| EVT-INT-014 | `int.async.invited`           | FR-INT-026      | NTF                              |
| EVT-INT-015 | `int.async.submitted`         | FR-INT-027      | ATS, NTF                         |
| EVT-INT-016 | `int.feedback.requested`      | FR-INT-029      | ATS, NTF                         |
| EVT-INT-017 | `int.feedback.overdue`        | FR-INT-029      | ATS (SLA), NTF                   |
| EVT-INT-018 | `int.debrief.decided`         | FR-INT-030      | ATS                              |
| EVT-INT-019 | `int.accommodation.requested` | FR-INT-032      | NTF                              |
| EVT-INT-020 | `int.accommodation.decided`   | FR-INT-032      | NTF                              |
| EVT-INT-021 | `int.calendar.needs_reauth`   | FR-INT-004      | NTF                              |
| EVT-INT-022 | `int.room.failed`             | FR-INT-019      | ops alerting, ADM (planned)      |

## JOB

Source: [02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md](../02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)

| ID          | Event name                          | Trigger                         | Consumers                                       |
| ----------- | ----------------------------------- | ------------------------------- | ----------------------------------------------- |
| EVT-JOB-001 | `job.listing.viewed`                | SCR-JOB-003                     | ANL (planned), AIC (planned)                    |
| EVT-JOB-002 | `job.search.performed`              | FR-JOB-002                      | ANL, AIC                                        |
| EVT-JOB-003 | `job.listing.saved`                 | FR-JOB-010                      | AIC, ANL                                        |
| EVT-JOB-004 | `job.listing.hidden`                | FR-JOB-011                      | AIC                                             |
| EVT-JOB-005 | `job.listing.reported`              | FR-JOB-012                      | TSF (planned)                                   |
| EVT-JOB-006 | `job.saved_search.created`          | FR-JOB-014                      | ANL                                             |
| EVT-JOB-007 | `job.alert.sent`                    | FR-JOB-015                      | NTF (planned), ANL                              |
| EVT-JOB-008 | `job.application.draft_saved`       | FR-JOB-021                      | none (internal)                                 |
| EVT-JOB-009 | `job.application.submitted`         | FR-JOB-023                      | ATS inbox (FR-ATS-013), NTF, ANL, EVD (planned) |
| EVT-JOB-010 | `job.application.status_changed`    | JOB projection after ATS change | NTF, ANL                                        |
| EVT-JOB-011 | `job.application.withdrawn`         | FR-JOB-027                      | ATS, INT, NTF                                   |
| EVT-JOB-012 | `job.application.updated`           | FR-JOB-028                      | ATS                                             |
| EVT-JOB-013 | `job.application.auto_declined`     | FR-JOB-019                      | ATS, NTF                                        |
| EVT-JOB-014 | `job.interview_invite.responded`    | FR-JOB-030                      | INT, ATS                                        |
| EVT-JOB-015 | `job.offer.viewed`                  | FR-JOB-031                      | ATS                                             |
| EVT-JOB-016 | `job.offer.decided`                 | FR-JOB-032                      | ATS, NTF                                        |
| EVT-JOB-017 | `job.company.followed`              | FR-JOB-039                      | EMP (planned), AIC                              |
| EVT-JOB-018 | `job.listing.imported`              | FR-JOB-037                      | ANL, TSF                                        |
| EVT-JOB-019 | `job.listing.flagged_stale`         | FR-JOB-035                      | ATS, NTF                                        |
| EVT-JOB-020 | `job.external_application.recorded` | FR-JOB-038                      | AIC                                             |
| EVT-JOB-021 | `job.feedback.requested`            | FR-JOB-029                      | ATS                                             |
| EVT-JOB-022 | `job.recommendation.feedback_given` | FR-JOB-033                      | AIC                                             |
| EVT-JOB-023 | `job.export.requested`              | FR-JOB-042                      | SET (planned)                                   |
| EVT-JOB-024 | `job.listing.suppressed`            | FR-JOB-036                      | ATS, EMP                                        |
| EVT-JOB-025 | `job.prestart.published`            | FR-JOB-045                      | NTF, ANL (planned)                              |
| EVT-JOB-026 | `job.prestart.completed`            | FR-JOB-045                      | NTF, ATS                                        |

## LRN

Source: [02_MODULES/LRN_Learning_Course_Experience.md](../02_MODULES/LRN_Learning_Course_Experience.md)

| ID          | Event name                          | Trigger                               | Consumers                                                               |
| ----------- | ----------------------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| EVT-LRN-001 | `learning.catalog.viewed`           | Catalog list or search shown          | anonymous session id, filters, result count · ANL                       |
| EVT-LRN-002 | `learning.course.viewed`            | Course detail opened                  | courseId, source · ANL, AIC                                             |
| EVT-LRN-003 | `learning.enrollment.created`       | Enrollment row created                | enrollmentId, courseId, versionId, route · NTF, INS, ANL, REP           |
| EVT-LRN-004 | `learning.enrollment.activated`     | Enrollment becomes active             | enrollmentId, accessEndsAt · NTF, STU analytics                         |
| EVT-LRN-005 | `learning.enrollment.paused`        | Learner pauses                        | enrollmentId, resumeAt · NTF                                            |
| EVT-LRN-006 | `learning.enrollment.resumed`       | Resume                                | enrollmentId · NTF                                                      |
| EVT-LRN-007 | `learning.enrollment.dropped`       | Learner drops                         | enrollmentId, reasonCode · STU analytics, INS                           |
| EVT-LRN-008 | `learning.enrollment.expired`       | Window ends or unpaid                 | enrollmentId, cause · NTF, INS                                          |
| EVT-LRN-009 | `learning.enrollment.refunded`      | Refund completed                      | enrollmentId · EVD, STU, REP                                            |
| EVT-LRN-010 | `learning.enrollment.migrated`      | Learner switches version              | enrollmentId, fromVersion, toVersion · ANL                              |
| EVT-LRN-011 | `learning.lesson.started`           | First lesson event                    | enrollmentId, lessonKey · ANL                                           |
| EVT-LRN-012 | `learning.lesson.completed`         | Lesson rule met                       | enrollmentId, lessonKey, ruleKind · REP, ANL, AIC                       |
| EVT-LRN-013 | `learning.course.completed`         | Completion rule met                   | enrollmentId, courseId, versionId, gradeFinal · EVD, REP, NTF, INS, AIC |
| EVT-LRN-014 | `learning.certificate.issued`       | Certificate issued                    | certificateId, enrollmentId, type · NTF, PRF                            |
| EVT-LRN-015 | `learning.certificate.revoked`      | Revocation                            | certificateId, reasonClass · EVD, PRF                                   |
| EVT-LRN-016 | `learning.evidence.requested`       | Evidence hand-off                     | issuerRef, sourceRef, skills[] · EVD                                    |
| EVT-LRN-017 | `learning.path.enrolled`            | Path enrollment                       | pathEnrollmentId, pathId · ANL                                          |
| EVT-LRN-018 | `learning.path.completed`           | Program rule met                      | pathEnrollmentId · EVD, NTF, REP                                        |
| EVT-LRN-019 | `learning.submission.submitted`     | Submission                            | submissionId, assignmentId, late · STU inbox                            |
| EVT-LRN-020 | `learning.submission.graded`        | Grade saved                           | submissionId, score · NTF, gradebook                                    |
| EVT-LRN-021 | `learning.peerreview.completed`     | Review submitted                      | peerReviewId · gradebook                                                |
| EVT-LRN-022 | `learning.review.published`         | Review visible                        | reviewId, rating · STU, ANL                                             |
| EVT-LRN-023 | `learning.review.reported`          | Report threshold                      | reviewId, reasons · TSF                                                 |
| EVT-LRN-024 | `learning.qa.question_posted`       | Question posted                       | threadId, lessonKey · STU inbox                                         |
| EVT-LRN-025 | `learning.live.attended`            | Attendance finalized                  | sessionId, enrollmentId · completion rules                              |
| EVT-LRN-026 | `learning.download.licensed`        | Offline license issued                | licenseId, deviceId · ANL                                               |
| EVT-LRN-027 | `learning.goal.updated`             | Goal or plan changed                  | goalRef · AIC                                                           |
| EVT-LRN-028 | `learning.streak.updated`           | Streak day counted or lost            | streak · REP                                                            |
| EVT-LRN-029 | `learning.recommendation.dismissed` | Not interested                        | itemId, reason · AIC                                                    |
| EVT-LRN-030 | `learning.report.filed`             | Content problem filed                 | reportId, category · STU, TSF                                           |
| EVT-LRN-031 | `learning.access.extended`          | Extension granted                     | enrollmentId, newEnd · NTF                                              |
| EVT-LRN-032 | `learning.hub.visibility_changed`   | Hub crosses the contributor threshold | hubId, state · NTF, ANL                                                 |
| EVT-LRN-033 | `learning.hub.contribution_decided` | Contribution approved or rejected     | hubId, contributionId, decision · NTF, REP                              |

## MEN

Source: [02_MODULES/MEN_Mentorship_Coaching_Career_Services.md](../02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)

| ID          | Event name                  | Trigger                       | Consumers                              |
| ----------- | --------------------------- | ----------------------------- | -------------------------------------- |
| EVT-MEN-001 | `men.application.submitted` | Mentor application submitted  | mentor_id · ADM, TSF                   |
| EVT-MEN-002 | `men.mentor.approved`       | Approved with level           | mentor_id, level · NTF, SRC            |
| EVT-MEN-003 | `men.mentor.suspended`      | Suspension                    | mentor_id, reason class · BIL, NTF     |
| EVT-MEN-004 | `men.verification.expiring` | 60 and 14 days                | mentor_id · NTF                        |
| EVT-MEN-005 | `men.request.sent`          | Request sent                  | request_id · NTF                       |
| EVT-MEN-006 | `men.request.accepted`      | Accepted                      | request_id · NTF                       |
| EVT-MEN-007 | `men.request.declined`      | Declined                      | request_id · NTF                       |
| EVT-MEN-008 | `men.mentorship.started`    | Agreement confirmed           | mentorship_id · ANL                    |
| EVT-MEN-009 | `men.mentorship.ended`      | Ended                         | mentorship_id, by · NTF, ANL           |
| EVT-MEN-010 | `men.session.booked`        | Booking confirmed             | session_id · NTF, INT                  |
| EVT-MEN-011 | `men.session.cancelled`     | Cancelled                     | session_id, by · BIL, NTF              |
| EVT-MEN-012 | `men.session.completed`     | Completed                     | session_id · BIL (earning), REP        |
| EVT-MEN-013 | `men.session.no_show`       | No-show marked                | session_id, party · BIL, quality       |
| EVT-MEN-014 | `men.feedback.published`    | Feedback published            | session_id · ANL                       |
| EVT-MEN-015 | `men.action.assigned`       | Action item created           | action_id · NTF                        |
| EVT-MEN-016 | `men.goal.completed`        | Goal done                     | goal_id · PRF (achievement offer), REP |
| EVT-MEN-017 | `men.program.published`     | Program published             | program_id · NTF                       |
| EVT-MEN-018 | `men.pairing.confirmed`     | Pairing confirmed             | pairing_id · NTF                       |
| EVT-MEN-019 | `men.pair.inactive`         | Inactivity flagged            | pair_id · NTF                          |
| EVT-MEN-020 | `men.service.delivered`     | Review or scorecard delivered | order_id · NTF, BIL                    |
| EVT-MEN-021 | `men.service.late`          | Deadline passed               | order_id · BIL, quality                |
| EVT-MEN-022 | `men.package.purchased`     | Package order paid            | order_id · ANL                         |
| EVT-MEN-023 | `men.group.registered`      | Registration                  | group_id · NTF                         |
| EVT-MEN-024 | `men.report.received`       | Safeguarding report           | report_id, severity · TSF              |
| EVT-MEN-025 | `men.report.decided`        | Decision                      | report_id · NTF                        |
| EVT-MEN-026 | `men.dispute.opened`        | Dispute opened                | dispute_id · BIL                       |
| EVT-MEN-027 | `men.dispute.decided`       | Dispute decided               | dispute_id, outcome · BIL              |
| EVT-MEN-028 | `men.quality.flagged`       | Quality flag                  | mentor_id · ADM                        |
| EVT-MEN-029 | `men.conflict.blocked`      | Conflict block                | mentor_id · TSF                        |

## MKT

Source: [02_MODULES/MKT_Market_Intelligence_Career_Pathing.md](../02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)

| ID          | Event name                     | Trigger                                       | Consumers                                         |
| ----------- | ------------------------------ | --------------------------------------------- | ------------------------------------------------- |
| EVT-MKT-001 | mkt.skill.created              | Skill created                                 | skillId, category                                 |
| EVT-MKT-002 | mkt.skill.deprecated           | Skill deprecated                              | skillId, successorId                              |
| EVT-MKT-003 | mkt.skill.proposal_decided     | Proposal promoted, aliased, dismissed         | candidateId, decision                             |
| EVT-MKT-004 | mkt.taxonomy.version_published | Version published                             | versionId, changeCounts                           |
| EVT-MKT-005 | mkt.role.updated               | Role or requirements changed                  | roleId, versionId                                 |
| EVT-MKT-006 | mkt.source.state_changed       | Data source enabled, disabled, expired        | sourceId, state                                   |
| EVT-MKT-007 | mkt.pipeline.alert             | Reconciliation or freshness breach            | sourceId, kind                                    |
| EVT-MKT-008 | mkt.snapshot.published         | Snapshot published                            | snapshotId, kind, cellsPublished, cellsSuppressed |
| EVT-MKT-009 | mkt.snapshot.held              | Snapshot held                                 | snapshotId, reason                                |
| EVT-MKT-010 | mkt.salary.submitted           | Report submitted                              | reportId (pseudonymous), weight                   |
| EVT-MKT-011 | mkt.salary.flagged             | Report flagged                                | reportId, reasonClass                             |
| EVT-MKT-012 | mkt.salary.withdrawn           | Report withdrawn                              | reportId                                          |
| EVT-MKT-013 | mkt.transition.recorded        | Transition opt-in recorded                    | transitionId (pseudonymous)                       |
| EVT-MKT-014 | mkt.transition.removed         | Transition removed                            | transitionId                                      |
| EVT-MKT-015 | mkt.benchmark.viewed           | Benchmark viewed                              | kind, cellClass (no identity beyond pseudonym)    |
| EVT-MKT-016 | mkt.gap.computed               | Gap analysis run                              | targetRoleId, taxonomyVersion                     |
| EVT-MKT-017 | mkt.readiness.computed         | Readiness computed                            | modelVersion                                      |
| EVT-MKT-018 | mkt.plan.created               | Action plan created                           | planId, itemCount                                 |
| EVT-MKT-019 | mkt.consent.changed            | Contribution consent changed                  | purpose, state                                    |
| EVT-MKT-020 | mkt.export.requested           | Export requested                              | scope, format                                     |
| EVT-MKT-021 | mkt.api.grant_changed          | Grant approved or revoked                     | grantId, state                                    |
| EVT-MKT-022 | mkt.dispute.opened             | Dispute filed                                 | disputeId, type                                   |
| EVT-MKT-023 | mkt.dispute.resolved           | Dispute resolved                              | disputeId, outcome                                |
| EVT-MKT-024 | mkt.policy.changed             | Suppression policy changed                    | parameter, decisionRecordId                       |
| EVT-MKT-025 | mkt.fairness.review_recorded   | Fairness review done                          | modelVersion, outcome                             |
| EVT-MKT-026 | mkt.company_profile.published  | Company skill snapshot computed and published | orgId, snapshotId                                 |

## MSG

Source: [02_MODULES/MSG_Messaging_Realtime_Communication.md](../02_MODULES/MSG_Messaging_Realtime_Communication.md)

| ID          | Event name                 | Trigger    | Consumers                                        |
| ----------- | -------------------------- | ---------- | ------------------------------------------------ |
| EVT-MSG-001 | msg.conversation.created   | FR-MSG-001 | conversation id, type · ANL                      |
| EVT-MSG-002 | msg.message.sent           | FR-MSG-002 | message id, conversation id (no body) · NTF, TSF |
| EVT-MSG-003 | msg.message.edited         | FR-MSG-002 | message id, revision · TSF                       |
| EVT-MSG-004 | msg.message.deleted        | FR-MSG-002 | message id, scope · SRC, TSF                     |
| EVT-MSG-005 | msg.attachment.scanned     | FR-MSG-003 | attachment id, verdict · TSF                     |
| EVT-MSG-006 | msg.group.created          | FR-MSG-004 | conversation id, size · TSF                      |
| EVT-MSG-007 | msg.group.member_added     | FR-MSG-004 | conversation id, member · NTF                    |
| EVT-MSG-008 | msg.message.read           | FR-MSG-007 | message id, reader · ANL                         |
| EVT-MSG-009 | msg.conversation.closed    | FR-MSG-008 | conversation id, reason · ATS, MEN               |
| EVT-MSG-010 | msg.request.sent           | FR-MSG-009 | request id · NTF, TSF                            |
| EVT-MSG-011 | msg.request.accepted       | FR-MSG-009 | request id, conversation id · ANL                |
| EVT-MSG-012 | msg.request.declined       | FR-MSG-009 | request id (internal only) · TSF                 |
| EVT-MSG-013 | msg.outreach.sent          | FR-MSG-010 | outreach id, org, job · ATS, ANL, TSF            |
| EVT-MSG-014 | msg.credit.consumed        | FR-MSG-011 | ledger id · BIL                                  |
| EVT-MSG-015 | msg.credit.refunded        | FR-MSG-011 | ledger id · BIL                                  |
| EVT-MSG-016 | msg.preferences.updated    | FR-MSG-012 | member · SRC, ATS                                |
| EVT-MSG-017 | msg.context_thread.created | FR-MSG-013 | conversation id, context · ATS, MEN              |
| EVT-MSG-018 | msg.thread.assigned        | FR-MSG-014 | conversation id, assignee · ATS                  |
| EVT-MSG-019 | msg.broadcast.sent         | FR-MSG-016 | broadcast id, count · ANL, TSF                   |
| EVT-MSG-020 | msg.spam.flagged           | FR-MSG-017 | member, signal · TSF                             |
| EVT-MSG-021 | msg.report.created         | FR-MSG-018 | report ref · TSF                                 |
| EVT-MSG-022 | msg.scam_warning.shown     | FR-MSG-019 | conversation id, pattern id · TSF                |
| EVT-MSG-023 | msg.scan.verdict           | FR-MSG-021 | message or attachment id, verdict · TSF          |
| EVT-MSG-024 | msg.notification.requested | FR-MSG-024 | member, class · NTF                              |
| EVT-MSG-025 | msg.retention.purged       | FR-MSG-027 | scope, counts · SET, ADM                         |
| EVT-MSG-026 | msg.export.requested       | FR-MSG-028 | job id · SET                                     |
| EVT-MSG-027 | msg.export.ready           | FR-MSG-028 | job id · NTF                                     |
| EVT-MSG-028 | msg.access.granted         | FR-MSG-029 | audit id · ADM, SAD                              |
| EVT-MSG-029 | msg.access.viewed          | FR-MSG-029 | audit id · ADM                                   |
| EVT-MSG-030 | msg.link.blocked           | FR-MSG-031 | domain, reason · TSF                             |
| EVT-MSG-031 | msg.schedule_card.sent     | FR-MSG-033 | conversation id · INT                            |
| EVT-MSG-032 | msg.search.performed       | FR-MSG-006 | member (no query text) · ANL                     |

## NET

Source: [02_MODULES/NET_Networking_Community_Referrals.md](../02_MODULES/NET_Networking_Community_Referrals.md)

| ID          | Event name                      | Trigger    | Consumers                                  |
| ----------- | ------------------------------- | ---------- | ------------------------------------------ |
| EVT-NET-001 | net.connection_request.sent     | FR-NET-001 | request id, sender, recipient · NTF, TSF   |
| EVT-NET-002 | net.connection_request.accepted | FR-NET-002 | request id, connection id · NTF, REP, AIC  |
| EVT-NET-003 | net.connection.removed          | FR-NET-004 | pair · AIC, NET                            |
| EVT-NET-004 | net.follow.created              | FR-NET-005 | follower, target · NTF, AIC                |
| EVT-NET-005 | net.block.created               | FR-NET-006 | blocker, blocked · MSG, TSF, ATS (planned) |
| EVT-NET-006 | net.privacy.changed             | FR-NET-007 | member, diff · SRC, MSG                    |
| EVT-NET-007 | net.suggestion.dismissed        | FR-NET-008 | member, suggestion · AIC                   |
| EVT-NET-008 | net.introduction.requested      | FR-NET-010 | request id · NTF                           |
| EVT-NET-009 | net.endorsement.given           | FR-NET-011 | giver, receiver, skill · NTF, TSF, AIC     |
| EVT-NET-010 | net.recommendation.accepted     | FR-NET-012 | recommendation id · PRF, AIC               |
| EVT-NET-011 | net.profile_view.logged         | FR-NET-013 | viewer mode, owner · ANL                   |
| EVT-NET-012 | net.post.published              | FR-NET-014 | post id, audience · TSF, SRC, AIC          |
| EVT-NET-013 | net.post.edited                 | FR-NET-015 | post id, version · TSF                     |
| EVT-NET-014 | net.post.deleted                | FR-NET-015 | post id · SRC                              |
| EVT-NET-015 | net.comment.created             | FR-NET-016 | comment id · NTF, TSF                      |
| EVT-NET-016 | net.reaction.set                | FR-NET-017 | target, kind · ANL                         |
| EVT-NET-017 | net.mention.created             | FR-NET-018 | mention · NTF                              |
| EVT-NET-018 | net.feed.explanation_viewed     | FR-NET-020 | impression · ANL                           |
| EVT-NET-019 | net.feed.feedback               | FR-NET-021 | member, action · AIC                       |
| EVT-NET-020 | net.newsletter.issue_sent       | FR-NET-022 | issue id, recipients · NTF                 |
| EVT-NET-021 | net.group.created               | FR-NET-025 | group id · TSF                             |
| EVT-NET-022 | net.group.member_joined         | FR-NET-026 | group, member · NTF                        |
| EVT-NET-023 | net.group.moderation_action     | FR-NET-027 | action, target · TSF                       |
| EVT-NET-024 | net.referral.requested          | FR-NET-029 | request id · NTF                           |
| EVT-NET-025 | net.referral.responded          | FR-NET-030 | request id, action · NTF, ATS              |
| EVT-NET-026 | net.referral.employee_submitted | FR-NET-031 | request id · NTF                           |
| EVT-NET-027 | net.referral.delivered          | FR-NET-032 | referral id, application ref · ATS, ANL    |
| EVT-NET-028 | net.referral.attributed         | FR-NET-032 | referral id, hire · ATS, REP               |
| EVT-NET-029 | net.referral.reward_eligible    | FR-NET-033 | referral id · NTF, REP                     |
| EVT-NET-030 | net.referral.integrity_flagged  | FR-NET-034 | referral id, signal · TSF                  |
| EVT-NET-031 | net.ranking.version_activated   | FR-NET-036 | version · ANL, ADM                         |
| EVT-NET-032 | net.account.social_data_purged  | FR-NET-037 | member · SET                               |
| EVT-NET-033 | net.group.alumni_joined         | FR-NET-028 | group, member · NTF                        |
| EVT-NET-034 | net.referral_programme.updated  | FR-NET-035 | org, version · NTF                         |

## NTF

Source: [02_MODULES/NTF_Notifications_Communication.md](../02_MODULES/NTF_Notifications_Communication.md)

| ID          | Event name               | Trigger                                                          | Consumers                                |
| ----------- | ------------------------ | ---------------------------------------------------------------- | ---------------------------------------- |
| EVT-NTF-001 | ntf.notification.created | in-app item created                                              | notification id, recipient ref, category |
| EVT-NTF-002 | ntf.notification.read    | read action                                                      | notification id                          |
| EVT-NTF-003 | ntf.delivery.sent        | provider accepted                                                | delivery id, channel                     |
| EVT-NTF-004 | ntf.delivery.delivered   | confirmed                                                        | delivery id, channel                     |
| EVT-NTF-005 | ntf.delivery.failed      | permanent failure                                                | delivery id, error class                 |
| EVT-NTF-006 | ntf.delivery.bounced     | hard bounce                                                      | delivery id                              |
| EVT-NTF-007 | ntf.delivery.complained  | complaint                                                        | delivery id                              |
| EVT-NTF-008 | ntf.delivery.suppressed  | routing suppress                                                 | delivery id, reason                      |
| EVT-NTF-009 | ntf.address.suppressed   | suppression added                                                | recipient ref, reason                    |
| EVT-NTF-010 | ntf.preference.changed   | preference write                                                 | recipient ref, category, channel         |
| EVT-NTF-011 | ntf.unsubscribed         | unsubscribe                                                      | recipient ref, category                  |
| EVT-NTF-012 | ntf.endpoint.registered  | push or SMS endpoint added or removed                            | recipient ref, type                      |
| EVT-NTF-013 | ntf.digest.sent          | digest delivered                                                 | recipient ref, item count                |
| EVT-NTF-014 | ntf.broadcast.started    | broadcast active or resolved                                     | broadcast id                             |
| EVT-NTF-015 | ntf.template.published   | template active                                                  | key, locale, version                     |
| EVT-NTF-016 | ntf.alert.matched        | alert match                                                      | subscription id, count                   |
| EVT-NTF-017 | ntf.reminder.fired       | reminder sent                                                    | reminder id                              |
| EVT-NTF-018 | ntf.stream.paused        | deliverability pause                                             | stream, reason                           |
| EVT-NTF-019 | ntf.automation.run       | A rule was evaluated and its actions executed, failed or skipped | rule id, event id, outcome               |

## PLT

Source: [02_MODULES/PLT_Platform_API_Integrations_Media_Files.md](../02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)

| ID          | Event name                       | Trigger                              | Consumers                                                     |
| ----------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| EVT-PLT-001 | `plt.apiclient.registered`       | App registered                       | clientId, ownerId, environment · ADM, ANL                     |
| EVT-PLT-002 | `plt.apiclient.approved`         | Live approval or suspension decision | clientId, decision · NTF, ADM                                 |
| EVT-PLT-003 | `plt.credential.created`         | Key or secret created                | credentialId, ownerRef, scopes · NTF (notice), audit          |
| EVT-PLT-004 | `plt.credential.revoked`         | Key revoked or expired               | credentialId, reason · NTF, audit                             |
| EVT-PLT-005 | `plt.credential.rotated`         | Rotation started                     | credentialId, successorId · NTF, audit                        |
| EVT-PLT-006 | `plt.grant.authorized`           | OAuth consent granted                | userId, clientId, scopes · NTF (notice), audit                |
| EVT-PLT-007 | `plt.grant.revoked`              | Grant revoked                        | grantId, reason · audit                                       |
| EVT-PLT-008 | `plt.ratelimit.exceeded`         | Limit tripped (sampled)              | principalId, class · ANL, ADM alerts                          |
| EVT-PLT-009 | `plt.quota.threshold_reached`    | 80% or 100% of quota                 | tenantId, quotaType, percent · NTF, BIL                       |
| EVT-PLT-010 | `plt.apiversion.deprecated`      | Version deprecation announced        | version, sunsetAt · NTF, changelog subscribers                |
| EVT-PLT-011 | `plt.webhook.endpoint_created`   | Endpoint created or verified         | endpointId, tenantId · audit                                  |
| EVT-PLT-012 | `plt.webhook.endpoint_disabled`  | Endpoint disabled or auto-disabled   | endpointId, reason · NTF, audit                               |
| EVT-PLT-013 | `plt.webhook.delivery_failed`    | Attempt failed                       | deliveryId, attempt, errorClass · ANL, ADM health             |
| EVT-PLT-014 | `plt.webhook.delivery_dead`      | Delivery exhausted                   | deliveryId, eventId · NTF (digest), ADM                       |
| EVT-PLT-015 | `plt.webhook.replayed`           | Delivery replayed                    | deliveryId, by · audit                                        |
| EVT-PLT-016 | `plt.integration.connected`      | Connection active                    | connectionId, definitionId · audit, ANL                       |
| EVT-PLT-017 | `plt.integration.disconnected`   | Connection ended                     | connectionId, dataDisposition · audit                         |
| EVT-PLT-018 | `plt.integration.health_changed` | Health state transition              | connectionId or adapterId, from, to · ADM (EVT consumed), NTF |
| EVT-PLT-019 | `plt.integration.sync_completed` | Sync run done                        | runId, counts · owning module, audit                          |
| EVT-PLT-020 | `plt.integration.sync_failed`    | Sync run failed                      | runId, errorClass · NTF, ADM                                  |
| EVT-PLT-021 | `plt.sso.connection_verified`    | SSO test sign-in succeeded           | tenantId, protocol · audit                                    |
| EVT-PLT-022 | `plt.scim.user_deprovisioned`    | SCIM deactivation applied            | userId, tenantId · IDN, audit                                 |
| EVT-PLT-023 | `plt.file.upload_started`        | Upload session created               | fileId, purpose · ANL                                         |
| EVT-PLT-024 | `plt.file.available`             | Scan clean                           | fileId, purpose, size · owning modules                        |
| EVT-PLT-025 | `plt.file.quarantined`           | File quarantined                     | fileId, reasonClass · TSF, NTF                                |
| EVT-PLT-026 | `plt.file.deleted`               | Soft delete                          | fileId, by · owning modules, search                           |
| EVT-PLT-027 | `plt.file.purged`                | Purge complete                       | fileId · audit, SET                                           |
| EVT-PLT-028 | `plt.media.transcode_completed`  | Media ready                          | assetId · STU, LRN                                            |
| EVT-PLT-029 | `plt.media.transcode_failed`     | Media failed                         | assetId, reasonClass · STU, NTF                               |
| EVT-PLT-030 | `plt.storage.quota_threshold`    | Storage quota threshold              | ownerRef, percent · NTF, BIL                                  |
| EVT-PLT-031 | `plt.import.validated`           | Validation complete                  | runId, counts · NTF                                           |
| EVT-PLT-032 | `plt.import.committed`           | Import finished                      | runId, counts · owning module, audit                          |
| EVT-PLT-033 | `plt.import.failed`              | Import failed                        | runId, errorClass · NTF, ADM                                  |
| EVT-PLT-034 | `plt.export.ready`               | Export ready                         | exportId, expiresAt · NTF                                     |
| EVT-PLT-035 | `plt.export.expired`             | Export link expired                  | exportId · audit                                              |
| EVT-PLT-036 | `plt.job.dead`                   | Job became dead                      | jobId, kind, errorClass · ADM (FR-ADM-037)                    |
| EVT-PLT-037 | `plt.job.replayed`               | Operator replay                      | jobId, by · audit                                             |
| EVT-PLT-038 | `plt.schedule.missed`            | Slot skipped or late                 | scheduleId, slot, policy · ADM alerts                         |
| EVT-PLT-039 | `plt.sandbox.reset`              | Sandbox reset or deleted             | sandboxId · ANL                                               |
| EVT-PLT-040 | `plt.egress.blocked`             | Outbound request refused             | purpose, reasonClass, tenantId · security alerts, ADM         |

## PRF

Source: [02_MODULES/PRF_Profile_Resume_Portfolio.md](../02_MODULES/PRF_Profile_Resume_Portfolio.md)

| ID          | Event name                           | Trigger                                      | Consumers                                           |
| ----------- | ------------------------------------ | -------------------------------------------- | --------------------------------------------------- |
| EVT-PRF-001 | `prf.profile.created`                | Profile created                              | profileId, accountId · ANL, SRC                     |
| EVT-PRF-002 | `prf.profile.updated`                | Any section write                            | profileId, sections[], version · SRC, EVD, BGV, AIC |
| EVT-PRF-003 | `prf.profile.published`              | draft or hidden to published                 | profileId · SRC, NTF                                |
| EVT-PRF-004 | `prf.profile.hidden`                 | published to hidden or archived              | profileId · SRC, JOB                                |
| EVT-PRF-005 | `prf.profile.restored`               | History restore                              | profileId, snapshotId · SRC                         |
| EVT-PRF-006 | `prf.slug.changed`                   | Slug saved                                   | profileId, oldSlug, newSlug · SRC, ANL              |
| EVT-PRF-007 | `prf.completeness.changed`           | Integer score change or 70 threshold crossed | profileId, score, crossed70 · JOB, NTF, ANL         |
| EVT-PRF-008 | `prf.section.visibility_changed`     | Visibility edit                              | profileId, section, from, to · SRC                  |
| EVT-PRF-009 | `prf.discoverability.changed`        | Discoverability or stealth change            | profileId, discoverability, stealth · SRC           |
| EVT-PRF-010 | `prf.workentry.locked_field_changed` | Verified work or credential claim edited     | profileId, entryId · EVD                            |
| EVT-PRF-011 | `prf.resume.created`                 | Resume created                               | resumeId, source · ANL                              |
| EVT-PRF-012 | `prf.resume.exported`                | Export completed                             | resumeId, format · ANL                              |
| EVT-PRF-013 | `prf.resume.parsed`                  | Parse job ready_for_review                   | jobId, confidence · NTF                             |
| EVT-PRF-014 | `prf.resume.imported`                | Parse confirmed                              | jobId, createdItems · ANL, EVD                      |
| EVT-PRF-015 | `prf.resume.share_created`           | Link created                                 | resumeId, expiry · ANL                              |
| EVT-PRF-016 | `prf.resume.share_viewed`            | Link opened                                  | linkId, country · NTF (opt-in)                      |
| EVT-PRF-017 | `prf.resume.share_revoked`           | Link revoked                                 | linkId · ANL                                        |
| EVT-PRF-018 | `prf.project.published`              | Project published                            | projectId, skillIds · SRC, EVD                      |
| EVT-PRF-019 | `prf.project.removed`                | Project deleted or removed                   | projectId · SRC, EVD                                |
| EVT-PRF-020 | `prf.recommendation.requested`       | Owner sends request                          | recommendationId · NTF                              |
| EVT-PRF-021 | `prf.recommendation.submitted`       | Author submits                               | recommendationId · NTF                              |
| EVT-PRF-022 | `prf.recommendation.published`       | Owner approves                               | recommendationId · SRC, EVD                         |
| EVT-PRF-023 | `prf.recommendation.withdrawn`       | Author withdraws                             | recommendationId · SRC                              |
| EVT-PRF-024 | `prf.opentowork.changed`             | Status set, renewed, expired                 | profileId, status · SRC, AIC                        |
| EVT-PRF-025 | `prf.preferences.updated`            | Preferences saved                            | profileId, fieldsChanged · AIC, JOB                 |
| EVT-PRF-026 | `prf.profile.viewed`                 | View recorded                                | profileId, viewerClass, source · ANL, NTF           |
| EVT-PRF-027 | `prf.import.completed`               | Import applied                               | jobId, counts · ANL                                 |

## PWA

Source: [02_MODULES/PWA_PWA_Offline_Mobile_Extension.md](../02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)

| ID          | Event name                        | Trigger                                       | Consumers                                                |
| ----------- | --------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| EVT-PWA-001 | `pwa.install.prompted`            | Install card shown                            | platform, count · ANL, FR-PWA-030                        |
| EVT-PWA-002 | `pwa.install.accepted`            | User accepts prompt                           | platform · ANL                                           |
| EVT-PWA-003 | `pwa.install.dismissed`           | User dismisses                                | platform, method · ANL                                   |
| EVT-PWA-004 | `pwa.app.installed`               | `appinstalled`                                | platform, source · ANL, NTF (offers notification opt-in) |
| EVT-PWA-005 | `pwa.sw.updated`                  | New SW activated                              | fromVersion, toVersion · ANL, ADM health                 |
| EVT-PWA-006 | `pwa.update.prompted`             | Update banner shown                           | version, required · ANL                                  |
| EVT-PWA-007 | `pwa.update.applied`              | User or cold start applied                    | version, latencyBucket · ANL                             |
| EVT-PWA-008 | `pwa.offline.entered`             | State becomes offline                         | durationBucket on exit · ANL                             |
| EVT-PWA-009 | `pwa.draft.saved_offline`         | Draft saved while offline                     | kind · ANL (OD-PWA-01 evidence)                          |
| EVT-PWA-010 | `pwa.draft.sent_after_reconnect`  | Draft sent after being offline                | kind, ageBucket · ANL                                    |
| EVT-PWA-011 | `pwa.draft.discarded`             | Draft discarded unsent                        | kind, ageBucket · ANL                                    |
| EVT-PWA-012 | `pwa.outbox.item_queued`          | Item queued                                   | opType · ANL                                             |
| EVT-PWA-013 | `pwa.outbox.item_synced`          | Item confirmed                                | opType, attempts · ANL                                   |
| EVT-PWA-014 | `pwa.outbox.item_conflict`        | Conflict detected                             | opType · ANL                                             |
| EVT-PWA-015 | `pwa.outbox.item_expired`         | Item expired                                  | opType · ANL                                             |
| EVT-PWA-016 | `pwa.push.permission_prompted`    | Browser prompt requested                      | platform · ANL                                           |
| EVT-PWA-017 | `pwa.push.subscribed`             | Subscription stored                           | deviceId · NTF                                           |
| EVT-PWA-018 | `pwa.push.unsubscribed`           | Subscription removed                          | deviceId, reason · NTF                                   |
| EVT-PWA-019 | `pwa.push.delivery_failed`        | Push send failed                              | class, statusClass · NTF, ADM health                     |
| EVT-PWA-020 | `pwa.push.clicked`                | Notification opened                           | class · NTF, ANL                                         |
| EVT-PWA-021 | `pwa.lowbandwidth.toggled`        | Mode changed                                  | mode, auto · ANL                                         |
| EVT-PWA-022 | `pwa.storage.quota_warning`       | Over 80% usage                                | category · ANL                                           |
| EVT-PWA-023 | `pwa.cache.purged`                | Purge executed                                | reason · ANL, audit                                      |
| EVT-PWA-024 | `pwa.share.received`              | Share target used                             | kind · ANL                                               |
| EVT-PWA-025 | `pwa.extension.paired`            | Pairing complete                              | browser, version · NTF (security email), audit           |
| EVT-PWA-026 | `pwa.extension.revoked`           | Pairing revoked                               | reason · IDN, audit                                      |
| EVT-PWA-027 | `pwa.extension.job_saved`         | Job saved from extension                      | source domain class · JOB (planned), ANL                 |
| EVT-PWA-028 | `pwa.extension.scan_completed`    | Scan finished (counts only, opt-in telemetry) | adapterId, success · ANL, FR-PWA-038                     |
| EVT-PWA-029 | `pwa.extension.autofill_used`     | Autofill executed                             | adapterId, fieldCount · ANL                              |
| EVT-PWA-030 | `pwa.wrapper.trigger_fired`       | Trigger threshold crossed                     | trigger, snapshotRef · ADM, product owner                |
| EVT-PWA-031 | `pwa.version.unsupported_blocked` | API returned 426                              | clientVersion · ANL, ADM health                          |

## REP

Source: [02_MODULES/REP_Gamification_Reputation.md](../02_MODULES/REP_Gamification_Reputation.md)

| ID          | Event name                     | Trigger                     | Consumers                             |
| ----------- | ------------------------------ | --------------------------- | ------------------------------------- |
| EVT-REP-001 | rep.xp.awarded                 | ledger award posted         | subject ref, amount, rule, reference  |
| EVT-REP-002 | rep.xp.reversed                | reversal posted             | subject ref, original id, reason code |
| EVT-REP-003 | rep.xp.capped                  | cap note written            | subject ref, amount capped            |
| EVT-REP-004 | rep.level.changed              | level up or down            | subject ref, from, to                 |
| EVT-REP-005 | rep.badge.awarded              | badge issued                | subject ref, definition, version      |
| EVT-REP-006 | rep.badge.revoked              | badge revoked               | subject ref, definition, reason code  |
| EVT-REP-007 | rep.badge.expiring             | 30 days before expiry       | subject ref, definition               |
| EVT-REP-008 | rep.streak.updated             | streak state change         | subject ref, state, count             |
| EVT-REP-009 | rep.goal.completed             | goal complete               | subject ref, goal type                |
| EVT-REP-010 | rep.leaderboard.snapshot       | snapshot finalized          | board id, period                      |
| EVT-REP-011 | rep.season.closed              | season finalized            | season id                             |
| EVT-REP-012 | rep.reputation.updated         | score label change          | subject ref, context, domain, label   |
| EVT-REP-013 | rep.reputation.signal_removed  | signal removed or contested | subject ref, signal id                |
| EVT-REP-014 | rep.recognition.given          | recognition created         | giver ref, recipient ref, type        |
| EVT-REP-015 | rep.integrity.case_opened      | case opened                 | case id, family                       |
| EVT-REP-016 | rep.integrity.sanction_applied | sanction executed           | case id, effect                       |
| EVT-REP-017 | rep.preference.changed         | intensity or opt-out change | subject ref, intensity                |
| EVT-REP-018 | rep.config.activated           | new config version active   | area, version                         |
| EVT-REP-019 | rep.sharecard.created          | share card generated        | subject ref, kind                     |

## SET

Source: [02_MODULES/SET_Settings_Privacy_Consent.md](../02_MODULES/SET_Settings_Privacy_Consent.md)

| ID          | Event name                     | Trigger                        | Consumers                           |
| ----------- | ------------------------------ | ------------------------------ | ----------------------------------- |
| EVT-SET-001 | set.consent.changed            | ledger append                  | subject ref, scope, grantee, action |
| EVT-SET-002 | set.consent.expired            | expiry sweep                   | subject ref, scope, grantee         |
| EVT-SET-003 | set.visibility.changed         | visibility save                | subject ref, changed fields         |
| EVT-SET-004 | set.setting.changed            | any setting write              | subject ref, key                    |
| EVT-SET-005 | set.blocklist.changed          | add or remove                  | subject ref, org id                 |
| EVT-SET-006 | set.search.restriction_changed | FR-SET-011                     | subject ref, value                  |
| EVT-SET-007 | set.dsr.requested              | request created                | request id, type                    |
| EVT-SET-008 | set.export.ready               | archive built                  | request id                          |
| EVT-SET-009 | set.dsr.erasure_started        | cooling-off elapsed            | request id                          |
| EVT-SET-010 | set.dsr.erasure_released       | sweep clean                    | request id, subject ref             |
| EVT-SET-011 | set.dsr.completed              | any request completed          | request id, outcome                 |
| EVT-SET-012 | set.dsr.failed                 | contributor failure            | request id, module                  |
| EVT-SET-013 | set.legalhold.placed / lifted  | hold change                    | hold id                             |
| EVT-SET-014 | set.policy.published           | policy version published       | policy, version, material           |
| EVT-SET-015 | set.policy.accepted            | acceptance                     | subject ref, policy, version        |
| EVT-SET-016 | set.app.connected / revoked    | app grant change               | subject ref, app                    |
| EVT-SET-017 | set.token.created / revoked    | token change                   | subject ref, token id               |
| EVT-SET-018 | set.retention.disposed         | purge run                      | class, counts                       |
| EVT-SET-019 | set.rules.changed              | compliance rule version active | region, version                     |
| EVT-SET-020 | set.lock.applied               | managed lock change            | org, key                            |

## SRC

Source: [02_MODULES/SRC_Search_Discovery.md](../02_MODULES/SRC_Search_Discovery.md)

| ID          | Event name                              | Trigger                           | Consumers                                                 |
| ----------- | --------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| EVT-SRC-001 | `src.search.executed`                   | Search query completed (redacted) | entity, filterKeys, resultCount, latency · ANL            |
| EVT-SRC-002 | `src.search.zero_results`               | Zero results                      | entity, filterKeys · ANL, taxonomy review                 |
| EVT-SRC-003 | `src.result.clicked`                    | Result opened                     | entity, position · ANL, ranking evaluation                |
| EVT-SRC-004 | `src.savedsearch.created`               | Saved                             | savedSearchId, kind · ANL                                 |
| EVT-SRC-005 | `src.savedsearch.deleted`               | Deleted                           | savedSearchId · ANL                                       |
| EVT-SRC-006 | `src.alert.due`                         | Alert evaluation produced items   | subscriptionId, itemIds · NTF                             |
| EVT-SRC-007 | `src.alert.unsubscribed`                | One-click unsubscribe             | subscriptionId · NTF                                      |
| EVT-SRC-008 | `src.talent.searched`                   | Talent search executed            | orgId, recruiterId, resultCount · EMP audit, BIL metering |
| EVT-SRC-009 | `src.talent.profile_viewed_from_search` | Candidate opened from search      | candidateRef (hashed), orgId · PRF views, ANL             |
| EVT-SRC-010 | `src.talent.fairness_alert`             | Threshold breached                | scope, metric · ADM, EAD                                  |
| EVT-SRC-011 | `src.skill.created`                     | Skill activated                   | skillId · PRF, EVD, JOB, LRN                              |
| EVT-SRC-012 | `src.skill.updated`                     | Alias, class or category change   | skillId, changes · EVD, indexers                          |
| EVT-SRC-013 | `src.skill.deprecated`                  | Deprecated                        | skillId, supersededBy · PRF, EVD, JOB, LRN                |
| EVT-SRC-014 | `src.skill.merged`                      | Merge                             | fromId, toId · PRF, EVD, JOB, LRN, saved searches         |
| EVT-SRC-015 | `src.skill.proposed`                    | User or system proposal           | proposalId · ADM                                          |
| EVT-SRC-016 | `src.synonyms.released`                 | Synonym set released              | version · indexers                                        |
| EVT-SRC-017 | `src.ranking.released`                  | Ranking profile released          | entity, version · docs, ANL                               |
| EVT-SRC-018 | `src.index.lag_exceeded`                | Lag over threshold                | entityType, lag · ADM                                     |
| EVT-SRC-019 | `src.index.swapped`                     | Index version live                | entityType, version · ADM                                 |
| EVT-SRC-020 | `src.abuse.detected`                    | Abuse signal action               | actorKey, type, action · ADM, EMP (for orgs)              |
| EVT-SRC-021 | `src.mode.changed`                      | Live/degraded/down                | mode · ADM, status page                                   |
| EVT-SRC-022 | `src.leak_canary.failed`                | Leakage test failure              | entityType · SAD, ADM                                     |

## STU

Source: [02_MODULES/STU_Instructor_Studio_Content_Production.md](../02_MODULES/STU_Instructor_Studio_Content_Production.md)

| ID          | Event name                          | Trigger                      | Consumers                                        |
| ----------- | ----------------------------------- | ---------------------------- | ------------------------------------------------ |
| EVT-STU-001 | `studio.instructor.applied`         | Application submitted        | applicationId · ADM, NTF                         |
| EVT-STU-002 | `studio.instructor.approved`        | Application approved         | accountId · NTF, LRN, ANL                        |
| EVT-STU-003 | `studio.instructor.rejected`        | Application rejected         | accountId, reasonCodes · NTF                     |
| EVT-STU-004 | `studio.instructor.verified`        | Verification level reached   | accountId, level, scope · EVD, LRN               |
| EVT-STU-005 | `studio.instructor.suspended`       | Suspension                   | accountId, reason class · LRN, BIL, TSF          |
| EVT-STU-006 | `studio.course.created`             | Course shell created         | courseId, ownerType · ANL                        |
| EVT-STU-007 | `studio.version.submitted`          | Submit for review            | versionId · ADM review queue                     |
| EVT-STU-008 | `studio.version.approved`           | Reviewer approves            | versionId · NTF                                  |
| EVT-STU-009 | `studio.version.changes_requested`  | Reviewer requests changes    | versionId, items · NTF                           |
| EVT-STU-010 | `studio.course.published`           | Version goes live            | courseId, versionId, snapshotRef · LRN, SRC, ANL |
| EVT-STU-011 | `studio.course.patched`             | Patch published              | courseId, versionId, patchId · LRN               |
| EVT-STU-012 | `studio.course.unpublished`         | Owner unpublishes            | courseId · LRN, SRC                              |
| EVT-STU-013 | `studio.course.archived`            | Owner archives               | courseId · LRN, SRC                              |
| EVT-STU-014 | `studio.course.taken_down`          | Moderation or legal takedown | courseId, scope, reasonClass · LRN, SRC, BIL     |
| EVT-STU-015 | `studio.media.uploaded`             | Upload complete              | assetId · pipeline                               |
| EVT-STU-016 | `studio.media.ready`                | Asset ready                  | assetId, durationMs · lessons, NTF               |
| EVT-STU-017 | `studio.media.failed`               | Processing failed            | assetId, reasonClass · NTF, ADM                  |
| EVT-STU-018 | `studio.captions.published`         | Track reviewed or uploaded   | assetId, language · LRN                          |
| EVT-STU-019 | `studio.coupon.created`             | Coupon created               | couponId · BIL                                   |
| EVT-STU-020 | `studio.coupon.revoked`             | Coupon revoked               | couponId · BIL                                   |
| EVT-STU-021 | `studio.price.changed`              | Price set or scheduled       | courseId, effectiveFrom · BIL, LRN               |
| EVT-STU-022 | `studio.team.changed`               | Members, roles, splits       | courseId · BIL, LRN                              |
| EVT-STU-023 | `studio.signoff.granted`            | Instructor sign-off          | enrollmentId, signerId · LRN                     |
| EVT-STU-024 | `studio.announcement.posted`        | Announcement sent            | courseId, announcementId · LRN, NTF              |
| EVT-STU-025 | `studio.grading.released`           | Grades released              | submissionRef · LRN, NTF                         |
| EVT-STU-026 | `studio.moderation.action_taken`    | Moderator action             | targetRef, action · TSF, LRN                     |
| EVT-STU-027 | `studio.copyright.content_disabled` | Notice accepted              | targetRefs · LRN                                 |
| EVT-STU-028 | `studio.copyright.content_restored` | Counter-notice window ends   | targetRefs · LRN                                 |
| EVT-STU-029 | `studio.live.scheduled`             | Session scheduled            | sessionId · LRN, NTF                             |
| EVT-STU-030 | `studio.live.cancelled`             | Session cancelled            | sessionId · LRN, NTF                             |
| EVT-STU-031 | `studio.quality.checked`            | Checks run on submit         | versionId, blockingCount · ANL                   |

## TSF

Source: [02_MODULES/TSF_Trust_Safety_Moderation.md](../02_MODULES/TSF_Trust_Safety_Moderation.md)

| ID          | Event name                           | Trigger              | Consumers                                                      |
| ----------- | ------------------------------------ | -------------------- | -------------------------------------------------------------- |
| EVT-TSF-001 | tsf.report.submitted                 | FR-TSF-001           | report id, object ref, reason, priority · NET, MSG, ANL        |
| EVT-TSF-002 | tsf.report.triaged                   | FR-TSF-008           | report id, queue · ANL                                         |
| EVT-TSF-003 | tsf.report.resolved                  | FR-TSF-003           | report id, outcome class · NTF, ANL                            |
| EVT-TSF-004 | tsf.case.created                     | FR-TSF-008           | case id · ANL                                                  |
| EVT-TSF-005 | tsf.case.assigned                    | FR-TSF-008           | case id, queue · ANL                                           |
| EVT-TSF-006 | tsf.case.second_review_requested     | FR-TSF-010           | case id · ANL                                                  |
| EVT-TSF-007 | tsf.decision.made                    | FR-TSF-009           | decision id, policy, outcome · ANL, AIC (evaluation)           |
| EVT-TSF-008 | tsf.statement_of_reasons.issued      | FR-TSF-021           | statement id, recipient · NTF, ANL                             |
| EVT-TSF-009 | tsf.detection.signal_raised          | FR-TSF-013           | signal id, object ref, type, score · NET, MSG, JOB             |
| EVT-TSF-010 | tsf.content.actioned                 | FR-TSF-019           | object ref, action, decision id · NET, MSG, JOB, EVD, LRN, SRC |
| EVT-TSF-011 | tsf.content.restored                 | FR-TSF-019           | object ref · NET, MSG, JOB, SRC                                |
| EVT-TSF-012 | tsf.sanction.proposed                | FR-TSF-020, 018, 023 | sanction id · ANL                                              |
| EVT-TSF-013 | tsf.sanction.applied                 | FR-TSF-020           | account, restrictions · IDN, NET, MSG, JOB, AIC, ATS           |
| EVT-TSF-014 | tsf.sanction.lifted                  | FR-TSF-020           | account, restrictions · IDN, NET, MSG, JOB, AIC                |
| EVT-TSF-015 | tsf.appeal.submitted                 | FR-TSF-022           | appeal id · ANL                                                |
| EVT-TSF-016 | tsf.appeal.decided                   | FR-TSF-022           | appeal id, outcome · NTF, ANL                                  |
| EVT-TSF-017 | tsf.evidence.preserved               | FR-TSF-027           | hold id, scope · MSG, NET, SET                                 |
| EVT-TSF-018 | tsf.evidence.released                | FR-TSF-027           | hold id · MSG, NET, SET                                        |
| EVT-TSF-019 | tsf.legal_request.received           | FR-TSF-028           | request id (no content) · SAD                                  |
| EVT-TSF-020 | tsf.legal_request.fulfilled          | FR-TSF-028           | request id · SAD                                               |
| EVT-TSF-021 | tsf.fraud.case_opened                | FR-TSF-016, 017      | risk case id · EMP, BIL                                        |
| EVT-TSF-022 | tsf.fraud.employer_restricted        | FR-TSF-016           | org id, state · EMP, JOB, MSG                                  |
| EVT-TSF-023 | tsf.fraud.job_removed                | FR-TSF-016           | job id · JOB, NTF                                              |
| EVT-TSF-024 | tsf.minor_safety.escalated           | FR-TSF-024           | case id · SAD                                                  |
| EVT-TSF-025 | tsf.imminent_harm.escalated          | FR-TSF-025           | case id · SAD                                                  |
| EVT-TSF-026 | tsf.transparency_report.published    | FR-TSF-029           | period · ANL                                                   |
| EVT-TSF-027 | tsf.trusted_flagger.status_changed   | FR-TSF-004           | flagger id, status · ANL                                       |
| EVT-TSF-028 | tsf.qa.review_completed              | FR-TSF-032           | review id · AIC, ANL                                           |
| EVT-TSF-029 | tsf.moderator.exposure_limit_reached | FR-TSF-031           | moderator id (to assignment only) · TSF                        |
| EVT-TSF-030 | tsf.policy.version_published         | FR-TSF-006, 007      | policy id, version · NTF, all modules                          |
| EVT-TSF-031 | tsf.reporter.warned                  | FR-TSF-005           | reporter id · NTF                                              |
| EVT-TSF-032 | tsf.scam_warning.shown               | FR-TSF-015, 026      | target ref, pattern id · MSG, JOB                              |
