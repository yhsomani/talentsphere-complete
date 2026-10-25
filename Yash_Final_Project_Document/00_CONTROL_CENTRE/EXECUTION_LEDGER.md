# Execution Ledger

2026-10-25. All phases executed once; blueprint status **Revision Required**.
Done: 00-29 and 99 written (86+ files). Validation that ran: Redocly (openapi.yaml, 0 errors), AsyncAPI CLI (0 errors), JSON-Schema meta-checks, Ed25519 registry signatures (agent-reported), ID scan, relative link scan (all resolve). Not run: Mermaid render, Markdown lint.
Independent review: 27_INDEPENDENT_REVIEWS/FINAL_REVIEW_REPORT.md (45 findings: 4 Critical, 13 High). Reviewer did not open 25/26 and only searched parts of 07, 12, 14, 17-20, 23.
Next: fix REVW-01 (permission matrix vs rules), REVW-02 (consent vocab), REVW-03 (state names), REVW-04 (audit vs erasure), REVW-05 (cookies); renumber OPEN-FE/UX/B ids; register ADR-T23+; add ACs for 26 features; run federation spike and device lab.
Model use: Sonnet only (agents launched with model=sonnet).

## Fix pass 2026-10-25 (REVW-01..05)
- REVW-01: USR-01 §4 rows rewritten from DT-01/BR-T100/BR-T105; matrix marked non-normative; TEST-SEC-NEG-01 added.
- REVW-02: 14-scope CONSENT_SCOPE_CATALOGUE.md; DB/OpenAPI/DT-01/privacy aligned; FF-12. Revocation timing beyond read-time is [OPEN-CS-02].
- REVW-03: SM-00 is single state vocabulary; DB CHECK/OpenAPI/AsyncAPI aligned (ad-hoc lint 0 mismatches; FF-11 defined, no CI exists). Left: SM-FILE, endpoints for new transitions, job retry limits, 409 problem-type name.
- REVW-04: opaque subject_ref + erasable subject_identity_map; batch anchoring replaces inline chain; write-budget skeleton. REVW-06 fan-out/idempotency/rate-limit parts still open.
- REVW-05: single cookie contract (`__Host-ts_at`, `__Secure-ts_rt` Path=/api/v1/auth/refresh, `X-CSRF-Token`); /bff namespace removed.
Re-validation: YAML loads, JSON loads, 0 broken relative links. Redocly/AsyncAPI CLI NOT re-run after edits. Review report FINAL_REVIEW_REPORT.md not updated with resolution status; 41 other findings remain open.
