# Final Architecture Summary

Version 1.1 · Under Review. This is a target design, not an implementation report. Decision status is governed by the [ADR register](../24_RISKS_AND_DECISIONS/ADR_REGISTER.md); diagrams are in [system diagrams](../25_DIAGRAM_LIBRARY/SYSTEM_DIAGRAMS.md).

**Browser:** installable PWA with a host shell, cookie-based BFF session, router, design system, and error boundaries. The proposed initial delivery uses bundled lazy domain modules behind the typed `RemoteModule`/`HostApi` contract. Runtime Module Federation 2.0 with Vite is optional and awaits ADR-T23 ratification, OPEN-03 evidence, at least three named independent frontend teams, a demonstrated independent-release need, and a passing WP-FED-SPIKE. The signed registry, per-remote deployment, and last-known-good fallback belong to that gated federated mode; they are not approved or verified runtime controls.

**Server:** proposed Fastify modular monolith with public-interface-only module boundaries, central `can()` policy, worker/outbox processing, PostgreSQL as the system of record with RLS, and external providers behind ports. The sandbox runner and AI gateway remain target components subject to their release gates; this document does not claim they exist.

**Contracts and quality:** REST/OpenAPI and AsyncAPI are specified; fitness functions FF-01…FF-10 and 214 test cases are documented as target checks. The catalog does not establish that these tests or CI gates are implemented or passing.

**Boundaries and open evidence:** offline data is a cache, never authoritative (INV-T13). Modules sharing the browser execution context are not a security boundary (ADR-T19). iOS/Android device behavior remains unverified. Open decisions include federation activation and integrity evidence (OPEN-03, OPEN-11, OPEN-FE-03), hosting/HA (OPEN-14), and sandbox build-vs-buy (OPEN-27).
