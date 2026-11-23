# Blueprint Conventions

Rules every document in `PRODUCT_BLUEPRINT/` follows. They exist so independently written files stay consistent and so the registries can be generated from the specs instead of hand-copied.

## 1. Status of everything in this folder

Everything here describes the **intended complete product**. Nothing in this folder is a claim that anything is built. Existing source code and the legacy documents (`SSOT.md`, `docs/`, `Yash_Final_Project_Document/`) are **inputs**, never limits. What is actually built is recorded only in `ARCHITECTURE.md` and `docs/reports/`.

## 2. Evidence tags

Every non-obvious statement carries one tag:

| Tag | Meaning |
|---|---|
| `[SRC]` | Taken from a legacy document or the code. Cite it: `[SRC: SSOT §9.7]`. |
| `[DER]` | Derived: a logical consequence of sourced intent plus standard practice for this kind of product. |
| `[PROP]` | Proposed: a capability a complete product should have that no source mentions. Stands until a stakeholder rejects it. |
| `[DEC-REQ]` | Needs a stakeholder decision. Always paired with an `OD-` id. Never silently resolved. |

Do not invent business objectives, prices, targets, volumes, deadlines or headcount. When a number is needed and unknown, write the parameter name, give a **default proposal** marked `[PROP]`, and open an `OD-`.

## 3. Identifier scheme

| Prefix | Meaning | Format | Example |
|---|---|---|---|
| Module | Product module | 3-letter code (table in §4) | `LRN` |
| `FR-` | Feature | `FR-<MOD>-<nnn>` | `FR-LRN-014` |
| `BR-` | Business rule (new namespace; legacy `BR-001…248` are separate) | `BR-<MOD>-<nnn>` | `BR-LRN-007` |
| `SM-` | State machine | `SM-<MOD>-<nn>` | `SM-LRN-02` |
| `SCR-` | Screen | `SCR-<MOD>-<nnn>` | `SCR-LRN-011` |
| `EVT-` | Domain event | `EVT-<MOD>-<nnn>` (name `module.entity.action`) | `EVT-LRN-003` |
| `ENT-` | Data entity | `ENT-<MOD>-<nn>` | `ENT-LRN-04` |
| `JRN-` | User journey | `JRN-<ROLE>-<nn>` | `JRN-CAN-03` |
| `NFR-` | Non-functional requirement | `NFR-<AREA>-<nnn>` | `NFR-PERF-004` |
| `OD-` | Open decision (stakeholder input) | `OD-<MOD or AREA>-<nn>` | `OD-LRN-02` |
| `RSK-` | Risk | `RSK-<MOD or AREA>-<nn>` | `RSK-ASM-01` |
| `DEC-` | Recorded decision | `DEC-<nnn>` | `DEC-001` |
| `API-` | API capability group | `API-<MOD>-<nn>` | `API-JOB-03` |

Ids are never reused. A removed item keeps its id with status `Withdrawn`.

## 4. Module codes

| Code | Module | Group |
|---|---|---|
| IDN | Identity, Authentication & Account | Foundation |
| SET | Settings, Privacy, Consent & Data Rights | Foundation |
| NTF | Notifications & Communication Channels | Foundation |
| REP | Gamification, Reputation & Recognition | Engagement |
| PRF | Profile, Resume & Portfolio | Career identity |
| EVD | Evidence, Work History & Credentials | Career identity |
| BGV | Verification & Background Checks | Career identity |
| SRC | Search & Discovery | Platform |
| LRN | Learning & Course Experience | Learning |
| STU | Instructor Studio & Content Production | Learning |
| ASM | Assessments, Challenges & Integrity | Learning |
| JOB | Job Marketplace & Candidate Applications | Hiring |
| ATS | Recruiter Workspace & Hiring Pipeline | Hiring |
| INT | Interviews & Scheduling | Hiring |
| EMP | Employer Organisation, Teams & Brand | Hiring |
| NET | Networking, Community & Referrals | Social |
| MSG | Messaging & Real-time Communication | Social |
| AIC | AI Career Assistant, Matching & Recommendations | Intelligence |
| TSF | Trust, Safety & Moderation | Governance |
| INS | Institutions & Managed Learning | Institutions |
| BIL | Billing, Plans & Entitlements | Commercial |
| MEN | Mentorship, Coaching & Career Services | OS expansion |
| GIG | Freelance, Contract & Project Work | OS expansion |
| EVT | Events, Hackathons & Community Programmes | OS expansion |
| MKT | Market Intelligence & Career Pathing | OS expansion |
| ENT | Enterprise Talent: Internal Mobility, Skills & L&D | OS expansion |
| ANL | Analytics, Reporting & Insights | Platform |
| ADM | Admin Console, Support & Operations | Governance |
| PWA | PWA, Offline, Mobile & Browser Extension | Platform |
| PLT | Platform: Public API, Webhooks, Integrations, Media & Files | Platform |

"OS expansion" modules are **proposed scope** (the stakeholder goal is an "operating system" for the whole career domain, which exceeds `SSOT.md` §4.2). They are specified fully but gated by `DEC-002` / an `OD-` before any build.

## 5. Roles (canonical short codes)

`GUE` Guest · `CAN` Candidate / Professional · `STD` Student (candidate attached to an institution) · `INS` Instructor · `MNT` Mentor / Coach · `FRL` Freelancer (a Candidate with gig mode) · `REC` Recruiter · `HMG` Hiring Manager · `EAD` Employer Admin · `IAD` Institution Admin · `PLO` Placement Officer · `EXA` Enterprise Talent / L&D Admin · `MOD` Moderator · `SUP` Support Agent · `FIN` Finance Operator · `PAD` Platform Admin · `SAD` Super Admin / Security Officer · `API` Integration / Service Principal.

Permissions are written as `role: action` pairs, never as vague "admins can manage".

## 6. Release tiers (dependency-based, no dates)

`R0` foundations · `R1` core career loop · `R2` hiring marketplace · `R3` institutions and instructors · `R4` intelligence and trust at scale · `R5` commercial scale · `R6` OS expansion. A feature's tier follows its dependencies, not a calendar. Priority is MoSCoW (`Must` / `Should` / `Could` / `Won't-now`).

## 7. Feature specification template (mandatory)

Each feature is a level-3 heading `### FR-<MOD>-<nnn> — <Name>` followed by exactly these fields, in this order. Fields that genuinely do not apply say `n/a — <why>`; they are never omitted.

```markdown
### FR-XXX-000 — Feature name

- **Sub-module:** …
- **Priority / tier:** Must|Should|Could|Won't-now · R0–R6
- **Source:** [SRC: …] | [DER] | [PROP]
- **Purpose and outcome:** one or two sentences: what the user achieves and how the system knows.
- **Roles and permissions:** `CAN: view, create` · `REC: view` · `PAD: override with audit`
- **Preconditions and entry points:** where the user starts; what must be true.
- **User interactions and actions:** numbered, observable steps (click, type, drag, keyboard).
- **System behaviour:** what the system does in response, including side effects, async work, idempotency.
- **UI elements and controls:** each control by name and type, default, states.
- **Configuration options:** user, org and platform level settings, with defaults.
- **Business rules:** `BR-XXX-000` ids with the rule text defined in the module's rule table.
- **Validation:** field-by-field constraints (type, length, format, range, required, uniqueness).
- **Inputs and outputs:** data in; data and system responses out (success payload shape in words).
- **Filters, sorting, search:** or `n/a — <why>`.
- **Notifications and communication:** trigger, channel, recipient, template name, opt-out class.
- **Error handling and edge cases:** each failure and boundary condition with the exact system response.
- **Dependencies:** `FR-…`, `ENT-…`, external services.
- **Security and privacy:** authz, data classification, audit, abuse controls.
- **Acceptance criteria:** at least three Given/When/Then lines including one negative case.
```

## 8. Module file structure (mandatory)

`02_MODULES/<CODE>_<Name>.md`:

1. Purpose, outcomes and boundaries (in scope / out of scope / owned vs consumed)
2. Roles and permission matrix (role × capability table)
3. Sub-module map
4. Feature specifications (template §7), grouped by sub-module
5. Business rule table (`BR-`: id, rule, rationale, enforced where, source tag)
6. State machines (`SM-`: states, transitions, guards, triggers, terminal states) with a Mermaid `stateDiagram-v2`
7. Screen inventory (`SCR-`: name, route proposal, roles, purpose, key states)
8. Data entities owned (`ENT-`: name, key attributes, relationships, retention class)
9. Events emitted and consumed (`EVT-`)
10. Integrations and external dependencies
11. Cross-module dependencies (table: depends on / depended on by)
12. Module-level metrics (definition, formula, owner role)
13. Open decisions (`OD-`: question, options, default proposal, who decides, blocking what)
14. Risks (`RSK-`)
15. Legacy source trace (which legacy files informed this; what was dropped and why)

Registers are generated from these headings and tables, so the heading and id formats are exact.

## 9. Mermaid rules

Mermaid renders on GitHub. Use `flowchart`, `stateDiagram-v2`, `erDiagram`, `sequenceDiagram`, `mindmap`. In `mindmap` nodes avoid parentheses, brackets, colons, quotes and `&`; use plain words. Quote flowchart labels that contain punctuation: `A["Apply (draft)"]`.

## 10. Links and style

Relative links only. British or American spelling consistently: **American**. Plain language, no marketing tone, no emoji. Tables for matrices; numbered steps for procedures. Files are Prettier-formatted Markdown.
