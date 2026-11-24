<!-- Generated from 01_PRODUCT/05_USER_JOURNEYS.md headings. Do not edit by hand; edit the source and regenerate. -->

# Journey Register

End-to-end user journeys. Each journey is specified in [`../01_PRODUCT/05_USER_JOURNEYS.md`](../01_PRODUCT/05_USER_JOURNEYS.md) with starting conditions, steps, system responses, alternatives, failures and completion conditions.

**Total: 78.**

| ID         | Journey                                                                | Actor group                                                 |
| ---------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| JRN-GUE-01 | Find a public job and sign up to apply                                 | Guest journeys                                              |
| JRN-GUE-02 | Verify a credential from a shared link                                 | Guest journeys                                              |
| JRN-GUE-03 | Referee confirms a work-history claim from a single-use link           | Guest journeys                                              |
| JRN-GUE-04 | Preview a course and register to enroll                                | Guest journeys                                              |
| JRN-CAN-01 | Register, confirm email and reach first value                          | Candidate journeys                                          |
| JRN-CAN-02 | Import a résumé and build a profile with field visibility              | Candidate journeys                                          |
| JRN-CAN-03 | Add a work-history claim and request referee verification              | Candidate journeys                                          |
| JRN-CAN-04 | Set a career goal, see the gap and accept a learning plan              | Candidate journeys                                          |
| JRN-CAN-05 | Enroll, learn, complete a course and receive completion evidence       | Candidate journeys                                          |
| JRN-CAN-06 | Take a timed assessment under AI-prohibited mode and earn a credential | Candidate journeys                                          |
| JRN-CAN-07 | Search jobs, read the match explanation and apply                      | Candidate journeys                                          |
| JRN-CAN-08 | Track an application, self-schedule an interview and attend            | Candidate journeys                                          |
| JRN-CAN-09 | Receive an offer, accept it, and the outcome becomes new evidence      | Candidate journeys                                          |
| JRN-CAN-10 | Respond to a recruiter first-contact request                           | Candidate journeys                                          |
| JRN-CAN-11 | Review consents and revoke an employer share                           | Candidate journeys                                          |
| JRN-CAN-12 | Export data, then delete the account                                   | Candidate journeys                                          |
| JRN-CAN-13 | Recover access after losing password and passkey                       | Candidate journeys                                          |
| JRN-CAN-14 | Dispute a verification outcome                                         | Candidate journeys                                          |
| JRN-CAN-15 | Ask a connection for a referral                                        | Candidate journeys                                          |
| JRN-CAN-16 | Upgrade to a paid plan, hit a quota and cancel                         | Candidate journeys                                          |
| JRN-CAN-17 | Tailor a résumé variant for a job with the AI assistant                | Candidate journeys                                          |
| JRN-CAN-18 | Benchmark salary before negotiating                                    | Candidate journeys                                          |
| JRN-CAN-19 | Use the app offline and sync drafts                                    | Candidate journeys                                          |
| JRN-CAN-20 | Consent to and review a background check                               | Candidate journeys                                          |
| JRN-CAN-21 | Appeal a moderation takedown                                           | Candidate journeys                                          |
| JRN-CAN-22 | Register for a hackathon, form a team, submit and receive results      | Candidate journeys                                          |
| JRN-STD-01 | Claim an institution-provisioned account                               | Student journeys                                            |
| JRN-STD-02 | Complete an assigned course with a peer-reviewed assignment            | Student journeys                                            |
| JRN-STD-03 | Apply through a campus placement drive                                 | Student journeys                                            |
| JRN-STD-04 | Graduate and move to an independent career identity                    | Student journeys                                            |
| JRN-INS-01 | Apply to teach and get approved                                        | Instructor journeys                                         |
| JRN-INS-02 | Author, submit and publish a course                                    | Instructor journeys                                         |
| JRN-INS-03 | Grade submissions and attest learner skills                            | Instructor journeys                                         |
| JRN-INS-04 | Run a faculty batch and intervene with at-risk learners                | Instructor journeys                                         |
| JRN-MNT-01 | Become a mentor and publish availability                               | Mentor journeys (gated `OD-PRD-02`)                         |
| JRN-MNT-02 | Run a booked session with notes and follow-up                          | Mentor journeys (gated `OD-PRD-02`)                         |
| JRN-MNT-03 | Handle a mentee no-show and refund                                     | Mentor journeys (gated `OD-PRD-02`)                         |
| JRN-FRL-01 | Turn on gig mode and publish a service offering                        | Freelancer journeys (gated `OD-PRD-02`, `OD-PRD-03`)        |
| JRN-FRL-02 | Win a project, deliver milestones and get paid                         | Freelancer journeys (gated `OD-PRD-02`, `OD-PRD-03`)        |
| JRN-FRL-03 | Dispute an unpaid milestone                                            | Freelancer journeys (gated `OD-PRD-02`, `OD-PRD-03`)        |
| JRN-REC-01 | Accept an org invite and set up the workspace                          | Recruiter journeys                                          |
| JRN-REC-02 | Open a requisition, get approval and publish a job                     | Recruiter journeys                                          |
| JRN-REC-03 | Screen applicants with evidence and move or reject                     | Recruiter journeys                                          |
| JRN-REC-04 | Search discoverable candidates and send outreach                       | Recruiter journeys                                          |
| JRN-REC-05 | Schedule a panel interview loop                                        | Recruiter journeys                                          |
| JRN-REC-06 | Prepare an offer through the approval chain                            | Recruiter journeys                                          |
| JRN-REC-07 | Agency recruiter submits a candidate to a client                       | Recruiter journeys                                          |
| JRN-REC-08 | Participate in a campus placement drive                                | Recruiter journeys                                          |
| JRN-HMG-01 | Define role requirements, scorecard and assessment                     | Hiring manager journeys                                     |
| JRN-HMG-02 | Review a candidate packet and submit a blind scorecard                 | Hiring manager journeys                                     |
| JRN-HMG-03 | Run the debrief, decide and record a post-hire outcome                 | Hiring manager journeys                                     |
| JRN-EAD-01 | Create and verify an employer organization                             | Employer admin journeys                                     |
| JRN-EAD-02 | Invite members, assign roles and enforce SSO                           | Employer admin journeys                                     |
| JRN-EAD-03 | Buy seats, survive a failed payment, downgrade                         | Employer admin journeys                                     |
| JRN-EAD-04 | Offboard a member and run an access review                             | Employer admin journeys                                     |
| JRN-EAD-05 | Publish the brand page and respond to reviews                          | Employer admin journeys                                     |
| JRN-IAD-01 | Set up an institution, buy a licence and provision a cohort            | Institution admin journeys                                  |
| JRN-IAD-02 | Read cohort skill coverage without seeing private data                 | Institution admin journeys                                  |
| JRN-IAD-03 | Issue institution credentials and correct one                          | Institution admin journeys                                  |
| JRN-PLO-01 | Organize a placement drive with employers                              | Placement officer journeys                                  |
| JRN-PLO-02 | Produce the placement outcome report                                   | Placement officer journeys                                  |
| JRN-EXA-01 | Launch internal mobility and post an internal role                     | Enterprise talent journeys (gated `OD-PRD-02`, `OD-PRD-20`) |
| JRN-EXA-02 | Assign mandatory learning and track completion                         | Enterprise talent journeys (gated `OD-PRD-02`, `OD-PRD-20`) |
| JRN-EXA-03 | Run a skills inventory and gap report                                  | Enterprise talent journeys (gated `OD-PRD-02`, `OD-PRD-20`) |
| JRN-MOD-01 | Work the report queue and take down content                            | Moderator journeys                                          |
| JRN-MOD-02 | Decide an appeal as a second moderator                                 | Moderator journeys                                          |
| JRN-MOD-03 | Review an assessment integrity flag                                    | Moderator journeys                                          |
| JRN-SUP-01 | Resolve a ticket with time-boxed scoped access                         | Support agent journeys                                      |
| JRN-SUP-02 | Assist an identity-proofed account recovery                            | Support agent journeys                                      |
| JRN-FIN-01 | Process a refund and a chargeback                                      | Finance operator journeys                                   |
| JRN-FIN-02 | Run monthly reconciliation and a payout batch                          | Finance operator journeys                                   |
| JRN-PAD-01 | Roll out a feature flag and use the kill switch                        | Platform admin journeys                                     |
| JRN-PAD-02 | Change the skill taxonomy safely                                       | Platform admin journeys                                     |
| JRN-PAD-03 | Grant a privileged role with two-person approval                       | Platform admin journeys                                     |
| JRN-SAD-01 | Use break-glass access during an incident                              | Security officer journeys                                   |
| JRN-SAD-02 | Respond to a suspected cross-tenant exposure                           | Security officer journeys                                   |
| JRN-API-01 | Partner ATS syncs jobs and applications through the public API         | Integration principal journeys                              |
| JRN-API-02 | Webhook delivery fails, retries and is replayed                        | Integration principal journeys                              |
