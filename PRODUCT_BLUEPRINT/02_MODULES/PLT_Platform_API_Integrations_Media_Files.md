# PLT — Platform: Public API, Webhooks, Integrations, Media & Files

Status: intended product specification. Nothing in this file claims anything is built. Legacy inputs: `SSOT.md` §12.18 to §12.20 (API architecture, response envelope, interface contracts CON-001 to CON-016), §13.3 to §13.8 (integration register, doctrine, dual queue, job catalogs, job schema), §13.15 to §13.16 (media pipeline, media security), §10.21 (BR-083 to BR-090 media rules), F-42; `Yash_Final_Project_Document/13_API_EVENTS_AND_INTEGRATIONS` (API design standards, integration architecture).

## 1. Purpose, outcomes and boundaries

**Purpose.** PLT is the substrate every other module stands on to talk to the outside world and to move bytes and work reliably: a public developer API, signed webhooks, a governed catalog of third-party integrations behind adapters, a file and media service, import and export tooling, and the background job and scheduling platform. [DER]

**Outcomes.**

1. A developer or customer system can integrate with TalentSphere through a versioned, documented, rate-limited API with least-privilege scopes, without screen scraping. [SRC: SSOT §12.18, CON-001 to CON-006]
2. Customers receive reliable, signed event notifications and can replay what they missed. [SRC: SSOT CON-007]
3. Every external dependency (calendar, ATS, HRIS, LMS, SSO, payment, email, SMS, video, storage, identity verification) sits behind a provider port so a vendor can be swapped or lost without touching the domain. [SRC: SSOT §13.4 ADR-009]
4. Files and media are accepted safely (validated, scanned, quota-controlled), stored privately, served through short-lived access and delivered fast through a CDN. [SRC: SSOT §13.15, §13.16, CON-011]
5. Bulk data comes in and goes out through validated, resumable, audited import and export tools. [SRC: SSOT WF-17, §13.7 `institutional.import`, `migration.*`]
6. Asynchronous work is bounded, idempotent, observable and recoverable, and nothing is silently lost. [SRC: SSOT §13.5 to §13.8, CON-008]

### 1.1 In scope

API versioning and deprecation; OAuth 2.0 and API keys; scopes and consent; rate limits and quotas; pagination, filtering, idempotency, error model; the OpenAPI contract and SDKs; developer usage analytics; webhook endpoints, signing, delivery, retries, replay; integration catalog, connection lifecycle, adapter framework and credential vault; specific integrations (calendar, ATS, HRIS, LMS and LTI, SSO and SCIM, payment, email and SMS, video, identity verification); integration health; the marketplace decision gate; developer portal and sandbox; upload service, virus scanning, quotas, retention, signed URLs, transcoding abstraction, external media embeds, CDN; import and export tooling; the background job platform, scheduler, transactional outbox; SSRF-safe outbound fetching.

### 1.2 Out of scope (owned elsewhere)

| Capability | Owner | Relationship |
|---|---|---|
| End-user sessions, passkeys, login | IDN | PLT's OAuth server issues API-scoped tokens; user login is IDN's |
| Notification content and channels | NTF | PLT provides email and SMS provider ports and the job engine; NTF decides what to send |
| Billing, plans, entitlements, invoices | BIL | PLT enforces quotas and rate limits using entitlements supplied by BIL; the payment adapter is PLT's port, BIL's logic |
| Domain data models (jobs, applications, courses) | JOB, ATS, LRN and others | Resources exposed by the API are owned by those modules |
| Consent and data-subject rights | SET | PLT's export and file deletion execute SET's decisions |
| Admin consoles over PLT surfaces (job console, kill switches, integration admin views) | ADM | PLT owns the engines, ADM owns the console (FR-ADM-037) |
| Moderation of uploaded content | TSF | PLT provides scan results and hooks; TSF decides on policy |
| PWA client storage, extension | PWA | Consumes uploads and idempotency |
| AI model providers and prompts | AIC | AI gateway is AIC's; PLT provides the provider-port pattern and outbound fetch rules |
| Analytics warehouse and dashboards | ANL | PLT emits usage events |
| Search indexing | SRC | PLT provides jobs and the outbox |

### 1.3 Owned versus consumed

PLT **owns**: API gateway behavior, OAuth server for API clients, API keys, scopes catalog, rate-limit and quota engine, idempotency store, error model, OpenAPI, SDKs, webhook subsystem, integration catalog and connections, credential vault, adapters framework, file and media service, import and export engines, job engine, scheduler, outbox, developer portal and sandbox. PLT **consumes**: tenant, user and role data from IDN and EMP, entitlements from BIL, policy decisions from SET, console hooks from ADM, vendor services.

### 1.4 Principles

- **Contract first.** Zod schemas are the contract; OpenAPI, JSON Schema and client types are generated; hand-edited OpenAPI is a defect. [SRC: Yash 13 API-STD §1]
- **Safe by default.** Unknown request fields rejected; responses additive; unsafe operations retry-safe; concurrent edits detected. [SRC: Yash 13 API-STD §1]
- **No domain-critical writes from the browser straight to tables.** [SRC: SSOT §12.18]
- **Vendors behind ports.** Core domain never imports a vendor SDK. [SRC: SSOT §13.4]
- **Private by default for bytes.** Files are private, scanned, short-lived-access. [SRC: SSOT §13.16]
- **Unknown is not healthy.** Integration and job health report `unknown` honestly. [SRC: SSOT §20.2]
- **Everything is tenant- and purpose-scoped.** [SRC: SSOT §20.2 request-user-tenant trace]

## 2. Roles and permission matrix

Roles: `GUE`, `CAN`, `STD`, `INS`, `MNT`, `FRL`, `REC`, `HMG`, `EAD` Employer Admin, `IAD` Institution Admin, `PLO`, `EXA` Enterprise Admin, `MOD`, `SUP`, `FIN`, `PAD`, `SAD`, `API` Integration / Service Principal. Developer is an attribute (`developer` capability on an account), not a role. [PROP]

Legend: **U** use, **M** manage own, **O** manage for organization or tenant, **P** manage platform, **R** read only, **—** none.

| Capability | CAN, STD, FRL, INS, MNT | REC, HMG | EAD, IAD, EXA, PLO | API | SUP | PAD | SAD |
|---|---|---|---|---|---|---|---|
| Authorize third-party apps to own data (OAuth consent) | M | — | M (own account) | — | — | — | — |
| Create personal API keys (own data, low scopes) | M (if enabled by plan) | M | M | — | — | — | — |
| Create organization API keys and OAuth clients | — | — | O | — | — | P (review) | P |
| Use the public API | U (own scope) | U (own scope) | U (org scope) | U (client scope) | — | — | — |
| Webhook endpoints | — | — | O | — | R (support view) | P | R |
| Integration connections (calendar own) | M | M | O (org-level) | — | R | P | R |
| Integration catalog admin, adapter config | — | — | — | — | — | P | P (security review) |
| Uploads (own files) | U | U | U | U | — | — | — |
| Org storage quota view | — | — | O | — | R | P | — |
| Imports and exports (own org) | M (own data export) | — | O | — | — | P | P |
| Job console and scheduler | — | — | — | — | — | P (via ADM) | R |
| Developer portal and sandbox | M | M | O | — | — | P | R |
| Rate limit and quota configuration | — | — | — | — | — | P | P (security keys) |
| Marketplace publisher approval | — | — | — | — | — | P (decision gate) | P |

Rules: an `API` principal acts only within its client's scopes and tenant; it can never exceed the permissions of the user who granted it (delegated) or the org role it was created under (client credentials). [DER] `SUP` sees metadata of customers' integrations and webhook deliveries (status, timestamps, error class) and never secrets or payload bodies without a grant (FR-ADM-009).

## 3. Sub-module map

| Code | Sub-module | Features |
|---|---|---|
| A | Public API foundation | FR-PLT-001 to FR-PLT-010 |
| B | Webhooks and events | FR-PLT-011 to FR-PLT-014 |
| C | Integrations | FR-PLT-015 to FR-PLT-027 |
| D | Developer experience | FR-PLT-028 to FR-PLT-029 |
| E | Files and media | FR-PLT-030 to FR-PLT-036 |
| F | Data movement and background work | FR-PLT-037 to FR-PLT-043 |

## 4. Feature specifications

Conventions used by every feature (not repeated in each field):

- **Contracts.** All API shapes are defined in the shared Zod contract package; examples here describe fields in words. Money is integer minor units plus an ISO 4217 code; times are RFC 3339 UTC; ids are opaque UUIDs. [SRC: SSOT CON-009, CON-010]
- **Authorization.** Every route declares a policy action; the server enforces it per resource and tenant; clients never decide. [SRC: Yash 13 API-STD §1]
- **Observability.** Every request and job carries a request id and a tenant id in structured, redacted logs. [SRC: SSOT CON-016, §20.3]
- **Audit.** Security-relevant PLT actions emit audit events through the audit API (FR-ADM-032) as well as the module events listed.
- **Accessibility.** Developer portal and settings screens meet WCAG 2.1 AA.

### A. Public API foundation

### FR-PLT-001 — API versioning and deprecation policy

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT §12.18 deprecation ≥ 6 months; CON-002 path-versioned, additive within major] · [SRC: Yash 13 API-STD 90-day proposal]
- **Purpose and outcome:** Integrators can rely on the API not breaking underneath them; changes are announced early and visible in machine-readable form.
- **Roles and permissions:** `PAD: publish versions, set deprecations` · `EAD, developers: view and subscribe to changes` · `API: receive deprecation headers`
- **Preconditions and entry points:** Public API enabled for the tenant. Entry: path prefix `/api/v1`; developer portal "Changelog" and "Versions" pages.
- **User interactions and actions:** 1. Call `/api/v1/...`. 2. Read response headers `Deprecation` and `Sunset` when a route or version is deprecated. 3. Subscribe to the changelog by email, RSS or webhook (`plt.apiversion.deprecated`). 4. Compare versions in the portal's migration guide. 5. Request an extension for a sunset date through support (PAD decides).
- **System behaviour:** Major version in the path; within a major, only additive changes (new optional request fields, new response fields, new endpoints, new enum values flagged as extensible, new event types). Breaking changes require a new major, with the previous major supported for at least the deprecation window (6 months default, OD-PLT-01). Unknown request fields are rejected with a clear error (strict input) while response clients must ignore unknown fields. Deprecations announced via headers, changelog, email to client owners, and a banner in the portal; usage of deprecated routes is reported per client. At sunset the version returns `410 Gone` with a problem document pointing to the migration guide. `SM-PLT-11` tracks version state. Feature previews are explicit: `/api/v1-preview` or a `Preview-Features` header, never promised stable.
- **UI elements and controls:** Portal versions table (version, state, dates), changelog feed with filters, per-client "deprecated calls last 30 days" report, subscription form.
- **Configuration options:** Platform: deprecation window (6 months default), preview features list. Org: changelog recipients.
- **Business rules:** BR-PLT-001, BR-PLT-009
- **Validation:** Sunset date at least window days after announcement unless a security exception is recorded; contract diff tool in CI classifies changes and blocks breaking changes within a major.
- **Inputs and outputs:** Input: contract diffs. Output: version records, headers, changelog entries, event `plt.apiversion.deprecated`.
- **Filters, sorting, search:** Changelog filter by version, type (added, changed, deprecated, removed, security), area.
- **Notifications and communication:** `api.deprecation.announced` email to client owners at announcement, 90, 30 and 7 days before sunset (service class).
- **Error handling and edge cases:** Client on a sunset version: `410` with `type` link. Security-driven emergency removal: allowed with a shorter window and an incident-class notice. Deprecated route called by a client that never subscribed: header only plus the email to the owner.
- **Dependencies:** FR-PLT-009, FR-PLT-010, FR-PLT-028, ENT-PLT-23.
- **Security and privacy:** Deprecation reports are tenant-scoped.
- **Acceptance criteria:**
  - Given a PR that renames a response field within `v1`, when CI runs the contract diff, then the build fails with `breaking_change_in_major`.
  - Given a deprecated route, when called, then the response carries `Deprecation` and `Sunset` headers and the call is counted for that client.
  - Given a sunset version, when called after the date, then the API returns 410 and a problem document linking to the migration guide.

### FR-PLT-002 — OAuth 2.0 authorization for API clients

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R2
- **Source:** [DER] standard practice for public APIs; [SRC: SSOT §3 integration register] · [PROP] for grant set
- **Purpose and outcome:** Third-party applications and customer systems get access to TalentSphere data only with explicit, revocable authorization, using standard flows that SDKs and partners already support.
- **Roles and permissions:** `CAN, STD, FRL, INS, MNT, REC, HMG, EAD, IAD: authorize (delegated)` · `EAD, IAD: create clients with client credentials for the org` · `PAD: suspend clients`
- **Preconditions and entry points:** A registered, approved client (FR-PLT-034). Entry: authorization endpoint `/oauth/authorize`, token endpoint `/oauth/token`, revocation `/oauth/revoke`, introspection for resource servers, discovery document `/.well-known/oauth-authorization-server`.
- **User interactions and actions:** 1. A third-party app redirects the user to the authorization endpoint with `client_id`, `redirect_uri`, `scope`, `state`, PKCE `code_challenge`. 2. The user signs in (IDN) and sees the consent screen (FR-PLT-004). 3. The user allows or denies. 4. The app exchanges the code for tokens at the token endpoint. 5. The user can review and revoke authorized apps in Settings > Connected apps. 6. Server systems use `client_credentials` with a client secret or private-key JWT.
- **System behaviour:** Supported grants: authorization code with mandatory PKCE (S256), refresh token (rotating, reuse detection revokes the family), client credentials (organization-owned confidential clients), and device authorization for CLI and TV-like tools `[PROP]`. Implicit and password grants are not supported. Access tokens are opaque or signed JWTs with 15 to 60 minutes lifetime (default 30 minutes `[PROP]`); refresh tokens 30 days sliding with 1 year absolute `[PROP]`; authorization codes 60 seconds, single use. Redirect URIs must match exactly and be https (localhost allowed for development clients only). Token binding to client id and scope set; tokens carry tenant id for org clients. Introspection and revocation per RFC 7662 and 7009. Refresh reuse triggers revocation of the grant family and an alert to the user. Suspended clients' tokens fail within 60 seconds.
- **UI elements and controls:** Consent screen (FR-PLT-004), Settings > Connected apps list (app name, publisher, scopes, authorized date, last used, "Revoke access"), portal client management.
- **Configuration options:** Platform: token lifetimes, supported grants, device grant on or off. Org: allowed client types, require admin approval for apps requesting org scopes.
- **Business rules:** BR-PLT-003, BR-PLT-004, BR-PLT-034, BR-PLT-035
- **Validation:** PKCE challenge required on public clients and recommended-enforced on confidential; `state` echoed; scope subset of the client's registered scopes; redirect exact match.
- **Inputs and outputs:** Input: authorization and token requests. Output: tokens with scope, expiry; events `plt.grant.authorized`, `plt.grant.revoked`.
- **Filters, sorting, search:** Connected apps list sorted by last used.
- **Notifications and communication:** Email to the user "An app was given access to your account" with revoke link (security class); alert on refresh reuse.
- **Error handling and edge cases:** Invalid or reused code: `invalid_grant`. Scope not permitted for the user's role: consent screen omits it and tells the user. User denies: redirect with `access_denied`. Client secret leaked: rotate secret (FR-PLT-003 rules), old secret valid for a configurable overlap (default 24 hours).
- **Dependencies:** FR-PLT-004, FR-PLT-034, IDN (planned), ENT-PLT-01, ENT-PLT-03.
- **Security and privacy:** Tokens hashed at rest if opaque; secrets never logged; consent is recorded with scope and time; org-level client credentials require EAD approval and optionally SAD review for sensitive scopes.
- **Acceptance criteria:**
  - Given an authorization request without `code_challenge`, when sent by a public client, then the server returns `invalid_request`.
  - Given a refresh token used twice, when the second use arrives, then the whole grant family is revoked and the user is emailed.
  - Given a redirect URI differing by a trailing path, when sent, then the authorization is rejected.

### FR-PLT-003 — API keys and personal access tokens

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R2
- **Source:** [PROP] building on [SRC: SSOT §3.4 "bulk verification via API with rate limit + audit"]
- **Purpose and outcome:** Customers and individuals can script against their own data using long-lived keys that are scoped, expiring, auditable and safe to rotate.
- **Roles and permissions:** `EAD, IAD, EXA: create org keys` · `CAN, STD, FRL, REC, HMG: create personal access tokens (own data, read scopes by default)` · `PAD: revoke any`
- **Preconditions and entry points:** Plan allows API access (BIL entitlement). Entry: Settings > Developer > API keys.
- **User interactions and actions:** 1. Click "Create key". 2. Enter name, choose scopes (FR-PLT-004), expiry (30, 90, 365 days; default 90), optional IP allowlist (CIDR), environment (live, sandbox). 3. Click Create. 4. The secret is shown once with a copy button and warning. 5. Later: view metadata, last used time and IP, usage; rotate; revoke.
- **System behaviour:** Key format `ts_<env>_<prefix>_<secret>`; the prefix identifies the key without revealing the secret; only a hash (slow salted hash for secrets, SHA-256 of high-entropy secret with pepper acceptable) is stored. Keys are sent as `Authorization: Bearer`. Rotation creates a successor and keeps the predecessor valid for an overlap (default 24 hours) so deployments can switch without downtime; both appear in the list. Maximum 25 active keys per account or org `[PROP]`. Keys expire at the chosen date; an email at 14 and 3 days warns. Keys can be IP-restricted; requests from other IPs return 403 `ip_not_allowed`. Secret scanning: the key format is registered with public secret-scanning programs so leaked keys can be auto-revoked `[PROP]`; the system also revokes keys reported by the scanner and notifies the owner. Usage records last used time and counts. Personal tokens act as the user and are limited to the user's own data scopes; org keys act as an `API` principal in the org.
- **UI elements and controls:** Create dialog (name, scopes checklist, expiry select, IP allowlist textarea, environment radio), one-time secret panel with copy, key table (name, prefix, scopes, created, last used, expires, status), Rotate and Revoke buttons.
- **Configuration options:** Platform: max keys, default and maximum expiry (maximum 1 year), overlap duration. Org: require expiry on all keys, mandatory IP allowlist, disallow personal tokens for members.
- **Business rules:** BR-PLT-003, BR-PLT-004, BR-PLT-005
- **Validation:** Name 3 to 60 characters unique per owner; at least one scope; expiry ≤ 365 days; CIDR syntax valid.
- **Inputs and outputs:** Input: key spec. Output: key record, secret (once), events `plt.credential.created`, `plt.credential.rotated`, `plt.credential.revoked`.
- **Filters, sorting, search:** Key table filter by status, environment, owner; sort by last used or expiry.
- **Notifications and communication:** Expiry warnings and "key created" or "key revoked" notices to the owner and org admins (security class).
- **Error handling and edge cases:** Lost secret: cannot be retrieved; rotate. Key used after revoke: 401 `credential_revoked`. Secret displayed twice attempt: not possible. Key belongs to a user who left the org: org keys remain; personal tokens are revoked on deactivation.
- **Dependencies:** FR-PLT-004, FR-PLT-005, FR-PLT-010, ENT-PLT-02, BIL (planned).
- **Security and privacy:** Secrets never returned after creation; hashed at rest; creation and use audited; accounts with MFA required to create org keys (step-up).
- **Acceptance criteria:**
  - Given a created key, when the dialog closes, then the secret cannot be displayed again and only the prefix appears in the list.
  - Given a key with an IP allowlist, when used from another IP, then the API returns 403 `ip_not_allowed` and counts the event.
  - Given a rotation, when the overlap ends, then the predecessor stops working and the audit log records both events.

### FR-PLT-004 — Scopes, consent screen and permission model

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R2
- **Source:** [DER]; [SRC: Yash 13 API-STD §1 x-policy-action]
- **Purpose and outcome:** Access granted to an app or key is exactly what the human understood and approved, expressed in a small, stable catalog of scopes.
- **Roles and permissions:** `PAD: maintain scope catalog` · `all authorizing users: consent` · `EAD: approve org-level scopes for apps`
- **Preconditions and entry points:** Authorization request (FR-PLT-002), key creation (FR-PLT-003), app registration (FR-PLT-034).
- **User interactions and actions:** 1. The consent screen lists the app name, publisher (verified or not), and each requested permission in plain language grouped by sensitivity, with expand-for-detail. 2. The user can deselect optional scopes. 3. Choose Allow or Deny. 4. Organization admins approving org scopes see which data classes and which people are affected.
- **System behaviour:** Scope naming `resource.action` with optional `:own` or `:org` (examples: `profile.read:own`, `applications.read:org`, `jobs.write:org`, `candidates.read:org`, `webhooks.manage:org`, `files.write:own`, `learning.progress.read:own`, `integrations.manage:org`). Sensitive scopes (sealed data classes such as assessment answers, identity documents, background-check results, message bodies) are not offered to third-party apps at all (BR-PLT-041). Scope sets are intersected with the user's permissions at consent time and checked again on every request (a user who loses a role loses access immediately even with a token). Each scope has a human description, risk level (low, medium, high) and review requirement (app review before production for high). Consent records store scope list, version of the catalog, and time. Adding scopes later requires re-consent. Catalog changes are versioned and additive.
- **UI elements and controls:** Consent screen with grouped scope list, sensitivity labels (text and icon), "Allow" and "Deny" buttons, publisher verification badge with text, "What can this app never see?" expander; org approval screen.
- **Configuration options:** Platform: scope catalog, risk levels. Org: scopes apps may request without admin approval.
- **Business rules:** BR-PLT-004, BR-PLT-041, BR-PLT-002
- **Validation:** Requested scopes ⊆ client's registered scopes ∩ user-permitted scopes; unknown scope → `invalid_scope`.
- **Inputs and outputs:** Input: requested scopes. Output: granted scopes recorded in the grant.
- **Filters, sorting, search:** Portal scope reference searchable by resource and risk.
- **Notifications and communication:** Notice to org admins when an app requests an org scope pending approval.
- **Error handling and edge cases:** User lacks permission for a requested scope: not shown and the app receives the reduced grant (flag `scope` in token response). Org admin disapproves: the grant fails with `admin_approval_required` and the user sees an explanation.
- **Dependencies:** FR-PLT-002, FR-PLT-003, FR-PLT-034, IDN and EMP (role data), ENT-PLT-03.
- **Security and privacy:** Least privilege; no wildcard scopes; scope changes audited.
- **Acceptance criteria:**
  - Given an app requesting `applications.read:org` by a user who is not an org admin, when consent loads, then that scope is absent and the token response lists only granted scopes.
  - Given a request for a sealed-class scope by a third-party app, when sent, then the server returns `invalid_scope`.
  - Given a user's role removed after a grant, when the app calls the API, then the call returns 403 even though the token is valid.

### FR-PLT-005 — Rate limits and quotas

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT CON-006 per-class budgets, 429 + Retry-After] · [SRC: SSOT §20.1 open: where counters are kept across instances]
- **Purpose and outcome:** The platform stays available and fair under heavy or abusive use, and customers know their limits and consumption.
- **Roles and permissions:** `PAD: configure policies` · `EAD: view own org consumption` · `API: receive headers`
- **Preconditions and entry points:** Every API request; also uploads, webhook-triggering writes, exports. Entry: Developer portal > Usage.
- **User interactions and actions:** 1. Call the API; read headers `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (and `Retry-After` on 429). 2. View usage charts and limit values in the portal. 3. Request a higher limit through a form (PAD or BIL decides). 4. Configure client-side backoff using SDK defaults.
- **System behaviour:** Layered limits: (1) edge protection per IP (flood control); (2) per principal (key, client or user) token bucket per endpoint class (read, write, search, bulk, upload, auth, export) with burst; (3) per tenant daily and monthly quotas tied to plan entitlements (requests, webhook deliveries, storage, AI calls, export rows); (4) concurrency limits for expensive classes (exports, bulk imports). Counters live in a shared fast store accessible to all instances (not process memory) with a documented fail mode: if the store is unavailable, limits fail open for reads at a conservative local limit and fail closed for write bursts and auth endpoints (BR-PLT-005). Existing product limits are retained for end-user flows (login 10 per minute per IP, password reset 5 per minute, apply 5 per hour per candidate) [SRC: SSOT §5]. Defaults for API are proposals (OD-PLT-14): read 600 per minute, write 120 per minute, search 60 per minute, bulk 10 per minute per principal `[PROP]`. 429 responses are RFC 9457 problems with `Retry-After` and which limit tripped. Quota exhaustion returns 429 with `quota_exhausted` and the reset time, never silently throttles.
- **UI elements and controls:** Portal usage page (requests per day, 429 count, top endpoints, quota gauges with text values), limit table, "Request increase" form.
- **Configuration options:** Platform: limit classes, defaults, burst, fail modes. Org: per-key sub-limits (an admin can set a lower limit on a key). Plan: quota values via BIL.
- **Business rules:** BR-PLT-005
- **Validation:** Sub-limits cannot exceed tenant limits; increase request requires a reason of 20+ characters.
- **Inputs and outputs:** Input: request stream. Output: allow or 429, headers, events `plt.ratelimit.exceeded` (sampled), `plt.quota.threshold_reached` (80% and 100%).
- **Filters, sorting, search:** Usage filter by key, endpoint class, period.
- **Notifications and communication:** Email at 80% and 100% of monthly quotas to org admins (service class).
- **Error handling and edge cases:** Clock skew: windows use server time. Thundering herd after outage: jittered reset and `Retry-After` randomization. Misconfigured client retrying aggressively: temporary block escalation (429 then 15 minute penalty) recorded with reason.
- **Dependencies:** FR-PLT-008, BIL (planned), FR-ADM-016 (config), ENT-PLT-04, ENT-PLT-05.
- **Security and privacy:** Counters hold no payloads; per-IP limits tolerate shared NAT via principal-based limits for authenticated calls.
- **Acceptance criteria:**
  - Given a client exceeding its write limit, when the next request arrives, then the API returns 429 with `Retry-After` and a problem body naming the limit.
  - Given the counter store is down, when a login request arrives, then it is refused (fail closed) and a read request is served under the local limit.
  - Given a tenant at 100% of monthly quota, when a request arrives, then the response is `quota_exhausted` with the reset date.

### FR-PLT-006 — Pagination, filtering, sorting and field selection

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT CON-003, CON-004] · [SRC: Yash 13 API-STD list shape]
- **Purpose and outcome:** Clients can traverse large collections reliably and cheaply with predictable, stable behavior.
- **Roles and permissions:** `all API principals`
- **Preconditions and entry points:** Any list endpoint.
- **User interactions and actions:** 1. Request `GET /api/v1/<resource>?limit=25&cursor=<token>`. 2. Filter with documented query parameters (`status=open`, `createdAfter=2026-01-01T00:00:00Z`). 3. Sort with `sort=-createdAt`. 4. Select fields with `fields=id,title,status`. 5. Follow `page.next` until absent.
- **System behaviour:** Cursor (keyset) pagination only; offset pagination is not offered. Default limit 25 and maximum 100 (OD-PLT-03 notes SSOT default 20). The cursor is opaque, signed, expires after 24 hours and encodes the sort key and last id; tamper attempts return 400. Sorting limited to allow-listed, indexed keys, always with a unique tiebreaker (id). Filters allow-listed per resource with typed values; unknown filters are rejected. `fields` returns only listed properties (id always included) within the caller's authorization. Expansion (`expand=organization`) allowed for documented relations with a depth of 1. Totals are not returned by default (expensive); `includeTotal=true` returns an approximate count with `totalIsApproximate`. Response shape: `items` array and `page` object `{nextCursor, hasMore, limit}` (the SSOT envelope alternative is recorded in OD-PLT-02).
- **UI elements and controls:** n/a — API; the portal reference documents each parameter with examples.
- **Configuration options:** Platform: default and maximum limits per resource class.
- **Business rules:** BR-PLT-006
- **Validation:** limit 1 to 100; cursor signature and expiry; filter value types; sort key in allowlist.
- **Inputs and outputs:** Input: query parameters. Output: page of items and cursor.
- **Filters, sorting, search:** As defined; full-text search is a separate `/search` endpoint with its own limits (SRC).
- **Notifications and communication:** None.
- **Error handling and edge cases:** Expired cursor: 400 `cursor_expired` with advice to restart. Data changing between pages: keyset guarantees no duplicates or skips for stable sort keys. `limit` above max: clamped to max and reported in `page.limit`.
- **Dependencies:** FR-PLT-008, SRC (planned).
- **Security and privacy:** Filters and field selection are applied after authorization; cursors do not leak data.
- **Acceptance criteria:**
  - Given 130 items, when paging with limit 50, then three pages return all items once each in order and the last page has `hasMore=false`.
  - Given a tampered cursor, when sent, then the API returns 400 `invalid_cursor`.
  - Given `sort=salaryMax` which is not allow-listed, when sent, then the API returns 400 listing allowed sort keys.

### FR-PLT-007 — Idempotency keys

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R1
- **Source:** [SRC: SSOT CON-005 `Idempotency-Key` on non-idempotent writes; 24h replay] · [SRC: Yash 08 OFF-01-REV2 14-day retention] · [SRC: SSOT CON-012]
- **Purpose and outcome:** Any client, including the PWA and public integrators, can safely retry a write without creating duplicates.
- **Roles and permissions:** `all authenticated principals`
- **Preconditions and entry points:** `POST`, and `PATCH` where declared non-idempotent, on any API.
- **User interactions and actions:** 1. Send `Idempotency-Key: <uuid>` with the request. 2. On network failure retry the same request with the same key. 3. Receive the original response (status and body) with `Idempotent-Replayed: true`.
- **System behaviour:** Keys are scoped per principal and per route. On first receipt the server stores `{key, route, requestFingerprint, status: in_progress}` atomically (unique constraint) then executes and stores the response (status, headers subset, body up to 64 KB, otherwise a reference). Same key and same fingerprint returns the stored response; same key with a different payload returns 422 `idempotency_key_reuse`; while in progress returns 409 `request_in_progress` with `Retry-After`. Retention 14 days (OD-PLT-03 notes SSOT 24 hours; the longer window is required by offline clients, BR-PWA-005). Keys are required on selected public endpoints (create application, create job, send message, refund-capable operations, imports) and optional elsewhere; missing key on a required endpoint returns 400 `idempotency_key_required`. Responses with 5xx are not stored as final results to allow safe retries; the in-progress marker expires after a timeout (60 seconds `[PROP]`). Optimistic concurrency through `If-Match` complements it (428 when missing on versioned resources; 412 or 409 on mismatch).
- **UI elements and controls:** n/a — protocol.
- **Configuration options:** Platform: retention (14 days), in-progress timeout, required-endpoint list, stored body cap.
- **Business rules:** BR-PLT-007
- **Validation:** Key is a UUID v4 or an opaque string 16 to 64 characters; fingerprint = hash of method, path, normalized body, selected headers.
- **Inputs and outputs:** Input: key, request. Output: first or replayed response.
- **Filters, sorting, search:** n/a — protocol.
- **Notifications and communication:** None.
- **Error handling and edge cases:** Process crash mid-request: in-progress marker times out, the next retry may re-execute only if the original left no committed effect (effects and key record are written in the same transaction wherever possible). Large response not stored: replay returns the resource's current representation with `Idempotent-Replayed: true` and a `Location` header.
- **Dependencies:** FR-PLT-008, ENT-PLT-06.
- **Security and privacy:** Stored bodies inherit the data class of the original response and are encrypted at rest; deleted at retention end and on erasure of the principal.
- **Acceptance criteria:**
  - Given the same key and payload sent twice, when both reach the server, then one resource exists and the second response carries `Idempotent-Replayed: true`.
  - Given the same key with a different payload, when sent, then the server returns 422 `idempotency_key_reuse`.
  - Given a required endpoint without a key, when called, then the response is 400 `idempotency_key_required`.

### FR-PLT-008 — Error model, request identifiers and status codes

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Must · R1
- **Source:** [SRC: SSOT CON-001 RFC 9457; CON-016 logging] · [SRC: Yash 13 API-STD errors]
- **Purpose and outcome:** Every error is machine-readable, stable, safe to show, and traceable by a request id the user can quote to support.
- **Roles and permissions:** `all API principals and the web app`
- **Preconditions and entry points:** Any failing request.
- **User interactions and actions:** 1. Client receives an error with HTTP status, `Content-Type: application/problem+json`. 2. Client reads `type` (stable URL slug), `title`, `status`, `detail` (human sentence), `code` (stable machine code), `requestId`, and for validation `errors[]` (field pointer, code, message). 3. User-facing apps show the message and a support reference containing the request id.
- **System behaviour:** Standard status usage: 400 malformed, 401 unauthenticated, 403 forbidden, 404 not found (also used where existence must not leak), 409 conflict, 410 gone, 412 precondition failed, 413 payload too large, 415 unsupported media type, 422 validation, 426 upgrade required, 428 precondition required, 429 rate limited, 500 server fault, 503 unavailable with `Retry-After`. Codes are stable and documented; new codes are additive. `detail` never exposes stack traces, SQL, hostnames or internal ids. Every response (success or error) includes `X-Request-Id` (generated at the edge if the client does not send a UUID; a client-provided one is accepted if valid and echoed alongside a server id). Validation errors list all problems (up to 50). Localization: `title` and `detail` follow `Accept-Language` for the web app; machine fields stay English. 5xx automatically opens an observability event; repeated identical 5xx bursts raise an alert.
- **UI elements and controls:** Standard error component in the web app showing message and "Reference: <requestId>" with copy button; portal "Errors" reference page.
- **Configuration options:** Platform: error catalog, localization strings.
- **Business rules:** BR-PLT-008
- **Validation:** Error catalog test ensures each code has a type slug, title and documentation anchor; no 5xx contains internal detail.
- **Inputs and outputs:** Input: failure. Output: problem document.
- **Filters, sorting, search:** Portal error reference searchable by code.
- **Notifications and communication:** None.
- **Error handling and edge cases:** Proxy-generated errors (gateway timeouts) are converted to the same shape at the edge where possible. Unknown routes: 404 problem. Method not allowed: 405 with `Allow` header.
- **Dependencies:** FR-PLT-009, observability stack.
- **Security and privacy:** Error text never reveals whether an email or account exists for authentication endpoints; 404 vs 403 policy documented per resource to avoid enumeration.
- **Acceptance criteria:**
  - Given a validation failure on two fields, when returned, then the problem document lists both with JSON pointers and codes.
  - Given an unhandled exception, when it occurs, then the client sees a generic 500 problem with a request id and no stack trace.
  - Given a request with no `X-Request-Id`, when answered, then the response contains one and logs share it.

### FR-PLT-009 — OpenAPI contract, SDKs and developer documentation

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Should · R2
- **Source:** [SRC: Yash 13 API-STD §1 contract generated from Zod; OpenAPI 3.1] · [PROP] for SDKs
- **Purpose and outcome:** Integrators start from accurate documentation and generated clients; the contract can never drift from the implementation.
- **Roles and permissions:** `GUE: read public docs` · `developers: download SDKs` · `PAD: publish`
- **Preconditions and entry points:** Contract package builds. Entry: developer portal docs, `/api/v1/openapi.json`.
- **User interactions and actions:** 1. Open API reference (grouped by resource) with try-it console using a sandbox key. 2. Copy code samples in curl, TypeScript, Python. 3. Download the OpenAPI document. 4. Install SDKs (npm, PyPI) `[PROP]`. 5. Read guides (authentication, pagination, errors, webhooks, idempotency, rate limits, migration).
- **System behaviour:** OpenAPI 3.1 and JSON Schema generated from the Zod contracts at build; each route documents `x-policy-action`, scopes, rate-limit class, idempotency requirement and error codes. SDKs generated from OpenAPI with hand-written ergonomic wrappers for auth, retries (idempotent only), pagination iterators and webhook signature verification. Contract tests run SDK examples against the sandbox in CI. Documentation sample requests are executed in CI to prevent rot. Try-it console works only against sandbox. Public docs exclude internal-only routes (`x-internal`).
- **UI elements and controls:** Docs site with search, left nav, code tabs, "Try it" panel, version selector, copy buttons.
- **Configuration options:** Platform: SDK languages, publication cadence.
- **Business rules:** BR-PLT-009
- **Validation:** CI fails if OpenAPI diverges from route registry or any example fails.
- **Inputs and outputs:** Input: contract. Output: OpenAPI, SDK packages, docs site.
- **Filters, sorting, search:** Docs search over endpoints, guides, error codes.
- **Notifications and communication:** Changelog subscriptions (FR-PLT-001).
- **Error handling and edge cases:** Docs build failure blocks release; SDK publish failure leaves previous version live.
- **Dependencies:** FR-PLT-001, FR-PLT-028, FR-PLT-029.
- **Security and privacy:** Try-it sends only sandbox credentials; examples use synthetic data.
- **Acceptance criteria:**
  - Given a route added without a policy action, when CI runs, then the OpenAPI generation fails.
  - Given a documented example, when CI executes it against the sandbox, then it must succeed.
  - Given a signed-out visitor, when opening the docs, then no internal-only route appears.

### FR-PLT-010 — API request logs and usage analytics for developers

- **Sub-module:** A. Public API foundation
- **Priority / tier:** Should · R2
- **Source:** [PROP]; [SRC: SSOT CON-016 redacted structured logs]
- **Purpose and outcome:** Developers debug integrations themselves by seeing recent requests, errors and usage without contacting support.
- **Roles and permissions:** `EAD, developers: view logs of own keys and clients` · `SUP: view metadata with tenant consent` · `PAD: all`
- **Preconditions and entry points:** Portal > Logs and Usage.
- **User interactions and actions:** 1. Filter requests by time, key or client, status class, endpoint, request id. 2. Open a request to see method, path template, status, latency, rate-limit state, idempotency key, error code, and (optionally) redacted bodies. 3. Copy request id. 4. Enable "capture bodies for 1 hour" for debugging. 5. See charts: requests, error rate, p95 latency, 429s, deprecated calls.
- **System behaviour:** Request metadata retained 30 days `[PROP]`; bodies are not stored by default; with debug capture enabled (max 60 minutes, owner action, audited) bodies are stored redacted (secrets, tokens, fields tagged sensitive) and deleted after 7 days. Logs queryable by tenant only. Aggregates retained 13 months. Sampling for high-volume tenants with transparent notice. Webhook delivery logs live in FR-PLT-014.
- **UI elements and controls:** Log table, request detail drawer, time-range picker, debug-capture toggle with countdown, charts with text summaries for accessibility.
- **Configuration options:** Platform: retention, sampling. Org: allow support to view metadata (default on).
- **Business rules:** BR-PLT-038, BR-PLT-035
- **Validation:** Capture duration ≤ 60 minutes; filters bounded to 30 days.
- **Inputs and outputs:** Input: request stream. Output: logs and aggregates; event stream to ANL.
- **Filters, sorting, search:** As listed; sort by time, latency.
- **Notifications and communication:** Alert email if error rate exceeds a configured threshold (optional, org setting).
- **Error handling and edge cases:** Log pipeline lag: banner "Logs are delayed by N minutes". Redaction failure detected (pattern match on stored body): body dropped and incident-class alert.
- **Dependencies:** FR-PLT-005, FR-PLT-008, observability stack, ENT-PLT-05.
- **Security and privacy:** Redaction library with tests; bodies of sealed classes never captured.
- **Acceptance criteria:**
  - Given a request with an `Authorization` header, when viewed in logs, then the header is shown as redacted.
  - Given debug capture enabled for 60 minutes, when the time ends, then capture stops automatically.
  - Given a different tenant's request id, when searched, then no result is returned.

