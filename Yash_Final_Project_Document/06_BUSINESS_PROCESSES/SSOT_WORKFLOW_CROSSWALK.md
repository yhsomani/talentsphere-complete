# SSOT Workflow and Integrity Crosswalk

**Status: candidate mapping for owner review (OPEN-45).** The protected root `SSOT.md` defines 66 `WF-*` workflow identities and 25 `WIT-*` integrity traces. The target [Business Process Inventory](BUSINESS_PROCESS_INVENTORY.md) defines 38 `BP-*` processes. These registers have different scopes and identities; counts do not imply parity.

## Row-level mapping

The [CSV crosswalk](SSOT_WORKFLOW_CROSSWALK.csv) has one row for every SSOT `WF-*` and `WIT-*` identity. It retains the source title and terminal/guard, candidate BP IDs, a disposition, and a residual. The source integrity traces are safeguards attached to workflows, not standalone user journeys.

| Source set | Rows | Partial BP-level match | No BP-level match |
|---|---:|---:|---:|
| `WF-*` | 66 | 33 | 33 |
| `WIT-*` | 25 | 18 | 7 |
| **Total** | **91** | **51** | **40** |

`No match` means this inventory has no defensible end-to-end process counterpart; it does not prove the behavior is absent from every feature, rule, API, or operations document, and it is not a retirement decision. Partial matches preserve the target process IDs while naming the unrepresented source behavior or guard. No mapping establishes implementation or owner approval.

## Owner-review focus

- The source repeats the certification-exam workflow under both `WF-33` and `WF-53`; both identities remain visible until an owner decides whether they are duplicate records or distinct scenarios.
- No BP-level counterparts were identified for several source workflows, including institutional procurement/licensing and renewal, course publishing and creator payouts, contests, social/newsletter publishing, salary aggregation, mentorship/expert calls, custom assessment authoring, referrals/alumni, reputation, and internal mobility.
- High-impact source guards needing explicit disposition include mandatory scorecard preconditions, append-only moderation/audit, signed webhook plus entitlement reconciliation, validate-then-commit import, exact seat accounting, never-auto-convert at graduation, SSRF allow-listing, and webhook-owned course fulfillment.
- Review these process-level gaps together with the separate candidate J-to-UJ map in [User Journeys](../02_STAKEHOLDERS_AND_USERS/USER_JOURNEYS.md). State-machine identity coverage remains open; see OPEN-45.
