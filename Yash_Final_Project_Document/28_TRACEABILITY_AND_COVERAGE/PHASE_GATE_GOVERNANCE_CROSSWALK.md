# Phase, Gate and Governance Preservation Crosswalk

Status: **candidate mapping; no approval established**. This document and the [69-row CSV](PHASE_GATE_GOVERNANCE_CROSSWALK.csv) preserve source intent and identify target candidates. They do not change execution order, admit scope, ratify architecture, approve a pilot or GA, or establish implementation.

## Authority and phase vocabularies

The source [SSOT](../../SSOT.md#L5-L23) defines intended behavior; executable evidence determines implementation and readiness. [Governance](../../docs/governance/GOVERNANCE.md#L3-L22) assigns the implementation plan execution-order responsibility and keeps current architecture separate from intended architecture.

Keep these three vocabularies separate:

| Vocabulary | Source location | Rows |
|---|---|---:|
| IP founder execution phases 0–10 | [Implementation plan](../../docs/governance/IMPLEMENTATION_PLAN.md#L19-L52) | 11 |
| SSOT capability phases Ph0–Ph10 | [SSOT §38.1](../../SSOT.md#L4194-L4208) | 11 |
| RDM delivery phases Ph0–Ph4 | [Target roadmap §4](../22_IMPLEMENTATION_ROADMAP/ROADMAP.md#L71-L79) | 5 target phases, referenced as candidates |

Matching phase numbers do not establish equivalence. The implementation plan's [current-baseline note](../../docs/governance/IMPLEMENTATION_PLAN.md#L3-L17) points to the current audit and delivery roadmap and preserves the distinction between a proposed restricted beta and career-loop GA. The target [roadmap](../22_IMPLEMENTATION_ROADMAP/ROADMAP.md) and [developer guide](../29_DEVELOPER_IMPLEMENTATION_GUIDE/DEVELOPER_IMPLEMENTATION_GUIDE.md) are draft planning artifacts.

## Preserved source rows

| CSV family | Source rows |
|---|---:|
| ip_phase | 11 |
| ssot_phase | 11 |
| ip_exit_gate | 8 |
| ip_epic | 20 |
| approval_class | 7 |
| ssot_mvp_exit | 7 |
| ssot_institutional_exit | 5 |
| **Total** | **69** |

The eight IP gates apply to every founder phase. IP epic IDs are source ordinals, not new EPIC identifiers. MVP and institutional exits were extracted only within their own source sections. Exact source labels, scopes and exit criteria are preserved in separate CSV fields; source statements retain the inspected Markdown text.

Source anchors are line locators in the named source files at inspection time. Target anchors use L for roadmap lines, § for roadmap sections and DEV L for developer-guide lines. These locators can move when documents change. Candidate target IDs are existing roadmap work-package IDs.

## Reading the mappings

- **split**: candidate coverage spans multiple target packages or phases.
- **partial**: a candidate touches the source requirement, with the remaining gap stated explicitly.
- **unmapped**: no matching preservation rule was identified in the two inspected targets; a nearby target section may still be listed to explain the gap.

Every row remains candidate-unapproved, with approval evidence not-established. The target has 60 work packages, 15 initiatives, 15 workstreams and seven release-gate rows; those counts do not substitute for the source's phases, eight universal exit gates or 20 ordered epics.

The seven C classes preserve both the [governance classification](../../docs/governance/GOVERNANCE.md#L28-L38) and [SSOT approval requirements](../../SSOT.md#L4453-L4463). ADR/ARB escalation in the target developer guide does not establish Founder approval or the source reviewer counts.

## Controls outside the 69-row inventory

Retain the [dependency rule](../../docs/governance/IMPLEMENTATION_PLAN.md#L89-L91): blocking dependencies must be ready or intentionally mocked with a documented exit path. Preserve [register-integrity ratification](../../SSOT.md#L4465-L4468), [documentation sync](../../docs/governance/GOVERNANCE.md#L67-L69), and [historical-source restrictions](../../docs/governance/GOVERNANCE.md#L71-L73). The source Ph10 exclusions and Founder gate remain active source requirements.

## Validation and limits

CSV parse and round-trip checks passed for 69 unique family/source identifiers and the seven category counts above. Every candidate WP ID exists as a table-row ID in the inspected target roadmap. Source hashes were compared before writing.

Only this CSV and companion Markdown were created. No tests, builds, source changes, schema migrations or runtime verification were performed. Security and commercial approval requirements are preserved as source requirements; no approval is claimed. The mapping is limited to the two named target documents and is not proof of wider project coverage or implementation readiness.
