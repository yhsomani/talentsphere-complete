# Legacy Business Rule Crosswalk

**Status: source-text comparison and candidate mapping complete; product adoption and retirement decisions remain open.** This document compares the legacy `docs/registries/BUSINESS_RULE_REGISTRY.md` with the protected root `SSOT.md` rule corpus, then maps the canonical rule identities to the proposed target rules in [BUSINESS_RULES_REGISTRY](BUSINESS_RULES_REGISTRY.md). It does not change either source's authority, approve the target design, or claim implementation.

## Coverage

The [machine-readable crosswalk](LEGACY_RULE_CROSSWALK.csv) contains one row for each of 248 canonical `BR-001…BR-248` identities and 8 `MIG-*` rules (256 total). Each row records the exact source paths, original registry display ID, source-text comparison, candidate target IDs, disposition, rationale, and remaining gap or conflict. All target IDs resolve in the target registry. The two source tables have the same 256 normalized IDs; 252 rule texts are identical after ID normalization and 4 differ (`BR-065`, `BR-066`, `BR-158`, `BR-178`). The changed texts are reviewed separately in their row rationale. Number similarity is not evidence of semantic equivalence. The 248 BR rows also carry stable EVD/JSON pointers into the 2026-10-21 historical audit, plus reference/test-reference counts and candidate feature IDs; eight MIG rows have no corresponding audit rule record. This overlay joins on identity only: it does not resolve the four source-text discrepancies, verify the historical code/test citations, or approve feature associations. Full excerpts remain in the unchanged JSON source.

| Disposition | Rows | Meaning |
|---|---:|---|
| Exact | 9 | Target text covers the material legacy behavior; owner adoption is not implied. |
| Partial | 67 | Related target behavior exists, with a documented residual gap. |
| Conflict | 8 | Target and legacy behavior differ materially; resolution requires an owner. |
| Superseded | 1 | A target rule replaces the legacy behavior in the proposed design; approval remains open. |
| No match | 171 | No semantically equivalent target rule was found. This does not mean the behavior is retired. |

## Owner decisions required

- **Application re-entry:** legacy `BR-15` has a 90-day cooldown; target `BR-T001` permits a recruiter-invited linked application after terminal status.
- **Employer authorization:** legacy `BR-036` requires an approved organization and verified owner; target `BR-T035` permits one live job for a pending organization.
- **Job expiry:** legacy `BR-057` sets a 60-day default; target `BR-T036` uses a 45-day default and a 90-day continuous maximum.
- **Course review threshold:** legacy `BR-095` permits review after 20% completion; target `BR-T034` uses course completion or 50% progress.
- **Subscription refunds:** legacy `BR-100` allows a 30-day pro-rated refund; target `BR-T097` limits refunds to under 14 days and under 20% progress.
- **Minors:** legacy `BR-128` permits restricted/private use from age 16; target `BR-T106` blocks under-age users pending `OPEN-09`.
- **Outreach caps:** legacy `BR-130` sets weekly outreach caps of 20 for Pro, 50 for Team, and custom for Enterprise; target `BR-T081` uses monthly quotas, with values under `OPEN-05`.
- **Learner data sharing:** legacy `BR-190` requires consent for individual outcomes. `BR-T061` and `BR-T100` do not explicitly make institution course/credential views consent-gated.
- **AI evaluation and fallback:** SSOT `BR-065/066` requires capability-specific uncertainty/evaluation policy and suppression or human/non-AI fallback on gate failure. The legacy registry's `BR-065/066` instead sets universal confidence thresholds; the target does not carry either policy in full.
- **Aggregation thresholds:** SSOT `BR-158` specifies k>=10 for sensitive aggregate career analytics and `BR-178` k>=10 for aggregated salary data; legacy `BR-220` also specifies k>=10 generally. Target `BR-T100` uses k>=5 for institutional aggregates only. Broader scope and threshold overlap remain unresolved.

Other partial rows retain their specific residuals in the CSV. The no-match set includes legacy XP, social/community, media, salary intelligence, referrals, creator rules, and other behaviors. Product owners must explicitly adopt, redesign, or retire these behaviors before the legacy registry can be considered fully reconciled.

## Authority and preservation

The root SSOT declares `BR-001…BR-248` canonical; the legacy registry table uses inconsistent zero-padding. The independent `BR-T###` target namespace is not equivalent by number and remains under review. Both source files remain unchanged as historical/canonical evidence. OPEN-43 covers owner disposition; the journey/workflow/state, API, and architecture crosswalks have separate gates in OPEN-45 through OPEN-47. See the [knowledge preservation manifest](../00_CONTROL_CENTRE/KNOWLEDGE_PRESERVATION_MANIFEST.md) for source retention status.
