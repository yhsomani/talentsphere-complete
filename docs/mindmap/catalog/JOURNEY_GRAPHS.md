# Journey Graphs

Generated from the graph at `eb166ea`. One flowchart per e2e spec: each journey (JOUR-) points to the screens (FEAT-) and endpoint capabilities (MIN-) it exercises, found from its `goto` targets and request paths. Documented target journeys (J-) are in [`journeys/USER_JOURNEYS.md`](../journeys/USER_JOURNEYS.md). Back to the [feature catalog](FEATURE_CATALOG.md).

## tests/e2e/accessibility.spec.ts

7 journeys.

```mermaid
flowchart LR
  JOUR_001["JOUR-001 the skip link is revealed on focus and moves focus to main... - passed"]
  FEAT_155("FEAT-155 Screen /")
  JOUR_001 --> FEAT_155
  JOUR_002["JOUR-002 primary navigation is reachable by keyboard alone - passed"]
  JOUR_002 --> FEAT_155
  JOUR_003["JOUR-003 every interactive control on the login form is operable by... - passed"]
  FEAT_170("FEAT-170 Screen /login")
  JOUR_003 --> FEAT_170
  JOUR_004["JOUR-004 focused controls render a visible focus indicator - passed"]
  JOUR_004 --> FEAT_155
  JOUR_005["JOUR-005 honours the reduced-motion preference - passed"]
  JOUR_005 --> FEAT_155
  JOUR_006["JOUR-006 every vacancy on the jobs page is named and actionable by... - passed"]
  FEAT_166("FEAT-166 Screen /jobs")
  JOUR_006 --> FEAT_166
  JOUR_007["JOUR-007 each pricing option is a labelled region whose action is k... - passed"]
  FEAT_161("FEAT-161 Screen /checkout")
  JOUR_007 --> FEAT_161
```

| Journey  | Title                                                                       | Outcome | Exercises |
| -------- | --------------------------------------------------------------------------- | ------- | --------- |
| JOUR-001 | the skip link is revealed on focus and moves focus to main content          | passed  | FEAT-155  |
| JOUR-002 | primary navigation is reachable by keyboard alone                           | passed  | FEAT-155  |
| JOUR-003 | every interactive control on the login form is operable by keyboard         | passed  | FEAT-170  |
| JOUR-004 | focused controls render a visible focus indicator                           | passed  | FEAT-155  |
| JOUR-005 | honours the reduced-motion preference                                       | passed  | FEAT-155  |
| JOUR-006 | every vacancy on the jobs page is named and actionable by keyboard          | passed  | FEAT-166  |
| JOUR-007 | each pricing option is a labelled region whose action is keyboard reachable | passed  | FEAT-161  |

## tests/e2e/account-deletion.spec.ts

3 journeys.

```mermaid
flowchart LR
  JOUR_008["JOUR-008 confirm stays disabled until DELETE and a password are bot... - passed"]
  FEAT_177("FEAT-177 Screen /profile")
  JOUR_008 --> FEAT_177
  JOUR_009["JOUR-009 a wrong password is shown on the field, keeps the account,... - passed"]
  JOUR_009 --> FEAT_177
  MIN_174("MIN-174 Submit auth/login")
  JOUR_009 --> MIN_174
  JOUR_010["JOUR-010 the right password deletes the account and signs out - passed"]
  JOUR_010 --> FEAT_177
  JOUR_010 --> MIN_174
```

| Journey  | Title                                                                                  | Outcome | Exercises         |
| -------- | -------------------------------------------------------------------------------------- | ------- | ----------------- |
| JOUR-008 | confirm stays disabled until DELETE and a password are both entered                    | passed  | FEAT-177          |
| JOUR-009 | a wrong password is shown on the field, keeps the account, and is gone after reopening | passed  | FEAT-177, MIN-174 |
| JOUR-010 | the right password deletes the account and signs out                                   | passed  | FEAT-177, MIN-174 |

## tests/e2e/account-security.spec.ts

3 journeys.

```mermaid
flowchart LR
  JOUR_011["JOUR-011 changing the password signs out the other device and keeps... - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_011 --> FEAT_162
  FEAT_177("FEAT-177 Screen /profile")
  JOUR_011 --> FEAT_177
  JOUR_011 --> FEAT_162
  MIN_174("MIN-174 Submit auth/login")
  JOUR_011 --> MIN_174
  JOUR_012["JOUR-012 signing out ends the session on the server, not only in th... - passed"]
  JOUR_012 --> FEAT_162
  JOUR_012 --> MIN_174
  MIN_033("MIN-033 Read auth/session")
  JOUR_012 --> MIN_033
  JOUR_013["JOUR-013 signing out of other devices ends the other session and ke... - passed"]
  JOUR_013 --> FEAT_162
  JOUR_013 --> FEAT_177
  JOUR_013 --> MIN_174
```

| Journey  | Title                                                                  | Outcome | Exercises                             |
| -------- | ---------------------------------------------------------------------- | ------- | ------------------------------------- |
| JOUR-011 | changing the password signs out the other device and keeps this one    | passed  | FEAT-162, FEAT-177, FEAT-162, MIN-174 |
| JOUR-012 | signing out ends the session on the server, not only in this browser   | passed  | FEAT-162, MIN-174, MIN-033            |
| JOUR-013 | signing out of other devices ends the other session and keeps this one | passed  | FEAT-162, FEAT-177, MIN-174           |

## tests/e2e/career-readiness.spec.ts

3 journeys.

```mermaid
flowchart LR
  JOUR_015["JOUR-015 a candidate with no skills is sent to add some first - passed"]
  FEAT_160("FEAT-160 Screen /career")
  JOUR_015 --> FEAT_160
  JOUR_016["JOUR-016 picks a role, must state education, and sees a score with... - passed"]
  JOUR_016 --> FEAT_160
  JOUR_017["JOUR-017 a lower education level lowers the education part of the s... - passed"]
  JOUR_017 --> FEAT_160
```

| Journey  | Title                                                                            | Outcome | Exercises |
| -------- | -------------------------------------------------------------------------------- | ------- | --------- |
| JOUR-015 | a candidate with no skills is sent to add some first                             | passed  | FEAT-160  |
| JOUR-016 | picks a role, must state education, and sees a score with the missing milestones | passed  | FEAT-160  |
| JOUR-017 | a lower education level lowers the education part of the score                   | passed  | FEAT-160  |

## tests/e2e/challenges.spec.ts

2 journeys.

```mermaid
flowchart LR
  JOUR_019["JOUR-019 lists real challenges and shows only the public examples i... - passed"]
  FEAT_159("FEAT-159 Screen /assessments")
  JOUR_019 --> FEAT_159
  JOUR_020["JOUR-020 submits a solution, says it was not run or scored, and sto... - passed"]
  JOUR_020 --> FEAT_159
  MIN_053("MIN-053 Read evidence/:id")
  JOUR_020 --> MIN_053
```

| Journey  | Title                                                                          | Outcome | Exercises         |
| -------- | ------------------------------------------------------------------------------ | ------- | ----------------- |
| JOUR-019 | lists real challenges and shows only the public examples in a session          | passed  | FEAT-159          |
| JOUR-020 | submits a solution, says it was not run or scored, and stores it as unverified | passed  | FEAT-159, MIN-053 |

## tests/e2e/checkout-idempotency.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_021["JOUR-021 checkout keys: reused after a network failure, new after a... - passed"]
  FEAT_161("FEAT-161 Screen /checkout")
  JOUR_021 --> FEAT_161
  MIN_180("MIN-180 Submit billing/checkout")
  JOUR_021 --> MIN_180
  MIN_035("MIN-035 Read billing/plans")
  JOUR_021 --> MIN_035
```

| Journey  | Title                                                                                          | Outcome | Exercises                  |
| -------- | ---------------------------------------------------------------------------------------------- | ------- | -------------------------- |
| JOUR-021 | checkout keys: reused after a network failure, new after an answered failure or a cycle change | passed  | FEAT-161, MIN-180, MIN-035 |

## tests/e2e/core-loop.spec.ts

7 journeys.

```mermaid
flowchart LR
  JOUR_022["JOUR-022 a recruiter signs up, sets up a company and publishes a job - passed"]
  JOUR_023["JOUR-023 a candidate signs up and sees a dashboard about them, not... - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_023 --> FEAT_162
  JOUR_024["JOUR-024 the candidate proves a role: work email code, then a refer... - passed"]
  FEAT_163("FEAT-163 Screen /evidence")
  JOUR_024 --> FEAT_163
  JOUR_025["JOUR-025 the referee vouches from the emailed link, which then stop... - passed"]
  JOUR_026["JOUR-026 the candidate finds the job and applies with a note - passed"]
  FEAT_166("FEAT-166 Screen /jobs")
  JOUR_026 --> FEAT_166
  FEAT_158("FEAT-158 Screen /applications")
  JOUR_026 --> FEAT_158
  JOUR_027["JOUR-027 the recruiter sees how the applicant is verified and moves... - passed"]
  FEAT_164("FEAT-164 Screen /hiring")
  JOUR_027 --> FEAT_164
  JOUR_028["JOUR-028 the candidate sees the new status and can withdraw - passed"]
  JOUR_028 --> FEAT_158
```

| Journey  | Title                                                                   | Outcome | Exercises                     |
| -------- | ----------------------------------------------------------------------- | ------- | ----------------------------- |
| JOUR-022 | a recruiter signs up, sets up a company and publishes a job             | passed  | no screen or endpoint matched |
| JOUR-023 | a candidate signs up and sees a dashboard about them, not a demo        | passed  | FEAT-162                      |
| JOUR-024 | the candidate proves a role: work email code, then a reference          | passed  | FEAT-163                      |
| JOUR-025 | the referee vouches from the emailed link, which then stops working     | passed  | no screen or endpoint matched |
| JOUR-026 | the candidate finds the job and applies with a note                     | passed  | FEAT-166, FEAT-158            |
| JOUR-027 | the recruiter sees how the applicant is verified and moves them forward | passed  | FEAT-164                      |
| JOUR-028 | the candidate sees the new status and can withdraw                      | passed  | FEAT-158                      |

## tests/e2e/credentials.spec.ts

5 journeys.

```mermaid
flowchart LR
  JOUR_030["JOUR-030 a new candidate sees an empty credentials section - passed"]
  FEAT_177("FEAT-177 Screen /profile")
  JOUR_030 --> FEAT_177
  JOUR_031["JOUR-031 an earned certificate is listed with a link to its public... - passed"]
  JOUR_031 --> FEAT_177
  FEAT_183("FEAT-183 Screen /verify/:hash")
  JOUR_031 --> FEAT_183
  JOUR_032["JOUR-032 verified skill evidence is listed with a working link unve... - passed"]
  JOUR_032 --> FEAT_177
  MIN_206("MIN-206 Submit evidence")
  JOUR_032 --> MIN_206
  JOUR_033["JOUR-033 a revoked certificate is shown as not valid, with the reason - passed"]
  JOUR_033 --> FEAT_183
  JOUR_034["JOUR-034 a link that matches nothing is a final answer with no retr... - passed"]
  JOUR_034 --> FEAT_183
```

| Journey  | Title                                                                             | Outcome | Exercises          |
| -------- | --------------------------------------------------------------------------------- | ------- | ------------------ |
| JOUR-030 | a new candidate sees an empty credentials section                                 | passed  | FEAT-177           |
| JOUR-031 | an earned certificate is listed with a link to its public verification            | passed  | FEAT-177, FEAT-183 |
| JOUR-032 | verified skill evidence is listed with a working link; unverified evidence is not | passed  | FEAT-177, MIN-206  |
| JOUR-033 | a revoked certificate is shown as not valid, with the reason                      | passed  | FEAT-183           |
| JOUR-034 | a link that matches nothing is a final answer with no retry button                | passed  | FEAT-183           |

## tests/e2e/frontend-fixes.spec.ts

6 journeys.

```mermaid
flowchart LR
  JOUR_035["JOUR-035 FE-07: text inputs have a border that meets 3:1 contrast - passed"]
  FEAT_181("FEAT-181 Screen /signup")
  JOUR_035 --> FEAT_181
  JOUR_036["JOUR-036 FE-04: retrying after a failed publish does not create a s... - passed"]
  MIN_223("MIN-223 Submit jobs")
  JOUR_036 --> MIN_223
  JOUR_037["JOUR-037 FE-06: closing a job asks first, and Cancel leaves it open - passed"]
  JOUR_038["JOUR-038 FE-11: the applicant filter is a group of toggle buttons,... - passed"]
  JOUR_039["JOUR-039 sign-in sends one request however fast it is submitted - passed"]
  FEAT_170("FEAT-170 Screen /login")
  JOUR_039 --> FEAT_170
  MIN_174("MIN-174 Submit auth/login")
  JOUR_039 --> MIN_174
  JOUR_040["JOUR-040 FE-05: an API outage is not reported as a dead reference link - passed"]
  FEAT_178("FEAT-178 Screen /reference/:id")
  JOUR_040 --> FEAT_178
```

| Journey  | Title                                                                   | Outcome | Exercises                     |
| -------- | ----------------------------------------------------------------------- | ------- | ----------------------------- |
| JOUR-035 | FE-07: text inputs have a border that meets 3:1 contrast                | passed  | FEAT-181                      |
| JOUR-036 | FE-04: retrying after a failed publish does not create a second job     | passed  | MIN-223                       |
| JOUR-037 | FE-06: closing a job asks first, and Cancel leaves it open              | passed  | no screen or endpoint matched |
| JOUR-038 | FE-11: the applicant filter is a group of toggle buttons, not fake tabs | passed  | no screen or endpoint matched |
| JOUR-039 | sign-in sends one request however fast it is submitted                  | passed  | FEAT-170, MIN-174             |
| JOUR-040 | FE-05: an API outage is not reported as a dead reference link           | passed  | FEAT-178                      |

## tests/e2e/hostile-user.spec.ts

5 journeys.

```mermaid
flowchart LR
  JOUR_041["JOUR-041 script payloads in the name never execute - passed"]
  JOUR_042["JOUR-042 a stored script payload is shown as text on the dashboard - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_042 --> FEAT_162
  MIN_176("MIN-176 Submit auth/register")
  JOUR_042 --> MIN_176
  JOUR_043["JOUR-043 a 10,000 character name and a SQL-looking email are refuse... - passed"]
  JOUR_044["JOUR-044 a forged token sends the user to sign in and is discarded - passed"]
  FEAT_176("FEAT-176 Screen /privacy")
  JOUR_044 --> FEAT_176
  FEAT_157("FEAT-157 Screen /admin")
  JOUR_044 --> FEAT_157
  JOUR_045["JOUR-045 a candidate cannot reach admin data through the API or the... - passed"]
  JOUR_045 --> FEAT_157
  MIN_018("MIN-018 Read admin/users")
  JOUR_045 --> MIN_018
```

| Journey  | Title                                                                       | Outcome | Exercises                     |
| -------- | --------------------------------------------------------------------------- | ------- | ----------------------------- |
| JOUR-041 | script payloads in the name never execute                                   | passed  | no screen or endpoint matched |
| JOUR-042 | a stored script payload is shown as text on the dashboard                   | passed  | FEAT-162, MIN-176             |
| JOUR-043 | a 10,000 character name and a SQL-looking email are refused without a crash | passed  | no screen or endpoint matched |
| JOUR-044 | a forged token sends the user to sign in and is discarded                   | passed  | FEAT-176, FEAT-157            |
| JOUR-045 | a candidate cannot reach admin data through the API or the page             | passed  | FEAT-157, MIN-018             |

## tests/e2e/learning-page.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_047["JOUR-047 lists courses, filters by level, and enrolls - passed"]
  FEAT_168("FEAT-168 Screen /learning")
  JOUR_047 --> FEAT_168
```

| Journey  | Title                                        | Outcome | Exercises |
| -------- | -------------------------------------------- | ------- | --------- |
| JOUR-047 | lists courses, filters by level, and enrolls | passed  | FEAT-168  |

## tests/e2e/lesson-player.spec.ts

2 journeys.

```mermaid
flowchart LR
  JOUR_049["JOUR-049 a learner works through a course to a certificate - passed"]
  FEAT_168("FEAT-168 Screen /learning")
  JOUR_049 --> FEAT_168
  JOUR_050["JOUR-050 a course that does not exist is a final answer with no ret... - passed"]
  FEAT_169("FEAT-169 Screen /learning/:id")
  JOUR_050 --> FEAT_169
```

| Journey  | Title                                                               | Outcome | Exercises |
| -------- | ------------------------------------------------------------------- | ------- | --------- |
| JOUR-049 | a learner works through a course to a certificate                   | passed  | FEAT-168  |
| JOUR-050 | a course that does not exist is a final answer with no retry button | passed  | FEAT-169  |

## tests/e2e/messaging.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_051["JOUR-051 a recruiter messages an applicant, the candidate replies,... - passed"]
  FEAT_165("FEAT-165 Screen /hiring/jobs/:id")
  JOUR_051 --> FEAT_165
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_051 --> FEAT_162
  FEAT_171("FEAT-171 Screen /messages")
  JOUR_051 --> FEAT_171
```

| Journey  | Title                                                                               | Outcome | Exercises                    |
| -------- | ----------------------------------------------------------------------------------- | ------- | ---------------------------- |
| JOUR-051 | a recruiter messages an applicant, the candidate replies, both see the conversation | passed  | FEAT-165, FEAT-162, FEAT-171 |

## tests/e2e/mutation-feedback.spec.ts

14 journeys.

```mermaid
flowchart LR
  JOUR_052["JOUR-052 apply shows pending state before any response exists, then... - passed"]
  FEAT_167("FEAT-167 Screen /jobs/:id")
  JOUR_052 --> FEAT_167
  JOUR_053["JOUR-053 employment attestation shows pending state, blocks dismiss... - passed"]
  FEAT_163("FEAT-163 Screen /evidence")
  JOUR_053 --> FEAT_163
  MIN_188("MIN-188 Submit candidates/work-history")
  JOUR_053 --> MIN_188
  JOUR_054["JOUR-054 apply failure rolls back to idle with a safe error message... - passed"]
  JOUR_054 --> FEAT_167
  JOUR_055["JOUR-055 apply conflict 409 reconciles to the server record instead... - passed"]
  JOUR_055 --> FEAT_167
  MIN_032("MIN-032 Read applications/my")
  JOUR_055 --> MIN_032
  JOUR_056["JOUR-056 every rejected status 403, 404, 429 surfaces its message a... - passed"]
  JOUR_056 --> FEAT_167
  JOUR_057["JOUR-057 rapid double activation sends exactly one request - passed"]
  JOUR_057 --> FEAT_167
  JOUR_058["JOUR-058 a response for one job never lands on another job the user... - passed"]
  JOUR_058 --> FEAT_167
  JOUR_059["JOUR-059 a verify-email rejection is still shown after the list ref... - passed"]
  JOUR_059 --> FEAT_163
  JOUR_059 --> MIN_188
  JOUR_060["JOUR-060 reference request shows pending feedback and confirms only... - passed"]
  JOUR_060 --> FEAT_163
  JOUR_061["JOUR-061 the pricing page asks for no card and never starts a purchase - passed"]
  FEAT_161("FEAT-161 Screen /checkout")
  JOUR_061 --> FEAT_161
  JOUR_062["JOUR-062 offline submission fails truthfully and succeeds after rec... - passed"]
  JOUR_062 --> FEAT_167
  JOUR_063["JOUR-063 a dead session 401 mid-mutation clears state and returns t... - passed"]
  JOUR_063 --> FEAT_167
  JOUR_064["JOUR-064 applied state is restored from the server after a reload h... - passed"]
  JOUR_064 --> FEAT_167
  FEAT_166("FEAT-166 Screen /jobs")
  JOUR_064 --> FEAT_166
  JOUR_065["JOUR-065 Send a new code is locked for a minute after a send, then... - passed"]
  JOUR_065 --> FEAT_163
```

| Journey  | Title                                                                               | Outcome | Exercises          |
| -------- | ----------------------------------------------------------------------------------- | ------- | ------------------ |
| JOUR-052 | apply shows pending state before any response exists, then reconciles on 201        | passed  | FEAT-167           |
| JOUR-053 | employment attestation shows pending state, blocks dismissal, and survives retry    | passed  | FEAT-163, MIN-188  |
| JOUR-054 | apply failure rolls back to idle with a safe error message, then retry succeeds     | passed  | FEAT-167           |
| JOUR-055 | apply conflict (409) reconciles to the server record instead of a dead Apply        | passed  | FEAT-167, MIN-032  |
| JOUR-056 | every rejected status (403, 404, 429) surfaces its message and stays idle           | passed  | FEAT-167           |
| JOUR-057 | rapid double activation sends exactly one request                                   | passed  | FEAT-167           |
| JOUR-058 | a response for one job never lands on another job the user moved to                 | passed  | FEAT-167           |
| JOUR-059 | a verify-email rejection is still shown after the list refetch (regression)         | passed  | FEAT-163, MIN-188  |
| JOUR-060 | reference request shows pending feedback and confirms only from the server          | passed  | FEAT-163           |
| JOUR-061 | the pricing page asks for no card and never starts a purchase                       | passed  | FEAT-161           |
| JOUR-062 | offline submission fails truthfully and succeeds after reconnect                    | passed  | FEAT-167           |
| JOUR-063 | a dead session (401) mid-mutation clears state and returns to sign-in with ?return= | passed  | FEAT-167           |
| JOUR-064 | applied state is restored from the server after a reload (hydration)                | passed  | FEAT-167, FEAT-166 |
| JOUR-065 | "Send a new code" is locked for a minute after a send, then unlocks                 | passed  | FEAT-163           |

## tests/e2e/navigation.spec.ts

9 journeys.

```mermaid
flowchart LR
  JOUR_066["JOUR-066 a guarded deep link resumes after sign-in via return= - passed"]
  FEAT_163("FEAT-163 Screen /evidence")
  JOUR_066 --> FEAT_163
  MIN_176("MIN-176 Submit auth/register")
  JOUR_066 --> MIN_176
  JOUR_067["JOUR-067 sign-out clears the session and parks the user on /login - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_067 --> FEAT_162
  JOUR_067 --> FEAT_162
  JOUR_068["JOUR-068 an unknown path renders the 404 page with working destinat... - passed"]
  JOUR_069["JOUR-069 client-side navigation retitles the document and announces it - passed"]
  FEAT_155("FEAT-155 Screen /")
  JOUR_069 --> FEAT_155
  JOUR_070["JOUR-070 the active header destination carries aria-current= page - passed"]
  FEAT_166("FEAT-166 Screen /jobs")
  JOUR_070 --> FEAT_166
  JOUR_071["JOUR-071 push navigation returns the viewport to the top - passed"]
  JOUR_071 --> FEAT_155
  JOUR_072["JOUR-072 mobile menu is a dismissable disclosure with focus handoff - passed"]
  JOUR_072 --> FEAT_155
  JOUR_073["JOUR-073 modal traps Tab, closes on Escape and restores focus to it... - passed"]
  JOUR_073 --> FEAT_163
  JOUR_074["JOUR-074 signed out, candidate and hiring accounts each get their o... - passed"]
  JOUR_074 --> FEAT_155
  JOUR_074 --> FEAT_162
  JOUR_074 --> FEAT_155
  JOUR_074 --> FEAT_162
  JOUR_074 --> MIN_176
```

| Journey  | Title                                                                     | Outcome | Exercises                                       |
| -------- | ------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| JOUR-066 | a guarded deep link resumes after sign-in via ?return=                    | passed  | FEAT-163, MIN-176                               |
| JOUR-067 | sign-out clears the session and parks the user on /login                  | passed  | FEAT-162, FEAT-162                              |
| JOUR-068 | an unknown path renders the 404 page with working destinations            | passed  | no screen or endpoint matched                   |
| JOUR-069 | client-side navigation retitles the document and announces it             | passed  | FEAT-155                                        |
| JOUR-070 | the active header destination carries aria-current="page"                 | passed  | FEAT-166                                        |
| JOUR-071 | push navigation returns the viewport to the top                           | passed  | FEAT-155                                        |
| JOUR-072 | mobile menu is a dismissable disclosure with focus handoff                | passed  | FEAT-155                                        |
| JOUR-073 | modal traps Tab, closes on Escape and restores focus to its opener        | passed  | FEAT-163                                        |
| JOUR-074 | signed out, candidate and hiring accounts each get their own destinations | passed  | FEAT-155, FEAT-162, FEAT-155, FEAT-162, MIN-176 |

## tests/e2e/network-page.spec.ts

3 journeys.

```mermaid
flowchart LR
  JOUR_076["JOUR-076 sends a request, shows it as sent, and withdraws it - passed"]
  FEAT_173("FEAT-173 Screen /network")
  JOUR_076 --> FEAT_173
  JOUR_077["JOUR-077 finds a member by name and connects with them - passed"]
  JOUR_077 --> FEAT_173
  JOUR_078["JOUR-078 does not offer the signed-in member as a connection of the... - passed"]
  JOUR_078 --> FEAT_173
```

| Journey  | Title                                                            | Outcome | Exercises |
| -------- | ---------------------------------------------------------------- | ------- | --------- |
| JOUR-076 | sends a request, shows it as sent, and withdraws it              | passed  | FEAT-173  |
| JOUR-077 | finds a member by name and connects with them                    | passed  | FEAT-173  |
| JOUR-078 | does not offer the signed-in member as a connection of their own | passed  | FEAT-173  |

## tests/e2e/notifications.spec.ts

3 journeys.

```mermaid
flowchart LR
  JOUR_079["JOUR-079 a recruiter is told about a new applicant and lands on tha... - passed"]
  FEAT_164("FEAT-164 Screen /hiring")
  JOUR_079 --> FEAT_164
  JOUR_080["JOUR-080 a candidate sees their application move and marks everythi... - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_080 --> FEAT_162
  JOUR_081["JOUR-081 someone with no notifications sees what will appear there - passed"]
  FEAT_174("FEAT-174 Screen /notifications")
  JOUR_081 --> FEAT_174
```

| Journey  | Title                                                                      | Outcome | Exercises |
| -------- | -------------------------------------------------------------------------- | ------- | --------- |
| JOUR-079 | a recruiter is told about a new applicant and lands on that job’s pipeline | passed  | FEAT-164  |
| JOUR-080 | a candidate sees their application move and marks everything read          | passed  | FEAT-162  |
| JOUR-081 | someone with no notifications sees what will appear there                  | passed  | FEAT-174  |

## tests/e2e/performance.spec.ts

2 journeys.

```mermaid
flowchart LR
  JOUR_082["JOUR-082 client-side navigation responds within the gross-regressio... - passed"]
  FEAT_155("FEAT-155 Screen /")
  JOUR_082 --> FEAT_155
  MIN_176("MIN-176 Submit auth/register")
  JOUR_082 --> MIN_176
  JOUR_083["JOUR-083 signed-in pages do not shift as they load, on a phone or a... - passed"]
  FEAT_176("FEAT-176 Screen /privacy")
  JOUR_083 --> FEAT_176
```

| Journey  | Title                                                              | Outcome | Exercises         |
| -------- | ------------------------------------------------------------------ | ------- | ----------------- |
| JOUR-082 | client-side navigation responds within the gross-regression guard  | passed  | FEAT-155, MIN-176 |
| JOUR-083 | signed-in pages do not shift as they load, on a phone or a desktop | passed  | FEAT-176          |

## tests/e2e/portfolio-resumes.spec.ts

2 journeys.

```mermaid
flowchart LR
  JOUR_085["JOUR-085 adds a portfolio project and shows it after reload F-26 - passed"]
  FEAT_175("FEAT-175 Screen /portfolio")
  JOUR_085 --> FEAT_175
  JOUR_086["JOUR-086 creates a resume and shows it after reload F-13 - passed"]
  FEAT_179("FEAT-179 Screen /resumes")
  JOUR_086 --> FEAT_179
```

| Journey  | Title                                                     | Outcome | Exercises |
| -------- | --------------------------------------------------------- | ------- | --------- |
| JOUR-085 | adds a portfolio project and shows it after reload (F-26) | passed  | FEAT-175  |
| JOUR-086 | creates a resume and shows it after reload (F-13)         | passed  | FEAT-179  |

## tests/e2e/privacy-contact.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_087["JOUR-087 unverified privacy contacts are not represented as a staff... - passed"]
  FEAT_176("FEAT-176 Screen /privacy")
  JOUR_087 --> FEAT_176
```

| Journey  | Title                                                                      | Outcome | Exercises |
| -------- | -------------------------------------------------------------------------- | ------- | --------- |
| JOUR-087 | unverified privacy contacts are not represented as a staffed DPO or an SLA | passed  | FEAT-176  |

## tests/e2e/responsive.spec.ts

2 journeys.

```mermaid
flowchart LR
  JOUR_088["JOUR-088 the header is one row, and the menu that holds navigation... - passed"]
  FEAT_165("FEAT-165 Screen /hiring/jobs/:id")
  JOUR_088 --> FEAT_165
  JOUR_089["JOUR-089 a dialog is a bottom sheet on phones and a centred panel f... - passed"]
  JOUR_089 --> FEAT_165
```

| Journey  | Title                                                                         | Outcome | Exercises |
| -------- | ----------------------------------------------------------------------------- | ------- | --------- |
| JOUR-088 | the header is one row, and the menu that holds navigation fits at every width | passed  | FEAT-165  |
| JOUR-089 | a dialog is a bottom sheet on phones and a centred panel from 640 px          | passed  | FEAT-165  |

## tests/e2e/restricted-account.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_090["JOUR-090 shows an honest notice, reduced navigation and no refused... - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_090 --> FEAT_162
```

| Journey  | Title                                                              | Outcome | Exercises |
| -------- | ------------------------------------------------------------------ | ------- | --------- |
| JOUR-090 | shows an honest notice, reduced navigation and no refused requests | passed  | FEAT-162  |

## tests/e2e/session-resilience.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_091["JOUR-091 a throttled session check explains itself and recovers wit... - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_091 --> FEAT_162
  MIN_033("MIN-033 Read auth/session")
  JOUR_091 --> MIN_033
```

| Journey  | Title                                                                 | Outcome | Exercises         |
| -------- | --------------------------------------------------------------------- | ------- | ----------------- |
| JOUR-091 | a throttled session check explains itself and recovers with Try again | passed  | FEAT-162, MIN-033 |

## tests/e2e/settings-page.spec.ts

5 journeys.

```mermaid
flowchart LR
  JOUR_093["JOUR-093 saves a preference and keeps it after reload F-15 - passed"]
  FEAT_180("FEAT-180 Screen /settings")
  JOUR_093 --> FEAT_180
  MIN_174("MIN-174 Submit auth/login")
  JOUR_093 --> MIN_174
  MIN_129("MIN-129 Read settings")
  JOUR_093 --> MIN_129
  JOUR_094["JOUR-094 offers only controls the product acts on C-29, K-15 - passed"]
  JOUR_094 --> FEAT_180
  JOUR_095["JOUR-095 connections-only visibility saved in Settings is what the... - passed"]
  JOUR_095 --> FEAT_180
  FEAT_177("FEAT-177 Screen /profile")
  JOUR_095 --> FEAT_177
  JOUR_096["JOUR-096 command search opens with Ctrl+K, filters, and navigates F-20 - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_096 --> FEAT_162
  JOUR_097["JOUR-097 command search closes on Escape and returns focus F-20 - passed"]
  JOUR_097 --> FEAT_162
```

| Journey  | Title                                                                          | Outcome | Exercises                  |
| -------- | ------------------------------------------------------------------------------ | ------- | -------------------------- |
| JOUR-093 | saves a preference and keeps it after reload (F-15)                            | passed  | FEAT-180, MIN-174, MIN-129 |
| JOUR-094 | offers only controls the product acts on (C-29, K-15)                          | passed  | FEAT-180                   |
| JOUR-095 | connections-only visibility saved in Settings is what the profile shows (K-15) | passed  | FEAT-180, FEAT-177         |
| JOUR-096 | command search opens with Ctrl+K, filters, and navigates (F-20)                | passed  | FEAT-162                   |
| JOUR-097 | command search closes on Escape and returns focus (F-20)                       | passed  | FEAT-162                   |

## tests/e2e/skills-graph.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_099["JOUR-099 adding a skill shows it with its related skills, and it ca... - passed"]
  FEAT_177("FEAT-177 Screen /profile")
  JOUR_099 --> FEAT_177
```

| Journey  | Title                                                                         | Outcome | Exercises |
| -------- | ----------------------------------------------------------------------------- | ------- | --------- |
| JOUR-099 | adding a skill shows it with its related skills, and it cannot be added twice | passed  | FEAT-177  |

## tests/e2e/ui-sweep.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_100["JOUR-100 sign-in with return= target stays on this site - passed"]
  FEAT_170("FEAT-170 Screen /login")
  JOUR_100 --> FEAT_170
```

| Journey  | Title                                            | Outcome | Exercises |
| -------- | ------------------------------------------------ | ------- | --------- |
| JOUR-100 | sign-in with return=${target} stays on this site | passed  | FEAT-170  |

## tests/e2e/web-ui.spec.ts

8 journeys.

```mermaid
flowchart LR
  JOUR_101["JOUR-101 renders landing page with accessibility skip-link and trut... - passed"]
  FEAT_155("FEAT-155 Screen /")
  JOUR_101 --> FEAT_155
  JOUR_102["JOUR-102 guards the dashboard and displays career cockpit after rea... - passed"]
  FEAT_162("FEAT-162 Screen /dashboard")
  JOUR_102 --> FEAT_162
  JOUR_102 --> FEAT_155
  MIN_176("MIN-176 Submit auth/register")
  JOUR_102 --> MIN_176
  JOUR_103["JOUR-103 authenticates candidate via login page and redirects to da... - passed"]
  FEAT_170("FEAT-170 Screen /login")
  JOUR_103 --> FEAT_170
  JOUR_103 --> MIN_176
  JOUR_104["JOUR-104 pricing is truthful: free, no card, and paid plans cannot... - passed"]
  FEAT_161("FEAT-161 Screen /checkout")
  JOUR_104 --> FEAT_161
  MIN_036("MIN-036 Read billing/subscription")
  JOUR_104 --> MIN_036
  JOUR_105["JOUR-105 navigates to evidence page and validates work history atte... - passed"]
  FEAT_163("FEAT-163 Screen /evidence")
  JOUR_105 --> FEAT_163
  JOUR_105 --> FEAT_170
  JOUR_105 --> FEAT_163
  JOUR_105 --> MIN_176
  MIN_064("MIN-064 Read internal/worker-jobs")
  JOUR_105 --> MIN_064
  JOUR_106["JOUR-106 takes a challenge in a session and is told plainly that no... - passed"]
  JOUR_106 --> FEAT_170
  FEAT_159("FEAT-159 Screen /assessments")
  JOUR_106 --> FEAT_159
  JOUR_106 --> MIN_176
  JOUR_107["JOUR-107 browses real job postings, is asked to sign in, then appli... - passed"]
  FEAT_166("FEAT-166 Screen /jobs")
  JOUR_107 --> FEAT_166
  FEAT_167("FEAT-167 Screen /jobs/:id")
  JOUR_107 --> FEAT_167
  FEAT_158("FEAT-158 Screen /applications")
  JOUR_107 --> FEAT_158
  JOUR_108["JOUR-108 renders privacy policy and terms of service pre-launch gates - passed"]
  FEAT_176("FEAT-176 Screen /privacy")
  JOUR_108 --> FEAT_176
  FEAT_182("FEAT-182 Screen /terms")
  JOUR_108 --> FEAT_182
```

| Journey  | Title                                                                                     | Outcome | Exercises                                      |
| -------- | ----------------------------------------------------------------------------------------- | ------- | ---------------------------------------------- |
| JOUR-101 | renders landing page with accessibility skip-link and truthful PWA capability status      | passed  | FEAT-155                                       |
| JOUR-102 | guards the dashboard and displays career cockpit after real sign-in                       | passed  | FEAT-162, FEAT-155, MIN-176                    |
| JOUR-103 | authenticates candidate via login page and redirects to dashboard (F-01)                  | passed  | FEAT-170, MIN-176                              |
| JOUR-104 | pricing is truthful: free, no card, and paid plans cannot be bought (F-16)                | passed  | FEAT-161, MIN-036                              |
| JOUR-105 | navigates to evidence page and validates work history attestations with anti-fraud checks | passed  | FEAT-163, FEAT-170, FEAT-163, MIN-176, MIN-064 |
| JOUR-106 | takes a challenge in a session and is told plainly that nothing was run or scored         | passed  | FEAT-170, FEAT-159, MIN-176                    |
| JOUR-107 | browses real job postings, is asked to sign in, then applies and tracks it                | passed  | FEAT-166, FEAT-167, FEAT-158                   |
| JOUR-108 | renders privacy policy and terms of service pre-launch gates                              | passed  | FEAT-176, FEAT-182                             |

## tests/e2e/work-history-removal.spec.ts

1 journeys.

```mermaid
flowchart LR
  JOUR_109["JOUR-109 removes a mistaken role after saying what goes with it, an... - passed"]
  FEAT_163("FEAT-163 Screen /evidence")
  JOUR_109 --> FEAT_163
  MIN_188("MIN-188 Submit candidates/work-history")
  JOUR_109 --> MIN_188
```

| Journey  | Title                                                                      | Outcome | Exercises         |
| -------- | -------------------------------------------------------------------------- | ------- | ----------------- |
| JOUR-109 | removes a mistaken role after saying what goes with it, and keeps the rest | passed  | FEAT-163, MIN-188 |
