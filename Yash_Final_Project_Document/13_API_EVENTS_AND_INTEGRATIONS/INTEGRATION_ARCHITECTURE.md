# Integration Architecture

Doc ID: INT-01 · Owner: Backend Architecture Team + Security Architect · Version 1.0 · Status: Under Review · Relates: ADR-T12, ADR-T15, ADR-T20, ADR-T09, INV-T05, INV-T06, INV-T07, INV-T14, INV-T17, DOM-15, DOM-16, DOM-17, DOM-23 · Companions: BE-01 §10-§16, §19; EVC-01; API-STD; SEC-01 (SSRF, supply chain), SEC-03 (processors)

Tags: **[TARGET]** design · **[OPEN]** open · **[REF]** reference (the reference project's Stripe/Brevo wiring and `BILLING_MODE`/`dev outbox` ideas are read from repo `CLAUDE.md` only; live delivery there is "not established by source"). Provider behaviour described here reflects general knowledge of those services and **must be re-verified against current provider documentation before implementation**; nothing is implemented or tested.

## 1. Principles
1. **Port per capability, adapter per vendor** (BE-01 §11-§15). Application code depends on `EmailPort`, `PushPort`, `PaymentsPort`, `AiProviderPort`, `ScanPort`, `ObjectStorePort`, `IdentityProviderPort`, `ImportAdapter`, `RunnerPort`, `SearchPort`. Vendor SDK types never cross a port.
2. **Anti-corruption layer (ACL).** Each adapter translates provider payloads into the module's canonical model, validates them with Zod (fail closed on unknown critical shapes, tolerate unknown extra fields), and maps provider errors into three internal classes: `transient`, `permanent`, `rate_limited` (BE-01 §7.3).
3. **Idempotent and replayable.** Every outbound call that has an effect carries an idempotency key derived from `(job_id, purpose)`; every inbound webhook is deduplicated by provider event id and processed asynchronously.
4. **Authenticity before parsing.** Inbound webhooks: verify signature over the raw body, check timestamp tolerance, then parse.
5. **Least data.** Only the minimum fields leave the system; classification C3/C4 never goes to a provider except where that is the provider's function (e.g. recipient address to the email provider). Candidate data to AI providers requires consent `ai.assist.process` (INV-T15).
6. **Degrade, never corrupt.** An outage disables the dependent feature or delays async work; it never grants entitlements, marks evidence verified, or skips a security check (INV-T17, INV-T04).
7. **Secrets in the secret manager**, per-integration least-privilege credentials, separate test/live, rotation procedure documented (SEC-02).
8. **Everything has a fake.** Each port has an in-memory/dev adapter used in CI and local dev; the dev email adapter writes to a labelled outbox table and never sends.

## 2. Integration landscape
| Integration | Direction | Port / adapter | Data out (class) | Auth | Timeouts / retries / breaker | Outage behaviour (summary; matrix in §11) | Replacement trigger |
|---|---|---|---|---|---|---|---|
| Stripe Checkout/Portal/API | Out | `PaymentsPort` / `StripeAdapter` | Customer id, plan price id, success/cancel URLs, email (C2) | Restricted API key (server only) | 3 s/10 s, 2 retries with same idempotency key, breaker (BE-01 §19) | Upgrades unavailable; existing entitlements unchanged | New market payment need (ADR-T15) |
| Stripe webhooks | In | `POST /webhooks/stripe` | - | `Stripe-Signature` HMAC | respond < 5 s; async processing 8 attempts | Entitlement changes delayed until redelivery/reconcile | - |
| Email (Brevo) | Out | `EmailPort` / `BrevoAdapter`, `DevOutboxAdapter` | Recipient, template vars (C2/C3 minimal; token links) | API key (server) | 3 s/10 s, 12 attempts/24 h, breaker | Mail delayed; in-app notifications continue | Deliverability/cost (ADR-T20) |
| Email events | In | `POST /webhooks/email` | - | Provider signature/secret | async | Suppression lags | - |
| Web Push services | Out | `PushPort` / `WebPushAdapter` | Encrypted generic payload | VAPID JWT | 3 s/5 s, <=4 retries | No push; in-app/email fallback | - |
| AI providers | Out | `AiProviderPort` / adapters | Redacted context (C2 minimised) | API key | 3 s/30 s, 1 retry, breaker | AI feature unavailable only | Cost/quality/DPA (OPEN-B5) |
| Object store | Out/In | `ObjectStorePort` | Files (C2/C3) | Scoped credentials; presigned URLs | 2 s/10 s, 2 retries | Uploads/downloads 503 | Provider/residency |
| Virus scanner | Out | `ScanPort` | File bytes | Local/VPC | 5 s/60 s, 5 attempts | **Fail-closed** (files stay invisible) | Engine choice (OPEN-B3) |
| OIDC/SAML IdPs | Out/In | `IdentityProviderPort` | Auth requests; claims in | Client credentials / signed assertions | 3 s/8 s | SSO login fails; fallback only if org allows | - |
| Import adapters | In | `ImportAdapter` | Files/URLs from users | n/a | per-host 3 s/15 s | Import job fails with report | - |
| Customer outbound webhooks | Out | `WebhookDispatcher` | Curated event DTOs (ids + minimal facts) | HMAC signature | 3 s/5 s, 12 attempts/24 h | Customer endpoint failing is isolated | - |
| Sandbox runner | Out | `RunnerPort` | Candidate code artifacts | mTLS + signed requests | per assessment | Code assessments unavailable/unverified | Isolation tech (OPEN-B6) |
| Breached-password check | Out | `PasswordPolicyPort` | k-anonymity hash prefix | none | 1 s, fail-open | Check skipped | OPEN-B8 |
| Calendar | Out | none: generate `.ics` attachments | Interview details | n/a | n/a | n/a | Calendar APIs deferred (OPEN-B39) |
| Analytics vendor | - | none at launch | - | - | - | - | Own consent-gated table only |

## 3. Anti-corruption layer pattern
| Element | Rule |
|---|---|
| Canonical models | Defined in the owning module (`SubscriptionState`, `EmailDeliveryResult`, `PushOutcome`, `AiCompletion`, ...). Adapters return only these |
| Inbound validation | Zod schema per provider event type used; unknown event types are logged at info and acknowledged (so providers do not retry forever) but never processed |
| Version pinning | Stripe API version pinned in the client; webhook endpoint version matches; upgrades are explicit migrations with fixture re-recording |
| Error taxonomy | HTTP 5xx/timeouts/network -> `transient`; 429 -> `rate_limited` (honour `Retry-After`); 4xx (except 408/409/425/429) -> `permanent`; signature failure -> reject 400/401 without detail |
| Idempotency | Provider-supported key where available (Stripe `Idempotency-Key`, Brevo message tags/ids); else natural key checked in our DB before sending |
| Observability | Per-adapter metrics: latency, error class counts, breaker state; logs carry provider request id, never payloads with C3/C4 |
| Contract tests | Recorded fixtures per provider call/event; replayed in CI; a nightly job runs against provider sandboxes where they exist |
| Isolation | Adapter packages are importable only by their module's `adapters/` (FF-02 lint), so a provider SDK upgrade or compromise has a bounded blast radius |

## 4. Stripe (ADR-T15, INV-T17)
**Flow.** (1) Authenticated user/org admin calls `POST .../billing/checkout-sessions`; the server creates a Checkout Session (price id from the `plan` table, `client_reference_id` = subject id, metadata minimal, idempotency key from the request). (2) Browser is redirected to Stripe. (3) The return page shows **"processing"** and polls `GET /me/entitlements`; **redirect success grants nothing**. (4) A signed webhook updates `subscription`, and `entitlement` is recomputed in the same transaction. (5) `billing.reconcile` (periodic) lists subscriptions from Stripe and corrects drift.

| Stripe event (examples) | Handling |
|---|---|
| `checkout.session.completed` | Link `billing_customer`↔Stripe customer/subscription; no entitlement change until subscription event confirms state |
| `customer.subscription.created/updated/deleted` | Upsert `subscription` (state, plan, seats, period end, cancel flag); recompute entitlements; emit `subscription.changed`, `entitlement.changed` |
| `invoice.paid` / `invoice.payment_failed` | Upsert `invoice`; `payment.failed` -> dunning notifications; entitlement grace policy below |
| `customer.deleted` / dispute events | Flag for manual finance/support handling; no automatic entitlement decision beyond subscription state |

Rules: webhook endpoint verifies `Stripe-Signature` on the raw body with tolerance 5 min, inserts `stripe_event_inbox(stripe_event_id PK)` (duplicates ignored), enqueues processing, returns 200. Out-of-order guard: ignore events whose `created` is older than `subscription.provider_event_created_at`. Entitlements derive only from subscription state + plan features (never from client input). Grace on `past_due`: entitlements remain for a configurable window [OPEN-B40, default 7 days proposed] then downgrade with notice. Seats: seat count from subscription quantity; org membership changes trigger seat sync and warn when over limit (no automatic removal). Taxes, invoicing details, proration, refunds and disputes are handled in Stripe's dashboard/features [OPEN-B41: tax handling]. Hosted Checkout/Portal means card data does not touch TalentSphere systems; the PCI SAQ applicability must be confirmed with the payment provider/QSA guidance (stated as scope reduction, not a compliance claim; SEC-04). API keys are restricted keys (only needed resources), live and test separated by environment; webhook secrets rotate with a dual-secret window.

## 5. Email provider (ADR-T20)
| Topic | Design |
|---|---|
| Categories | `transactional` (account, security alerts, verification/reference mail, application updates the user opted into) and `marketing` (requires `comms.marketing_email` consent; one-click unsubscribe headers per RFC 8058; separate sender stream) |
| Templates | Versioned in repo (`template_id@version`), localisable, plain-text + HTML, rendered by the provider or locally; variables validated against a schema; no raw user HTML |
| **Token links** | Emails carrying capability tokens (referee, reset, verify, invitation) **must have provider click-tracking and open-tracking disabled** and use direct links, so tokens are not rewritten, logged by the provider's redirector, or leaked via a third-party domain |
| Suppression | Provider webhooks (delivered, hard bounce, soft bounce, complaint, unsubscribe, blocked) -> `email_suppression` + `notification.email.bounced`; sending checks suppression first (hash lookup); hard-bounced addresses are marked unreachable and the user is prompted in-app |
| Deliverability | SPF, DKIM, DMARC on the sending domain; dedicated subdomain for transactional vs marketing; monitoring of bounce/complaint rates with alert thresholds [OPEN-B42] |
| Idempotency | `email.send` job id as message idempotency key/tag; resend creates a new job only by explicit user action (rate-limited) |
| Referee mail abuse | Referee requests are rate-limited per candidate, per referee address (hash) and per domain; templates state who asked and offer "this isn't for me / report abuse" (feeds suppression) — BR-T004 reminder cap 2 |
| Dev/test | `DevOutboxAdapter` stores messages in a labelled table with a viewer for developers; production config rejects it at boot (config guard) |
| Outage | Jobs retry up to ~24 h; after that dead-letter + alert; users can request resend; critical security alerts also appear in-app |

## 6. Web Push (ADR-T02, ADR-T20)
VAPID keys held in the secret manager (public key delivered to the client). Subscription is created only after a user gesture + permission grant + `notify.preference` opt-in; stored with encrypted endpoint/keys (C3). Payloads are generic and encrypted per the Web Push standard; they carry a notification id/deep link only. Delivery uses `TTL`, `Urgency` and `Topic` (coalescing) headers; `404/410` removes the subscription; repeated failures expire it. iOS delivery works only for Home-Screen-installed PWAs (secondary-source assumption, ADR-T02), so email/in-app are the guaranteed channels. Quiet hours and per-category preferences are enforced server-side before enqueueing. Capability-detected on the client (FF-09).

## 7. Outbound customer webhooks (DOM-23, conditional)
| Topic | Design |
|---|---|
| Event set | Curated subset (e.g. `application.submitted`, `application.stage.changed`, `job.published`, `job.closed`) as **separate public DTOs** (`webhook v1`), not internal events; payload carries ids and minimal facts; personal data included only if the org has the entitlement and the candidate's consent for that application permits; otherwise the receiver fetches via API under policy |
| Envelope | `{id (event_id), type, apiVersion, createdAt, data}`; header `TS-Signature: t=<unix>,v1=<hex HMAC-SHA256(secret, t + "." + rawBody)>`; secrets per endpoint, shown once, two active secrets during rotation; receivers are told to reject timestamps older than 5 minutes and to dedupe by `id` |
| Delivery | At-least-once; success = 2xx within 5 s; retries 12 attempts over ~24 h with jittered exponential backoff; no ordering guarantee; endpoint auto-paused after sustained failure with owner notification; manual re-send from delivery log |
| Registration | `https` only; verification handshake (signed challenge) at creation; endpoint count and event types capped per org |
| **SSRF defences** | Resolve DNS server-side and reject loopback, private (RFC 1918), link-local (169.254/16 incl. cloud metadata addresses), CGNAT, multicast, unique-local IPv6, IPv4-mapped IPv6, and any internal hostnames; connect to the **validated IP** (pin, defeats DNS rebinding) while sending the original `Host`/SNI; allow only port 443; **do not follow redirects** (or re-validate every hop); response size and time caps; egress only through a dedicated egress proxy/network segment that itself denies internal ranges; no credentials or internal headers attached; same defences for import-by-URL and avatar/URL fetches (SEC-01) |

## 8. AI providers (ADR-T12)
`AiProviderPort`: `generate({purpose, system, userBlocks[], schema, maxTokens, timeoutMs})` and `embed(texts[])`, returning `{content, usage{inputTokens,outputTokens}, providerRequestId}`. Adapters live under `api/ai/adapters`. Model registry (config): `purpose -> {provider, model, maxTokens, costTable, enabled}` so changing models is a config + evaluation change, not a code change. Prompts/templates are versioned in the repo with an evaluation set (accuracy, refusal, injection, PII-leak tests) run in CI for changes. No tool/function calling with side effects in v1. Contractual requirements before enabling a provider: no training on our data, defined retention (zero where available), sub-processor list, region options, security attestations reviewed by privacy/security (OPEN-B31; no claim about any specific vendor's terms). Cost control by budgets (INV-T07) and per-purpose token caps. Outage handling: AI features show unavailable state; jobs retry (3 attempts); there is no silent failover to another provider because data-processing terms differ (OPEN-B5).

## 9. Import adapters
| Aspect | Design |
|---|---|
| Interface | `ImportAdapter { key, accepts(mime/ext), parse(stream, ctx) -> AsyncIterable<NormalizedRecord | RowError>, validate(record), idempotencyKey(source) }` |
| Launch adapters [TARGET] | (a) Institution roster CSV (members, cohorts); (b) Job feed JSON/CSV for employers (creates **drafts** only; publishing is a human action and subject to entitlement); (c) Resume file upload to prefill profile fields — deterministic parsing preferred, any AI-assisted parsing goes through the AI gateway with consent and produces suggestions, not evidence (INV-T08). Profile import from third-party networks is **not** planned (terms/consent unknown, OPEN-B43) |
| Safety | Files go through the upload pipeline (BE-01 §12) first; parsing runs in a worker with memory/time caps; XML parsers disable DTDs/external entities (XXE); archives not accepted; CSV/Excel formula injection neutralised on export and display (leading `= + - @` escaped); URL sources pass the SSRF guard (§7) |
| Process | Upload -> `import_job` -> dry-run preview with row-level errors -> user confirms -> commit in batches (idempotent by `(adapter, source hash, row key)`) -> report file. Nothing is committed on a partially invalid file unless the user chooses "skip invalid rows" |
| Limits | Rows/file size caps per plan; per-tenant concurrency 1; `RL-HEAVY` on creation |
| Privacy | Roster imports create invitations/memberships only; candidate data is not read until the candidate accepts and consents (`evidence.share_institution`) |

## 10. Identity providers (SSO)
OIDC (authorization code + PKCE, `state`, `nonce`, exact redirect URI match, ID-token signature + `iss`/`aud`/`exp` checks, JWKS caching with rotation) and SAML (signed assertions, audience/recipient/`InResponseTo` checks, replay cache, clock skew <= 2 min [TARGET]). Accounts link by `(issuer, subject)` and verified org-domain claims; JIT provisioning only for domains verified by DNS TXT; SSO enforcement per org; removal at IdP does not auto-delete accounts but SCIM-style deprovisioning is out of scope at launch (OPEN-B44). Tokens from IdPs are not stored beyond the login transaction.

## 11. Outage behaviour matrix
| Dependency down | Still works | Degraded / blocked | User message | Operator action | Recovery |
|---|---|---|---|---|---|
| Stripe API | Browsing, all product features, existing entitlements | New checkout/portal sessions | "Billing is temporarily unavailable" | Watch breaker; status page | Auto after breaker half-open; no data to repair |
| Stripe webhooks delayed | Everything | Entitlement/plan changes lag | Post-checkout shows "processing" up to a timeout with support link | Trigger `billing.reconcile` | Redelivery + reconcile |
| Email provider | App, in-app notifications | Verification/reference/reset emails delayed | "We're having trouble sending email" + resend option | Check queue age; consider failover provider via port | Jobs drain on recovery; dead-lettered ones re-queued |
| Web Push | App, email, in-app | Push | none | none | Automatic |
| AI provider | All core flows | AI assist features, embeddings backlog | "Assistant unavailable" | Pause budgets; check breaker | Backlog drains; reservations released |
| Object store | Profile text data, browsing | Uploads, artifact viewing, exports | "File service unavailable" | Escalate to provider | State machine resumes (nothing advanced prematurely) |
| Virus scanner | Everything except new files becoming visible | New uploads stay "scanning" | "Scanning in progress" | Scale/restart scanner; backlog alert | Queue drains |
| IdP | Password/passkey users | SSO logins | "Your organisation's sign-in is unavailable" | Contact org admin | Automatic |
| Sandbox runner | Non-code assessments | Code assessments unverified/blocked | "Verification unavailable; your work is saved" | Page on-call; disable offering via flag | Re-run queued attempts |
| Customer webhook endpoint | Everything | That customer's deliveries retry then pause | Customer dashboard shows failures | none | Manual re-send |
| Postgres | Nothing authoritative; PWA read cache shows stale owner data | Writes/reads | "Service unavailable" + cached labelled-stale data | Incident process | PITR/failover |

## 12. Testing and exit
Each adapter ships with: fake implementation, recorded-fixture contract tests, failure-injection tests (timeouts, 429/5xx, malformed payload, replayed webhook, out-of-order events), and a documented swap procedure (data export from vendor, template/key migration, parallel run). Game-days exercise the matrix in §11 at least semi-annually [TARGET].

## 13. Open items
| ID | Item |
|---|---|
| OPEN-B39 | Calendar integration (Google/Microsoft) vs `.ics` only |
| OPEN-B40 | Entitlement grace period after payment failure |
| OPEN-B41 | Tax/invoicing approach (Stripe Tax or other) |
| OPEN-B42 | Bounce/complaint alert thresholds |
| OPEN-B43 | Third-party profile/job-board import and ToS |
| OPEN-B44 | SCIM/deprovisioning for enterprise SSO |
