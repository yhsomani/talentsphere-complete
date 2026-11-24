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

### B. Webhooks and events

### FR-PLT-011 — Webhook endpoint management and event subscriptions

- **Sub-module:** B. Webhooks and events
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT CON-007 webhooks HMAC signed, timestamp + replay window] · [SRC: SSOT §13.6 `notification.fanout`, webhooks as transactional jobs]
- **Purpose and outcome:** Customers subscribe their own systems to platform events (application received, stage changed, offer accepted, course completed) so they react in real time rather than polling.
- **Roles and permissions:** `EAD, IAD, EXA: create, edit, delete, test endpoints for the org` · `developers with `webhooks.manage` scope: via API` · `SUP: read metadata` · `PAD: disable any`
- **Preconditions and entry points:** Plan allows webhooks; org has verified domain or passes endpoint verification. Entry: Settings > Developer > Webhooks; API `POST /api/v1/webhook-endpoints`.
- **User interactions and actions:** 1. Click "Add endpoint". 2. Enter HTTPS URL, description, API version, choose event types (grouped, with a search), optionally filter by resource (for example only jobs of one department), environment (live or sandbox). 3. Save; the system sends a verification challenge ping; the endpoint must answer 2xx within 10 seconds, and the user sees "Verified". 4. Copy the signing secret (shown once; rotation available). 5. Send a test event from the UI. 6. Disable, enable, edit or delete the endpoint. 7. Pause deliveries for a period during their maintenance.
- **System behaviour:** Endpoint states per `SM-PLT-02`. URL rules: https only, port 443 (or allowlisted), no credentials in the URL, no private, loopback or link-local addresses (BR-PLT-012, resolved at delivery time too, with DNS pinning). Up to 20 endpoints per org and 100 event-type subscriptions per endpoint `[PROP]`. Events are registered in a catalog with schema, version and sample payload (BR-PLT-037); wildcard subscription (`application.*`) allowed. Delivery payload is "thin plus snapshot": event id, type, created time, API version, tenant id, resource id and a small data snapshot; consumers fetch full resources through the API if needed (limits PII spread, BR-PLT-041). The secret is generated per endpoint (32 bytes random), stored encrypted in the vault, rotated on demand with a 24-hour dual-signing overlap (FR-PLT-012). Endpoint changes are audited.
- **UI elements and controls:** Endpoint list (URL host, status chip with text, event count, last delivery, success rate), "Add endpoint" wizard (3 steps), event type picker with descriptions, "Send test event" button, secret reveal-once panel, Rotate secret, Pause, Delete (with confirmation typing the host).
- **Configuration options:** Platform: endpoint caps, allowed ports, event catalog. Org: default retry profile (standard or extended).
- **Business rules:** BR-PLT-010, BR-PLT-011, BR-PLT-012, BR-PLT-035, BR-PLT-037
- **Validation:** URL length ≤ 2048; scheme https; resolved IPs not in blocked ranges; description ≤ 200 characters; at least one event type; verification challenge answered 2xx with the echo token.
- **Inputs and outputs:** Input: endpoint definition. Output: endpoint record, secret, events `plt.webhook.endpoint_created`, `plt.webhook.endpoint_disabled`.
- **Filters, sorting, search:** Endpoint list filter by status, environment; event catalog search.
- **Notifications and communication:** Email to org admins when an endpoint is auto-disabled or its secret is rotated (security and operational class).
- **Error handling and edge cases:** Verification fails: endpoint stays `pending_verification` with the last error shown (timeout, TLS error, non-2xx, blocked address). Endpoint URL redirects (3xx): not followed; shown as a failure. Endpoint on a domain resolving to an internal IP later (DNS rebinding): blocked at delivery with `egress_blocked` and event `plt.egress.blocked`.
- **Dependencies:** FR-PLT-012, FR-PLT-013, FR-PLT-041, FR-PLT-016 (vault), FR-PLT-042 (outbox), ENT-PLT-07.
- **Security and privacy:** Secrets encrypted; outbound only through the SSRF-safe fetcher; payloads minimal; sealed classes never included.
- **Acceptance criteria:**
  - Given an endpoint URL `https://10.0.0.5/hook`, when saved, then validation fails with `address_not_allowed`.
  - Given a verified endpoint, when the user sends a test event, then the delivery log shows the attempt and response status within 10 seconds.
  - Given the user deletes an endpoint, when confirmed, then no further events are delivered and the secret is destroyed.

### FR-PLT-012 — Webhook signing and verification

- **Sub-module:** B. Webhooks and events
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT CON-007] · [SRC: SSOT §12.18 provider webhooks signature verification, replay protection, idempotency]
- **Purpose and outcome:** Receivers can prove a webhook is genuine, fresh and untampered, and the platform can prove the same about inbound provider webhooks.
- **Roles and permissions:** `developers: verify` · `PAD: manage platform signing policy`
- **Preconditions and entry points:** Every outbound delivery; every inbound provider webhook (payment, identity verification, video, e-signature).
- **User interactions and actions:** 1. Receiver reads headers `TalentSphere-Signature: t=<unix>,v1=<hex>[,v1=<hex>]`, `TalentSphere-Event-Id`, `TalentSphere-Delivery-Id`, `TalentSphere-Api-Version`. 2. Compute `HMAC-SHA256(secret, t + "." + rawBody)` and compare in constant time with any `v1`. 3. Reject if the timestamp is older than 5 minutes. 4. Deduplicate by event id.
- **System behaviour:** Outbound: signature over timestamp and raw body; during a rotation overlap two `v1` values are sent (new and old secret). SDKs ship a verify helper (FR-PLT-009). Inbound provider webhooks: each adapter implements `verifySignature(rawBody, headers)` using the provider's scheme (for example payment provider signature header), rejects stale timestamps, stores `(provider, eventId)` for deduplication, and acknowledges quickly (2xx) after durable enqueue, processing asynchronously (BR-PLT-043). Raw body is preserved for verification (no JSON re-serialization). Secrets rotate on a schedule or on demand; platform signing secrets for all endpoints can be mass-rotated by SAD with 2P (FR-ADM-010).
- **UI elements and controls:** Portal "Verify a webhook" tool where a developer pastes headers and body to check a signature offline; per-endpoint secret rotate button.
- **Configuration options:** Platform: tolerance (5 minutes), overlap (24 hours).
- **Business rules:** BR-PLT-010, BR-PLT-043
- **Validation:** Timestamp within tolerance; signature hex length; constant-time compare.
- **Inputs and outputs:** Input: payload and secret. Output: signature headers; verification result.
- **Filters, sorting, search:** n/a — protocol.
- **Notifications and communication:** Rotation notices (FR-PLT-011).
- **Error handling and edge cases:** Clock skew at receiver: documentation recommends NTP; tolerance is configurable per endpoint up to 10 minutes. Secret lost: rotate. Inbound signature invalid: 400, counted, alerts at a threshold, never processed.
- **Dependencies:** FR-PLT-011, FR-PLT-016, FR-PLT-009.
- **Security and privacy:** Secrets never in logs; replay protection by timestamp and event id.
- **Acceptance criteria:**
  - Given a body modified by one byte, when the receiver verifies, then the signature fails.
  - Given a delivery signed 6 minutes ago, when verified with default tolerance, then it is rejected.
  - Given an inbound payment webhook with an invalid signature, when received, then the platform returns 400 and enqueues nothing.

### FR-PLT-013 — Webhook delivery, retries and circuit breaking

- **Sub-module:** B. Webhooks and events
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT CON-007, CON-008 retry/timeout 10s default, exponential backoff] · [SRC: SSOT §13.6 notification.fanout retries 5]
- **Purpose and outcome:** Events reach receivers at least once, in a bounded and predictable way, without hammering failing endpoints or losing events.
- **Roles and permissions:** `system` · `EAD: view delivery state` · `PAD: tune platform defaults`
- **Preconditions and entry points:** A domain event (outbox) matching a subscription.
- **User interactions and actions:** 1. Receiver returns 2xx within 10 seconds to acknowledge. 2. Non-2xx or timeout triggers retries. 3. The owner views delivery attempts in the log (FR-PLT-014) and the endpoint health chip.
- **System behaviour:** Delivery job per (event, endpoint) (kind `webhook.deliver`, FR-PLT-039) with timeout 10 seconds, no redirects, response body stored truncated (first 1 KB, redacted). Retry schedule (standard profile `[PROP]`): immediate, 1 minute, 5 minutes, 30 minutes, 2 hours, 8 hours, 24 hours (7 attempts across about 34 hours), with ±20% jitter; extended profile continues to 72 hours. 410 Gone from the receiver disables the endpoint immediately. 429 or `Retry-After` from the receiver is honored up to 1 hour. Circuit breaker: after 20 consecutive failures or a success rate under 10% over 100 attempts the endpoint becomes `degraded` (deliveries queue and are tried at a reduced rate, one probe every 5 minutes); after 3 days of continuous failure it becomes `auto_disabled`, and owners are emailed at degraded, 24 hours before auto-disable, and at disable. Events are delivered at least once; ordering is not guaranteed (events carry a `createdAt` and a per-resource sequence number so receivers can order); receivers deduplicate on event id (BR-PLT-011). Events not delivered within the retry window become `dead` and remain replayable for 30 days.
- **UI elements and controls:** Endpoint health chip (Healthy, Degraded, Disabled with text), delivery attempt list (FR-PLT-014), "Retry now" for a failed delivery.
- **Configuration options:** Platform: timeout, schedule, jitter, breaker thresholds. Org: standard or extended profile (plan dependent).
- **Business rules:** BR-PLT-011, BR-PLT-040, BR-PLT-012
- **Validation:** Response size cap read 1 MB; TLS 1.2 or newer; certificate must validate (no self-signed in live).
- **Inputs and outputs:** Input: events. Output: delivery attempts, state, events `plt.webhook.delivery_failed`, `plt.webhook.delivery_dead`.
- **Filters, sorting, search:** n/a — system behavior.
- **Notifications and communication:** Degraded, pre-disable and disable emails to org admins (operational class).
- **Error handling and edge cases:** Receiver slow (accepts after 9 seconds): counts as success; repeated slowness flagged. Massive event bursts: per-endpoint concurrency cap (default 5) and queue backpressure; platform never blocks the producer. Endpoint re-enabled after auto-disable: queued events within retention are delivered in order of creation at a throttled rate.
- **Dependencies:** FR-PLT-011, FR-PLT-039, FR-PLT-041, FR-PLT-042, ENT-PLT-08.
- **Security and privacy:** Delivery uses the egress-safe fetcher; payload minimization; response bodies stored redacted.
- **Acceptance criteria:**
  - Given a receiver returning 500, when an event is delivered, then retries follow the schedule and each attempt is logged.
  - Given a receiver returning 410, when the first delivery returns, then the endpoint is disabled and the owner is notified.
  - Given 20 consecutive failures, when the 20th fails, then the endpoint becomes degraded and probing slows to every 5 minutes.

### FR-PLT-014 — Webhook delivery log and replay

- **Sub-module:** B. Webhooks and events
- **Priority / tier:** Should · R2
- **Source:** [PROP] (as in Stripe, GitHub and Twilio developer dashboards)
- **Purpose and outcome:** Customers see exactly what was sent and what their endpoint answered, and can resend events after fixing their receiver, so integration problems are resolved without support.
- **Roles and permissions:** `EAD, developers: view and replay own endpoint deliveries` · `SUP: view metadata`
- **Preconditions and entry points:** Delivery history exists (retained 30 days). Entry: webhook endpoint page > Deliveries.
- **User interactions and actions:** 1. Filter deliveries by status (success, failed, dead, pending), event type, time range, event id. 2. Open a delivery to see request headers (signature redacted), payload, each attempt with status code, latency, response snippet and error class. 3. Click "Resend" on one delivery, or "Replay failed events" for a time range (up to 1,000 events, async job). 4. Download the payload.
- **System behaviour:** A replay creates a new delivery of the same event (same event id, new delivery id, header `TalentSphere-Replay: true`) so receivers deduplicating on event id can choose. Bulk replay respects rate limits and ordering by creation time; it is capped at 1,000 events per request `[PROP]` and one active bulk replay per endpoint. Replays after the retention window are refused. Payload shown is the stored snapshot at event time (not regenerated) to avoid leaking data the user can no longer access; if the recipient's access to a referenced resource has since been revoked, the snapshot is still the original but its resource link requires authorization. Replays are audited.
- **UI elements and controls:** Deliveries table with status chips (text and icon), detail drawer with tabs (Request, Attempts, Response), "Resend" and "Replay failed events" buttons with time-range picker, download button.
- **Configuration options:** Platform: log retention (30 days), bulk replay cap.
- **Business rules:** BR-PLT-011, BR-PLT-038
- **Validation:** Time range ≤ 30 days; event count ≤ cap; endpoint must be active or degraded.
- **Inputs and outputs:** Input: replay request. Output: new deliveries, event `plt.webhook.replayed`.
- **Filters, sorting, search:** As listed; sort by time.
- **Notifications and communication:** Completion notice of a bulk replay in-app.
- **Error handling and edge cases:** Replay to a disabled endpoint: refused with prompt to enable. Duplicate bulk replay: second refused with `replay_in_progress`.
- **Dependencies:** FR-PLT-013, FR-PLT-039, ENT-PLT-08.
- **Security and privacy:** Payload snapshots inherit retention; access limited to endpoint owners.
- **Acceptance criteria:**
  - Given a failed delivery, when the user clicks Resend after fixing the receiver, then a new delivery with the same event id is sent and flagged as replay.
  - Given a request to replay events older than 30 days, when submitted, then it is refused.
  - Given another org's delivery id, when requested, then the API returns 404.

### C. Integrations

### FR-PLT-015 — Integration catalog and connection management

- **Sub-module:** C. Integrations
- **Priority / tier:** Must · R2
- **Source:** [SRC: SSOT §13.3 integration register] · [SRC: Yash 13 INTEGRATION_ARCHITECTURE]
- **Purpose and outcome:** Org admins and individuals discover, connect, configure and disconnect integrations from one place with a consistent flow and clear data-sharing statements.
- **Roles and permissions:** `EAD, IAD, EXA: connect org-level integrations` · `CAN, STD, FRL, INS, MNT, REC, HMG: connect personal integrations (calendar, video)` · `PAD: manage catalog entries` · `SUP: read connection status`
- **Preconditions and entry points:** Entitlement allows the integration; user has the needed role. Entry: Settings > Integrations (org) and Settings > Connected accounts (personal).
- **User interactions and actions:** 1. Browse the catalog by category (Calendar, ATS, HRIS, Learning (LMS and LTI), Single sign-on, Payments, Email and SMS, Video meetings, Identity verification, Storage, Automation). 2. Open a tile: description, what data is read and written, direction, setup steps, plan requirement, status badge, support link. 3. Click Connect and complete the provider's authorization (OAuth, SAML metadata, API key entry or SCIM token). 4. Choose settings (which calendar, which ATS job mappings, sync direction, field mapping). 5. Review the data-sharing summary and confirm. 6. Run "Test connection". 7. Disconnect: choose whether to keep or delete data previously imported (where applicable) and confirm.
- **System behaviour:** Each catalog entry is an `IntegrationDefinition` (id, category, adapter id, auth type, scopes requested, data read and written lists, supported directions, plan gates, regions, status: beta, general, deprecated). A `IntegrationConnection` (`SM-PLT-03`) belongs to a tenant or user, stores configuration, references vault secrets, and has a health state (FR-PLT-026). Connecting requires explicit consent to the data-sharing summary; disconnect revokes tokens at the provider where supported, stops syncs, and records what was retained. Imported records carry provenance (source integration id, external id, imported time) (BR-PLT-015). Data minimization: only the declared fields and scopes are requested (BR-PLT-039). Per-tenant limits on connections per type. Reconnect flows when authorization expires (`reauth_required`). Data-sharing summaries are generated from the adapter's declared lists, never free text.
- **UI elements and controls:** Catalog grid with filters and search, tile detail page, Connect wizard, settings form per integration, status badge (text and icon), "Test connection", "Sync now" (where relevant), "Disconnect" with data-retention choice.
- **Configuration options:** Platform: catalog entries, plan gates, regional availability. Org: allowed integrations list (an admin can restrict which integrations members may connect personally).
- **Business rules:** BR-PLT-013, BR-PLT-015, BR-PLT-035, BR-PLT-039
- **Validation:** Required settings per integration; scopes not exceeding the definition; one active connection per (tenant, integration) unless the definition allows multiple.
- **Inputs and outputs:** Input: connection spec and provider authorization. Output: connection record, events `plt.integration.connected`, `plt.integration.disconnected`.
- **Filters, sorting, search:** Catalog filter by category, status, plan; search by name.
- **Notifications and communication:** Email to org admins on connect, disconnect and `reauth_required` (operational).
- **Error handling and edge cases:** Provider authorization denied: the wizard returns to step one with an explanation. Disconnect while a sync is running: the sync is cancelled gracefully. Provider revoked access: connection becomes `reauth_required` and syncs pause.
- **Dependencies:** FR-PLT-016, FR-PLT-026, FR-PLT-004, ENT-PLT-09, ENT-PLT-10.
- **Security and privacy:** Tenant-scoped; secrets only in the vault; disconnect revokes; audit trail of connect and disconnect.
- **Acceptance criteria:**
  - Given an integration requiring the Business plan, when a Free-plan admin opens it, then Connect is disabled with the plan requirement.
  - Given a connected ATS, when the admin disconnects and chooses "Keep imported data", then syncs stop, tokens are revoked at the provider and imported records remain with provenance.
  - Given the provider revokes access, when the next sync runs, then the connection becomes `reauth_required` and admins are emailed.

### FR-PLT-016 — Provider adapter framework and credential vault

- **Sub-module:** C. Integrations
- **Priority / tier:** Must · R1
- **Source:** [SRC: SSOT §13.4 ADR-009 `ProviderAdapter` + anti-corruption mappers; §12.10 shared kernel] · [SRC: SSOT §13.4 rules: server-side secrets, idempotency, circuit breakers, status visible, owner and degraded mode]
- **Purpose and outcome:** Every vendor is wrapped in a uniform adapter so the domain stays vendor-free, and every credential is held in a hardened vault with rotation.
- **Roles and permissions:** `engineers: implement adapters` · `PAD: rotate platform secrets` · `SAD: vault policy` · `org admins: enter and replace their own integration credentials (write-only)`
- **Preconditions and entry points:** Each adapter registers in the catalog (FR-PLT-015).
- **User interactions and actions:** 1. An org admin pastes an API key or completes OAuth; the secret goes straight to the vault. 2. The UI shows "Saved. Last rotated 2026-10-01" and never the secret. 3. Replace or rotate through the same form. 4. Platform operators rotate platform-level secrets through the console (FR-ADM-016 shows only metadata).
- **System behaviour:** `ProviderAdapter<TPort>` interface: `id`, `capabilities`, `healthCheck()`, `call(operation, input, ctx)` with timeout, retry policy, circuit breaker and metrics, plus mappers translating provider models to domain models both ways (anti-corruption layer). Contract tests per adapter run against recorded fixtures and the provider sandbox on a schedule. Each adapter has an owner, a documented degraded mode (what users see when it fails), and a removal drill result (the product works with the adapter disabled) as a release gate (SRC VER-021). Vault: envelope encryption with a key per tenant derived from a master key held in a KMS; secrets encrypted at rest, decrypted only in the process making the call, never logged or returned to clients (BR-PLT-014); access audited; rotation policies per type (OAuth refresh tokens rotated by provider rules; API keys on schedule or on demand); secret versions kept for rollback for a short overlap. Detection of leaked secrets in logs by pattern tests in CI. Platform secrets (VAPID, webhook signing, JWT keys) use the same vault with scheduled rotation (FR-PWA-021 consumes).
- **UI elements and controls:** Credential field components (write-only with "Replace"), metadata line (last rotated, last used, status), rotate button.
- **Configuration options:** Platform: rotation schedules, adapter timeouts and breaker thresholds per adapter, KMS configuration. Org: none.
- **Business rules:** BR-PLT-013, BR-PLT-014, BR-PLT-040
- **Validation:** Adapters must declare capabilities and degraded behavior to register; secrets validated by the provider "test" call before being committed (where available).
- **Inputs and outputs:** Input: secrets, adapter calls. Output: provider results mapped to domain types; vault metadata.
- **Filters, sorting, search:** n/a — framework.
- **Notifications and communication:** Secret nearing expiry notice to the owner; failure notices through health (FR-PLT-026).
- **Error handling and edge cases:** KMS unavailable: calls needing secrets fail with a degraded-mode response, never fall back to plaintext. Secret decryption failure: connection flagged `error` and admins notified. Adapter timeouts produce provider-neutral error classes (`provider_timeout`, `provider_rejected`, `provider_unavailable`).
- **Dependencies:** FR-PLT-015, FR-PLT-026, FR-PLT-041, KMS (external), ENT-PLT-11.
- **Security and privacy:** Strong isolation per tenant; key rotation without downtime; no secrets in environment dumps; break-glass decryption is not supported (secrets are replaced, not recovered).
- **Acceptance criteria:**
  - Given a saved API key, when any API or UI reads the connection, then the secret is absent and only metadata is returned.
  - Given an adapter without a documented degraded mode, when registering, then registration fails.
  - Given the KMS is unreachable, when a sync needs a secret, then the run fails with `vault_unavailable` and no plaintext fallback occurs.

### FR-PLT-017 — Calendar integrations

- **Sub-module:** C. Integrations
- **Priority / tier:** Should · R2
- **Source:** [SRC: SSOT §13.3 Slack / Cal.com post-MVP; INT scheduling needs] · [PROP] for providers
- **Purpose and outcome:** Interviewers, candidates and mentors link their calendars so availability is respected and scheduled events appear where they already look; INT consumes this port.
- **Roles and permissions:** `CAN, STD, FRL, INS, MNT, REC, HMG: connect personal calendars` · `EAD: org-level calendar (resource calendars, delegated access)` 
- **Preconditions and entry points:** Settings > Connected accounts > Calendar.
- **User interactions and actions:** 1. Connect Google Calendar, Microsoft 365/Outlook, or an iCal/ICS feed (read-only), by OAuth. 2. Choose which calendars to check for conflicts and which one to write events to. 3. Choose "Free and busy only" (default) or "Event titles" (not recommended). 4. See the next 7 days preview. 5. Disconnect.
- **System behaviour:** `CalendarPort` operations: `listCalendars`, `getFreeBusy(range, calendars)`, `createEvent`, `updateEvent`, `cancelEvent`, `subscribeToChanges` (push notifications or polling every 10 minutes). Least scopes: free/busy read plus event write on a chosen calendar; event content is not read unless the user chooses titles (BR-PLT-047). Availability computations use free/busy in UTC with the user's working hours (INT). Scheduled interview events carry a TalentSphere link and ICS attachment (RFC 5545) with `METHOD:REQUEST`, UID stable per interview so updates and cancels amend the same event. Two-way sync of cancellations (a declined event notifies INT). Time zones resolved with IANA names; daylight changes handled by the provider. Rate limits per provider respected (backoff). Disconnecting stops writes and deletes cached busy data.
- **UI elements and controls:** Provider buttons, calendar checklist, privacy radio (Free/busy, Titles), preview list, Disconnect.
- **Configuration options:** User: calendars, privacy level, buffer minutes. Platform: providers enabled, poll interval.
- **Business rules:** BR-PLT-047, BR-PLT-015, BR-PLT-016
- **Validation:** At least one calendar chosen for conflict checking; write calendar must be writable.
- **Inputs and outputs:** Input: OAuth and settings. Output: free/busy, events; connection events.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** Reconnect notice on `reauth_required`.
- **Error handling and edge cases:** Calendar API quota: backoff and "Availability may be delayed" notice. Event deleted at the provider: INT receives `calendar.event.removed` and asks the organizer. Shared or delegated calendars: allowed only with the owner's grant.
- **Dependencies:** FR-PLT-015, FR-PLT-016, INT (planned), ENT-PLT-10.
- **Security and privacy:** Free/busy default; cached busy blocks purged on disconnect; tokens in vault.
- **Acceptance criteria:**
  - Given a user with free/busy only, when INT checks availability, then only busy intervals are retrieved and no titles are stored.
  - Given an interview rescheduled, when INT updates it, then the same calendar event UID is updated, not duplicated.
  - Given disconnect, when completed, then cached busy data is deleted.

### FR-PLT-018 — ATS import and export adapters

- **Sub-module:** C. Integrations
- **Priority / tier:** Should · R2
- **Source:** [SRC: SSOT WF migration `migration.parse` / `.commit`; §13.3 LinkedIn migration source] · [PROP] for ATS list (Greenhouse, Lever, Workable, Ashby, SmartRecruiters)
- **Purpose and outcome:** Employers bring jobs and candidates from their existing ATS and keep systems in step, or push TalentSphere candidates and decisions out, so adopting TalentSphere does not mean double entry.
- **Roles and permissions:** `EAD, REC (with `integrations.manage:org` granted by EAD): connect and run` · `PAD: catalog`
- **Preconditions and entry points:** Org has ATS module entitlement; Settings > Integrations > ATS.
- **User interactions and actions:** 1. Connect the ATS with API credentials or OAuth. 2. Choose scope: jobs (open and closed), candidates and applications, stages, notes (optional), attachments (optional). 3. Map ATS stages to TalentSphere pipeline stages; map departments and locations. 4. Choose mode: one-time import, ongoing inbound sync, outbound push (candidate moved or hired), or two-way (field-level ownership table, BR-PLT-016). 5. Run a dry run showing counts and warnings. 6. Start; watch progress; download the result report. 7. Resolve flagged duplicates.
- **System behaviour:** `AtsPort` operations: `listJobs`, `listApplications(since)`, `getCandidate`, `pushApplicationStatus`, `createCandidate`, `webhookIngest`. Import runs on the import engine (FR-PLT-037) with per-record idempotency keyed by (integration, externalId). Deduplication by verified email then normalized name plus phone; ambiguous matches queued for human review. Candidate personal data imported on behalf of the employer follows the employer-as-controller rule: records are flagged `source=ats_import`, no consent assumptions are made about processing beyond the employer's contract, and candidates are not auto-invited unless the org enables it with a lawful-basis acknowledgement [DEC-REQ] OD-PLT-10. Stage mapping is explicit; unmapped stages block the run. Outbound pushes are queued with retries and idempotency. Field ownership table decides conflicts (default: ATS owns job and candidate master fields on inbound mode; TalentSphere owns stages in outbound mode). Provider rate limits respected; resumable using cursors.
- **UI elements and controls:** Connect wizard, mapping table (dropdown per stage), mode radios with explanation, dry-run summary, progress bar with counts, report download, duplicate review list.
- **Configuration options:** Org: mapping, mode, schedule (hourly, daily), attachments on or off. Platform: adapters, batch sizes.
- **Business rules:** BR-PLT-016, BR-PLT-028, BR-PLT-039, BR-PLT-015
- **Validation:** Mapping complete for all stages in scope; credentials tested; mode requires matching scopes.
- **Inputs and outputs:** Input: ATS data, mapping. Output: imported entities, push calls, sync run records (`ENT-PLT-12`), events `plt.integration.sync_completed`, `plt.integration.sync_failed`.
- **Filters, sorting, search:** Run history filter by status and date.
- **Notifications and communication:** Run completion and failure summary to the connecting admin.
- **Error handling and edge cases:** ATS rate limit: backoff and resume. Deleted-in-source records: marked `source_deleted`, not auto-deleted. Partial failure: successful rows stay, failures reported with reasons. Webhook from ATS arrives for an unmapped event: logged and ignored.
- **Dependencies:** FR-PLT-015, FR-PLT-016, FR-PLT-037, FR-PLT-039, ATS (planned), JOB (planned).
- **Security and privacy:** Imported candidates are employer-scoped data (no cross-org visibility); attachments scanned (FR-PLT-031); credentials in vault.
- **Acceptance criteria:**
  - Given an unmapped ATS stage, when the dry run executes, then it reports `unmapped_stage` and the run cannot start.
  - Given the same import run twice, when completed, then no duplicate candidates exist.
  - Given a candidate moved to Hired in TalentSphere in outbound mode, when pushed, then the ATS receives exactly one status update even after a retry.

### FR-PLT-019 — HRIS sync

- **Sub-module:** C. Integrations
- **Priority / tier:** Could · R6
- **Source:** [SRC: SSOT §13.3 Workday / SAP / BambooHR bidirectional HRIS sync Ph6]
- **Purpose and outcome:** Enterprise customers keep employee, org structure and role data in step with their HR system so internal mobility and learning assignments use current data; this brushes the SSOT non-goal of generic HR and is limited to read-oriented sync (OD-PLT-09).
- **Roles and permissions:** `EXA: connect and configure` · `PAD: catalog`
- **Preconditions and entry points:** Enterprise entitlement; ENT module (planned) enabled.
- **User interactions and actions:** 1. Connect (Workday, BambooHR, SAP SuccessFactors, or generic SFTP/CSV and SCIM). 2. Select fields to sync (employee id, name, work email, manager, department, job title, location, hire date, employment status; compensation and performance are excluded). 3. Choose schedule (nightly default). 4. Preview and approve the first sync. 5. Monitor changes (joiners, movers, leavers) feed.
- **System behaviour:** `HrisPort`: `listWorkers(since)`, `getOrgUnits`, `getJobCatalog`. Inbound only by default; write-back is not offered in v1 (internal mobility results are exposed to the HRIS through exports or webhooks instead). Field allowlist enforces data minimization (BR-PLT-039): compensation, performance, medical, and protected-class fields are never requested. Joiner, mover and leaver events update ENT's workforce directory; leavers deprovision access through SCIM or an event (FR-PLT-021). Identity matching on work email and employee id. Changes are applied in transactional batches with rollback on a failed batch. Conflicts: HRIS wins for mastered fields (BR-PLT-016).
- **UI elements and controls:** Connector wizard, field-selection list with data-class labels, schedule select, change preview, sync history.
- **Configuration options:** Org: fields, schedule, leaver policy (suspend or remove after N days). Platform: adapters.
- **Business rules:** BR-PLT-016, BR-PLT-039, BR-PLT-041
- **Validation:** Field list limited to the allowlist; first sync requires explicit approval after preview.
- **Inputs and outputs:** Input: HRIS data. Output: workforce directory updates, events.
- **Filters, sorting, search:** Change feed filter by type and department.
- **Notifications and communication:** Sync summary to EXA; alert on large deltas (over 20% change `[PROP]`) requiring approval.
- **Error handling and edge cases:** Large delta (mass termination or data error): sync paused awaiting approval. Duplicate employee ids: flagged. Field mapping change: next sync requires preview.
- **Dependencies:** FR-PLT-015, FR-PLT-016, FR-PLT-021, FR-PLT-037, ENT (planned).
- **Security and privacy:** Strict allowlist; employee data encrypted; org-scoped.
- **Acceptance criteria:**
  - Given a field `salary` selected via custom mapping, when saving, then validation rejects with `field_not_permitted`.
  - Given a nightly sync where 30% of workers disappear, when run, then the sync pauses for approval.
  - Given a leaver in the HRIS, when synced, then access is suspended per the org's leaver policy.

### FR-PLT-020 — LMS integration and LTI 1.3

- **Sub-module:** C. Integrations
- **Priority / tier:** Could · R3
- **Source:** [SRC: SSOT §13.3 Moodle / Canvas / Blackboard / SIS LMS interop Ph6] · [PROP] for LTI details
- **Purpose and outcome:** Institutions launch TalentSphere learning, assessments or career tools from inside their LMS with single sign-on, and receive grades and completions back, so students do not need separate logins.
- **Roles and permissions:** `IAD: register the LMS platform` · `INS, STD: launch` · `PAD: security review`
- **Preconditions and entry points:** Institution tenant with LTI enabled. Entry: LMS external tool placement; Settings > Integrations > LMS.
- **User interactions and actions:** 1. IAD registers a platform: issuer, client id, deployment id, OIDC auth URL, JWKS URL, token URL (or uses dynamic registration). 2. TalentSphere shows its tool configuration (login initiation URL, redirect URIs, JWKS, public key). 3. The LMS admin adds the tool. 4. An instructor adds a TalentSphere course or assessment as an activity. 5. A student clicks and lands directly in the item, signed in. 6. Scores and completions return to the LMS gradebook.
- **System behaviour:** LTI 1.3 Advantage: OIDC third-party login initiation, id token validation (signature via JWKS, issuer, audience, nonce, expiry, deployment id), `LtiResourceLink` and Deep Linking (content selection), Assignment and Grade Services (score passback with `scoreGiven`, `scoreMaximum`, `activityProgress`, `gradingProgress`), and Names and Role Provisioning Services (roster). User mapping by (issuer, subject) to a TalentSphere account: first launch can auto-provision an institution-managed account (if INS policy allows) or require linking. Roles mapped from LTI context roles. Launch uses state and nonce stored server-side, one use, 10-minute lifetime. Grade passback is queued with retries; only the grades the institution authorizes (contexts bound to the tool). Cookies in iframes: launches open in a new window when third-party cookies are blocked (capability check). Data returned to the LMS limited to scores and completion status.
- **UI elements and controls:** Platform registration form, tool config page with copy buttons, activity picker (deep linking UI), roster sync status, grade passback log.
- **Configuration options:** Institution: auto-provision, role mapping, roster sync schedule, grade passback on or off per activity.
- **Business rules:** BR-PLT-018, BR-PLT-015, BR-PLT-035
- **Validation:** JWKS reachable over https; deployment id present; id token claims validated per spec; nonce unused.
- **Inputs and outputs:** Input: LTI launches and registrations. Output: sessions, grade updates, roster data.
- **Filters, sorting, search:** Passback log filter by status.
- **Notifications and communication:** Admin notice on repeated passback failures.
- **Error handling and edge cases:** Expired or replayed nonce: launch rejected with a message. LMS JWKS rotation: refreshed automatically with caching. Score above maximum: clamped and logged. Student not in roster: launch allowed only if policy permits.
- **Dependencies:** FR-PLT-015, FR-PLT-016, FR-PLT-021, INS (planned), LRN and ASM (planned).
- **Security and privacy:** Strict JWT validation; tenant isolation by deployment; minimal claims stored.
- **Acceptance criteria:**
  - Given an id token with a reused nonce, when launched, then the launch is rejected.
  - Given a student completing an assessment, when passback is enabled, then the LMS receives one score and the log shows it.
  - Given a context not bound to a registered deployment, when launched, then access is refused.

### FR-PLT-021 — Single sign-on (SAML 2.0, OIDC) and SCIM provisioning

- **Sub-module:** C. Integrations
- **Priority / tier:** Must · R3
- **Source:** [SRC: SSOT §13.3 MS Entra / Google Workspace / Okta SSO Ph6] · [PROP] for SCIM
- **Purpose and outcome:** Employers and institutions authenticate members with their own identity provider and have accounts created and removed automatically, meeting enterprise security requirements.
- **Roles and permissions:** `EAD, IAD, EXA: configure SSO and SCIM for their tenant` · `PAD, SAD: review` · `all members: sign in through SSO`
- **Preconditions and entry points:** Tenant has verified a domain; plan includes SSO. Entry: Settings > Security > Single sign-on.
- **User interactions and actions:** 1. Choose protocol (SAML 2.0 or OIDC). 2. For SAML: download TalentSphere SP metadata (entity id, ACS URL, certificates), upload IdP metadata XML or enter SSO URL, entity id and X.509 certificate. 3. For OIDC: enter issuer, client id, secret; discovery is fetched. 4. Map attributes (email, name, groups to roles). 5. Click "Test sign-in" in a separate window. 6. Enable for selected domains; choose "Required for all members" or "Optional". 7. Generate a SCIM token and base URL for the IdP; map groups. 8. Download recovery codes for the break-glass admin.
- **System behaviour:** SAML: SP-initiated and IdP-initiated (configurable, IdP-initiated off by default), signed assertions required (response or assertion), strict audience, recipient and `InResponseTo` checks, 5-minute clock skew, replay cache of assertion ids, encryption supported, certificate rollover with two certificates. OIDC: authorization code with PKCE, id token validation. Account linking by verified email and domain ownership, never by unverified attributes. Just-in-time provisioning off by default; when on, creates accounts with the mapped role at least privilege. SCIM 2.0 `/Users` and `/Groups` with `filter`, `PATCH`, soft deactivation (`active=false` suspends the account and revokes sessions within 5 minutes, BR-PLT-017). Enforcement: when SSO is required, password and social login for those domain members are disabled, except one designated break-glass owner account protected by a passkey (BR-PLT-017). Group-to-role mapping applies on every login. SSO sessions respect the IdP's session lifetime up to the platform maximum. Domain ownership must be proven by DNS TXT before activation; domain claims cannot take over existing accounts silently: existing members are notified and prompted to link.
- **UI elements and controls:** SSO wizard, metadata download and upload, attribute mapping table, "Test sign-in" button, enforcement toggle with warning, SCIM token panel (shown once), break-glass account selector, recovery codes download.
- **Configuration options:** Tenant: protocol, mapping, JIT on or off, enforcement, IdP-initiated on or off, SCIM. Platform: allowed algorithms (RSA-SHA256 or stronger), clock skew.
- **Business rules:** BR-PLT-017, BR-PLT-015, BR-PLT-035
- **Validation:** Metadata XML schema validated; certificate not expired and ≥2048-bit RSA or P-256; domain verified; at least one break-glass account before enabling enforcement.
- **Inputs and outputs:** Input: IdP configuration, assertions, SCIM calls. Output: authenticated sessions via IDN, provisioned users, events `plt.sso.connection_verified`, `plt.scim.user_deprovisioned`.
- **Filters, sorting, search:** Provisioning log filter by operation and status.
- **Notifications and communication:** Email to org admins on SSO enablement, enforcement change and certificate expiry (60 and 14 days before).
- **Error handling and edge cases:** Assertion lacks email: sign-in fails with an explanatory page and a log entry. Certificate expired: SSO disabled for new sign-ins and admins notified; the break-glass account remains. User exists with the same email under another tenant: sign-in refused with a conflict message and support path. SCIM duplicate: 409 per spec.
- **Dependencies:** IDN (planned), FR-PLT-015, FR-PLT-016, FR-ADM-007 (staff SSO), ENT-PLT-10.
- **Security and privacy:** Strict signature validation; enforcement always leaves an owner recovery path; SCIM tokens hashed and rotatable.
- **Acceptance criteria:**
  - Given an unsigned SAML assertion, when posted to the ACS, then sign-in is rejected and logged.
  - Given SCIM `active=false` for a user, when received, then their sessions are revoked within 5 minutes.
  - Given a tenant enabling "Required for all members" with no break-glass account, when saving, then validation fails.

### FR-PLT-022 — Payment provider port

- **Sub-module:** C. Integrations
- **Priority / tier:** Must · R5
- **Source:** [SRC: SSOT §13.3 Stripe bidirectional billing, webhooks, metering, invoicing] · [SRC: SSOT BR-32 subscription state webhook-owned]
- **Purpose and outcome:** BIL charges, refunds and manages subscriptions through a provider-neutral port, with payment state owned by verified webhooks, so the provider can change without domain change.
- **Roles and permissions:** `system` · `FIN: operational views via ADM` · `PAD: catalog and keys`
- **Preconditions and entry points:** BIL requests payment operations; provider configured per environment.
- **User interactions and actions:** End users see hosted checkout and billing portal pages of the provider (card data never touches TalentSphere servers); staff see state through ADM. No direct user controls in PLT.
- **System behaviour:** `PaymentPort` operations: `createCheckoutSession`, `createCustomer`, `attachPaymentMethodViaPortal`, `createSubscription`, `changeSubscription`, `cancelSubscription`, `refund`, `listDisputes`, `submitDisputeEvidence`, `reconcile(range)`. All calls carry idempotency keys (provider-supported) derived from BIL's intent ids. State changes are accepted only from verified provider webhooks (BR-PLT-043): signature verified, event id deduplicated, processed in order by `created` with out-of-order tolerance, applied idempotently by BIL; webhook endpoint acknowledges after durable enqueue. Customer and subscription mappings are stored with provider ids; tax and invoicing features are delegated to the provider where legally appropriate. Currency handling in minor units with ISO 4217. Reconciliation job compares provider balance transactions to BIL ledger daily and raises worklists (FR-ADM-035). Test and live modes are strictly separated by environment keys. Provider outage degrades to "Billing temporarily unavailable" with queued intents (no duplicate charges on resume).
- **UI elements and controls:** n/a — port; provider-hosted pages.
- **Configuration options:** Platform: provider selection per region (OD-PLT-15), webhook endpoints, API versions pinned.
- **Business rules:** BR-PLT-043, BR-PLT-013, BR-PLT-040
- **Validation:** Webhook signature; event type allowlist; amounts match order records before applying.
- **Inputs and outputs:** Input: BIL intents, provider webhooks. Output: provider calls and verified events delivered to BIL.
- **Filters, sorting, search:** n/a — port.
- **Notifications and communication:** None directly (BIL owns customer emails).
- **Error handling and edge cases:** Duplicate webhook: ignored by event id. Unknown event type: stored and ignored with metric. Webhook backlog: alert when lag exceeds 5 minutes. Provider API version upgrade: pinned and tested in sandbox before switch.
- **Dependencies:** BIL (planned), FR-PLT-012, FR-PLT-016, FR-PLT-039, FR-ADM-035.
- **Security and privacy:** No card data stored (PCI scope minimized via hosted fields); keys in vault; webhook secrets rotated.
- **Acceptance criteria:**
  - Given a duplicate payment webhook, when received, then BIL state changes once.
  - Given a refund request retried after a timeout, when sent with the same idempotency key, then the provider issues one refund.
  - Given a webhook with an invalid signature, when received, then it is rejected and not enqueued.

### FR-PLT-023 — Email and SMS provider ports

- **Sub-module:** C. Integrations
- **Priority / tier:** Must · R1
- **Source:** [SRC: SSOT §13.3 transactional email provider behind a provider port (decides none)] · [SRC: ARCHITECTURE Brevo behind provider-independent service] · [PROP] for SMS
- **Purpose and outcome:** NTF sends email and (where in scope) SMS through replaceable providers with deliverability controls, so messages arrive and failures are handled.
- **Roles and permissions:** `system` · `PAD: provider configuration` · `SUP: delivery status lookup (metadata)`
- **Preconditions and entry points:** NTF requests a send with a template id, recipient, locale and variables.
- **User interactions and actions:** End users unsubscribe via links and manage preferences in NTF. Staff view delivery status in tickets and ADM.
- **System behaviour:** `EmailPort.send({to, templateKey, variables, idempotencyKey, class})` and `SmsPort.send` with the same shape. Adapters implement the provider API, map provider events (delivered, bounced, complained, opened if enabled) to normalized events delivered to NTF; hard bounces and complaints add the address to a suppression list honored by all sends except mandatory security messages to a user's verified address (BR-PLT-044). Sender domain authentication: SPF, DKIM and DMARC records documented and monitored; separate sending streams for transactional and bulk/marketing with different IPs or subdomains. Rate limiting per provider quota; provider failover (primary and secondary) for transactional email when the circuit opens `[PROP]`. Message bodies and recipient addresses are not written to application logs (only ids and status). SMS: sender ids, opt-in records, STOP handling, country regulations, per-country enablement; OTP and security messages only until a decision (OD-PLT-12). Template rendering is in NTF; the port receives rendered content or a provider template id. Idempotency key prevents duplicates on retry. A dev outbox replaces providers outside production and is labeled as such.
- **UI elements and controls:** n/a — port; admin views via ADM.
- **Configuration options:** Platform: providers, streams, failover, countries for SMS, send rate caps. Tenant: custom sending domain (enterprise) `[PROP]`.
- **Business rules:** BR-PLT-044, BR-PLT-013, BR-PLT-040
- **Validation:** Recipient address syntax; template key exists; class (transactional, security, marketing) required; suppressed addresses blocked for non-mandatory classes.
- **Inputs and outputs:** Input: send request. Output: accepted id, delivery events.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** n/a (this is the channel).
- **Error handling and edge cases:** Provider 5xx: retry with backoff, then failover. Soft bounce: retried by the provider; repeated soft bounces after 3 attempts treated as hard for suppression. Complaint: suppress and notify NTF. Webhook from the provider with bad signature: rejected.
- **Dependencies:** NTF (planned), FR-PLT-012, FR-PLT-016, FR-PLT-039.
- **Security and privacy:** Recipients are personal data: minimal retention in provider; DPAs required; no content in logs.
- **Acceptance criteria:**
  - Given a hard bounce, when received, then the address is suppressed and marketing sends to it are refused.
  - Given a retried send with the same idempotency key, when the first succeeded, then no second email is sent.
  - Given the primary provider circuit open, when a transactional email is sent, then the secondary provider delivers it.

### FR-PLT-024 — Video meeting providers

- **Sub-module:** C. Integrations
- **Priority / tier:** Should · R2
- **Source:** [SRC: SSOT F-33 video interview rooms; §13.3 Kaltura / Panopto / MS Stream gateways Ph6] · [PROP] for conferencing providers
- **Purpose and outcome:** Interviews and mentoring sessions can use the participant's preferred meeting tool (or a built-in room) with links created and cancelled automatically.
- **Roles and permissions:** `REC, HMG, MNT, INS: connect personal provider` · `EAD: org default provider` 
- **Preconditions and entry points:** INT or MEN schedules a session needing a meeting link. Entry: Settings > Connected accounts > Video.
- **User interactions and actions:** 1. Connect Zoom, Google Meet (via calendar), Microsoft Teams, or choose "TalentSphere room". 2. When scheduling, choose the provider; the link is created and placed in the calendar invite. 3. Participants join via the link; hosts see attendance where the provider returns it. 4. Cancelling the session cancels the meeting.
- **System behaviour:** `MeetingPort`: `createMeeting`, `updateMeeting`, `cancelMeeting`, `getAttendance`, `getRecordingStatus`. Links created at scheduling time with lobby or waiting room defaults and unique per session. Recording: off by default; enabling requires the consent flow of INT (all parties informed before joining) (BR-PLT-045); recordings stored by the provider are not copied unless INT's retention rules apply, then ingested through the file service with a retention class. If the provider fails at creation, the system offers the built-in room or a manual link field. Enterprise gateways (Kaltura, Panopto, Microsoft Stream) are catalog entries for lecture video hosting under LRN via the media port (FR-PLT-035), not the meeting port.
- **UI elements and controls:** Provider selector in the scheduling flow, connection cards, link display with copy.
- **Configuration options:** User: default provider. Org: default and allowed providers, recording policy.
- **Business rules:** BR-PLT-045, BR-PLT-013, BR-PLT-040
- **Validation:** Provider connection must be active; durations within provider limits; recording requires consent flags.
- **Inputs and outputs:** Input: session details. Output: meeting link, attendance data.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** Link included in INT notifications.
- **Error handling and edge cases:** Provider token expired: reauth prompt to the host before scheduling completes. Meeting deleted at provider: INT is told and offers a new link. Attendance unavailable: field absent, not zero.
- **Dependencies:** FR-PLT-015, FR-PLT-016, INT and MEN (planned).
- **Security and privacy:** Least-privilege scopes (create meetings only); recording consent; no content stored beyond metadata unless INT policy.
- **Acceptance criteria:**
  - Given an interview scheduled with Zoom, when it is cancelled, then the meeting is cancelled at the provider.
  - Given recording enabled without participant consent configured, when scheduling, then validation fails.
  - Given the provider API down, when scheduling, then the user can pick the built-in room and no partial meeting remains.

### FR-PLT-025 — Identity verification vendor port

- **Sub-module:** C. Integrations
- **Priority / tier:** Should · R4
- **Source:** [SRC: SSOT §13.3 IDV vendor Ph9 OD-27] · [SRC: Yash 18 PROC-01 identity fallback]
- **Purpose and outcome:** BGV and IDN verify a person's identity document and liveness through a replaceable vendor, receiving only the minimal result, so the platform avoids storing identity documents.
- **Roles and permissions:** `CAN, STD, MNT, FRL, EAD: complete verification` · `PAD, SAD: vendor configuration`
- **Preconditions and entry points:** BGV or IDN requires a verification (profile trust badge, mentor onboarding, support recovery). 
- **User interactions and actions:** 1. The user is redirected to the vendor's hosted flow (or embedded SDK) after a consent screen stating what is collected and why. 2. They capture the document and a selfie. 3. They return to TalentSphere and see "Verification in progress" then the result.
- **System behaviour:** `IdentityVerificationPort`: `createSession(subject, level, locale)`, `getResult(sessionId)`, webhook `verification.completed`. The vendor holds documents and biometrics under its retention (contractually short, `[PROP]` 30 days); TalentSphere stores only the outcome facts (verified, level, name match boolean, document country and type, expiry month, verified at, vendor reference) not images (BR-PLT-046). Name mismatch with profile prompts a profile correction flow rather than rejection. Results valid for a policy period (24 months default). Retries limited (3 attempts per 24 hours). Vendor failure shows "Verification unavailable, try later" and does not block non-dependent actions. Appeal path through support (PROC-15). Region and legal restrictions per country on biometrics determine availability.
- **UI elements and controls:** Consent screen, redirect, status page with states (Not started, In progress, Verified, Needs another try, Unable to verify), help link.
- **Configuration options:** Platform: vendor, levels, validity, countries. 
- **Business rules:** BR-PLT-046, BR-PLT-013
- **Validation:** Consent recorded before session creation; webhook signature; result schema.
- **Inputs and outputs:** Input: session request. Output: verification facts to BGV.
- **Filters, sorting, search:** n/a.
- **Notifications and communication:** Result notification via NTF.
- **Error handling and edge cases:** User abandons: session expires after 24 hours. Vendor returns "refer" (manual review): state `in_review` with SLA. Document type unsupported: guidance to alternatives.
- **Dependencies:** BGV (planned), IDN, FR-PLT-012, FR-PLT-016.
- **Security and privacy:** Biometrics never stored by TalentSphere; explicit consent; results as minimal facts; DPA with vendor.
- **Acceptance criteria:**
  - Given a successful verification, when the webhook arrives, then only outcome facts are stored and no image exists in TalentSphere storage.
  - Given 4 failed attempts in 24 hours, when the user starts another, then it is refused with a retry time.
  - Given a vendor outage, when the user opens verification, then the page says unavailable and other features work.

### FR-PLT-026 — Integration health monitoring and circuit breakers

- **Sub-module:** C. Integrations
- **Priority / tier:** Must · R1
- **Source:** [SRC: SSOT §13.4 status visible in admin health; circuit breakers with degraded modes; BR-28 live / inferred / degraded / not-configured]
- **Purpose and outcome:** Everyone can see whether each integration really works, with honest unknowns, and failures are contained automatically.
- **Roles and permissions:** `EAD, IAD, EXA: view their connections' health` · `PAD, SUP: view platform and tenant health` · `PAD: override breakers`
- **Preconditions and entry points:** Connections and platform adapters exist. Entry: Settings > Integrations (per connection status), ADM health dashboard (FR-ADM-039).
- **User interactions and actions:** 1. See per-connection status: Live, Inferred, Degraded, Not configured, Needs sign-in, Unknown, with last success time and last error. 2. Click "Run check". 3. Read the suggested fix (reconnect, check permissions, wait for provider). 4. PAD sees fleet-wide per-adapter error rates and breaker states.
- **System behaviour:** Health sources: (1) active `healthCheck()` calls on a schedule (every 5 minutes for platform adapters, hourly for tenant connections); (2) passive success and error rates from real calls; (3) provider status feeds where available (inferred). Status values follow BR-28: `live` (recent successful probe and calls), `inferred` (derived from provider status or indirect signals), `degraded` (elevated errors or latency), `not_configured`, `reauth_required`, `unknown` (no data in 2 intervals; never shown as healthy, BR-PLT-019). Circuit breaker per adapter and tenant: opens after N consecutive failures or error rate over threshold within a window, half-open probes after cool-down; open breaker returns the adapter's degraded response instantly rather than waiting for timeouts. Health changes emit `plt.integration.health_changed`, consumed by ADM and incident tooling. Per-adapter SLO tracking and an alert when a breaker stays open longer than 15 minutes.
- **UI elements and controls:** Status chips with text and icon, last success and error times, "Run check" button, fix suggestions, admin fleet table.
- **Configuration options:** Platform: probe intervals, breaker thresholds, cool-downs per adapter.
- **Business rules:** BR-PLT-019, BR-PLT-040
- **Validation:** Probe calls must be safe (read-only) and rate-limited.
- **Inputs and outputs:** Input: probe results, call outcomes. Output: health state, events.
- **Filters, sorting, search:** Admin table filter by adapter, state, tenant.
- **Notifications and communication:** Tenant admins get an email when a connection is degraded for over 1 hour; PAD gets alerts for platform adapters.
- **Error handling and edge cases:** Probe itself failing due to platform issues: state `unknown`, not `degraded`. Breaker open for a tenant due to their credentials: scoped to that tenant only.
- **Dependencies:** FR-PLT-016, FR-ADM-039, ENT-PLT-10.
- **Security and privacy:** Health data excludes payloads and secrets.
- **Acceptance criteria:**
  - Given no probe result for 2 intervals, when the page loads, then the status is Unknown, not Live.
  - Given 10 consecutive provider failures, when the next call is made, then the breaker returns the degraded response immediately.
  - Given a health transition, when it occurs, then `plt.integration.health_changed` is emitted once.

### FR-PLT-027 — Integration marketplace decision gate

- **Sub-module:** C. Integrations
- **Priority / tier:** Should · R6 (decision) · Won't-now (marketplace build)
- **Source:** [SRC: SSOT §4.2 non-goal: not a general marketplace] · [SRC: SSOT §13.3 Zapier / Make future] · [PROP] for gate
- **Purpose and outcome:** The team decides, on stated criteria, whether to let third parties publish apps to a TalentSphere directory; until then only first-party catalog integrations exist. The gate avoids drifting into the general-marketplace non-goal.
- **Roles and permissions:** `PAD, SAD, product owner: decide` · `developers: apply for review (after the gate opens)`
- **Preconditions and entry points:** Public API and OAuth operating for at least one release cycle with measured third-party demand.
- **User interactions and actions:** 1. PAD reviews the gate dashboard: number of registered apps, request volume, partner inquiries, abuse incidents, support load. 2. Records the decision (stay first-party only; allow unlisted private apps for customers; open a curated directory). 3. If curated directory approved, the build proposal lists the review process, policies, revenue-share question and security requirements.
- **System behaviour:** Criteria `[PROP]`: (a) at least N active third-party apps by verified developers (N set in OD-PLT-08); (b) no unresolved high-severity abuse incidents tied to API apps in the last two quarters; (c) completed app review process (security questionnaire, scope justification, privacy policy, support contact); (d) legal review of developer terms and data-processing terms; (e) support capacity defined. Even when open: apps listed only if they use only low and medium risk scopes or pass a manual review for high; sealed scopes remain forbidden; listing is within the career domain (recruiting, learning, career tools), not a general app store; apps can be delisted and their tokens revoked. Private (unlisted) custom apps for a single customer are allowed without the directory. Decision records are retained.
- **UI elements and controls:** Gate dashboard, decision form, records list.
- **Configuration options:** Platform: gate thresholds.
- **Business rules:** BR-PLT-020, BR-PLT-004
- **Validation:** Decision requires metrics snapshot and rationale ≥ 100 characters; approvals by product owner and SAD.
- **Inputs and outputs:** Input: metrics, rationale. Output: decision record.
- **Filters, sorting, search:** Records by date and decision.
- **Notifications and communication:** Quarterly review reminders to PAD.
- **Error handling and edge cases:** Metrics unavailable: "Not measured", decision deferred.
- **Dependencies:** FR-PLT-028, FR-PLT-034, FR-ADM-010.
- **Security and privacy:** Metrics aggregated.
- **Acceptance criteria:**
  - Given thresholds unmet, when a PAD attempts to open directory submissions, then the system requires a documented exception.
  - Given a decision of "unlisted private apps only", when a developer submits a public listing, then it is refused.
  - Given a delisted app, when delisted, then its tokens are revoked.

