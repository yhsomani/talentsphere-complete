# Final Architecture Summary

Version 1.0 · Under Review. Source of truth: [ADR register](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md); diagrams: [system diagrams](../25_DIAGRAM_LIBRARY/SYSTEM_DIAGRAMS.md).

Browser: installable PWA → host shell (auth session via BFF cookies, router, design system, remote loader, error boundaries) + 7 remotes (candidate, learning, opportunities, hiring, messaging, account, admin) from a signed same-origin manifest registry with last-known-good fallback.
Server: Fastify modular monolith (public-interface-only module boundaries, central `can()` policy) + worker (outbox dispatcher, fenced leases) + isolated sandbox runner + AI gateway; PostgreSQL as sole system of record with RLS; Stripe/email/push/AI behind ports.
Quality gates: fitness functions FF-01…FF-10 in CI; invariants INV-T01…T45; contract-first OpenAPI/AsyncAPI.
Honest boundaries: federation gives fault containment not security isolation (ADR-T19); offline is a cache, never authoritative (INV-T13); iOS/Android behaviour unverified on devices.
Open architecture risks: federation tooling maturity (OPEN-11), hosting/HA (OPEN-14), sandbox build-vs-buy (OPEN-27), SRI for federated modules.
