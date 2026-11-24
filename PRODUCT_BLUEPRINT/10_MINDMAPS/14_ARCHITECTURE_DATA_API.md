<!-- Generated from PRODUCT_BLUEPRINT sources. Regenerate instead of editing by hand. -->

# Mind map: Architecture data and API

System architecture, data model, API, events, integrations, AI, search and module dependencies.

```mermaid
mindmap
  root((Architecture data and API))
    01 System Architecture
      How to read this file
      Architectural drivers
      As-built baseline and where the target
      System context
      Container view
      Bounded contexts mapped to the 30 modules
      Modular-monolith structure
      Layering rules
      Multi-tenancy model
      Authorization architecture
      Identity and session architecture
      Eventing
      Realtime
      Search
    02 Data Model
      Modeling conventions
      Classification schemes
      Entity catalog
      Conceptual diagrams per domain cluster
      Versioning and audit trail
      Indexing and partitioning guidance
      Soft delete and erasure strategy
      Row-level security approach
      Migration policy
      Open decisions and risks
    03 API Design
      API surfaces
      Style rules
      Authorization scope notation
      Idempotency
      Pagination, filtering, sorting
      Concurrency and caching
      Error model
      Versioning and deprecation
      Rate-limit classes
      Long-running operations
      File and upload API
      Realtime channels
      Webhooks
      Contract governance
    04 Events and Asynchronous Processing
      Principles
      Naming and envelope
      Outbox pattern
      Topics per module
      Job engine
      Retry, dead-letter and replay
      Job catalog
      Scheduler
      Ordering and delivery guarantees
      Request idempotency records
      Cross-module sagas
      Async observability
      Open decisions and risks
    05 Integrations and Adapters
      Adapter pattern
      Port catalog
      Integration catalog
      Credentials handling
      Environments and test strategy
      Inbound webhook handling
      Adding a new integration
      Open decisions and risks
    06 AI Architecture
      Binding principles
      Gateway pipeline
      Capability registry
      Provider abstraction and execution targets
      Prompts and versioning
      Evaluations
      Guardrails
      Model fallback
      Cost metering and budgets
      Human-in-the-loop checkpoints
      Privacy and training-data rules
      Explainability and provenance storage
      Matching architecture
      Open decisions and risks
    07 Search, Media and Realtime
      Search and discovery
      Media, files, storage and CDN
      Realtime
      Caching strategy
      Open decisions and risks
    08 Technical Specification Index
      How a team uses this index
      Module map
      Synchronous dependency baseline
      Implementation guidance and build order
      Per-module definition of done
      Conflict register architecture versus
      Open decisions and risks
    07 Module Map and Dependencies
      Modules by group
      Module relationship diagram
      Ownership of core and shared entities
      Dependency matrix
      Dependencies by module
      Shared services
      Build-order implications
      Key cross-module events
      Cross-module needs for module authors
```

## Documents

- [01 — System Architecture](../04_ARCHITECTURE/01_SYSTEM_ARCHITECTURE.md)
- [02 — Data Model](../04_ARCHITECTURE/02_DATA_MODEL.md)
- [03 — API Design](../04_ARCHITECTURE/03_API_DESIGN.md)
- [04 — Events and Asynchronous Processing](../04_ARCHITECTURE/04_EVENTS_AND_ASYNC.md)
- [05 — Integrations and Adapters](../04_ARCHITECTURE/05_INTEGRATIONS_AND_ADAPTERS.md)
- [06 — AI Architecture](../04_ARCHITECTURE/06_AI_ARCHITECTURE.md)
- [07 — Search, Media and Realtime Architecture](../04_ARCHITECTURE/07_SEARCH_MEDIA_REALTIME_ARCHITECTURE.md)
- [08 — Technical Specification Index](../04_ARCHITECTURE/08_TECHNICAL_SPECIFICATION_INDEX.md)
- [07 — Module Map and Dependencies](../01_PRODUCT/07_MODULE_MAP_AND_DEPENDENCIES.md)
