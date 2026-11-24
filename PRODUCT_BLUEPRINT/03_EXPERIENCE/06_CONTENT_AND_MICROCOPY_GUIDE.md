# 06 Content and Microcopy Guide

Status: intended standard. Words are interface. This guide fixes voice, vocabulary and the formulas for the copy that appears most often, so every module reads as one product and so copy can be linted and localized. Rule ids use area code `CPY` (`NFR-CPY-nnn`). American English throughout [CONVENTIONS §10]. Legal text here is a drafting standard, not legal advice: all legal copy requires review by counsel (`OD-CPY-01`).

Legacy inputs: `SSOT.md` Appendix D micro-interaction register, the as-built copy conventions in `apps/web/src/pages/*` (for example the product says "Work history" for the `/evidence` route) and `Layout.tsx` (support contact is configuration, not copy). [SRC: apps/web/src/components/Layout.tsx]

## 1. Voice and tone

### 1.1 Voice (constant)

| Trait | Means | Does not mean |
|---|---|---|
| Clear | Short words, one idea per sentence, the point first | Dumbed down; hiding detail (details are one click away) |
| Calm | Steady, matter of fact, no exclamation marks except in rare celebration (max one per screen, never in errors) | Cold or robotic |
| Respectful | Treats the reader as a capable adult with a goal; never scolds, never blames | Overly formal or gushing |
| Honest | Says what is known and unknown, what the system did and did not do; labels AI, estimates, sample data and unverified claims | Overpromising ("guaranteed", "best", "instantly") |
| Direct | Active voice, imperative buttons, "you" and "your" for the user, "we" for TalentSphere only when taking responsibility | Corporate we-speak, passive evasion ("mistakes were made") |
| Inclusive | Gender-neutral, culturally neutral, ability-neutral language; no idioms | Euphemism that obscures meaning |

### 1.2 Tone (varies by moment)

| Moment | Tone | Example |
|---|---|---|
| First use, onboarding | Welcoming, encouraging, specific | "Add your last role. It takes about two minutes." |
| Routine task | Neutral, efficient | "Resume saved." |
| Success after effort (applied, passed assessment, certified, hired) | Warm, brief celebration | "You've applied to Data Analyst at Northwind. We'll tell you when they respond." |
| Waiting or uncertainty | Reassuring, factual | "Checking your degree with Northfield University. We'll email you when it's done." |
| Error caused by system | Accountable, plain, helpful | "We couldn't save your changes. Your work is still here. Try again." |
| Error caused by user input | Neutral, instructive | "Enter a date after the start date." |
| Rejection or negative outcome (candidate) | Compassionate, respectful, informative, no false hope | "Northwind chose to move forward with other candidates for this role. Thank you for your time." |
| Legal, safety, security | Precise, serious, plain | "We'll never ask for your password by message." |
| Moderation actions | Neutral, specific, reversible where true | "We removed your post because it breaks our rule on {rule}. You can appeal within {n} days." |
| Money | Exact, unambiguous, no urgency tricks | "You'll be charged $X on {date}. Cancel anytime before then." (amounts from the billing system) |
| Hiring-side (recruiters, managers) | Professional, concise, data forward | "12 applicants need review." |
| Staff console | Terse, precise, operational | "Case 4821 assigned to you." |

### 1.3 Style rules

- `NFR-CPY-001` Sentence case for all UI text (headings, buttons, tabs, menu items, table headers). Exception: proper nouns and product names.
- `NFR-CPY-002` No exclamation marks in errors, warnings, legal, money, security or permission text. Celebration may use at most one per screen.
- `NFR-CPY-003` No emoji in product UI or system emails. User-generated content may contain emoji.
- `NFR-CPY-004` No ALL CAPS text in source (CSS `text-transform: uppercase` only for the overline style).
- `NFR-CPY-005` Numerals for all numbers ("3 jobs", "2 days"); words only in fixed idioms ("one-time"). Numbers in prose with units use a non-breaking space. Dates "12 March 2026" or locale equivalent; times with time zone for events.
- `NFR-CPY-006` Use contractions ("can't", "you're") for friendliness except in legal text and in security-critical sentences where clarity matters ("Do not share this code").
- `NFR-CPY-007` Present tense, active voice; future tense only for what will happen after an action ("We'll email you").
- `NFR-CPY-008` No color, position or shape words as the only identification ("click the green button", "see the menu on the right"). Use names ("Select Save").
- `NFR-CPY-009` No jargon from our implementation (`entity`, `payload`, `null`, `undefined`, HTTP codes, internal state names like `PROCESSING`). A reference code appears only in "Details" for support.
- `NFR-CPY-010` Do not address the user by first name in errors or warnings; use names in greetings and celebrations at most once per screen.
- `NFR-CPY-011` Write for translation: no jokes, no idioms, no puns, no concatenation, no text in images, no cultural references, leave room for 40 percent expansion.
- `NFR-CPY-012` Reading level US grade 8 or lower for UI strings (`04` section 10).
- Length targets: button 1 to 3 words (max 25 characters); tab and nav labels 1 to 2 words (max 20); page title 2 to 6 words; helper text 1 sentence (max 120 characters); toast 1 sentence (max 120); error message 1 to 2 sentences (max 160); empty state body 1 to 2 sentences (max 200); dialog title as a question or statement under 70 characters; push notification title under 40, body under 100.

## 2. Terminology

One term per concept, everywhere (UI, emails, help, API docs, marketing). The glossary below is binding; the copy lint flags banned alternatives. Internal ids and module names are not user terms.

### 2.1 Core vocabulary

| Use | Do not use | Notes |
|---|---|---|
| Work history | Experience log, CV entries | The as-built UI uses "Work history" for the evidence area. [SRC: Layout.tsx nav] |
| Evidence | Proof, artifacts, documents | A piece of supporting material for a claim (document, link, project, assessment result, reference) |
| Verified | Approved, validated, certified (unless a certificate) | Checked by a named source; always with source and date |
| Self-reported | Unverified, claimed | Neutral term for unchecked data; "Unverified" may appear as a filter label |
| Credential | Certificate (generic), badge (generic) | Umbrella; "Certificate" only for course or program completion; "Badge" only for gamification (REP) or digital badges issued as such; "License" for regulated licenses |
| Skill | Competency (except in institutions where required), tag | |
| Resume | CV | US usage; locale packs may substitute "CV" (`OD-CPY-02`) |
| Profile | Account (for the public persona) | "Account" is login, email, password, billing |
| Job | Position, opening, vacancy (employer UI may say "job") | Recruiter UI: "Job"; the pre-approval request is "Hiring request" |
| Application | Submission | The candidate's application to a job |
| Applicant | Candidate (in a specific job's context) | "Candidate" is the broader term for a person in the hiring pipeline or talent pool; "Applicant" for someone who applied to a given job |
| Pipeline | Funnel, workflow | The ordered stages for a job; stage names are employer-defined |
| Stage | Step (in pipelines), status | "Step" is for wizards |
| Offer | Package | |
| Interview | Meeting, call | Type suffix: video interview, phone interview, on-site interview |
| Assessment | Test, exam, quiz (for graded quizzes inside courses use "Quiz") | Challenge: competitive or practice coding/problem item; Assignment: instructor-set coursework |
| Course | Class, module (module is a section of a course) | Lesson: unit within a module; Program or Path: sequence of courses |
| Instructor | Teacher, creator (creator may appear in studio marketing) | Faculty: institution staff who teach |
| Mentor | Coach (unless the service is explicitly coaching) | Mentee: person receiving mentoring |
| Recruiter | Talent partner, sourcer | Roles in an org are as defined in EMP |
| Hiring manager | HM | |
| Employer | Company (when role-related); "Company" for the public page | Organization: any workspace entity |
| Institution | School, college, university (generic) | Use the specific word when naming a specific one |
| Student | Learner (generic in LRN; "Learner" used for non-institution course takers) | "Learner" in course contexts, "Student" for institution-attached users |
| Cohort | Batch, class (institution UI may display local term via setting [PROP]) | |
| Placement | Campus recruitment | "Drive": a placement event with employers |
| Message | DM, chat | "Conversation" for the thread |
| Connection | Friend, contact | Two-way relationship; "Follow" is separate and one-way where offered |
| Referral | Recommendation (reserved for reference letters) | "Reference" is a request to confirm work history |
| Notification | Alert | |
| Plan | Subscription (the product) | "Subscription" is the billing relationship; "Plan" the tier |
| Invoice | Bill | |
| Sign in / Sign out | Log in / Log out, Login | "Sign up" to create an account; "Create account" in headings |
| Settings | Preferences (except "Notification preferences") | |
| Delete | Remove (for permanent), Erase | "Remove" for taking something out of a list without destroying it; "Archive" for reversible hide; "Close" for jobs and accounts' state changes |
| Cancel | Close (dialogs without a pending action) | "Cancel" backs out of a task; "Close" dismisses information |
| Save | Submit (for drafts), Update | "Save changes" in forms; "Submit" only for formal submissions (application, assessment) |
| Match | Score (when explaining recommendation) | "Match" with reasons; never a bare percentage as the only explanation |
| AI | Artificial intelligence (spell out only in legal text), bot | "AI assistant" |
| Trust and safety | Moderation (staff term) | User-facing "Report", "Appeal" |

### 2.2 Banned or restricted words

| Word or pattern | Why | Instead |
|---|---|---|
| "Oops", "Whoops", "Uh oh", "Sorry!" repeated | Trivializes problems | State what happened |
| "Please" in every instruction | Padding | Use only for a request that costs effort ("Please check your email") |
| "Simply", "just", "easily", "obviously" | Condescending | Delete |
| "Invalid" alone | Not actionable | "Enter a valid {thing}" with the rule |
| "Failed", "Error" as only message | Not actionable | What failed and what to do |
| "Click" | Not input-agnostic | "Select" (tap or click), "Choose" for options, "Go to", "Open" |
| "Submit" for non-formal actions | Unclear | Verb plus object |
| "User" in UI | Impersonal | "you", "people", "member", or the role |
| "Guest" for logged-out visitors in UI | | No label needed; use "Sign in" |
| "Fit", "culture fit" | Bias-prone in hiring | "Skills match", "role match" |
| "Rockstar", "ninja", "young", "digital native", "energetic" (in suggested job copy) | Exclusionary | Flagged by the inclusive-language checker (`04` section 10) |
| "Rejected" in candidate-facing text | Harsh | "Not selected", "Closed" |
| "Blacklist/whitelist", "master/slave", "sanity check", "crazy" etc. | Exclusionary or ableist | allowlist/blocklist, primary/replica, quick check |
| "Disabled" for a person | | "person with a disability" in policy text; "unavailable" for controls |
| "Free" without conditions | Misleading | "Free" only when no payment method is needed; otherwise state the condition |
| "Best", "top", "#1", "guaranteed" claims | Unsubstantiated | Verifiable statements only |
| "Hurry", "last chance", "only N left" | Dark pattern unless real and exact | Real deadlines with dates |
| Protected-attribute words in matching explanations | Fairness | Never display or infer |

### 2.3 Status labels

Fixed labels for domain states are in `02` section 3.3 (Verified, Pending, Checking, Not verified, Expired, Revoked, Disputed, Archived, Draft, Self-reported). Candidate-facing application statuses are written by JOB; they follow: Draft, Submitted, In review, Interview, Offer, Hired, Not selected, Withdrawn, Closed. Employer-defined stage names pass through unchanged on the employer side and map to the candidate-facing set for display.

### 2.4 Capitalization and naming of features

- Product name "TalentSphere" (one word, capital T and S). Feature names are lowercase common nouns in running text ("your work history"), Title Case never. Proper product tiers are capitalized ("Pro plan") as defined in BIL.
- Do not coin feature brand names in UI. A named feature requires an `OD-CPY` approval so the glossary stays small.

## 3. Error messages

### 3.1 The formula

Every error message has up to three parts, in this order, each a sentence or fragment:

1. **What happened**, in the user's terms (and which object).
2. **Why or what it means**, only if it changes what the user does.
3. **What to do next**, as a concrete action or button.

Rules: no codes in the sentence; no blame; no apology unless the fault is ours (then a single "Sorry" is allowed at the start, once per screen); say what is preserved ("Your changes are saved on this device"); give a specific fix, not a vague "try again later" unless that is truly the only action.

### 3.2 Patterns by cause

| Cause | Pattern | Example |
|---|---|---|
| Required field empty | "Enter {field name}." / "Select {field name}." / "Choose {field}." | "Enter your email address." |
| Wrong format | "Enter a {thing} in the format {example}." | "Enter a phone number for United States numbers, like (415) 555-0132." |
| Out of range | "{Field} must be between {min} and {max}." | "Salary must be between 0 and 1,000,000." |
| Too long or short | "{Field} must be {n} characters or fewer." (show counter) | "Headline must be 120 characters or fewer." |
| Cross-field | "{Field} must be after {other field}." | "End date must be after the start date." |
| Not unique | "{Value} is already used. {Alternative}." | "That handle is taken. Try dana-kim-2." |
| Already exists | "You've already {done X}. {link}" | "You've already applied to this job. View your application." |
| Not allowed (permission) | "You don't have permission to {action}. {Who can}." | "You don't have permission to reject candidates. Ask an admin for access." |
| Not allowed (state) | "You can't {action} because {state}." | "You can't edit this job because it's closed. Reopen it first." |
| File too large | "This file is {size}. The limit is {limit}." | "This file is 14 MB. The limit is 10 MB." |
| File type | "{Type} files aren't supported. Use {allowed}." | "DOCX files aren't supported here. Use PDF, PNG or JPG." |
| Network | "We can't connect right now. {What is safe}. {Retry}" | "We can't connect right now. Your changes are saved on this device. Retry." |
| Server fault | "Sorry, something went wrong on our side. {What is safe}. {Retry}" | "Sorry, something went wrong on our side. Your changes are not lost. Try again." |
| Timeout | "This is taking longer than expected. {Retry}" | |
| Session | "Your session ended. Sign in to continue where you left off." | |
| Rate limit | "You're trying that too often. Try again in {n} seconds." | |
| Payment declined | "Your card was declined. Check the details or use a different card." (never expose processor internals) | |
| Verification failed | "We couldn't verify {object}. {Reason class}. {Next}" | "We couldn't verify your degree. The issuer couldn't find a match. Check the details or upload a certificate." |
| Not found | "We can't find that {object}. It may have been removed, or you may not have access." | |
| Conflict | "{User} changed this while you were editing. Choose which version to keep." | |
| Integration failed | "We couldn't connect to {service}. {Next}" | "We couldn't connect to Google Calendar. Reconnect in Settings." |
| Unsupported browser or device | "{Feature} isn't available on this device. {Alternative}" | |
| Maintenance | See `03` section 12 | |

### 3.3 Where each error appears

Field error under the field and in the error summary (same text); form-level error in a Notice above the action bar; region error in an ErrorState with Retry; global error in a banner; never only in a toast (`03` section 12, `02` section 10).

### 3.4 Field labels, required, optional, help

- Labels are nouns or short noun phrases in sentence case ("Email address", "Start date"), not questions or instructions ("What is your email?" only in conversational wizards where the question is the step heading with the field labeled separately).
- Required is the default and unmarked; optional fields end with " (optional)" in the label text, which is exposed to assistive tech as part of the label. No asterisks. Forms state at the top when mixed: "All fields are required unless marked optional."
- Help text answers "why do you ask" or "what format"; it never repeats the label. Example: label "Phone number", help "Employers only see this after you apply."
- Placeholders are examples only ("name@example.com"), never labels or instructions, never required to understand the field.
- Choice labels are parallel in structure and ordered logically (not alphabetical when a natural order exists); include "Prefer not to say" for demographic questions; include "Other (please specify)" only when needed with an input revealed on selection.
- Error text for required fields uses the label: "Enter your email address", not "This field is required".

### 3.5 Warnings and notices

- Warning: states the condition and consequence, then the action ("Your plan ends on 30 June. After that, you won't be able to post jobs. Renew plan").
- Info notice: states the fact, one sentence, optional link.
- Do not stack more than two notices; prioritize by severity.

## 4. Empty states

### 4.1 Formula

Heading (what this place is or the state, 2 to 6 words) + body (why it's empty and why it matters or what will appear, 1 to 2 sentences, max 200 characters) + primary action (verb plus object) + optional secondary link. Body never blames and never says "No data".

### 4.2 Variants and templates

| Variant | Heading | Body | Action |
|---|---|---|---|
| First use | "Show your work" (feature purpose) | "Add roles, projects and credentials. Verified work stands out to employers." | "Add work history" |
| No results from search | "No jobs match your search" | "Try fewer filters or a broader title." | "Clear filters" and per-filter removers |
| No results, saved search | "Nothing new yet" | "We'll notify you when new jobs match this search." | "Edit alert" |
| Nothing to do (queue cleared) | "You're all caught up" | "New applications will appear here." | "View all applications" |
| No access to items | "Nothing to show here" | "Items you can see will appear here." | none or "Request access" |
| Filtered to zero in a table | "No {things} match these filters" | "{N} {things} are hidden by filters." | "Clear filters" |
| Not yet available (time based) | "Results aren't ready" | "Results appear within {typical window} after the assessment closes." | "Notify me" |
| Feature off by plan | See entitlement gate | | "See plans" |
| Deleted or archived | "This {object} is archived" | "You can view it but not change it." | "Restore" |
| Error state replacing empty | Use error states, not empty states | | |

### 4.3 Rules

- `NFR-CPY-013` Every empty state has at most one primary action and it is the action that most plausibly fills the empty state.
- `NFR-CPY-014` Empty states distinguish "never had any" from "filters hide all" from "cannot see any"; each has different copy.
- Sample content in empty states is labeled "Sample" and never counts in metrics.
- Illustration optional (`02` section 6), never required to understand.
- For employers with zero applicants: factual tone, offers promotion or sharing actions; no guilt ("No one has applied" is stated, not dramatized).

## 5. Button and link labels

### 5.1 Formula

Verb + object in sentence case, 1 to 3 words: "Save changes", "Add skill", "Send invite", "Apply". The label names the outcome of the action, not the mechanism.

### 5.2 Standard labels

| Intent | Label | Not |
|---|---|---|
| Persist form edits | Save changes | Submit, Update, OK |
| Persist a new object | Create {object} / Add {object} | Save |
| Finish formal submission | Submit application / Submit assessment | Submit |
| Continue in wizard | Continue (final step: the task verb) | Next >> |
| Go back in wizard | Back | Previous |
| Dismiss without effect | Cancel (task) / Close (information) | No, Exit |
| Confirm destructive | Delete {object} / Remove {person} | Yes, OK, Confirm |
| Safe default in dialog | Cancel / Keep {object} | |
| Undo | Undo | |
| Retry a failed request | Try again | Retry (acceptable in compact UI) |
| Sign in | Sign in | Login, Log in |
| Create account | Create account | Register |
| Search | Search | Go |
| Download | Download {file type} | |
| Share | Share | |
| Invite | Send invite | Invite (when it sends) |
| Accept or decline offers/invitations | Accept offer / Decline offer / Accept invitation | Yes/No |
| Enable a feature | Turn on {feature} | Enable |
| See more | Show more (inline), See all {things} (navigates) | More, Read more |
| Learn about | Learn how {x} works | Click here |
| Contact | Contact support | Help us |
| Upgrade | See plans / Upgrade to {Plan} | Buy now |
| Pay | Pay {amount} | Place order |
| Join session | Join interview / Join session | Enter |
| Start/resume learning | Start course / Continue | Go |

### 5.3 Rules

- `NFR-CPY-015` A button's accessible name equals its visible label plus, where several identical buttons repeat in a list, the object via `aria-labelledby` ("Delete resume Product Manager").
- `NFR-CPY-016` Links use descriptive text ("View application", "Read the privacy policy"), not URLs or "here".
- `NFR-CPY-017` Primary and secondary actions in a dialog are verbs of opposite meaning when a decision ("Delete job" and "Keep job").
- `NFR-CPY-018` Avoid "Please" and "Now" in labels (the apply action is labeled "Apply").
- Toggle labels: a switch is labeled with the setting name ("Job alerts") with On/Off state text; a button that changes state uses "Turn on alerts" and then "Turn off alerts" and does not use `aria-pressed`.

## 6. Legal, consent and sensitive-data language

Standard for drafting consent screens, notices and microcopy; counsel owns the final legal text. Product requirements: DP-10 (respect attention), `04` `NFR-AXS-061` and `NFR-AXS-062`. Regulatory frames to design for (confirm in `OD-CPY-01`): GDPR and UK GDPR, CCPA/CPRA, India DPDP Act, Canada PIPEDA, Brazil LGPD, COPPA (age limits), EEOC and OFCCP record-keeping, NYC Local Law 144 and EU AI Act obligations for automated employment decision tools, e-privacy rules for cookies and push.

### 6.1 Consent principles

- Specific, informed, unbundled, freely given, as easy to withdraw as to give, recorded with version and time.
- Consent is requested at the moment the data or capability is needed (just in time), with the purpose in the label: "Let employers who match your preferences see your profile" not "I agree to data processing".
- No pre-ticked boxes; no consent as a condition for unrelated features; refusing is as visible as accepting (same size and weight).
- Terms and Privacy acceptance at sign-up: "By creating an account you agree to the Terms and acknowledge the Privacy Policy." with links, as a statement beneath the button for contractual acceptance, and a separate unticked checkbox for each optional consent (marketing, personalization, research).
- Minors: age gate at sign-up asking for birth year or "I'm at least {age}" statement (age per jurisdiction, `OD-CPY-03`); under-age flow explains that parental permission is needed.

### 6.2 Templates

| Context | Copy template |
|---|---|
| Cookie banner (non-essential) | Title: "Your privacy choices". Body: "We use necessary cookies to run TalentSphere. With your permission we also use cookies to understand how it's used and to personalize it. You can change this anytime." Buttons: "Accept all", "Reject all", "Customize" (equal prominence). Category list with plain purpose lines |
| Profile visibility choice | "Private: only you can see your profile." / "Recruiters: employers on TalentSphere can find you based on your preferences." / "Public: anyone can see the parts you choose, including search engines." Each with "What others can see" preview |
| Sharing evidence with employers | "Visible to employers who view this item. You can change this anytime." |
| Background check consent | "{Employer} asked us to run a {check type} check through {Provider}. They'll receive {what result} and not {what they will not see}. You'll see the result first{if law requires}. Your rights: {link}." Separate "I authorize" checkbox, name typed and date; right to a copy; link to dispute process |
| Identity verification | "To confirm it's you, {Provider} will check your ID and a selfie. We keep the result, not the images, for {retention}. You can use {alternative path} instead." |
| Recording an interview | "{Employer} would like to record this interview and create a transcript for the hiring team. You can say no, and it won't affect your application." Buttons "Allow recording" and "Don't record" |
| AI note taking | "An AI assistant will take notes for the interviewers. It does not score or rank you." (only if true); Accept and Decline equal |
| Automated decision tools | "This job uses an automated tool to help rank applicants. {What it considers}. A person makes the final decision. You can ask for a human review." plus where required, bias audit summary link |
| Data export | "We'll prepare a file with the data we hold about you and email you when it's ready. This can take up to {n} days." |
| Account deletion | "Deleting your account removes your profile and ends your sign in. Some records we must keep by law stay for {period}. You have 14 days to change your mind." (parameters from policy) |
| Sensitive categories (diversity data, disability) | "Optional. We use this only to {purpose} and show results in groups of {min group size} or more. It is never shown to employers who view your profile or used to rank you. Prefer not to say." |
| Employer data processing (EEO) | "These questions are voluntary. Your answers are kept apart from your application and not seen by the hiring team." (if so designed) |
| Marketing email | "Send me product updates and tips." unchecked; separate from transactional email which the user cannot disable but can control by category except security |
| Third-party sharing | "Share with {Partner}: {what} for {purpose}." Each partner separately |
| Location | "Use your location to show jobs nearby. We save your city, not your exact location." |
| Camera and microphone (browser prompt precursor) | "TalentSphere needs your camera to {purpose}. We'll ask your browser for permission next." |
| Push | "Get notified about {specific things}. You can turn this off anytime in Settings." |

### 6.3 Legal documents UX copy

- Legal pages have a plain-language summary at the top (grade 8) and a table of changes with dates; version and effective date visible; "Last updated {date}".
- Material changes: in-app notice 30 days before, requiring a re-acceptance dialog only when the law or the change demands; the dialog shows what changed in 3 bullets.
- Never hide opt-outs in legal text; link to Settings.

### 6.4 Disclosures required in context

- "Sponsored" or "Promoted" labels on paid placements, with an explanation popover.
- "AI-generated" on AI content.
- "Sample" on sample data.
- "Machine translated" on translated user content.
- "Verified by {source} on {date}" with the verification's limits ("checked employment dates, not job performance").
- "Estimated" on salary estimates and market data with source and date; "Employer provided" vs "Estimated by TalentSphere".
- Pay transparency: salary ranges shown where required by law in the job's jurisdiction.

## 7. Notification copy templates

### 7.1 Structure

Title: who/what + event (under 40 characters for push, under 90 in app). Body: the one detail needed to act (under 100). Action: label verb plus object. Never include sensitive details on lock screen when "Hide details" is set: use the generic form.

### 7.2 Templates (variables in braces)

| Event | In-app title | Body | Push (detail hidden form) | Email subject | Action label |
|---|---|---|---|---|---|
| Application received (candidate) | "You applied to {Job title}" | "{Company} will review your application." | "Application sent" | "You applied to {Job title} at {Company}" | View application |
| Application viewed | "{Company} viewed your application" | "They looked at it on {date}." | "Application viewed" | none (in-app only by default) | View application |
| Stage change | "Your application moved to {Stage}" | "{Job title} at {Company}" | "Application update" | "Update on your application to {Company}" | View application |
| Not selected | "Update on {Job title}" | "{Company} chose to move forward with other candidates. Thank you for applying." | "Application update" | "Update on your application to {Job title}" | See similar jobs |
| Interview invitation | "{Company} invited you to interview" | "{Date and time} {time zone}. Confirm or suggest another time." | "Interview invitation" | "Interview invitation from {Company}" | Choose a time |
| Interview reminder | "Interview in {1 hour}" | "{Job title} with {Company} at {time}. Join from the app." | "Interview soon" | "Reminder: interview with {Company} at {time}" | Join interview |
| Offer received | "You have an offer from {Company}" | "Respond by {date}." | "You have an offer" | "Offer from {Company}" | View offer |
| New message | "{Sender} sent you a message" | "{First 80 characters}" (if details shown) | "New message" | digest | Reply |
| Connection request | "{Name} wants to connect" | "{Headline}" | "New connection request" | digest | View request |
| Job alert | "{N} new jobs match {Search name}" | "{Top title} at {Company} and {N-1} more" | "New jobs for you" | "{N} new jobs for {Search name}" | View jobs |
| Evidence verified | "{Item} is verified" | "Confirmed by {Source} on {date}." | "Verification complete" | "Your {item} was verified" | View evidence |
| Verification needs action | "We need one more thing for {Item}" | "{Specific need}." | "Action needed" | "Action needed: {Item}" | Fix now |
| Credential expiring | "{Credential} expires on {date}" | "Renew it to keep it on your profile." | "Credential expiring" | same | Renew |
| Course deadline | "{Course} assignment is due {date}" | "{Assignment}" | "Assignment due soon" | digest | Open assignment |
| Assessment invitation | "{Org} invited you to take {Assessment}" | "Complete it by {date}. It takes about {duration}." | "Assessment invitation" | "{Org} invited you to take an assessment" | Start assessment |
| Assessment result | "Your result for {Assessment} is ready" | "{Short outcome sentence}" | "Result ready" | | View result |
| Certificate issued | "You earned a certificate" | "{Course}. Share it or add it to your profile." | "Certificate earned" | "Your {Course} certificate" | View certificate |
| Mentor request | "{Name} asked to book a session" | "{Date and time} {time zone}" | "New session request" | | Respond |
| Session reminder | "Session with {Name} in {1 hour}" | | "Session soon" | | Join session |
| New applicant (employer) | "{N} new applicants for {Job}" | "{Top match name or 'Review them'}" | "New applicants" | digest | Review applicants |
| Review requested (HMG) | "{Recruiter} asked you to review {Candidate}" | "For {Job}. Due {date}." | "Review requested" | | Review candidate |
| Scorecard overdue | "Scorecard due for {Candidate}" | "Interview was on {date}." | "Scorecard due" | | Add scorecard |
| Offer approval | "{Offer} needs your approval" | "{Job}, {candidate name hidden in push}" | "Approval needed" | | Review offer |
| Team invite | "{Name} invited you to join {Org}" | "Role: {Role}." | | "Join {Org} on TalentSphere" | Accept invitation |
| Moderation notice | "We removed your {content type}" | "It broke our rule on {rule}. You can appeal until {date}." | "Account notice" | "About your {content type}" | Review decision |
| Security: new sign-in | "New sign-in to your account" | "{Device} in {City} on {date}." | "New sign-in" | "New sign-in to TalentSphere" | Secure account |
| Payment failed | "We couldn't process your payment" | "Update your payment method to keep {Plan}." | "Payment issue" | "Action needed: payment failed" | Update payment |
| Data export ready | "Your data export is ready" | "Download it within {n} days." | "Export ready" | same | Download |
| Referral outcome | "Your referral {Name} {outcome}" | | | | View referral |

### 7.3 Rules

- `NFR-CPY-019` Notifications state facts without urgency inflation; deadlines use real dates and times with zone.
- `NFR-CPY-020` Subject lines are specific and under 60 characters; no "Re:" or "Fwd:" tricks, no emoji, no ALL CAPS; transactional email contains no promotional content; footer has the legal entity, address (where required), preference link and one-click unsubscribe for non-essential classes.
- `NFR-CPY-021` Each email has a plain-text part; links are descriptive; the primary action appears once as a button and once as a text link.
- `NFR-CPY-022` Names are only included in channels that allow sensitive content; hidden-detail variants contain no person or employer name.
- `NFR-CPY-023` Templates are versioned and localized; variables validated (no raw `{Placeholder}` leak: lint fails if a rendered string contains braces).
- Email layout: preheader text (under 90 characters) summarizing the action; single column; 16 px text; headings; accessible colors from tokens.
- Digest structure: heading by category, up to 5 items per category, "See all" link, sent at the user's local time (default 08:00).

## 8. Other microcopy patterns

| Pattern | Formula | Examples |
|---|---|---|
| Success toast | "{Object} {past participle}." | "Resume saved." "Invite sent." "Link copied." |
| Success page heading | Statement of what the user achieved | "You've applied to {Job}." |
| Confirmation dialog title | Verb + object? ("Delete resume?") | "Delete this resume?" body "This can't be undone. Applications that used it keep a copy." Buttons "Cancel", "Delete resume" |
| Progress status | Present continuous + object | "Uploading 2 of 3 files", "Checking your document" |
| Loading text (only when needed) | "Loading {thing}" | |
| Tooltip | Name or short fact, no sentences with periods unless 2 sentences | "Bookmark job" |
| Placeholder | Example value | "e.g. Product designer" |
| Search placeholder | "Search {things}" | "Search jobs, skills or companies" |
| Character counter | "{remaining} characters left" | |
| Time | Relative within 7 days ("2 days ago"), absolute afterward ("12 Mar 2026") | |
| Counts | "{n} {things}" with plural forms via ICU | "1 job", "2 jobs" |
| Date range | "12 Mar to 20 Apr 2026" | |
| Currency | "$85,000 per year" / "USD 85,000 a year" by locale; ranges "$80,000 to $95,000" | |
| Unknown or missing | "Not provided" | not "N/A", "-" alone |
| Permissions text | "{Role} can {action}" | "Hiring managers can view and score candidates." |
| Onboarding prompts | Benefit then action | "Verified roles get seen more. Add evidence" |
| Coachmark | Title: feature name; body: one benefit | "Saved searches. Get alerts when new jobs match." |
| AI disclosure | "AI-generated. Check for accuracy." | |
| AI refusal | "I can't help with {topic}. {Alternative}." | |
| Match explanation | "Matches your {skill} and {experience}. Missing: {skill}." | |
| Verification detail | "Verified by {source} on {date}. We checked {what}." | |
| Offline | "You're offline. {What still works.}" | |
| Beta labeled | "Beta" chip with explanation popover "This feature is new and may change." | |
| Staff console actions | Plain operational: "Suspend account", reason required: "Reason (visible in the audit log)" | |
| Footers | "© {year} TalentSphere" and links | |

### 8.1 Writing for specific contexts

- **Job and course content authored by users:** the editors suggest, never auto-rewrite; templates and examples avoid bias; length guidance ("Most strong job descriptions run 300 to 700 words" only if evidence-backed, otherwise omit).
- **Recruiter-to-candidate templates:** provided templates must disclose the sender and the job, state a specific reason for contact, and include an easy "Not interested" reply path; no deceptive urgency.
- **Rejection messages** (system templates, editable by employers within guardrails): must thank, state the decision clearly, avoid reasons that could be discriminatory, offer feedback only when the employer provides it, and never promise "we'll keep your resume" unless pool membership is true and consented.
- **Moderation and trust copy:** name the rule, the content, the consequence, the appeal path and the deadline; never accuse beyond the finding ("This post broke our rule", not "You are a spammer").
- **Billing copy:** exact amounts, currencies, tax inclusivity, billing date, renewal, cancellation path in the same screen as purchase; trial copy states when the first charge occurs.
- **AI copy:** first-use note "AI can make mistakes. Check important details." Confidence in words.
- **Accessibility-related copy:** "Accommodations" (not "special needs"); never mention disability in notifications; use "adjustments approved" for effective settings.

## 9. Localization rules for content

- `NFR-CPY-024` Every user-visible string lives in a message catalog with a stable key, source text in `en-US`, a translator note (context, max length, variables), and a screenshot where useful. No string literals in components.
- `NFR-CPY-025` ICU MessageFormat for plurals, select (gender-neutral by default; avoid gender where possible), and number/date formatting; never assemble sentences from fragments; variables are named (`{count}`, `{company}`), not positional.
- `NFR-CPY-026` Layout tolerates 40 percent expansion and RTL mirroring (`04` section 9); button and tab labels allow wrapping to two lines in fixed-width places or have a shorter alternate key flagged `short` for tight spaces.
- `NFR-CPY-027` Terminology glossary is translated per locale and enforced by the translation memory; "Verified", "Evidence", "Work history", "Application" are fixed terms.
- Do not translate: product name, plan names unless localized in BIL, user-generated content (offered with machine translation labeled), legal entity names, code, API names.
- Names: never reorder or assume order; display names as the user entered; sorting by locale rules; honorifics not required.
- Units and formats: metric/imperial and currency by locale; salary periods localized; phone and address formats by country.
- Content tone adaptation: formality levels per language (for example "tu/vous", "du/Sie") default to the polite form; documented per locale.
- Sensitive terms and law-specific copy (consent, hiring decisions) have jurisdiction-specific versions rather than literal translation.
- Images and illustrations contain no culture-specific gestures or text; icons avoid regionally ambiguous metaphors (mailbox, thumbs up) unless validated.
- Review: native-speaker review for each launch language; pseudo-localization in CI (`04` section 9); a linguistic QA pass on screens with the longest strings.
- Fallback: missing translation falls back to `en-US` and logs; user never sees a key.
- Machine translation of UI is not used for legal or consent text.
- Date and time strings for emails use the recipient's locale and zone, plus the organizer's zone for events.

## 10. Copy governance and linting

| Control | Rule |
|---|---|
| Copy lint (CI) | Flags banned words (section 2.2), exclamation marks in error/legal text, all caps, "click", "please" density, readability above grade 11, empty alt text on informative images, braces in rendered strings, strings over length targets (section 1.3), non-sentence-case headings |
| Review | Every new or changed user-facing string needs review by the content designer (or designated reviewer) in the PR; legal strings need counsel sign-off |
| Source of truth | Message catalogs per module; shared strings (buttons, errors, statuses) in a common catalog consumed by components so wording cannot drift |
| Change log | Copy changes to consent, billing, security and moderation strings are logged with version and date |
| Research | Copy tested in usability tests for onboarding, assessments, offers and rejection; comprehension test for consent copy at grade 8 target |

## 11. Rules summary

| Id | Rule |
|---|---|
| NFR-CPY-001 | Sentence case for all UI text |
| NFR-CPY-002 | No exclamation marks in errors, warnings, legal, money, security or permission text |
| NFR-CPY-003 | No emoji in product UI or system emails |
| NFR-CPY-004 | No ALL CAPS source text |
| NFR-CPY-005 | Numerals, unambiguous dates, time zones on events |
| NFR-CPY-006 | Contractions in friendly text; not in legal or security-critical sentences |
| NFR-CPY-007 | Present tense and active voice |
| NFR-CPY-008 | No color or position words as sole identifiers |
| NFR-CPY-009 | No implementation jargon in UI |
| NFR-CPY-010 | No first-name use in errors and warnings |
| NFR-CPY-011 | Write for translation |
| NFR-CPY-012 | Grade 8 reading level |
| NFR-CPY-013 | One primary action per empty state |
| NFR-CPY-014 | Distinguish never-had, filtered, cannot-see empties |
| NFR-CPY-015 | Accessible name equals visible label plus object in repeated lists |
| NFR-CPY-016 | Descriptive link text |
| NFR-CPY-017 | Opposite-verb dialog buttons |
| NFR-CPY-018 | No "Please" or "Now" in labels |
| NFR-CPY-019 | Notifications without urgency inflation |
| NFR-CPY-020 | Specific subject lines; transactional emails not promotional |
| NFR-CPY-021 | Plain-text part and descriptive links in emails |
| NFR-CPY-022 | Hidden-detail variants contain no names |
| NFR-CPY-023 | Templates versioned; no unrendered variables |
| NFR-CPY-024 | All strings in catalogs with keys and translator notes |
| NFR-CPY-025 | ICU MessageFormat, named variables, no fragment assembly |
| NFR-CPY-026 | 40 percent expansion tolerance and short alternates |
| NFR-CPY-027 | Fixed translated glossary terms |

## 12. Open decisions and risks

| Id | Question | Options | Default proposal | Decides | Blocks |
|---|---|---|---|---|---|
| OD-CPY-01 | Jurisdictions the legal copy is drafted for | List | GDPR/UK GDPR, CCPA/CPRA, DPDP, NYC LL144 first | Counsel | Section 6 |
| OD-CPY-02 | "Resume" or "CV" default by locale | US resume; UK/EU/India CV | By locale setting | Content lead | Terminology |
| OD-CPY-03 | Minimum age and age gate pattern | 13, 16, 18 by region | 16 in EU, 13 US, hiring features 18 | Counsel | IDN onboarding |
| OD-CPY-04 | Institution local term overrides ("batch" for cohort) | Allow; disallow | Allow display override in institution workspaces | Product owner | INS |

### 12.1 Risks

| Id | Risk | Mitigation |
|---|---|---|
| RSK-CPY-01 | Copy drift across 31 modules | Shared catalogs, glossary lint, reviewer role |
| RSK-CPY-02 | Legal text not matching product behavior (consent claims we do not honor) | Consent copy generated from the consent registry in SET; claims reviewed against behavior in tests |
| RSK-CPY-03 | Rejection and moderation copy causing harm or legal exposure | Template guardrails, counsel review, tone tests |
