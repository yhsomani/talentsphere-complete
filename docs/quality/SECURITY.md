# TalentSphere — SECURITY.md v6.0

## 1. Security Objective

Protect identity, private career data, evidence, assessments, tenant data, financial state, credentials, provider credentials and audit history.

## 2. Security Architecture

```text
Browser
→ HTTPS
→ AuthN
→ Session verification
→ Authorization
→ Purpose/privacy policy
→ Domain validation
→ DB constraints + RLS
→ Audit
```

## 3. Authorization

Use:
`Identity → Role → Permission → Resource ownership → Tenant → Purpose → Policy`.

Never trust client role/tenant IDs.

## 4. Supabase Security

RLS is required on exposed tables and should be tested with allow/deny assertions. Supabase's current guidance also distinguishes table grants from RLS policies, so both must be designed together. citeturn123371search0turn123371search4

## 5. Threat Model

Primary threats:
- broken object-level authorization;
- broken function-level authorization;
- account/session compromise;
- tenant isolation failure;
- SSRF;
- XSS/CSRF;
- unsafe file upload;
- webhook replay;
- rate-limit bypass;
- secret leakage;
- supply-chain compromise;
- prompt injection;
- AI data leakage;
- assessment cheating;
- billing replay/double effects.

## 6. Sensitive Data

```text
PUBLIC
INTERNAL
PRIVATE
SENSITIVE
RESTRICTED
NEVER-EXTERNAL
```

Assessment answer keys, provider secrets, access tokens and security internals are never sent to external AI.

## 7. File Security

```text
UPLOAD
→ validate size/type
→ MIME/content inspection
→ malware scan where needed
→ isolated storage
→ access policy
→ signed delivery
→ lifecycle
```

## 8. API Security

- Zod validation at boundary.
- Allow-listed filters/sorts.
- Rate limiting.
- Idempotency.
- CSRF strategy aligned to auth transport.
- Secure headers.
- CORS allow-list.
- No stack traces to clients.

### Session signing key

Session tokens are `base64url(payload).base64url(HMAC-SHA256(payload))`, where the
payload carries `userId`, `email`, and `roles`. Every authorization decision in the API
reads `roles` from that payload, so the signing key is a full privilege boundary.

- The key is `process.env.TOKEN_SECRET` and **must be at least 32 characters** in any
  deployed environment. `validateServerEnv()` enforces the length when it is set.
- There is **no hardcoded fallback key**. If `TOKEN_SECRET` is unset, the domain layer
  generates a random per-process key, so tokens remain unforgeable but do not survive a
  restart. A committed constant would let anyone read a valid signing key out of the
  source tree and mint a `platform_admin` token.
- Generate a key with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- Regression coverage: `tests/security/api-security.test.ts`, describe block
  *"SEC: Session signing key is not a committed constant"*, asserts that a token signed
  with the former hardcoded literal and with other guessed secrets is rejected.
- Any component that mints tokens out of band (test harnesses, scripts) must set
  `TOKEN_SECRET` for the API process as well; see `test-secrets.mjs`.

## 9. Webhooks

Verify provider signature + timestamp/replay window. Record provider event ID and make handling idempotent.

### Open gap — billing webhook is not authenticated

`POST /api/v1/webhooks/billing` currently validates the payload shape and
enforces idempotency on the provider event ID, but it accepts **unsigned**
requests. It therefore does not meet the requirement above, and must not be
described as replay-resistant or signature-verified.

Impact: anyone who can reach the endpoint can post a fabricated billing event.

Not fixed here because the signing scheme is a provider contract, not an
implementation detail — the provider, algorithm, header name, secret
distribution and tolerance window are all unspecified. Inventing them would
produce a webhook that looks secured while rejecting real events.

To close: specify the provider contract, then verify signature and timestamp
before any processing, and reject on mismatch rather than falling through.

## 10. AI Security

Before any provider call:
1. authenticate;
2. resolve entitlement;
3. classify data;
4. inspect assessment context;
5. evaluate policy;
6. minimize context;
7. invoke provider;
8. validate output;
9. record provenance.

## 11. Assessment Security

AI restrictions must be inherited by all AI routes. Protected answers are never returned to clients.

## 12. Security Testing Baseline

Use OWASP ASVS 5.0 and OWASP API Security Top 10 as the verification frameworks. citeturn398510search0turn617445search0

## 13. Incident Response

```text
DETECT → CONTAIN → PRESERVE → ASSESS → ERADICATE → RECOVER → NOTIFY → LEARN
```

## 14. Privacy

Implement privacy controls against applicable legal requirements. For India, map the program to the DPDP Act/Rules and their staged commencement timeline; do not claim legal compliance without implementation evidence. citeturn832916search0turn832916search8turn832916search9
