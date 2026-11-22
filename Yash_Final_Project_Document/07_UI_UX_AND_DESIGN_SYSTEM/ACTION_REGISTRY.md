# Action Registry — 231 user and operator actions

Doc ID: UI-04 · Owner: Interaction Design Lead · Version 1.0 · Status: Under Review · Relates: UI-02 `SCREEN_REGISTRY.md`, UI-03, UI-07, ADR-T08, ADR-T10, INV-T01, INV-T04, INV-T05, INV-T08, INV-T09, INV-T10, INV-T15, INV-T17, INV-T18, BR-T001, BR-T004, BR-T005, BR-T041, BR-T050, BR-T060

Supersedes nothing; linked from the folder index and `MASTER_INDEX`. All rows **[TARGET]**. API names are placeholders `API-<module>-<verb>` (see UI-02 OPEN-UX-22). State-machine names (SM-*) are those owned by `06_BUSINESS_PROCESSES`; transitions shown are the UI's expectation, and the server remains authoritative (INV-T11).

## 0. Reading guide and global rules

**Columns:** Trigger · screen = control and where it lives. Actor = ROLE-*. Visible / enabled = when shown / when active (otherwise disabled **with a stated reason**, never silently). Input · validation = fields and rules (client validation is a convenience; the server re-validates and may return RFC 9457 problem+json). Processing = API call and state effects. Feedback = how the person learns the outcome (`T` toast, `I` inline persistent, `A` screen-reader announcement, `N` notification). Failure = specific failures; **global failure classes below apply to every row unless overridden.** Result · navigation = resulting state and where focus/route goes. Idem · Confirm = idempotency and confirmation requirement.

**Idempotency codes:** `K` unsafe mutation sends `Idempotency-Key` (generated once per user intent, reused on retry; FF-07, INV-T10) · `N` natural-key idempotent (set-to-value) · `R` read/safe · `E` ETag/`If-Match` required (ADR-T08).
**Confirmation codes:** `C0` none · `C1` review step or inline summary before commit · `C2` dialog with consequence text and verb-labelled button · `C3` typed confirmation · `U8` undo available for 8 s (server-side delayed commit or soft delete, OPEN-UX-15) · `SU` step-up authentication within last 15 min (SCR-SHELL-07/18).

**Global failure classes (apply by default):**

| Class | Behaviour |
|---|---|
| F-net (offline / timeout) | Keep user input; online-only actions: control disabled with "Needs connection"; unknown-outcome mutation → "checking…" then status query, never blind resubmit (UI-07 §11); ADR-T10 actions queue as "Waiting to sync" |
| F-422 validation | Field errors + error summary (focus moves), server messages mapped to fields |
| F-401 | Re-auth overlay (ACT-AUTH-14), then action resumes |
| F-403 | In-place forbidden state; capabilities refetch; no existence disclosure (INV-T02) |
| F-409/412 | Conflict flow (UI-07 §8) |
| F-429 | Show wait time from `Retry-After` as text; no auto-hammering |
| F-5xx | `ErrorState` with trace id, Retry, input preserved |
| F-remote | Remote unavailable state (UI-07 §7) |

**Standing rules:** no action may auto-reject, rank-out, flag or ban a person without a human actor (INV-T09); AI outputs are suggestions that become the user's own text only on adoption and never create evidence (INV-T08); every privileged action is audited (INV-T10, INV-T18); evidence rung is never set by a client action (INV-T04).

## 1. AUTH — identity and session (14)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure (specific) | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-AUTH-01 | "Create account" · SHELL-03 | ANON | Anon only; enabled when valid | Email RFC-valid ≤254; password ≥12 chars, breach-list check, no composition rules, paste allowed; or "Use a passkey"; unticked terms checkbox; age confirmation [OPEN-09] | `API-identity-register`: Account (unconfirmed); code/link stored as hash (INV-T05); event `account.registered` | `I` "Check your email" + `A` | Email exists → identical neutral response (no enumeration); breached password → field message; F-429 | → SHELL-04 | K · C0 |
| ACT-AUTH-02 | "Confirm" / emailed link · SHELL-04 | ANON (pending) | Pending account | 6-digit code, numeric, paste ok; or `#k` secret | `API-identity-confirm-email`: single-use, expiring, bound to request; session issued | `A` "Email confirmed" | Wrong code: attempts left shown (max 5) then 15-min lock; expired → ACT-AUTH-03 | → `/me/onboarding` (candidate) or invite flow | N · C0 |
| ACT-AUTH-03 | "Send a new code" · SHELL-04 | ANON (pending) | After 60 s cooldown (text countdown, coarse cadence); ≤5/hour | — | `API-identity-resend-code`; invalidates prior code | `T` "New code sent" | F-429 | stay; focus on code field | K · C0 |
| ACT-AUTH-04 | "Sign in" · SHELL-02 | ANON | Form complete | Email, password (never truncated, paste/autofill ok) | `API-identity-login`: session cookie, refresh family (BR-T050) | none on success | Generic "email or password incorrect"; lockout after repeated failure with recovery link; paused → RD-16; SSO-enforced → ACT-AUTH-12 | → `next` or workspace home; → SHELL-07 if step-up | K · C0 |
| ACT-AUTH-05 | "Use a passkey" · SHELL-02 | ANON | WebAuthn feature-detected (FF-09), else hidden with password fallback | Browser prompt (conditional UI/autofill) | `API-identity-passkey-options` → `API-identity-passkey-verify` | — | User cancels → no error banner; unknown credential → offer password; cross-device QR fallback text | as ACT-AUTH-04 | K · C0 |
| ACT-AUTH-06 | "Verify" · SHELL-07 / overlay | Any (partial session) | Step-up needed (sensitive action or new device) | Passkey, or emailed 6-digit code (paste ok) | `API-identity-challenge-verify`; marks session "recent auth" 15 min | `A` | 5 attempts then 15-min lock; code expired → resend | Returns to originating action with data preserved | K · C0 |
| ACT-AUTH-07 | "Send reset link" · SHELL-05 | ANON | — | Email | `API-identity-request-reset`: always 202; hashed single-use token (INV-T05) | `I` neutral "If an account exists…" | F-429 | stay | K · C0 |
| ACT-AUTH-08 | "Set password" · SHELL-06 | ANON (token) | Token valid | New password (policy as ACT-AUTH-01), show/hide toggle | `API-identity-reset-password`: token consumed; all sessions revoked | `I` + `T` | Expired/used → request new link; breached → field message | → `/login` with message | K · C0 |
| ACT-AUTH-09 | "Sign out" · account menu | Authed | Always | — | `API-identity-logout`; clears caches/drafts of sensitive data on device; warns if unsynced queue exists | `A` | Queue non-empty → dialog "2 changes not synced; signing out discards them" | → `/` | K · C2 only if queue non-empty |
| ACT-AUTH-10 | "Accept invitation" · SHELL-12 | Any (token) | Token valid; signed-in email must match invite or user signs up | Review of org name + role | `API-orgs-accept-invite`: RoleGrant created; event `org.member.added` | `I` | Wrong account → "Sign out and use `x@…`"; expired/revoked → contact inviter | → new workspace home; focus `h1` | K · C1 |
| ACT-AUTH-11 | "Add a passkey" · ACC-02 | Authed | WebAuthn supported; step-up | Nickname 1–40 | `API-identity-passkey-register` | `T` | Cancelled; already registered on device | stay | K · SU |
| ACT-AUTH-12 | "Continue with SSO" · SHELL-02/03 | ANON | Domain has SSO or user chooses | Work email | `API-orgs-sso-discover` → IdP redirect → `API-identity-sso-callback` (SHELL-19) | polite "Signing you in…" | IdP error/timeouts → login with reason; account not provisioned → request invite | → workspace home | N · C0 |
| ACT-AUTH-13 | "Can't use your passkey?" · SHELL-07 | Partial/ANON | — | Email; emailed code | `API-identity-recover`: notifies existing devices; sensitive changes cool-off 24 h | `I` | F-429 | → reset flow | K · C0 |
| ACT-AUTH-14 | "Sign in again" · overlay SHELL-18 | Authed (expired) | Session expired mid-task | Password or passkey | `API-identity-reauth`; replays pending request | `A` | Refresh reuse detected → full logout (BR-T050) with explanation | Focus returns to prior control; form data intact | K · C0 |

## 2. ONB — candidate onboarding (6)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-ONB-01 | "Next" step 1 · CAND-02 | CAND | First login | Goals (≥0 of: find a job, switch careers, learn, prove skills, teach) | `API-profile-update` (goals); O-q | `A` step heading | — | → step 2 | N · C0 |
| ACT-ONB-02 | "Next" step 2 · CAND-02 | CAND | — | 0–20 skills from taxonomy typeahead; custom text maps to nearest taxonomy skill or stays as free tag | `API-skills-search`, `API-profile-update` | `A` count | Taxonomy search offline → free tag allowed, reconciled later | → step 3 | N · C0 |
| ACT-ONB-03 | "Import résumé" · CAND-02 | CAND | Optional; parse allowed within AI budget (INV-T07) else manual path | PDF/DOCX ≤5 MB; type + scan | `API-platform-upload-init`, `API-ai-parse-resume` via gateway; output = L1 **suggestions** only (INV-T08) | Indeterminate + `A` "Found 8 items to review" | Parse fails / over budget → manual entry; blocked file | Review list; accept per item | K · C1 |
| ACT-ONB-04 | "Next" step 4 · CAND-02 | CAND | — | Per-field choice Private / Recruiters I allow / Public; default Private | `API-profile-update-visibility`, `API-privacy-set-defaults` | `A` | — | → step 5 | N · C0 |
| ACT-ONB-05 | "Skip for now" · CAND-02 | CAND | Steps 2–4 optional | — | Records skip; reminder card on home | `A` | — | next step | N · C0 |
| ACT-ONB-06 | "Finish" · CAND-02 | CAND | Goal answered or skipped | — | `API-profile-update` (onboarded flag); event | `T` | — | → `/me` or `/me/evidence/new` if chosen | K · C0 |

## 3. PRO — profile, portfolio, résumé (14)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-PRO-01 | "Save" section / blur autosave · CAND-03 | CAND, INST | Own profile | Headline ≤120; summary ≤2000; location free text; links https only, ≤5; pronouns ≤30; languages from list | `API-profile-update` with `If-Match`; event `profile.updated`; O-q queue | `A` "Saved" / badge "Waiting to sync" | 412 → conflict dialog; validation | stay | K, E · C0 |
| ACT-PRO-02 | "Change photo" · CAND-03 | CAND | — | PNG/JPG/WebP ≤5 MB, ≥200 px; client crop with keyboard-operable controls | `API-platform-upload-init`; scan; set avatar | Byte progress → "Checking file" | Blocked/oversized → reason | stay | K · C0 |
| ACT-PRO-03 | Visibility selector · CAND-03/04 | CAND | — | Private / Recruiters I allow / Public per field (Public requires published profile) | `API-profile-update-visibility` | `A` state text | Public without handle → prompt ACT-PRO-04 | stay | N · C1 when moving to Public (shows preview) |
| ACT-PRO-04 | "Publish profile" / "Unpublish" · CAND-04 | CAND | Handle set; headline present | Handle 3–30 `[a-z0-9-]`, unique, not reserved | `API-profile-publish` / `-unpublish` | `I` public URL + `T` | Handle taken → suggestions | stay; URL shown | K · C2 |
| ACT-PRO-05 | "Add skill" · CAND-03/14 | CAND | — | Taxonomy skill; optional self-rated level | `API-profile-add-skill`; confidence recompute async | `A` | Duplicate → focus existing | stay | N · C0 |
| ACT-PRO-06 | "Remove skill" · CAND-03/14 | CAND | — | — | `API-profile-remove-skill`; linked evidence stays | `T` Undo | — | stay | K · U8 |
| ACT-PRO-07 | "Save project" · CAND-05/06 | CAND | — | Title ≤100, description ≤1000, URL https, evidence links | `API-profile-create-portfolio-item` / `-update-…` | `T` | Validation | → CAND-05 | K, E · C0 |
| ACT-PRO-08 | "Move up/down" or drag · CAND-05 | CAND | ≥2 items | Position | `API-profile-reorder-portfolio` | `A` "Moved to position 2 of 6" | Conflict | stay; focus kept on moved item | K · C0 |
| ACT-PRO-09 | "Add role" · CAND-10 | CAND | — | Employer ≤120, title ≤120, start ≤ today, end ≥ start or "present", type from list, description ≤2000 | `API-profile-create-work-claim` (L1 Claimed) | `T` | Overlapping dates → advisory | → CAND-11 | K · C0 |
| ACT-PRO-10 | "New résumé" · CAND-15 | CAND | Within plan limit (server-derived entitlement) | Name 1–60, template, evidence selection | `API-profile-create-resume` | `T` | Limit reached → plan explainer (no dark pattern) | → CAND-16 | K · C0 |
| ACT-PRO-11 | "Export" · CAND-16 | CAND | — | PDF or DOCX | `API-profile-export-resume` (job) | Indeterminate + notify when ready | Export fails → retry | Download | K · C0 |
| ACT-PRO-12 | "Use suggestion" / "Dismiss" · AI panel | CAND | AI available within budget (INV-T07) and session not `AI_PROHIBITED` (INV-T06) | — | `API-ai-suggest` (human-gated INV-T09); adoption copies text as user's own L1 content; logs `ai_assisted` [OPEN-UX-04]; never creates evidence (INV-T08) | `A` "Suggestion added to your text" | Budget exhausted → "Not available on your plan right now" | stay | K · C0 |
| ACT-PRO-13 | "Preview as…" · CAND-04 | CAND | — | Viewpoint: Public / Recruiter I allow | `API-profile-get-preview` (same policy engine) | Labelled "Preview" region | — | stay | R · C0 |
| ACT-PRO-14 | "Report" · SHELL-08/11 | Any | Not own | Reason category; text ≤1000 | `API-safety-create-report`; case in moderation queue | `T` "Report received" | F-429 | stay | K · C1 |

## 4. EVD — evidence (12)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-EVD-01 | "Save evidence" · CAND-08 | CAND, INST | Online; valid | Type (project, certificate, course, assessment, work sample, publication, other); title 3–120; description 10–2000; dates (end ≥ start, ≤ today); skills 1–10; default visibility Private | `API-evidence-create`: rejects `source=ai` (INV-T08); rung set by server (starts L1 Claimed; L2 once artifact clean); event `evidence.created` | `I` "Saved as Claimed" + `T` | Offline → "Needs connection to save to your library" with local draft; uploads pending are allowed (attach as scanning) | → CAND-09 | K · C0 |
| ACT-EVD-02 | "Add file" / drop · CAND-08/09 | CAND | ≤10 files | pdf, docx, png, jpg, md, zip ≤25 MB each; type sniffed server-side | `API-evidence-upload-init` (signed upload) → virus scan (BR-T003): invisible to others until clean | Byte bar → "Uploaded — scanning for safety" → "Ready" | Blocked → reason; retry ACT-EVD-08 | stay; focus on file row | K · C0 |
| ACT-EVD-03 | "Add link" · CAND-08/09 | CAND | ≤10 links | https URL ≤2048; no `javascript:`; domain displayed | `API-evidence-add-link` (reachability check async; not an endorsement) | `A` | Unreachable → advisory | stay | K · C0 |
| ACT-EVD-04 | "Ask someone to attest" · CAND-09 | CAND own | Evidence exists; no open request to same person | Attester name 2–80, email, relationship (select), message ≤500 | `API-verification-create-attestation-request`: hashed token, 14-day expiry (INV-T05, BR-T004) | `I` chip "Requested 3 Nov" + `T` | Own email blocked; rate cap 10/day | stay | K · C1 (email preview) |
| ACT-EVD-05 | "Edit" · CAND-09 | CAND own | Not revoked | Same rules as ACT-EVD-01 | `API-evidence-update` with `If-Match`; material edits create a new revision and the prior attestation stays bound to the old revision [OPEN-UX-25] | `A` | 412 conflict; warning if attested | stay | K, E · C2 when attested |
| ACT-EVD-06 | "Archive" · CAND-07/09 | CAND own | — | Optional reason | `API-evidence-archive` (soft); dependents recomputed (BR-T005) | `T` Undo | — | → CAND-07 | K · U8 |
| ACT-EVD-07 | "Dispute this status" · CAND-09 | CAND own | Rung revoked or contested | Message ≤2000; attachments | `API-verification-create-dispute` → moderation queue | `I` status "Under review" | — | stay | K · C1 |
| ACT-EVD-08 | "Retry upload" · CAND-08/09 | CAND | Upload failed | — | `API-evidence-upload-init` (resume where possible) | Byte bar | Repeat failure → report problem link | stay | K · C0 |
| ACT-EVD-09 | "Discard draft" · CAND-08 | CAND | Local draft exists | — | Local delete only | `T` | — | → CAND-07 | — · C2 if non-empty |
| ACT-EVD-10 | "Link to skill" · CAND-07/09/14 | CAND own | — | 1–10 taxonomy skills | `API-evidence-link-skill`; confidence recompute async | `A` | — | stay | N · C0 |
| ACT-EVD-11 | "Download file" · CAND-09 | CAND own | Artifact clean | — | `API-evidence-get-artifact-url` (short-lived signed URL; audited) | Browser download | Expired link → regenerate | stay | R · C0 |
| ACT-EVD-12 | "How was this checked?" · CAND-09 / SHELL-11 | Any with access | — | — | `API-evidence-get-provenance` | Panel | — | stay | R · C0 |

## 5. VER — work-history verification (8)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-VER-01 | "Verify this role" · CAND-11 | CAND | Claim exists | Choose route: Ask a referee / Confirm with work email | Navigation only | — | — | → ACT-VER-02 or ACT-VER-05 | R · C0 |
| ACT-VER-02 | "Send request" · CAND-12 | CAND | <3 open requests per claim | Referee name 2–80; email valid, ≠ own; relationship (select) + period; message ≤500; language | `API-verification-create-reference-request`: hashed single-use token bound to this request; 14-day expiry; email via provider port (ADR-T20) | `I` "Requested on 3 Nov. We'll tell you when Priya responds." | Invalid/duplicate email; F-429 | → CAND-11 | K · C1 |
| ACT-VER-03 | "Send reminder" · CAND-11/13 | CAND | ≥3 days since last send and <2 reminders (BR-T004) | — | `API-verification-remind` | `T` | Disabled with reason ("2 of 2 reminders used") | stay | K · C0 |
| ACT-VER-04 | "Cancel request" · CAND-11/13 | CAND | Open request | — | `API-verification-cancel`: token invalidated | `T` | — | stay | K · C2 |
| ACT-VER-05 | "Confirm with work email" · CAND-11 | CAND | Employer-domain email; not free-mail | Work email | `API-verification-create-email-challenge` (code hashed) | `I` | Free-mail domain → use referee route | → ACT-VER-06 | K · C0 |
| ACT-VER-06 | "Enter code" · CAND-11 | CAND | Challenge open | 6-digit code | `API-verification-confirm-email-challenge`; copy: "You control an email at acme.com. This does not prove employment on its own." Rung effect decided by server | `A` | 5 attempts then lock | stay | N · C0 |
| ACT-VER-07 | "Respond to dispute" · CAND-13 | CAND | Dispute open | Text ≤2000; files | `API-verification-respond` | `T` | — | stay | K · C1 |
| ACT-VER-08 | "Send a new request" · CAND-11/13 | CAND | Previous expired/declined | As ACT-VER-02 | New request, old one stays closed | `I` | — | stay | K · C1 |

## 6. REF — referee flow, no account (6)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-REF-01 | Open emailed link · SHELL-09 | REFEREE | Token valid | `#k` secret, or 8-char code if fragment missing | `API-verification-get-request-public` returns only candidate name + claim summary; `no-store`; referrer suppressed; secret never echoed | Skeleton → form | Invalid/used/expired/cancelled → neutral SHELL-10 (never reveals requester) | Focus `h1` | R · C0 |
| ACT-REF-02 | "Send my confirmation" · SHELL-09 | REFEREE | Form valid | Relationship confirm (radio); dates/title (Yes / Partly / No each); optional comment ≤1000; typed name; checkbox "This is from my own knowledge" | `API-verification-submit-attestation`: token consumed (INV-T05); result recorded; evidence becomes **Peer-attested** only via server transition; event `verification.completed` | Page "Thank you" + `A` | Already used → SHELL-10 neutral; network loss → entries retained locally, Retry | → SHELL-10 | K (token-bound) · C1 |
| ACT-REF-03 | "I can't confirm this" · SHELL-09 | REFEREE | — | Reason radio (don't know them / can't confirm / prefer not to say) | `API-verification-decline` | `I` | — | → SHELL-10 | K · C2 |
| ACT-REF-04 | "This isn't for me / report" · SHELL-09 | REFEREE | — | Text ≤500 | `API-safety-create-report-public` (rate limited) | `I` | — | → SHELL-10 | K · C1 |
| ACT-REF-05 | "Send me a new link" · SHELL-10 | REFEREE | Expired link | None (link goes only to the original address; UI never accepts a new email) | `API-verification-resend-link` (neutral, rate limited) | `I` neutral | F-429 | stay | K · C0 |
| ACT-REF-06 | Language select · SHELL-09/10 | REFEREE | — | Locale | Local | `A` | — | stay | R · C0 |

## 7. LRN — learning (11)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-LRN-01 | "Enrol" / "Start course" · LRN-03 | CAND | Free or entitled; prerequisites met | — | `API-learning-enrol` | `T` | Prerequisites missing → list; course full | → LRN-04 first lesson | K · C0 |
| ACT-LRN-02 | "Continue" · LRN-01/05 | CAND | Enrolled | — | `API-learning-get-lesson` (resume point from server) | Skeleton | Lesson unpublished → next lesson | → LRN-04 | R · C0 |
| ACT-LRN-03 | "Submit answers" quiz · LRN-04 | CAND | Quiz lesson | Per question type | `API-learning-submit-quiz` (server scoring) | `I` result | O-x | stay / next | K · C0 |
| ACT-LRN-04 | "Save note" · LRN-04 | CAND | — | ≤2000 chars | `API-learning-save-note`; O-q (notes are in ADR-T10 set) | Badge "Waiting to sync" | — | stay | K · C0 |
| ACT-LRN-05 | "Mark complete" / auto at criteria · LRN-04 | CAND | Criteria met (e.g. quiz passed; media finished as reported by player) | — | `API-learning-record-progress`: server verifies criteria; progress UI updates **only after** confirmation | `A` "Lesson 3 complete" | O-x → "Will record when you're online" is NOT shown; progress stays unchanged | Next lesson | K · C0 |
| ACT-LRN-06 | "Add to my evidence" · LRN-05 | CAND | Course complete | Optional description | `API-evidence-create-from-course`: issuer-linked; rung from server per issuer authority [OPEN-UX-26] | `I` | Not eligible → reason | → CAND-09 | K · C1 |
| ACT-LRN-07 | "Buy course" · LRN-03 | CAND | Paid course; billing mode on | — | `API-billing-create-checkout` → Stripe; access only after verified webhook (INV-T17) | Redirect | Checkout cancelled → return page | → ACC-13 | K · C1 (price, currency, refund policy) |
| ACT-LRN-08 | "Request refund" · LRN-05 | CAND | Within refund window | Reason | `API-billing-request-refund` | `I` | Outside window → disabled with reason | stay | K · C2 |
| ACT-LRN-09 | "Submit review" · LRN-03 | CAND | ≥50 % complete | Stars 1–5; text ≤1000 | `API-learning-create-review` (moderated) | `T` | — | stay | K · C0 |
| ACT-LRN-10 | "Start path" · LRN-06 | CAND | — | — | `API-learning-start-path` | `T` | — | → first step | K · C0 |
| ACT-LRN-11 | "Report content" · LRN-03/04 | Any | — | Reason; text | `API-safety-create-report` | `T` | — | stay | K · C1 |

## 8. ASM — assessments (10)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-ASM-01 | "Start assessment" · LRN-07/08 | CAND | Online; prerequisites; attempts left; window open | Checkbox "I have read the rules" (AI policy, integrity monitoring, timing) | `API-assessment-start-attempt`: server timer starts; AI gateway blocks if `AI_PROHIBITED` (INV-T06) | `A` | Attempt in progress → resume; offline → disabled "Needs connection" | → LRN-09 | K · C1 |
| ACT-ASM-02 | Answer control · LRN-09 | CAND | Attempt active | Per question type | `API-assessment-save-answer` (debounced 2 s, sequence number); server timer authoritative | Text "Saved 14:02" (not announced each time) | Offline: buffer locally with banner; on expiry server grades what it holds; may be unsaved → shown honestly | stay | K (seq) · C0 |
| ACT-ASM-03 | "Flag for review" · LRN-09 | CAND | — | — | Local + `API-assessment-flag-question` | `A` | — | stay | N · C0 |
| ACT-ASM-04 | "Run code" · LRN-09 | CAND | Code question; sandbox runner available (ADR-T13) | Code ≤50 KB | `API-assessment-run-code` (isolated, network-less) | Indeterminate output panel | Runner unavailable → disabled with reason; submission is marked **Unverified** | stay | K · C0 |
| ACT-ASM-05 | "Submit attempt" · LRN-09 | CAND | Online | Dialog lists unanswered/flagged counts | `API-assessment-submit-attempt` (irreversible) | `A` | Time expired → auto-submit with saved answers; offline → blocked with reason, server timer continues | → LRN-10 | K · C2 |
| ACT-ASM-06 | "Pause" / "Leave attempt" · LRN-09 | CAND | Only if assessment permits | — | `API-assessment-pause` / `-abandon` | `I` | Not permitted → explanation | → LRN-08 | K · C2 |
| ACT-ASM-07 | "View result" · LRN-07/10 | CAND own | Scored | — | `API-assessment-get-result` | — | `Unverified` shows honest note | stay | R · C0 |
| ACT-ASM-08 | "Ask for a review" · LRN-11 | CAND own | Review requested or result contested | Statement ≤2000 | `API-assessment-create-appeal` → human review (INV-T20) | `I` "Review requested" | — | stay | K · C1 |
| ACT-ASM-09 | "Request accommodation" · LRN-08 | CAND | Before start | Type (extra time, breaks, assistive tech, other), note ≤1000, optional document | `API-assessment-request-accommodation`; reviewer approves; applied server-side to timer | `I` status | — | stay | K · C1 |
| ACT-ASM-10 | "Add to my evidence" · LRN-10 | CAND own | Passed and verifiable (not Unverified) | — | `API-evidence-create-from-assessment`; rung by server | `I` | Not eligible → reason | → CAND-09 | K · C1 |

## 9. JOB — discovery (11)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-JOB-01 | Search box / "Search jobs" · OPP-01 | Any | — | Keywords ≤200; filters (skills, location/remote, type, seniority, posted) | `API-search-jobs` cursor pagination; match summary only when signed in | `A` "42 jobs" | O-c last results | URL updates | R · C0 |
| ACT-JOB-02 | Filter chips / "Clear filters" · OPP-01 | Any | — | — | Query state in URL | `A` count | — | stay | R · C0 |
| ACT-JOB-03 | "Save search" · OPP-01 | CAND | Signed in | Name 1–60 | `API-search-save` | `T` | Limit reached | stay | K · C0 |
| ACT-JOB-04 | "Alert me" · OPP-01/04 | CAND | Signed in | Frequency (instant / daily / weekly); channel (in-app, email, push) | `API-notify-create-alert`; email only with consent | `T` | Push unsupported → explainer | stay | K · C0 |
| ACT-JOB-05 | "Why this matched" · OPP-01/02 | Signed-in | — | — | `API-matching-explain`: strengths, gaps, missing information, confidence, inputs; payment is never an input (INV-T19) | Panel | Unavailable → "Not enough information to explain this match" | stay | R · C0 |
| ACT-JOB-06 | "Share" · OPP-02 | Any | — | — | Web Share / copy link | `A` "Link copied" | Share unsupported → copy | stay | R · C0 |
| ACT-JOB-07 | "Save job" toggle · OPP-01/02 | CAND | — | — | `API-jobs-save` (optimistic) | `A` | Revert on failure | stay | N · C0 |
| ACT-JOB-08 | "Not interested" · OPP-01/02 | CAND | — | Optional reason | `API-jobs-hide` (affects recommendations only) | `T` Undo | — | stay | N · U8 |
| ACT-JOB-09 | "Report job" · OPP-02 | Any | — | Reason; text | `API-safety-create-report` | `T` | — | stay | K · C1 |
| ACT-JOB-10 | "Edit/Delete alert" · OPP-03/04 | CAND own | — | As ACT-JOB-04 | `API-notify-update-alert` / `-delete-alert` | `T` | — | stay | K · C2 for delete |
| ACT-JOB-11 | "Follow company" · OPP-02/05 | CAND | — | — | `API-jobs-follow-org` | `A` | — | stay | N · C0 |

## 10. APP — applying (10)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-APP-01 | "Apply" · OPP-02 | CAND | Job published; no active application (BR-T001); signed in | — | `API-applications-create-draft` | Skeleton | Existing application → "View your application"; job closed → explanation | → OPP-06 | K · C0 |
| ACT-APP-02 | Autosave / "Save draft" · OPP-06 | CAND | — | Any | `API-applications-save-draft` with `If-Match`; O-q | Badge "Saved" / "Waiting to sync" | 412 conflict | stay | K, E · C0 |
| ACT-APP-03 | "Submit application" · OPP-06 | CAND | Online; required fields; job open | Résumé variant; ≤10 evidence items; consent selection; screening answers (types per job); contact details prefilled from profile (3.3.7) | `API-applications-submit`: SM-APPLICATION → submitted; event `application.submitted`; consent scope created for chosen evidence (INV-T15); email receipt | `I` persistent confirmation "Submitted. You can withdraw any time before a decision." + `N` | Job closed meanwhile → draft retained, message; idempotent replay shown as normal success | → OPP-08 | K · C1 (review step) |
| ACT-APP-04 | "Withdraw application" · OPP-08 | CAND own | Not terminal | Optional reason | `API-applications-withdraw`: terminal; consent scopes tied to it end | `T` | — | → OPP-07 | K · C2 |
| ACT-APP-05 | "Confirm this time" · OPP-09 | CAND own | Slots offered | Slot | `API-applications-select-slot` (atomic) | `I` + ICS link | Slot taken → refreshed list with message | stay | K · C1 |
| ACT-APP-06 | "Suggest other times" · OPP-09 | CAND own | — | Up to 3 windows with time zone; note ≤300 | `API-applications-propose-times` | `I` | — | stay | K · C0 |
| ACT-APP-07 | "Accept offer" · OPP-10 | CAND own | Offer active | Confirm checkbox | `API-applications-respond-offer` (accept) | `I` | Expired → explanation | stay | K · C2, SU |
| ACT-APP-08 | "Decline offer" · OPP-10 | CAND own | — | Optional reason | `API-applications-respond-offer` (decline) | `I` | — | stay | K · C2 |
| ACT-APP-09 | "Choose evidence to share" · OPP-06 | CAND | — | Select ≤10 own items; preview of what the employer will see | `API-applications-attach-evidence` records consent scope id | `A` count | Item still scanning → excluded with note | stay | K · C1 |
| ACT-APP-10 | "Choose résumé" · OPP-06 | CAND | ≥1 variant | Select | Draft update | `A` | — | stay | N · C0 |

## 11. HIRE — job management (10)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-HIRE-01 | "Post a job" · HIR-01/02/20 | REC, ORGADM | Seat and plan allow | Blank or template | `API-jobs-create-draft` | Skeleton | Plan quota → plan explainer | → HIR-03 | K · C0 |
| ACT-HIRE-02 | "Save draft" · HIR-03 | REC, ORGADM | — | Title 5–120; description ≥50 chars; location/remote; type; salary range (optional; mandatory where law requires [OPEN]); skills 1–15 (must / nice); screening ≤10 questions | `API-jobs-update` with `If-Match` | `A` "Saved" | 412 conflict; O-x | stay | K, E · C0 |
| ACT-HIRE-03 | "Publish job" · HIR-03 | REC, ORGADM | Required fields complete | Checkbox "Content is accurate and decisions will be made by people" | `API-jobs-publish`: SM-JOB; content lint may route to review; event `job.published` | `I` + `T` | Blocked content → "Pending review" status with reason | → HIR-02 | K · C1 |
| ACT-HIRE-04 | "Pause" · HIR-02/03 | REC, ORGADM | Published | Optional reason | `API-jobs-pause` | `T` | — | stay | K · C2 (applicants see paused) |
| ACT-HIRE-05 | "Close job" · HIR-02/03 | REC, ORGADM | Published/paused | Reason (filled, cancelled, other); optional notify applicants (template) | `API-jobs-close` (applications continue to be handled by people) | `T` | — | stay | K · C2 |
| ACT-HIRE-06 | "Duplicate" · HIR-02 | REC, ORGADM | — | — | `API-jobs-duplicate` | `T` | — | → HIR-03 | K · C0 |
| ACT-HIRE-07 | "Use template" · HIR-03/04 | REC, ORGADM | — | Template select | Editor prefill | `A` | — | stay | R · C0 |
| ACT-HIRE-08 | "Add question" · HIR-03 | REC, ORGADM | — | Text ≤300; type; required toggle; "flag for review if answer is X" (flag only; **no auto-reject**, INV-T09) | In job draft | `A` | — | stay | N · C0 |
| ACT-HIRE-09 | "Archive" · HIR-02 | REC, ORGADM | Closed | — | `API-jobs-archive` | `T` Undo | — | stay | K · U8 |
| ACT-HIRE-10 | "Save as template" · HIR-03/04 | REC, ORGADM | — | Name 1–60 | `API-jobs-create-template` | `T` | — | stay | K · C0 |

## 12. PIPE — pipeline, review, offers, search (19)

Stage changes follow SM-APPLICATION only (INV-T11). "Adverse" = moves to a terminal "Not moving forward" state: always a named human actor, reason category, never triggered by score, rank or AI (INV-T09).

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-PIPE-01 | Drag card to column · HIR-05 | REC, HM (assigned) | Pointer; transition allowed by SM | Target column | `API-applications-move-stage` with `from_stage` and `If-Match`; event `application.stage.changed`; candidate notified by template | `A` "Moved to Interview, position 2 of 7" | Stale `from_stage` → card snaps back with "Moved to X by Dana 1 min ago" + "Apply my move"; terminal/not allowed → drop refused with reason | Card in new column; focus stays on card | K, E · C0 forward; C2 adverse |
| ACT-PIPE-02 | "Move to…" menu · HIR-05/06/14 | REC, HM (assigned) | Always (non-drag path, 2.5.7) | Stage select (only legal targets listed) | As ACT-PIPE-01 | As above | As above | Same | K, E · same |
| ACT-PIPE-03 | "Move selected" · HIR-05 | REC | 1–200 selected | Target stage | Bulk op `API-applications-bulk-move`; per-item results (UI-07 §4) | Dialog with count/sample/ineligible list, then HIR-12 | Per-item skipped/failed | → HIR-12 | K per item · C2 |
| ACT-PIPE-04 | "Message selected" · HIR-05/13 | REC | Candidates contactable (consent); quota ≥ count | Template + personalisation preview; message ≤1500 | Bulk op `API-messaging-bulk-send`; quota decrement | Preview + quota shown ("38 of 100 left") | Not contactable → skipped with reason | → HIR-12 | K per item · C2 |
| ACT-PIPE-05 | "Not moving forward…" · HIR-05/06 | REC (HM where permitted) | Human selects each candidate; no preselection by score | Reason category (select, required), optional note ≤1000, message template (respectful default), checkbox "I reviewed these N candidates" | Single or bulk op `API-applications-close-out`; SM → terminal; candidate sees "Not moving forward" with the category | Confirmation dialog lists names | Item changed meanwhile → skipped | Row moves to closed list | K per item · C2 (typed N for ≥ 20) |
| ACT-PIPE-06 | "Assign reviewer" · HIR-05/06 | REC, ORGADM | — | Org member with HM/REC role | `API-applications-assign` | `T` | Member lacks access → listed reason | stay | K · C0 |
| ACT-PIPE-07 | "Schedule interview" · HIR-06/09 | REC, HM | Stage allows | Panel (≥1), ≥1 slot, duration 15–240 min, mode, link/location, time zone shown | `API-applications-create-interview`; invites + ICS | `I` + `N` to candidate | Calendar conflict warning | stay | K · C1 |
| ACT-PIPE-08 | "Add note" · HIR-06 | REC, HM | — | ≤5000 chars; internal only; hint text discourages sensitive-attribute remarks | `API-applications-add-note`; O-q (notes) | Badge "Waiting to sync" if offline | — | stay | K · C0 |
| ACT-PIPE-09 | "Submit scorecard" · HIR-10 | REC, HM (panel) | Interview complete | Ratings 1–5 per job-linked criterion with anchors; comment required for 1 and 5; overall recommendation (advice, not decision) | `API-applications-submit-scorecard`; immutable after submit | `T` | Late edit → addendum only | → HIR-06 | K · C2 |
| ACT-PIPE-10 | "Create offer" · HIR-06 | REC | Stage allows | Role, compensation, start date, expiry ≥3 days | `API-applications-create-offer` (draft) | `T` | — | → HIR-11 | K · C0 |
| ACT-PIPE-11 | "Send offer" · HIR-11 | REC (approver per policy [OPEN]) | Draft valid | Review summary | `API-applications-send-offer`; candidate notified | `I` | Approval pending → disabled with reason | → HIR-06 | K · C2 |
| ACT-PIPE-12 | "Mark as hired" · HIR-06 | REC | Offer accepted | Start date confirm | `API-applications-mark-hired` | `T` | — | stay | K · C2 |
| ACT-PIPE-13 | "Add to shortlist" · HIR-05/06/07 | REC, HM | Live consent scope exists | List select/create | `API-applications-add-shortlist` | `A` | No consent → disabled "Candidate hasn't shared this profile" | stay | N · C0 |
| ACT-PIPE-14 | "Request access" · HIR-06/07 | REC | Evidence hidden by consent | Message ≤300 | `API-privacy-create-access-request` → candidate notification (never auto-granted) | `I` "Requested" | Duplicate pending → shown | stay | K · C1 |
| ACT-PIPE-15 | "Search" · HIR-07 | REC, ORGADM | Entitlement | Skills, minimum rung, location, availability | `API-search-candidates`; discoverable + consented only; explanation + uncertainty; payment never a ranking input (INV-T19) | `A` count | Quota → message | stay | R · C0 |
| ACT-PIPE-16 | "View evidence" · HIR-06 | REC, HM | Live consent scope | — | `API-evidence-list-consented`; view audited and visible in candidate access log | — | Scope revoked mid-view → hidden on next fetch with notice | stay | R · C0 |
| ACT-PIPE-17 | "Compare" · HIR-05/14 | REC, HM | 2–4 selected | — | `API-applications-compare` (criteria columns; no total score) | — | Consent-hidden columns shown as locked | → HIR-14 | R · C0 |
| ACT-PIPE-18 | "Export" · HIR-05/18 | REC, ORGADM | — | Field allowlist; date range | `API-analytics-export` (job; no sensitive attributes) | Indeterminate + notify | — | Download | K · C0 |
| ACT-PIPE-19 | "Cancel remaining" / "Retry failed" · HIR-12 | Initiator, ORGADM | Op running / failures exist | — | `API-platform-cancel-operation` / `-retry-failed`; completed items are not rolled back | `A` | — | stay | K · C2 (cancel) |

## 13. MSG — messaging (7)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-MSG-01 | "Send" · MSG-02/03, OPP-08 | Participants | Recipient contactable; thread open | Text ≤4000; ≤3 attachments | `API-messaging-send` with client message id; O-q (compose is in ADR-T10 set) | Bubble "Not sent yet" until server accepts | Consent withdrawn/blocked → disabled with reason; moderation hold shown | stay; composer cleared only after accept | K · C0 |
| ACT-MSG-02 | Open thread / "Mark read" · MSG-01 | Participant | — | — | `API-messaging-mark-read` (optimistic) | — | Revert silently | stay | N · C0 |
| ACT-MSG-03 | "Mute" · MSG-01/02 | Participant | — | Duration (1 h, 8 h, forever) | `API-messaging-mute` | `T` | — | stay | N · C0 |
| ACT-MSG-04 | "Archive" · MSG-01/02 | Participant | — | — | `API-messaging-archive` (optimistic) | `T` Undo | — | stay | N · U8 |
| ACT-MSG-05 | "Report message" · MSG-02 | Participant | — | Reason; text | `API-safety-create-report` | `T` | — | stay | K · C1 |
| ACT-MSG-06 | "Contact" / "Send outreach" · HIR-07/13, SHELL-08 | REC, ORGADM | Candidate discoverable and contactable; quota | Template + message ≤1500; role link | `API-messaging-send-outreach`; quota decrement; candidate can mute/block | `I` | Not contactable → disabled with reason; quota → message | → MSG-02 | K · C1 |
| ACT-MSG-07 | "Attach file" · MSG-02 | Participant | — | Allowlisted types ≤10 MB | Upload + scan | Byte bar → scanning | Blocked | stay | K · C0 |

## 14. NTF and NET — notifications and network (8)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-NTF-01 | Open notification / "Mark read" · MSG-04 | Authed | — | — | `API-notify-mark-read` (optimistic) | — | Revert | Deep link target | N · C0 |
| ACT-NTF-02 | "Mark all read" · MSG-04 | Authed | Unread >0 | — | `API-notify-mark-all-read` | `T` Undo | — | stay | N · U8 |
| ACT-NTF-03 | Preference toggles · ACC-04 | Authed | — | Category × channel; security and legal notices cannot be disabled (explained) | `API-notify-update-preferences` | `I` "Saved" (switch states in text) | — | stay | N · C0 |
| ACT-NTF-04 | "Turn on notifications" · ACC-04/06 | Authed | Web Push supported; on iOS only in installed PWA, after explicit tap (FF-09, RES-01 R2) | Browser permission | `API-notify-register-push` (VAPID subscription) | `I` | Denied → how to change; unsupported → explanation, email fallback | stay | K · C0 |
| ACT-NTF-05 | "Quiet hours" · ACC-04 | Authed | — | Start/end, time zone | `API-notify-update-preferences` | `I` | — | stay | N · C0 |
| ACT-NET-01 | "Connect" · MSG-05/06 [flag] | CAND | Feature on | Note ≤200 | `API-network-request` | `T` | Rate cap | stay | K · C0 |
| ACT-NET-02 | "Accept" / "Decline" · MSG-06 [flag] | CAND | Pending request | — | `API-network-respond` | `T` | — | stay | K · C0 |
| ACT-NET-03 | "Ask to mentor me" · MSG-07 [flag, OPEN-UX-17] | CAND | Permissions defined | Note ≤500 | `API-network-request-mentor` | `T` | Blocked until OPEN-UX-17 | stay | K · C1 |

## 15. ACC — account and settings (11)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-ACC-01 | "Change email" · ACC-02 | Authed | — | New email valid; code sent to new address; notice to old address | `API-identity-change-email` | `I` | Email in use → neutral | stay | K · SU |
| ACT-ACC-02 | "Change password" · ACC-02 | Authed | Has password | New password per policy | `API-identity-change-password`; other sessions revoked | `T` | Breached → field message | stay | K · SU |
| ACT-ACC-03 | "Rename/Remove passkey" · ACC-02 | Authed | At least one other sign-in method remains | Nickname 1–40 | `API-identity-passkey-update` / `-delete` | `T` | Last method → disabled with reason | stay | K · C2 (remove), SU |
| ACT-ACC-04 | "Sign out this device" · ACC-03 | Authed | Not current device (current uses ACT-AUTH-09) | — | `API-identity-revoke-session` | `T` | — | stay | K · C2 |
| ACT-ACC-05 | "Sign out all other devices" · ACC-03 | Authed | ≥2 sessions | — | `API-identity-revoke-other-sessions` | `T` | — | stay | K · C2 |
| ACT-ACC-06 | Display preferences · ACC-05 | Anyone (device-local when anon) | — | Language, theme, contrast, motion, density | `API-identity-update-preferences` + device fallback | Instant apply, `A` | — | stay | N · C0 |
| ACT-ACC-07 | "Clear saved data on this device" · ACC-06 | Authed | — | — | Clears service-worker caches and local drafts; automatic on logout | `T` | Queue non-empty → list items first | stay | — · C2 if queue non-empty |
| ACT-ACC-08 | "Install app" · ACC-06 / install card | Authed | `beforeinstallprompt` available or iOS instructions (FF-09) | — | Browser install prompt | `A` | Unsupported → instructions or "not needed" | stay | — · C0 |
| ACT-ACC-09 | "Connect"/"Disconnect" · ACC-14 | CAND, ORGADM | DOM-23 enabled | Provider consent screen | `API-integrations-connect` / `-disconnect` | `T` | Provider error | stay | K · C1 |
| ACT-ACC-10 | "Pause my account" · ACC-15 | CAND | Active | Optional reason; prompts about active applications | `API-identity-pause`: profile hidden, outreach stopped; data kept | `I` banner | — | → ACC-15 | K · C2 |
| ACT-ACC-11 | "Reactivate" · login / ACC-15 | CAND | Paused | Re-consent if terms/privacy version changed | `API-identity-reactivate` | `T` | — | → `/me` | K · C1 |

## 16. BIL — billing (6)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-BIL-01 | "Choose plan" · ACC-08 | CAND, ORGADM, INSTADM | `BILLING_MODE` enabled (else plans hidden with explanation) | Plan; seats (org) ≥ used; currency | `API-billing-create-checkout` → Stripe Checkout; redirect success grants nothing (INV-T17) | Redirect | Stripe error → return with message | → Stripe → ACC-13 | K · C1 (price, renewal date, cancellation terms) |
| ACT-BIL-02 | Return page · ACC-13 | Purchaser | After redirect | — | Polls `API-billing-get-checkout-status` with backoff to 60 s; entitlements appear only from server state | `A` "Confirming your payment…" then "Plan active" | >60 s → "Still confirming; we'll email you" | → ACC-07 | R · C0 |
| ACT-BIL-03 | "Manage billing" · ACC-07/12 | Payer | Customer exists | — | `API-billing-create-portal-session` | Redirect | — | Stripe portal | K · C0 |
| ACT-BIL-04 | "Cancel plan" · ACC-07 | Payer | Active | Reason optional | `API-billing-cancel` (end of period) | `I` "Ends on 12 Jan" | — | stay | K · C2 |
| ACT-BIL-05 | "Change seats" · ACC-07 | ORGADM, INSTADM | — | Integer ≥ used seats, ≤1000 | `API-billing-update-seats`; proration preview from Stripe | `I` | Below used → disabled with reason | stay | K · C1, SU |
| ACT-BIL-06 | "Download invoice" · ACC-12 | Payer | — | — | `API-billing-get-invoice-url` | Download | — | stay | R · C0 |

## 17. PRV — privacy and consent (9)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-PRV-01 | "Allow" · ACC-09, OPP-06 | CAND, INST (own) | Request exists or proactive share | Purpose (from versioned list); recipient; data categories/ids; duration (30 / 90 / 365 days or until revoked) | `API-privacy-grant`: versioned ConsentRecord (INV-T15); event `consent.changed` | `I` plain summary ("Acme can see 3 evidence items until 12 Jan; change anytime") + `T` | Stale consent version → reload and re-confirm | stay | K, E · C1 |
| ACT-PRV-02 | "Stop sharing" · ACC-09 | CAND own | Active scope | — | `API-privacy-revoke`: effective for new reads at once; copy: data already downloaded cannot be recalled [OPEN-08] | `I` | — | stay | K · C2 |
| ACT-PRV-03 | Filters · ACC-10 | CAND own, ORGADM (O) | — | Date, actor type | `API-privacy-list-access-log` | `A` count | — | stay | R · C0 |
| ACT-PRV-04 | "Request my data" · ACC-11 | CAND, INST | — | Categories; format JSON/CSV | `API-privacy-create-export` (job) | `I` "We're preparing this; we'll notify you" (no % bar) | — | stay | K · SU |
| ACT-PRV-05 | "Download" · ACC-11 | Requester | Ready; link valid 7 days | — | Signed URL | Download | Expired → request again | stay | K · SU |
| ACT-PRV-06 | "Delete my account" · ACC-11/15 | CAND, INST | — | Typed "DELETE"; export offered first; retained-record notice (OPEN-08) | `API-privacy-create-erasure`; account paused; completes ≤30 days (BR-T060); event `erasure.completed` | `I` persistent receipt with date | — | → ACC-11 status | K · C3, SU |
| ACT-PRV-07 | "Cancel deletion" · ACC-11 | Requester | Within cancellation window [OPEN-UX-27] | — | `API-privacy-cancel-erasure` | `T` | Window passed → disabled with date | stay | K · C2 |
| ACT-PRV-08 | "Ask for a person to review this" · OPP-08, LRN-11 | CAND | Any automated score/ranking/flag affecting them | Text ≤2000 | `API-privacy-create-review-request` → human | `I` | — | stay | K · C1 |
| ACT-PRV-09 | Cookie/analytics preferences · SHELL-16, ACC-09 | Anyone | — | Essential (locked on); analytics off by default | Local + `API-privacy-set-cookie-prefs` | `A` | — | stay | N · C0 |

## 18. ORG — organization administration (9)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-ORG-01 | "Invite" · HIR-15/20 | ORGADM | Seats available | 1–50 emails; role select | `API-orgs-create-invites` (bulk op if >10) | `I` | Seat limit → explanation without upsell pressure | stay | K · C1 |
| ACT-ORG-02 | "Change role" · HIR-15, ADM-21 | ORGADM, INSTADM | Not last owner | Role select | `API-orgs-update-member`; audited; effective on next request | `T` | Last owner → disabled with reason | stay | K, E · C2, SU |
| ACT-ORG-03 | "Remove" · HIR-15 | ORGADM | Not last owner | Reassign owned jobs/applications | `API-orgs-remove-member`; org-scope sessions revoked | `T` | — | stay | K · C2 |
| ACT-ORG-04 | "Save SSO" / "Enforce SSO" · HIR-16 | ORGADM | — | Issuer/metadata, client id; test login required before enforce; break-glass owner retained | `API-identity-sso-config` | `I` | Invalid metadata; enforce blocked without passing test | stay | K · C2, SU |
| ACT-ORG-05 | "Assign seat" · HIR-15 | ORGADM | Seat free | Member, seat type | `API-billing-assign-seat` | `T` | — | stay | K · C0 |
| ACT-ORG-06 | "Export audit" · HIR-17 | ORGADM, AUD | — | Range ≤90 days, filters | `API-admin-export-audit-org` (job) | Indeterminate + notify | — | Download | K · C0 |
| ACT-ORG-07 | "Transfer ownership" · HIR-16 | Owner | Recipient is admin | Typed org name | `API-orgs-transfer-owner` | `I` | — | stay | K · C3, SU |
| ACT-ORG-08 | "Save organization" · HIR-16 | ORGADM | — | Name; logo ≤1 MB; accent colour must meet 4.5:1 text contrast on white or is rejected with a suggested colour | `API-orgs-update` | `T` | — | stay | K, E · C0 |
| ACT-ORG-09 | "Update request" · HIR-19 | ORGADM | Request from own employee | Status, note | `API-privacy-update-request`; SLA clock | `T` | — | stay | K · C1 |

## 19. INS — institution workspace (8)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-INS-01 | "New cohort" · ADM-17/18 | INSTADM | — | Name, term dates, programme, consent-notice template | `API-institutions-create-cohort` | `T` | — | → ADM-19 | K · C0 |
| ACT-INS-02 | "Invite learners" · ADM-18/19 | INSTADM | — | CSV ≤500 rows or paste emails; header check | Bulk op `API-institutions-invite-learners` | Op status page | Invalid rows listed | → op status | K per item · C1 |
| ACT-INS-03 | "Issue credential" · ADM-20 | INSTADM (FAC requests) | Learner met criteria (human confirms) | Credential type, learners, issue date | `API-evidence-issue-credential` → evidence becomes **Verified by `<Institution>`** via server transition; event | Op status | Learner not found → skipped | stay | K per item · C2 |
| ACT-INS-04 | "Revoke credential" · ADM-20 | INSTADM | Issued | Reason required | `API-evidence-revoke-credential`; dependents recompute (BR-T005); learner notified | `T` | — | stay | K · C2, SU |
| ACT-INS-05 | Cohort coverage view · ADM-17/19 | INSTADM, FAC | — | Skill/term filters | `API-institutions-get-coverage` (aggregate; small cells suppressed, OPEN-UX-21) | `A` | Small cell → "Fewer than 10 learners" | stay | R · C0 |
| ACT-INS-06 | "Export report" · ADM-19/22 | INSTADM, FAC (aggregates) | — | Fields allowlist | `API-institutions-export-report` (job) | Indeterminate + notify | — | Download | K · C0 |
| ACT-INS-07 | "Add faculty / proctor" · ADM-21 | INSTADM | — | Email; role | `API-orgs-create-invites` (institution scope) | `T` | — | stay | K · C1 |
| ACT-INS-08 | "Publish cohort notice" · ADM-19 | INSTADM | — | Consent wording selected from versioned templates (cannot free-edit legal text) | `API-privacy-publish-notice`; learners re-consent on version change | `I` | — | stay | K · C2 |

## 20. STU — instructor studio (8)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-STU-01 | "New course" · LRN-13 | INST | Instructor grant | Title 5–100; summary ≤500; level; language; category | `API-learning-create-course` (draft) | `T` | — | → LRN-14 | K · C0 |
| ACT-STU-02 | "Save lesson" · LRN-15 | INST own | — | Title; blocks; quiz items | `API-learning-update-lesson` with `If-Match` | `A` "Saved" | 412 conflict | stay | K, E · C0 |
| ACT-STU-03 | "Upload media" · LRN-15 | INST own | — | Video/audio ≤2 GB; captions (VTT) and transcript required before publish | Upload + scan + transcode | Bytes bar → "Processing" (indeterminate) | Blocked file | stay | K · C0 |
| ACT-STU-04 | "Publish course" · LRN-14 | INST own | Checklist passes (captions, evidence mapping, price, assessment policy) | Final checklist confirmation | `API-learning-publish`; event | `I` | Checklist failures listed with links | stay | K · C1 |
| ACT-STU-05 | "Unpublish" · LRN-14 | INST own | Published | — | `API-learning-unpublish` (enrolled learners keep access) | `T` | — | stay | K · C2 |
| ACT-STU-06 | "Save assessment" · LRN-16 | INST own | — | Type; AI policy (`AI_PROHIBITED` default for graded); runner type; time limit | `API-assessment-update`; AI policy locked once attempts exist | `A` | Runner unavailable → warning "results will be Unverified" (ADR-T13) | stay | K, E · C0 |
| ACT-STU-07 | "Confirm learner outcome" · LRN-17 | INST own | Learner met criteria (human decision) | Selection; note | `API-evidence-issue-course-evidence`; rung decided by server per authority [OPEN-UX-26] | Op status for bulk | Learner not eligible → skipped | stay | K per item · C2 |
| ACT-STU-08 | "Reply" · LRN-17 | INST own | — | Text ≤2000 | `API-learning-reply` | `T` | — | stay | K · C0 |

## 21. SUP — support operator (8)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-SUP-01 | "Request access" · ADM-02/03/12 | SUP, ADM | Open case id | Subject (picker), **reason code** (list), case id, scope checkboxes, duration 30 m / 1 h / 2 h / 4 h (max 4 h, BR-T041), justification ≥20 chars | `API-admin-create-grant`: audited; subject notified via access log (INV-T18); approval policy [OPEN-UX-23] | Persistent banner "Support access active until 15:20" | Over cap/no case → blocked with reason | → ADM-04 | K · C2, SU |
| ACT-SUP-02 | "End access now" · banner, ADM-04 | SUP, ADM | Grant active | — | `API-admin-end-grant`; audited | `T` | — | → ADM-02 | K · C0 |
| ACT-SUP-03 | Tabs · ADM-04 | SUP (grant holder) | Within scope and time | Tab select | `API-admin-get-user-view`: server-side masking; read-only; **no impersonation**; no tokens/secrets (INV-T14); every view event logged | `A` | Grant expired → read blocked at once; notes retained | stay | R · C0 |
| ACT-SUP-04 | "Reveal" · ADM-04 | SUP | Field is masked | Reason code + note ≥10 chars | `API-admin-unmask-field` (per-field audit); auto re-mask after 5 min | `A` | Not in scope → disabled | stay | K · C2 |
| ACT-SUP-05 | "Add note" · ADM-04 | SUP | — | ≤5000; guidance not to paste secrets | `API-admin-add-case-note` | `T` | — | stay | K · C0 |
| ACT-SUP-06 | "Update request" · ADM-04/11 | SUP (assist), ADM | Data-rights request | Status, note (cannot complete erasure alone) | `API-privacy-update-request` | `T` | Needs ADM → shows "Requires admin" | stay | K · C1 |
| ACT-SUP-07 | "Escalate" · ADM-04 | SUP | — | Team, summary | `API-admin-escalate` | `T` | — | stay | K · C1 |
| ACT-SUP-08 | "Find" · ADM-01/12 | SUP, ADM | — | Query ≥3 chars | `API-admin-search-directory`: minimal fields; rate limited; search audited | `A` count | Rate limit | stay | R · C0 |

## 22. MOD — moderation and integrity (7)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-MOD-01 | "Open case" · ADM-05 | MOD | Unassigned or mine | — | `API-safety-get-case` (assignment lock) | — | Already taken → shown | → ADM-06 | K · C0 |
| ACT-MOD-02 | "Record decision" · ADM-06 | MOD | Assigned to me | Decision (no action / warn / remove content / restrict feature / escalate); reason ≥20 chars; notify parties toggle | `API-safety-decide`: human only (INV-T09); appealable | `T` | Content changed → refresh and re-confirm | → ADM-05 | K · C2 |
| ACT-MOD-03 | "Take down" · ADM-06/14 | MOD | — | Reason; template | `API-learning-takedown` / `API-jobs-takedown` | `T` | — | stay | K · C2 |
| ACT-MOD-04 | "Ask for more information" · ADM-06/07/08/14 | MOD | — | Message to reporter/owner | `API-safety-request-info` | `T` | — | stay | K · C1 |
| ACT-MOD-05 | "Resolve review" · ADM-07 | MOD | — | Outcome (no concern / retake offered / attempt invalidated); reason; candidate notified, appeal path stated (INV-T20) | `API-assessment-resolve-review` | `T` | — | stay | K · C2 |
| ACT-MOD-06 | "Resolve dispute" · ADM-08 | MOD | — | Outcome (uphold / revoke / adjust) + reason | `API-verification-resolve-dispute`; revocation triggers BR-T005 recompute | `T` | — | stay | K · C2 |
| ACT-MOD-07 | "Decide appeal" · ADM-06 | MOD (not original decider) | Appeal open | Outcome + reason | `API-safety-decide-appeal` | `T` | Same decider → blocked | stay | K · C2 |

## 23. ADM — platform administration (9)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-ADM-01 | Flag toggle · ADM-09 | ADM | — | Flag, environment, rollout %, reason | `API-platform-update-flag`; audited | `T` | — | stay | K · C2 for production |
| ACT-ADM-02 | "Roll back" · ADM-15 | ADM | Last-known-good exists | Remote, target version | `API-platform-rollback-remote` | `I` | Incompatible with Host Contract → blocked | stay | K · C2, SU |
| ACT-ADM-03 | "Pin version" · ADM-15 | ADM | — | Remote, version | `API-platform-pin-remote` | `I` | Compat check failure | stay | K · C2, SU |
| ACT-ADM-04 | "Merge skills" · ADM-13 | ADM | — | Source, target; impact preview | `API-skills-merge`; event `skill.merged` | `I` | — | stay | K · C2 |
| ACT-ADM-05 | "Grant role" · ADM-16 | ADM | — | Role, scope, justification, expiry | `API-admin-grant-role` | `T` | — | stay | K · C2, SU |
| ACT-ADM-06 | "Revoke role" · ADM-16 | ADM | — | Reason | `API-admin-revoke-role` | `T` | — | stay | K · C2 |
| ACT-ADM-07 | "Attest review" · ADM-16 | ADM | Review due | Keep / revoke per grant | `API-admin-attest-review`; dormant (60 d) grants auto-expire | `T` | — | stay | K · C1 |
| ACT-ADM-08 | "Export" · ADM-10 | ADM, AUD | — | Range, filters | `API-admin-export-audit` (job) | Indeterminate + notify | — | Download | K · C0 |
| ACT-ADM-09 | "Publish notice" · ADM-09 | ADM | — | Message, severity, start/end | `API-platform-publish-notice` | `T` | — | stay | K · C2 |

## 24. SYS — shell and cross-cutting (10)

| ID | Trigger · screen | Actor | Visible / enabled | Input · validation | Processing | Feedback | Failure | Result · navigation | Idem · Confirm |
|---|---|---|---|---|---|---|---|---|---|
| ACT-SYS-01 | `Ctrl/⌘+K` or search button · TopBar | Authed | Always | Query ≥2 chars for records | Capability-derived entries + `API-search-workspace-records` (server-scoped) | `A` result count | Search error → nav items still available | Go to target; focus `h1` | R · C0 |
| ACT-SYS-02 | Workspace switcher · TopBar, SHELL-13 | Authed (≥2 grants) | — | Workspace | Stores last-used server-side; rebuilds nav | `A` "Switched to Acme hiring" | Grant revoked → refreshed list | → workspace home | N · C0 |
| ACT-SYS-03 | "Try again" · SHELL-14 | Any | Remote load failed | — | Re-runs `loadRemote` with backoff; uses last-known-good if available (ADR-T18) | Skeleton → content | Persistent → status link | In place | R · C0 |
| ACT-SYS-04 | "Report a problem" · SHELL-14/17, TopBar | Any | — | Description ≤2000; auto-attached trace id and route (no content); contact optional | `API-platform-create-feedback` | `T` | Offline → queued locally with notice [OPEN] | stay | K · C1 |
| ACT-SYS-05 | "Retry" / "Discard" · Sync panel, SHELL-15 | Authed | Queue non-empty | Item selection | Client queue → `API-*` per kind (application-draft, profile-edit, message-compose, note only) | `A` "3 changes synced" | Server `rejected`/`conflict` → needs-attention | stay | K · C2 for discard |
| ACT-SYS-06 | "Review changes" · conflict dialog | Authed | 412 received | Per-field choice | Re-submit merged payload with new ETag | `T` | Another conflict → repeat | stay | K, E · C1 |
| ACT-SYS-07 | "Not now" · install card | Authed | Card shown | — | Local snooze 30 days | — | — | stay | — · C0 |
| ACT-SYS-08 | "Stay signed in" · timeout dialog | Authed | ≥2 min before expiry | — | `API-identity-refresh` | `A` | Fails → re-auth overlay | stay | K · C0 |
| ACT-SYS-09 | "Keyboard shortcuts" switch · ACC-05 | Anyone | — | On/off | Local/prefs | `A` | — | stay | N · C0 |
| ACT-SYS-10 | "Help" link · TopBar, footers | Anyone | Same position everywhere (3.2.6) | — | Navigate | — | — | → SHELL-17 | R · C0 |

## 25. Totals and cross-checks

| Area | Count | Area | Count |
|---|---|---|---|
| AUTH | 14 | PIPE | 19 |
| ONB | 6 | MSG | 7 |
| PRO | 14 | NTF | 5 |
| EVD | 12 | NET | 3 |
| VER | 8 | ACC | 11 |
| REF | 6 | BIL | 6 |
| LRN | 11 | PRV | 9 |
| ASM | 10 | ORG | 9 |
| JOB | 11 | INS | 8 |
| APP | 10 | STU | 8 |
| HIRE | 10 | SUP | 8 |
| MOD | 7 | ADM | 9 |
| SYS | 10 | **Total** | **231** |

Cross-check: every consequential action class in UI-07 §6.1 ("Confirmed") carries `K` and at least `C1`; every ADR-T10 queueable action (ACT-APP-02, ACT-PRO-01, ACT-MSG-01, ACT-PIPE-08, ACT-LRN-04) is the only O-q set; no action sets an evidence rung directly (INV-T04); no action performs an adverse decision without a human actor (INV-T09).

## 26. Open items raised here

| ID | Item |
|---|---|
| OPEN-UX-25 | Behaviour of existing attestations when evidence is materially edited (new revision vs reset). |
| OPEN-UX-26 | Which rung an instructor's confirmation of course outcomes yields (matrix gives INST "A (own course evidence)" but ADR-T14 reserves authority-verified for authorities); proposed: L4 only if the instructor is an accredited issuer, else L3. |
| OPEN-UX-27 | Cancellation window for erasure requests inside the 30-day completion period (7 days proposed). |



# Patch 2026-10-27: atomic action contracts (ACT-ATOM-01..12)

All **[TARGET]**; values marked PROPOSED are not measured or ratified. These rows refine, and never replace, the base rows above. Platform dependencies: idempotency key and status-query endpoint, queue and multi-tab leader ownership: see [13_API_EVENTS_AND_INTEGRATIONS](../13_API_EVENTS_AND_INTEGRATIONS/API_DESIGN_STANDARDS.md) and [08_PWA_AND_MOBILE](../08_PWA_AND_MOBILE/OFFLINE_AND_SYNC_DESIGN.md#record-offline-and-sync-design-rev2) (pending patch). Audit event names and revocation timing are owned by [14_SECURITY_PRIVACY_COMPLIANCE](../14_SECURITY_PRIVACY_COMPLIANCE/SECURITY_ARCHITECTURE.md#record-security-rev2) (pending patch); names below are PROPOSED. Completion words (`submitted`, `committed`, `queued`...) follow the "Completion-state vocabulary" in [STATE_MACHINES](../06_BUSINESS_PROCESSES/STATE_MACHINES.md). Hazard ids UXH-* are in PROGRESSIVE_UX_AND_FEEDBACK; guard ids NAV-GRD-* in NAVIGATION_ARCHITECTURE.

**Shared columns.** *Idem key* = one UUID per user intent, created when the form opens (not on click) and reused by every retry. *Opt/Conf* = O optimistic, C confirmed, Q queued (ADR-T10). *Perm* is always re-checked on the server (INV-T11). PROPOSED defaults: request timeout 15 s, then a status query (never a blind resubmit); backoff 1/2/4/8/30 s per UI-07 sec 6.2.

| ACT-ATOM | Base ACT · actor · permission | Trigger | Enabled when | Inputs / validation | Idem key | Opt/Conf | Completion criterion | Nav / undo | Timeout / retry | Audit event (PROPOSED) | Concurrency / stale | A11y | TEST |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ATOM-01 | ACT-AUTH-04 · ANON · none | "Sign in" reached from a deep link `/login?next=` (RD-01) | Form complete | Email, password; `next` same-origin registered pattern only (RD-01) | Per submit; login is not replayed after success | C | Session cookie set AND `next` resolved | Lands on `next`, focus on `h1`; unsafe or unknown `next` goes to workspace home. No undo | 15 s then "Couldn't sign in, try again"; no auto-retry (lockout counter) | `audit.auth.login_succeeded` / `audit.auth.login_failed` | Deep link to a record the user cannot access gives RD-08/09 in place, no existence leak. Already signed in from another tab: reuse session, skip form | Error summary takes focus; lock message in polite live region; entered email kept, password cleared | TEST-ACT-001 |
| ATOM-02 | ACT-APP-03 · CAND own · `application.submit` | "Submit application" | Online, required fields valid, job open | Per ACT-APP-03; re-validated on server | `applicationId` + intent id | C | Server accepts draft to submitted (SM-APPLICATION) and confirmation page shown | To OPP-08; Withdraw (ACT-APP-04) is the reversal, no undo toast | 15 s then status query by key; repeated click or Enter returns the SAME application (replay) | `audit.application.submitted` | Job closed meanwhile: 409 `job_closed`, draft kept. Second tab submit: replay result, banner "Already submitted" | Button `aria-disabled` + text "Submitting" (stays in tab order); result announced once, polite | TEST-ACT-002 |
| ATOM-03 | ACT-APP-02 · CAND own · `application.draft.write` | Autosave; reconnect flush | Draft open | Partial allowed; field size caps | Mutation id + `If-Match` ETag per draft revision | Q | Server returns `accepted` for that mutation id; local copy then marked synced | None; Discard in Sync panel (ACT-SYS-05) | Flush on reconnect with backoff, one flusher (leader tab, platform doc); `needs-attention` after 5 failures PROPOSED | `audit.application.draft_synced` | Stale ETag opens conflict dialog (ACT-SYS-06); job closed: item `rejected`, draft kept read-only. Replayed mutation id is a no-op | Sync badge has text, not colour alone; flush result batched in a polite region (UXH-06) | TEST-ACT-003 |
| ATOM-04 | ACT-EVD-01 / ACT-EVD-09 · CAND · `evidence.create` | "Save evidence"; close or back with edits | Online | Per ACT-EVD-01; unsaved-change guard when dirty (NAV-GRD-01) | Per form open | C | Evidence row exists; files may still be `scanning` (SM-FILE); rung stays claimed (INV-T04) | Dirty close opens dialog: Keep editing / Keep local draft / Discard. Discard has no undo; local draft retained 30 d PROPOSED | 15 s then status query; uploads retried per file (ACT-EVD-08), not the whole form | `audit.evidence.created` | Edited in another tab: ETag conflict. Session expiry: ACT-AUTH-14, form preserved | Dialog focus on "Keep editing"; Escape = keep editing; focus returns to the opener | TEST-ACT-004 |
| ATOM-05 | ACT-SYS-02 · authed (>=2 grants) · membership | Workspace switcher | No blocking save, or after guard choice | Target workspace | N (set-to-value) | C | New workspace active AND capabilities refetched | To target home. In-flight mutations keep their ORIGIN workspace id; their responses are dropped from the UI, not cancelled on the server | 5 s PROPOSED to refetch; failure keeps old workspace | `audit.session.org_context_switched` | In-flight mutation: guard dialog "Finish or leave". Queued writes stay bound to the origin workspace and flush with that header (UXH-02). Other tabs get a "workspace changed" banner | "Switched to <name>" announced once; focus on new `h1` | TEST-ACT-005 |
| ATOM-06 | ACT-PIPE-01/02 · REC, HM assigned · `application.stage.move` | Drag or "Move to" | Transition legal per SM | Target stage, `from_stage`, `If-Match` | Per move | O with revert | Server accepts; card stage equals server stage | Undo U8 (8 s) where reversible; adverse moves are never optimistic (ACT-PIPE-05, INV-T09) | 15 s then status query, then refetch card | `audit.application.stage_changed` | `from_stage` mismatch: 409/412, card snaps back, toast "Moved by <name> to <stage>". Late response after navigation: cache only, no toast (UXH-01) | Non-drag path always present; "Moved to <stage>" announced once, not per drag-over | TEST-ACT-006 |
| ATOM-07 | ACT-PIPE-03 / ACT-PIPE-19 · REC · `application.bulk.move` | "Move selected"; "Cancel remaining" | 1 to 200 selected | Target stage; count dialog | Batch key plus item key (batch key + item id) | C | Terminal batch state with per-item results; partial is a valid result | Cancel stops items not yet started; completed items are not rolled back; "Retry failed" resends only failed item keys | Per item 15 s; progress by polling, not one long request | `audit.application.bulk_move_completed` / `audit.application.bulk_move_cancelled` | Cancel racing completion: each item settles as whichever won; summary honest ("42 moved, 3 skipped, 5 not started") | Progress text at coarse cadence (every 10 items or 5 s PROPOSED); final summary announced once | TEST-ACT-007 |
| ATOM-08 | ACT-ASM-05 · CAND own · `attempt.submit` | "Submit attempt" or timer expiry | Active attempt | Dialog shows unanswered count | `attemptId` (natural key) | C | Server shows attempt submitted or scored | To LRN-10; irreversible | Server timer authoritative; offline at expiry shows "Waiting to submit", server decides acceptance (PROGRESSIVE sec 2.1) | `audit.assessment.attempt_submitted` | Late response after the user left: result appears in LRN-07 and as notification, no stale toast. Duplicate submit returns same result | Timer text at coarse cadence; fixed warning thresholds; not announced every second | TEST-ACT-008 |
| ATOM-09 | ACT-SYS-03 / ACT-ADM-02 · any / ADM · `remote.rollout` | "Try again"; version change detected | Remote load failed or skew detected | None | N | C | Remote passes compatibility check (ADR-T18) and mounts | Never reloads mid-edit: banner "Update ready, reload when done" if dirty form or non-empty queue | 3 attempts with backoff, then last-known-good | `audit.remote.rollback_executed` (ADM) | Rollout step mid-session: keep running version until a safe point (route change, nothing dirty). Never force reload (UXH-04) | Banner uses `role=status`, not alert; no focus steal | TEST-ACT-009 |
| ATOM-10 | ACT-ORG-02 · ORGADM · `org.member.role.change` + step-up | "Change role" | Not last owner, step-up fresh | Role | Per change | C | Grant updated; effective at next request (revocation timing owned by 14) | Change again to restore; no undo | 15 s then status query | `audit.org.role_changed` | Own role changed mid-flow: next 403 triggers RD-11 refetch; form kept if still permitted, else neutral notice. Two admins: ETag | Dialog states consequence; step-up overlay returns focus to trigger | TEST-ACT-010 |
| ATOM-11 | ACT-BIL-01 · CAND, ORGADM · `billing.checkout` | "Choose plan" | `BILLING_MODE` on | Plan, seats | Per checkout intent | C | Provider webhook confirms (externally-confirmed); redirect return alone is NOT success | Return page shows "Confirming payment" until entitlement visible | Success with lost response: poll entitlement via status query up to 60 s PROPOSED, then "We'll email you" | `audit.billing.subscription_confirmed` | Duplicate webhook is idempotent by event id (INV-T17). Plan changed in another tab: refetch | Status text in `role=status`; no success claim before confirmation | TEST-ACT-011 |
| ATOM-12 | ACT-ACC-06 · any · none | Motion, contrast, density preference | Always | Enum | N | O (device-local if anon) | Preference applied to `<html>` attributes at once | Choose again to revert | n/a | `audit.account.preferences_updated` (authed) | Server vs local differ: account value wins on next load | `prefers-reduced-motion` honoured by default; "Reduce motion" removes transforms, parallax, auto-scroll, shimmer; state changes remain visible by text or icon; one polite confirmation | TEST-ACT-012 |

## Hazard coverage check

| Scenario | Rows |
|---|---|
| Double submit | 02, 07, 08, 11 |
| Deep link while logged out | 01 |
| Unsaved-dialog close | 04 |
| Workspace switch mid-operation | 05 |
| Reconnect after queued write | 03 |
| Late response after navigation | 06, 08 |
| Cancel batch partway | 07 |
| Remote reload mid-rollout | 09 |
| Reduced motion / screen reader | 12, plus the A11y column of every row |
