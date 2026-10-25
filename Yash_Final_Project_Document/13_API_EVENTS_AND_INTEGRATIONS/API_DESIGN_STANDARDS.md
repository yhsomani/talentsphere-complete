# API Design Standards

Doc ID: API-STD · Owner: Backend Architecture Team · Version 1.0 · Status: Under Review · Relates: ADR-T06, ADR-T07, ADR-T08, ADR-T18, INV-T01, INV-T02, INV-T10, INV-T13, INV-T15, FF-01, FF-06, FF-07 · Companions: APIC-01 `API_CATALOG.md`, `contracts/openapi.yaml`, BE-01 §4-§9

Tags: **[TARGET]** decision · **[OPEN]** open · **[REF]** reference. Numeric limits are **[TARGET]** starting values with rationale; calibration is OPEN-B2. The reference project's `API_CONTRACTS.md` is **[REF]** only.

**Root SSOT reconciliation (OPEN-46):** SSOT v6 §§23.1–23.3 specifies a `{success,data,meta}` success/list envelope, cursor default 20, and a minimum deprecation period of six months. This target standard specifies `{items,page}` list pagination with default 25 and a 90-day deprecation window. RFC 9457 `problem+json` describes errors and may coexist with a success envelope; whether the SSOT success envelope is retained is not yet decided. These contract differences remain open, and this target document does not silently supersede the SSOT.

The candidate row-level mapping for SSOT `CON-001…CON-016` is in [SSOT_INTERFACE_CONTRACT_CROSSWALK](SSOT_INTERFACE_CONTRACT_CROSSWALK.md) and [CSV](SSOT_INTERFACE_CONTRACT_CROSSWALK.csv). It records two conflicts and remaining partial mappings; no equivalence is approved.

## 1. Principles
1. The contract is the Zod schema in `packages/contracts`; OpenAPI 3.1, JSON Schema and TypeScript client types are generated from it (ADR-T08). Hand-edited OpenAPI is a defect.
2. Every route declares a policy action; the contract documents it as `x-policy-action` (FF-01). Authorisation is server-side and per resource (INV-T01/T02). A client never learns permissions except as UI hints from `GET /me/capabilities`.
3. Safe by default: unknown request fields are rejected; response fields are additive; unsafe operations are retry-safe (INV-T10); concurrent edits are detected (ETag).
4. The API exposes *use cases*, not tables: state changes are modelled as resources (`/publication`, `/closure`, `/withdrawal`, `/stage-transitions`, `/decision`) so that history, idempotency and policy attach naturally.
5. No cross-origin API for the browser: the shell, remotes and API share one origin through the BFF routing layer; there is no CORS allowlist to misconfigure. Integrators use service tokens (§4) from servers.

## 2. Resource, URL and payload conventions
| Topic | Rule |
|---|---|
| Base | `/api/v1`; JSON only (`application/json; charset=utf-8`); errors `application/problem+json` |
| Paths | lowercase, plural nouns, kebab-case multiword (`saved-searches`, `reference-requests`); ids in path are opaque UUIDs; `me` is the only alias and resolves to the authenticated account; nesting at most two levels (`/orgs/{orgId}/jobs`); a resource addressable by id is also available at its top-level path (`/jobs/{jobId}`) for policy lookup by resource |
| Verbs | Use HTTP methods for CRUD. State transitions are `POST` to a noun that names the *result* of the transition (`POST /jobs/{id}/closure`). No verbs in paths except established protocol endpoints (`/auth/login`) |
| Fields | `camelCase`; timestamps RFC 3339 UTC with `Z`; dates `YYYY-MM-DD`; enums lowercase `snake_case` strings (never integers); money = integer minor units + ISO 4217 code; ids `uuid`; booleans never tri-state (use explicit enum); absent vs `null`: absent = not provided / not visible to caller, `null` = known empty |
| Masking | Fields the caller may not see (consent, masking obligations) are **omitted**, not nulled, and the representation carries no hint of their existence beyond documented `consentLive`-style flags |
| Sizes | Request body <= 1 MB JSON (uploads go to presigned URLs); string maxima declared per field; arrays have `maxItems`; rejected with 413/422 |
| Locale | `Accept-Language` affects only problem `title`/`detail` text and server-rendered strings; data is never translated implicitly |
| Methods | `PUT` replaces a whole sub-resource and requires `If-Match` where versioned; `PATCH` is JSON Merge Patch semantics on documented fields only |
| Idempotent semantics | `GET/PUT/DELETE` idempotent by HTTP; `POST` idempotent via `Idempotency-Key` (§8) |
| Redirects | Only for protocol flows (SSO). APIs return 303/302 `Location` only on documented routes |

## 3. Versioning and evolution (ADR-T08, ADR-T18)
| Rule | Detail |
|---|---|
| Major in URL | `/api/v1`. A `v2` exists only for unavoidable breaking change; v1 and v2 run side by side for a documented window |
| Compatible changes (no version bump) | Add optional request field, add response field, add enum value **only where the contract states "clients must tolerate unknown enum values"** (all response enums carry this note), add endpoint, loosen validation, add problem type |
| Breaking changes | Remove/rename field, tighten validation, change type/semantics, remove enum value, change auth or idempotency semantics, change default sort. Detected by `oasdiff` in CI (FF-06); a breaking diff on v1 fails the build |
| Remote compatibility | Each remote manifest declares `apiRange`; the shell refuses to activate a remote outside the range and falls back to last-known-good (ADR-T18). Because the PWA may run an old shell/remote for days (service-worker cache), the API supports the previous *remote* release for at least one deprecation window |
| Deprecation | `Deprecation: true` + `Sunset: <date>` + `Link: <doc>; rel="deprecation"` headers; minimum window 90 days [TARGET: remotes release independently and installed PWAs update lazily; shorter windows strand clients]; usage telemetry decides removal |
| Experimental | Routes tagged `x-stability: experimental` may change without notice; none are exposed to the product UI |

## 4. Authentication and request provenance (ADR-T06)
| Caller | Mechanism |
|---|---|
| Browser (shell + all remotes) | `__Host-ts_at` (15 min; `HttpOnly; Secure; SameSite=Lax; Path=/`) and `__Secure-ts_rt` (refresh; `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh` — the `__Host-` prefix cannot be path-scoped) cookies. Remotes call `fetch('/api/v1/...')` through the shell's fetch wrapper with `credentials: 'same-origin'`; they never read tokens (INV-T16) |
| CSRF | Unsafe methods require `X-CSRF-Token` (double-submit value issued by `GET /me` / `POST /auth/login`) **and** pass an `Origin`/`Sec-Fetch-Site: same-origin` check. `SameSite=Lax` is defence in depth, not the control |
| Step-up | Operations marked `step-up-required` (password change, erasure request, data export, passkey removal, SSO config) need `recentAuthAt` within 10 minutes [TARGET] or return `403 step-up-required` with the acceptable `amr` methods; the client re-authenticates then retries with the same Idempotency-Key |
| Capability tokens | Referee, password-reset, email-verify, org-invitation, unsubscribe tokens: >=256-bit random, single use, expiring, bound to one request, stored hash-only (INV-T05); sent in the path/body, never in query strings (avoids referer/log leakage); responses set `Referrer-Policy: no-referrer`, `Cache-Control: no-store`; invalid/expired/consumed tokens return an indistinguishable `404` (expired may return `410` only where the token is still bound to a visible request) |
| Service tokens | ROLE-SVC clients (`api_client`) obtain short-lived (<=1 h) tokens by client-credentials from `POST /oauth/token` [TARGET; route in APIC-01, details OPEN-B16]; scopes are a subset of the owning org's role; accepted only on routes whose catalog authN includes `+SVC`; every call attributed in `audit_event` |
| Provider callbacks | Signature verification over the raw body with timestamp tolerance (Stripe: 5 min) before any parsing; replay protection by event id (INV-T17) |
| Trace | `traceparent` accepted and propagated; `X-Request-Id` echoed; both appear in every problem body as `traceId` |

## 5. Error model — RFC 9457 problem+json (ADR-T08)
Body: `{type, title, status, detail?, instance?, code, traceId, retryAfterSeconds?}`; validation errors add `errors: [{pointer, code, message}]` (JSON Pointer into the request). `type` is a stable URI `https://errors.talentsphere.example/<slug>` (placeholder authority; resolved to docs) and `code` repeats the slug for programmatic use. Messages never include secrets, SQL, stack traces, other users' data, or whether a *different* user's resource exists.

| Slug (`code`) | Status | When | Client action | Retry |
|---|---|---|---|---|
| `malformed-request` | 400 | Unparseable JSON, bad cursor, bad header | Fix request | No |
| `unauthenticated` | 401 | No/expired/invalid session or token | Refresh then re-login | After refresh |
| `session-reuse-detected` | 401 | Rotated refresh token replayed; family revoked (BR-T050) | Full re-login | No |
| `entitlement-required` | 402 | Plan/quota does not permit the action | Show upgrade path | After plan change |
| `forbidden` | 403 | Authenticated but policy denies | Hide/disable | No |
| `consent-required` | 403 | Needed consent scope absent/revoked (INV-T15) | Explain; request consent | After consent |
| `ai-prohibited` | 403 | AI blocked by assessment mode (INV-T06) | Explain | No |
| `step-up-required` | 403 | Recent authentication needed | Re-authenticate | Yes |
| `grant-required` | 403 | Support access needs live grant (BR-T041) | Request grant | After grant |
| `not-found` | 404 | Missing **or not visible** to caller | - | No |
| `conflict` | 409 | Uniqueness/state conflict (generic) | Refetch | Maybe |
| `duplicate-application` | 409 | BR-T001 | Show existing application | No |
| `state-transition-invalid` | 409 | Not allowed by SM-* (INV-T11) | Refetch state | No |
| `reminder-limit-reached` | 409 | BR-T004 (max 2) | - | No |
| `idempotency-in-flight` | 409 | Same key running | Wait `Retry-After` | Yes |
| `gone` | 410 | Expired token/request/export | Re-request | No |
| `precondition-failed` | 412 | `If-Match` stale | Refetch, merge, retry | After refetch |
| `payload-too-large` | 413 | Body/file over cap | Reduce | No |
| `unsupported-media-type` | 415 | Content-type not allowlisted | Fix | No |
| `validation-failed` | 422 | Schema/business validation | Fix fields (`errors[]`) | No |
| `idempotency-key-reuse` | 422 | Key reused with different request | New key | No |
| `account-locked` | 423 | Throttled/locked login | Wait / recover | After `until` |
| `precondition-required` | 428 | Missing `If-Match` or required `Idempotency-Key` | Add header | Yes |
| `rate-limited` | 429 | Class limit exceeded | Back off per `Retry-After` | Yes |
| `internal` | 500 | Unexpected | Report `traceId` | Idempotent only |
| `upstream-unavailable` | 503 | Dependency/breaker open (BE-01 §19) | Retry later | Yes |
| `upstream-timeout` | 504 | Dependency timeout | Retry later | Yes (idempotent) |

Status-code discipline: `401` never reveals whether an account exists; login failures are uniform; `403` vs `404` follows BE-01 §5 (existence not disclosed). The catalog's "Errors" column lists route-specific statuses only; generic ones apply everywhere.

## 6. Pagination (mandatory for list routes)
| Rule | Detail |
|---|---|
| Style | Keyset (cursor) pagination. Request: `?limit=<1..100, default 25>&cursor=<opaque>`. Response: `{items: [...], page: {nextCursor, hasMore, limit}}` |
| Cursor | Opaque, HMAC-signed, includes sort key tuple + filter hash + issued-at (valid 24 h); a cursor from a different filter set or principal is rejected (`malformed-request`). Never contains ids of rows the caller cannot see |
| Ordering | Every list has a total, documented, stable order ending in `id` as tiebreaker (e.g. `createdAt desc, id desc`); ordering parameter `sort` accepts a per-route allowlist |
| Totals | No total counts by default (expensive and a side channel). Where the UI needs a number, a separate cheap count endpoint or `page.estimatedTotal` bounded by a cap is provided per route |
| Consistency | Cursor pages are stable under inserts (no offset drift); deletions may shorten a page. Search results use `(rank_bucket, id)` keyset and are best-effort stable |
| Guard | A list route without `pagination: cursor` fails the route-registry lint unless its result set is bounded by construction (documented) |

## 7. Filtering, sorting, search
Filters are explicit query parameters named after fields (`state=published&workMode=remote`); multi-values repeat the parameter; ranges use `from`/`to` or `<field>Since`; free text is `q` (length-capped, never concatenated into SQL). Unknown filters -> 422 (no silent ignore). Sorting is an allowlist (`sort=-publishedAt`). No client-supplied field selection or `expand` (keeps policy/masking evaluation per representation simple). Search endpoints (`/search/*`) are separate from list endpoints (§APIC-01 note).

## 8. Idempotency (INV-T10, FF-07)
Header: `Idempotency-Key: <16-64 char client-generated id>`. Semantics per BE-01 §8: same principal + key + identical request returns the stored response with `Idempotency-Replayed: true`; different request body/route -> `422 idempotency-key-reuse`; concurrent duplicate -> `409 idempotency-in-flight` + `Retry-After`; keys expire after 24 h (7 days for payment-adjacent routes). Operations whose absence of a key would risk money, legal effect, or irreversible harm **require** the key (`428` if absent) — listed in the catalog as "Key (required)". Replays of responses larger than 64 KB return `200` with the current representation and the original `Location`. Offline-queued writes (ADR-T10) reuse the key they were enqueued with.

## 9. Rate limiting (BE-01 §16)
| Class | Applies to | Initial limit [TARGET] | Key | Rationale |
|---|---|---|---|---|
| RL-AUTH | login, register, forgot, passkey options, email challenges | 20 / 10 min per IP; 10 / 15 min per account identifier; progressive delay then `account-locked` | IP prefix + identifier | Far above human typo rate, below credential-stuffing economics; separate per-account counter defeats IP rotation |
| RL-TOKEN | capability-token routes | 30 / 10 min per IP; 10 / hour per token hash | IP, token hash | Token space is 256-bit so guessing is infeasible; limit contains DoS and log-noise |
| RL-READ | authenticated reads | 600 / min per principal | principal | ~10 req/s sustained is above interactive UI behaviour (bursts of single digits) yet stops bulk scraping through the API |
| RL-WRITE | authenticated writes | 120 / min per principal | principal | Human editing pace; protects outbox/audit write amplification |
| RL-HEAVY | search, recommendations, AI, exports, aggregates | 30 / min and 300 / hour per principal; per-org 600 / hour | principal, org | Costly queries/compute; also limits candidate-scraping rate |
| RL-PUBLIC | anonymous reads | 120 / min per IP prefix | IP | CDN absorbs cacheable traffic; limit targets scrapers |
| RL-WEBHOOK | provider webhooks | no per-IP quota; signature check first; max 50 concurrent | provider | Provider IPs change; authenticity is the gate |

Responses carry `RateLimit-Policy` / `RateLimit` (IETF draft structured headers) and, on `429`, `Retry-After`. Business quotas (outreach, postings, AI spend) are entitlements surfaced as `402 entitlement-required` / `429` with `quota` details, not rate-limit classes. All limits are config; changes need no deploy. Values are starting points, not benchmarks (OPEN-B2).

## 10. Concurrency and caching
| Topic | Rule |
|---|---|
| Strong ETag | Every versioned resource response carries `ETag`; `GET` with `If-None-Match` returns `304` |
| `If-Match` | Required on PATCH/PUT/state-transition routes flagged `m` (catalog "If-Match"); `428` missing, `412` stale (body includes current `ETag` header) |
| Cache-Control | Personal/authenticated: `private, no-store` for sensitive classes (referee, privacy, billing, verification), otherwise `private, max-age=0, must-revalidate`; public catalogs (skills, plans, public jobs/profiles): `public, max-age=60, stale-while-revalidate=300` [TARGET] with `Vary: Accept-Language, Cookie` where personalised variants exist (`O` routes avoid shared caching when a session cookie is present) |
| Service worker | Caches only GETs of owner data allowed by the platform matrix (INV-T13); never caches responses with `no-store`, referee/token routes, or any non-GET; cached entries are labelled stale in UI; logout clears caches |

## 11. Long-running and asynchronous operations
`202 Accepted` + a resource representing the work (`ExportJob`, `DataExport`, `ImportJob`, `FileObject`, `Attempt` with `state`) at a stable URL; clients poll with ETag (`Retry-After` hints) or receive a notification. Status vocabulary is explicit per resource (`requested|building|ready|failed|expired`). No custom `/jobs/{id}` status route for product features; operators use `/admin/jobs`. Results needing authorisation (downloads) return short-lived signed URLs via a dedicated `download-url` route after a policy check, never a public object URL.

## 12. Response filtering by consent and role
Serialisation runs after `policy.can` obligations: `field_mask` removes fields; `require_consent` is resolved before the handler returns data. Recruiter-facing evidence representations include `rung`, provenance summary and only consented artifacts. Representations never include `rung` as a settable field in any request schema (INV-T04) and never include AI-origin text labelled as verified evidence (INV-T08).

## 13. Webhooks and callbacks (inbound/outbound)
Inbound provider webhooks: raw-body signature verification, dedupe by provider event id, respond `2xx` fast, process async. Outbound customer webhooks: versioned envelope, HMAC signature (`TS-Signature: t=<ts>,v1=<hmac>`), at-least-once delivery with retries; payload DTOs are separate from internal events (INT-01 §7).

## 14. Contract governance and testing
| Gate | Tool / rule |
|---|---|
| Generation | Zod -> OpenAPI 3.1 + JSON Schema; CI fails if the generated file differs from the committed contract |
| Breaking-change detection | `oasdiff` (FF-06); AsyncAPI diff for events |
| Route registry lint | Policy action present (FF-01), idempotency declared for unsafe routes (FF-07), pagination for lists, rate class present, problem types declared |
| Contract tests | Provider tests per route (schema conformance incl. error bodies); consumer checks per remote against its declared `apiRange` |
| Security tests | Generated cross-tenant canary (FF-05), IDOR matrix from the permission matrix, token single-use tests, rate-limit tests |
| Docs | Catalog (APIC-01) is regenerated from the registry; hand-written prose lives only in this document |

## 15. Open items
| ID | Item |
|---|---|
| OPEN-B16 | Exact `/oauth/token` service-token flow and scope names (to be specified with INT-01 developer platform; DOM-23 conditional) |
| OPEN-B17 | Whether to expose `estimatedTotal` for any list; default is none |
| OPEN-B18 | Deprecation window length (90 days proposed) vs enterprise contract needs |
