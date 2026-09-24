# TalentSphere

PWA-first Career Operating System built around a Talent Graph + Evidence Graph.

## Current status

**GREENFIELD / 0% VERIFIED IMPLEMENTATION**

The repository specification is complete enough to begin implementation. The software is not represented as built until executable evidence proves it.

## Core loop

```text
Goal → Gap → Learn → Practice → Prove → Verify
→ Discover → Match → Apply → Interview → Outcome → New Evidence
```

## Stack

React + TypeScript + Vite · Node.js + Fastify · PostgreSQL/Supabase · Supabase Auth/Storage/Queues · REST/OpenAPI · PWA · central AI Gateway.

## Start here
 
1. [`SSOT.md`](SSOT.md)
2. [`BRAIN/MEMORY.md`](BRAIN/MEMORY.md)
3. [`docs/product/PRD.md`](docs/product/PRD.md)
4. [`docs/engineering/ARCHITECTURE.md`](docs/engineering/ARCHITECTURE.md)
5. [`docs/engineering/TRD.md`](docs/engineering/TRD.md)
6. [`docs/registries/FEATURE_REGISTRY.md`](docs/registries/FEATURE_REGISTRY.md)
7. [`docs/governance/IMPLEMENTATION_PLAN.md`](docs/governance/IMPLEMENTATION_PLAN.md)
8. [`FINAL_DOCUMENT_INDEX.md`](FINAL_DOCUMENT_INDEX.md)
9. [`AGENTS.md`](AGENTS.md)

## Golden rule

Do not confuse:
`documented → implemented → verified → production-ready`.

## Development

```bash
npm install
npm run dev
npm run test
npm run build
```

Exact scripts are finalized with the first repository implementation and then become canonical in this README.

## Security

Security is part of the product architecture, not post-release hardening.

## Contribution

Every behavior-changing PR updates:
- tests;
- required documentation;
- migrations if applicable;
- analytics/observability;
- feature status.
