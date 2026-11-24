<!-- Generated from PRODUCT_BLUEPRINT sources by grep-based extraction. Do not edit by hand; edit the source specs and regenerate. -->

# State Machine Register

State machines declared per module. Transitions and guards are in the owning module file section 6.

**Total: 224.**

## ADM

Source: [02_MODULES/ADM_Admin_Console_Support_Operations.md](../02_MODULES/ADM_Admin_Console_Support_Operations.md)

| ID        | Name                                                     |
| --------- | -------------------------------------------------------- |
| SM-ADM-01 | Support ticket                                           |
| SM-ADM-02 | Privileged grant (including break-glass)                 |
| SM-ADM-03 | Approval request (two-person)                            |
| SM-ADM-04 | Impersonation (view-as) session                          |
| SM-ADM-05 | Incident                                                 |
| SM-ADM-06 | Announcement and maintenance window                      |
| SM-ADM-07 | Content version (CMS page, legal document, help article) |
| SM-ADM-08 | Data request case (staff handling)                       |
| SM-ADM-09 | Feature flag lifecycle                                   |
| SM-ADM-10 | Administrative account state                             |

## AIC

Source: [02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md](../02_MODULES/AIC_AI_Career_Assistant_Matching_Recommendations.md)

| ID        | Name                              |
| --------- | --------------------------------- |
| SM-AIC-01 | AI request                        |
| SM-AIC-02 | Recommendation                    |
| SM-AIC-03 | Model version                     |
| SM-AIC-04 | Assistant session                 |
| SM-AIC-05 | AI suggestion (apply with review) |
| SM-AIC-06 | AI incident                       |

## ANL

Source: [02_MODULES/ANL_Analytics_Reporting_Insights.md](../02_MODULES/ANL_Analytics_Reporting_Insights.md)

| ID        | Name                |
| --------- | ------------------- |
| SM-ANL-01 | Metric definition   |
| SM-ANL-02 | Dashboard           |
| SM-ANL-03 | Scheduled report    |
| SM-ANL-04 | Export job          |
| SM-ANL-05 | Experiment          |
| SM-ANL-06 | Data access request |
| SM-ANL-07 | Alert               |

## ASM

Source: [02_MODULES/ASM_Assessments_Challenges_Integrity.md](../02_MODULES/ASM_Assessments_Challenges_Integrity.md)

| ID        | Name                 |
| --------- | -------------------- |
| SM-ASM-01 | Attempt              |
| SM-ASM-02 | Assessment version   |
| SM-ASM-03 | Question item        |
| SM-ASM-04 | Judge job            |
| SM-ASM-05 | Integrity case       |
| SM-ASM-06 | Appeal               |
| SM-ASM-07 | Certification record |
| SM-ASM-08 | Exam registration    |
| SM-ASM-09 | Contest              |
| SM-ASM-10 | Employer assignment  |
| SM-ASM-11 | Manual grading task  |
| SM-ASM-12 | Accommodation grant  |

## ATS

Source: [02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md](../02_MODULES/ATS_Recruiter_Workspace_Hiring_Pipeline.md)

| ID        | Name                     |
| --------- | ------------------------ |
| SM-ATS-01 | Requisition              |
| SM-ATS-02 | Job posting              |
| SM-ATS-03 | Offer                    |
| SM-ATS-04 | Scorecard                |
| SM-ATS-05 | Talent pool membership   |
| SM-ATS-06 | Candidate rights request |
| SM-ATS-07 | Approval request         |

## BGV

Source: [02_MODULES/BGV_Verification_Background_Checks.md](../02_MODULES/BGV_Verification_Background_Checks.md)

| ID        | Name                            |
| --------- | ------------------------------- |
| SM-BGV-01 | Check request                   |
| SM-BGV-02 | Check item                      |
| SM-BGV-03 | Adjudication and adverse action |
| SM-BGV-04 | Identity verification session   |
| SM-BGV-05 | Candidate dispute               |
| SM-BGV-06 | Reference check (per referee)   |

## BIL

Source: [02_MODULES/BIL_Billing_Plans_Entitlements.md](../02_MODULES/BIL_Billing_Plans_Entitlements.md)

| ID        | Name                          |
| --------- | ----------------------------- |
| SM-BIL-01 | Subscription                  |
| SM-BIL-02 | Invoice                       |
| SM-BIL-03 | Dunning case                  |
| SM-BIL-04 | Refund                        |
| SM-BIL-05 | Coupon                        |
| SM-BIL-06 | Seat pool                     |
| SM-BIL-07 | Purchase request              |
| SM-BIL-08 | Enterprise quote and contract |
| SM-BIL-09 | Webhook event                 |
| SM-BIL-10 | Payout                        |
| SM-BIL-11 | Dispute (chargeback)          |
| SM-BIL-12 | Reconciliation run            |

## EMP

Source: [02_MODULES/EMP_Employer_Organisation_Teams_Brand.md](../02_MODULES/EMP_Employer_Organisation_Teams_Brand.md)

| ID        | Name                       |
| --------- | -------------------------- |
| SM-EMP-01 | Organisation               |
| SM-EMP-02 | Membership and invitation  |
| SM-EMP-03 | Agency-client relationship |
| SM-EMP-04 | Employer review            |
| SM-EMP-05 | Webhook endpoint           |
| SM-EMP-06 | Data processing agreement  |
| SM-EMP-07 | Company claim              |
| SM-EMP-08 | Sanction and appeal        |

## ENT

Source: [02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md](../02_MODULES/ENT_Enterprise_Talent_Internal_Mobility.md)

| ID        | Name                              |
| --------- | --------------------------------- |
| SM-ENT-01 | Enterprise workspace              |
| SM-ENT-02 | Enterprise member (employee link) |
| SM-ENT-03 | Internal posting                  |
| SM-ENT-04 | Internal application              |
| SM-ENT-05 | Learning assignment               |
| SM-ENT-06 | Talent review cycle               |
| SM-ENT-07 | Skill inventory entry             |
| SM-ENT-08 | Learning request                  |

## EVD

Source: [02_MODULES/EVD_Evidence_Work_History_Credentials.md](../02_MODULES/EVD_Evidence_Work_History_Credentials.md)

| ID        | Name                              |
| --------- | --------------------------------- |
| SM-EVD-01 | Evidence rung (per claim)         |
| SM-EVD-02 | Work history verification request |
| SM-EVD-03 | Credential lifecycle              |
| SM-EVD-04 | Dispute                           |
| SM-EVD-05 | Evidence share link               |
| SM-EVD-06 | Endorsement                       |

## EVT

Source: [02_MODULES/EVT_Events_Hackathons_Community_Programmes.md](../02_MODULES/EVT_Events_Hackathons_Community_Programmes.md)

| ID        | Name                 |
| --------- | -------------------- |
| SM-EVT-01 | Event lifecycle      |
| SM-EVT-02 | Registration         |
| SM-EVT-03 | Hackathon            |
| SM-EVT-04 | Hackathon team       |
| SM-EVT-05 | Hackathon submission |
| SM-EVT-06 | Career-fair booth    |

## GIG

Source: [02_MODULES/GIG_Freelance_Contract_Project_Work.md](../02_MODULES/GIG_Freelance_Contract_Project_Work.md)

| ID        | Name               |
| --------- | ------------------ |
| SM-GIG-01 | Freelancer mode    |
| SM-GIG-02 | Project listing    |
| SM-GIG-03 | Proposal           |
| SM-GIG-04 | Contract           |
| SM-GIG-05 | Milestone          |
| SM-GIG-06 | Change request     |
| SM-GIG-07 | Dispute            |
| SM-GIG-08 | Time entry (gated) |

## IDN

Source: [02_MODULES/IDN_Identity_Authentication_Account.md](../02_MODULES/IDN_Identity_Authentication_Account.md)

| ID        | Name                    |
| --------- | ----------------------- |
| SM-IDN-01 | Account                 |
| SM-IDN-02 | Session family          |
| SM-IDN-03 | Recovery request        |
| SM-IDN-04 | Organization invitation |
| SM-IDN-05 | Impersonation grant     |

## INS

Source: [02_MODULES/INS_Institutions_Managed_Learning.md](../02_MODULES/INS_Institutions_Managed_Learning.md)

| ID        | Name                         |
| --------- | ---------------------------- |
| SM-INS-01 | Institution tenant lifecycle |
| SM-INS-02 | Import batch                 |
| SM-INS-03 | Student membership           |
| SM-INS-04 | Seat assignment              |
| SM-INS-05 | Placement drive              |
| SM-INS-06 | Drive application            |
| SM-INS-07 | Intervention case            |
| SM-INS-08 | Guardian consent             |
| SM-INS-09 | Graduation transition        |
| SM-INS-10 | Placement outcome            |

## INT

Source: [02_MODULES/INT_Interviews_Scheduling.md](../02_MODULES/INT_Interviews_Scheduling.md)

| ID        | Name                       |
| --------- | -------------------------- |
| SM-INT-01 | Interview                  |
| SM-INT-02 | Scheduling invitation      |
| SM-INT-03 | Room session               |
| SM-INT-04 | Recording artifact         |
| SM-INT-05 | Async interview invitation |
| SM-INT-06 | Feedback request           |
| SM-INT-07 | Accommodation request      |
| SM-INT-08 | Calendar connection        |

## JOB

Source: [02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md](../02_MODULES/JOB_Job_Marketplace_Candidate_Applications.md)

| ID        | Name                                      |
| --------- | ----------------------------------------- |
| SM-JOB-01 | Application (candidate-visible lifecycle) |
| SM-JOB-02 | Application draft                         |
| SM-JOB-03 | Job report                                |
| SM-JOB-04 | Saved search alert subscription           |
| SM-JOB-05 | Imported listing                          |

## LRN

Source: [02_MODULES/LRN_Learning_Course_Experience.md](../02_MODULES/LRN_Learning_Course_Experience.md)

| ID        | Name                    |
| --------- | ----------------------- |
| SM-LRN-01 | Enrollment              |
| SM-LRN-02 | Lesson progress         |
| SM-LRN-03 | Certificate             |
| SM-LRN-04 | Assignment submission   |
| SM-LRN-05 | Review                  |
| SM-LRN-06 | Path enrollment         |
| SM-LRN-07 | Offline license         |
| SM-LRN-08 | Live session attendance |
| SM-LRN-09 | Q&A thread              |
| SM-LRN-10 | Playback session        |

## MEN

Source: [02_MODULES/MEN_Mentorship_Coaching_Career_Services.md](../02_MODULES/MEN_Mentorship_Coaching_Career_Services.md)

| ID        | Name                                                   |
| --------- | ------------------------------------------------------ |
| SM-MEN-01 | Mentor application and listing                         |
| SM-MEN-02 | Mentorship request                                     |
| SM-MEN-03 | Session                                                |
| SM-MEN-04 | Mentorship relationship                                |
| SM-MEN-05 | Program                                                |
| SM-MEN-06 | Program pairing                                        |
| SM-MEN-07 | Service order (resume review, mock interview, package) |
| SM-MEN-08 | Safeguarding report                                    |

## MKT

Source: [02_MODULES/MKT_Market_Intelligence_Career_Pathing.md](../02_MODULES/MKT_Market_Intelligence_Career_Pathing.md)

| ID        | Name                                 |
| --------- | ------------------------------------ |
| SM-MKT-01 | Skill lifecycle                      |
| SM-MKT-02 | Taxonomy version                     |
| SM-MKT-03 | Salary report                        |
| SM-MKT-04 | Emerging skill candidate             |
| SM-MKT-05 | Dataset snapshot (published insight) |
| SM-MKT-06 | Dispute                              |
| SM-MKT-07 | Career transition record             |

## MSG

Source: [02_MODULES/MSG_Messaging_Realtime_Communication.md](../02_MODULES/MSG_Messaging_Realtime_Communication.md)

| ID        | Name                           |
| --------- | ------------------------------ |
| SM-MSG-01 | Message                        |
| SM-MSG-02 | Conversation (per participant) |
| SM-MSG-03 | Message request                |
| SM-MSG-04 | Recruiter outreach             |
| SM-MSG-05 | Group membership               |
| SM-MSG-06 | Realtime connection (client)   |

## NET

Source: [02_MODULES/NET_Networking_Community_Referrals.md](../02_MODULES/NET_Networking_Community_Referrals.md)

| ID        | Name                   |
| --------- | ---------------------- |
| SM-NET-01 | Connection request     |
| SM-NET-02 | Connection             |
| SM-NET-03 | Post                   |
| SM-NET-04 | Group membership       |
| SM-NET-05 | Referral request       |
| SM-NET-06 | Written recommendation |
| SM-NET-07 | Introduction request   |
| SM-NET-08 | Group                  |

## NTF

Source: [02_MODULES/NTF_Notifications_Communication.md](../02_MODULES/NTF_Notifications_Communication.md)

| ID        | Name                                         |
| --------- | -------------------------------------------- |
| SM-NTF-01 | Delivery (one notification on one channel)   |
| SM-NTF-02 | Template version                             |
| SM-NTF-03 | Admin broadcast                              |
| SM-NTF-04 | Channel endpoint (push device or SMS number) |

## PLT

Source: [02_MODULES/PLT_Platform_API_Integrations_Media_Files.md](../02_MODULES/PLT_Platform_API_Integrations_Media_Files.md)

| ID        | Name                                |
| --------- | ----------------------------------- |
| SM-PLT-01 | Webhook delivery                    |
| SM-PLT-02 | Webhook endpoint                    |
| SM-PLT-03 | Integration connection              |
| SM-PLT-04 | Stored file                         |
| SM-PLT-05 | Media asset processing              |
| SM-PLT-06 | Background job                      |
| SM-PLT-07 | API credential (key, client secret) |
| SM-PLT-08 | Import run                          |
| SM-PLT-09 | Developer application               |
| SM-PLT-10 | Export run                          |
| SM-PLT-11 | API version                         |

## PRF

Source: [02_MODULES/PRF_Profile_Resume_Portfolio.md](../02_MODULES/PRF_Profile_Resume_Portfolio.md)

| ID        | Name                                                       |
| --------- | ---------------------------------------------------------- |
| SM-PRF-01 | Profile publication                                        |
| SM-PRF-02 | Resume share link                                          |
| SM-PRF-03 | Document job (resume parse, resume export, profile import) |
| SM-PRF-04 | Recommendation                                             |
| SM-PRF-05 | Open-to-work signal                                        |

## PWA

Source: [02_MODULES/PWA_PWA_Offline_Mobile_Extension.md](../02_MODULES/PWA_PWA_Offline_Mobile_Extension.md)

| ID        | Name                                          |
| --------- | --------------------------------------------- |
| SM-PWA-01 | Service worker and update lifecycle           |
| SM-PWA-02 | Install state (per device and account)        |
| SM-PWA-03 | Draft and outbox item                         |
| SM-PWA-04 | Push permission and subscription (per device) |
| SM-PWA-05 | Connectivity                                  |
| SM-PWA-06 | Extension pairing                             |
| SM-PWA-07 | Native wrapper decision                       |

## REP

Source: [02_MODULES/REP_Gamification_Reputation.md](../02_MODULES/REP_Gamification_Reputation.md)

| ID        | Name                               |
| --------- | ---------------------------------- |
| SM-REP-01 | XP event evaluation                |
| SM-REP-02 | Badge award                        |
| SM-REP-03 | Streak                             |
| SM-REP-04 | Integrity case                     |
| SM-REP-05 | Season                             |
| SM-REP-06 | Gamification configuration version |

## SET

Source: [02_MODULES/SET_Settings_Privacy_Consent.md](../02_MODULES/SET_Settings_Privacy_Consent.md)

| ID        | Name                                                                                |
| --------- | ----------------------------------------------------------------------------------- |
| SM-SET-01 | Data request (export, erasure, rectification, restriction, objection, human review) |
| SM-SET-02 | Consent grant (per scope and grantee)                                               |
| SM-SET-03 | Export archive                                                                      |
| SM-SET-04 | Legal hold                                                                          |
| SM-SET-05 | API token and app grant                                                             |

## SRC

Source: [02_MODULES/SRC_Search_Discovery.md](../02_MODULES/SRC_Search_Discovery.md)

| ID        | Name                       |
| --------- | -------------------------- |
| SM-SRC-01 | Saved search               |
| SM-SRC-02 | Index version              |
| SM-SRC-03 | Taxonomy skill             |
| SM-SRC-04 | Ranking or synonym release |
| SM-SRC-05 | Index document             |

## STU

Source: [02_MODULES/STU_Instructor_Studio_Content_Production.md](../02_MODULES/STU_Instructor_Studio_Content_Production.md)

| ID        | Name                     |
| --------- | ------------------------ |
| SM-STU-01 | Course                   |
| SM-STU-02 | Course version           |
| SM-STU-03 | Instructor application   |
| SM-STU-04 | Media asset              |
| SM-STU-05 | Publish review case      |
| SM-STU-06 | Payout                   |
| SM-STU-07 | Coupon                   |
| SM-STU-08 | Copyright case           |
| SM-STU-09 | Grading task             |
| SM-STU-10 | Co-instructor invitation |

## TSF

Source: [02_MODULES/TSF_Trust_Safety_Moderation.md](../02_MODULES/TSF_Trust_Safety_Moderation.md)

| ID        | Name                                                     |
| --------- | -------------------------------------------------------- |
| SM-TSF-01 | Report                                                   |
| SM-TSF-02 | Moderation case                                          |
| SM-TSF-03 | Appeal                                                   |
| SM-TSF-04 | Sanction                                                 |
| SM-TSF-05 | Content moderation status                                |
| SM-TSF-06 | Legal request                                            |
| SM-TSF-07 | Fraud investigation (employer, job, credential, network) |
| SM-TSF-08 | Evidence hold                                            |
