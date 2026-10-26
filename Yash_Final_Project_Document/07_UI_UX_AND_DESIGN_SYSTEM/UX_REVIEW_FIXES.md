# UI/UX - Review Fixes (revision overlay)

Doc ID: UI-REV2 (covers UI-01 navigation, UI-03 screen specifications, UI-05 design system, UI-07 progressive UX, and the screen and action registries) · Owner: Product Design / Frontend Architecture · Version 2.0 · Status: Under Review
Relates: REVW-07, REVW-08, REVW-15, REVW-24, REVW-37 · REV-RES · MFA-01-REV2, OFF-01-REV2, PWA-01-REV2

Tags: [TARGET] [OPEN]. This file is **additive**: no other file in this folder is changed. Where it differs from the originals it governs; section 6 lists what it supersedes (relationship only). `ACTION_REGISTRY.md` API-name mapping is owned by the backend pass and is not touched.

## 1. Institution screens move to MOD-INS (REVW-08)
The platform back-office (MOD-ADM) and the institution workspace (MOD-INS) are different audiences and cadences. Screen IDs gain module-aligned IDs; the old IDs stay valid as aliases so existing citations (for example USER_JOURNEYS) still resolve.

| New ID | Alias (SCREEN_REGISTRY section 8) | Route | Roles | Purpose |
|---|---|---|---|---|
| SCR-INS-01 | SCR-ADM-17 | `/institution` | INSTADM, FAC, proctor | Institution home: aggregate activation, coverage, credentials |
| SCR-INS-02 | SCR-ADM-18 | `/institution/cohorts` | INSTADM, FAC (own) | Cohorts list |
| SCR-INS-03 | SCR-ADM-19 | `/institution/cohorts/:cohortId` | INSTADM, FAC | Cohort detail: members, aggregate skill coverage, consented evidence, notice wording |
| SCR-INS-04 | SCR-ADM-20 | `/institution/credentials` | INSTADM | Issue and revoke institution credentials (authority-verified; `issuer_class` shown, REVW-12) |
| SCR-INS-05 | SCR-ADM-21 | `/institution/members` | INSTADM | Faculty, proctor and staff management |
| SCR-INS-06 | SCR-ADM-22 | `/institution/reports` | INSTADM, FAC (aggregates) | Outcomes reports and exports (aggregate only, small-cell suppression) |

Columns not listed (primary and secondary actions, APIs, states, offline and a11y codes) are those of the aliased row. Updated counts: MOD-ADM **16** screens (SCR-ADM-01..16), MOD-INS **6**; total stays **130**. SCREEN_REGISTRY title "seven remotes" reads "eight remotes". The institution `Offline` mode stays **O-x** (no cache; consent must be immediate, INV-T15).

Action references (ACTION_REGISTRY section 19 and ACT-ORG-02) read as: ACT-INS-01 INS-01/02 · ACT-INS-02 INS-02/03 · ACT-INS-03 and ACT-INS-04 INS-04 · ACT-INS-05 INS-01/03 · ACT-INS-06 INS-03/06 · ACT-INS-07 INS-05 · ACT-INS-08 INS-03 · ACT-ORG-02 HIR-15 and INS-05. Section 19 is titled "INS - institution workspace (8)" and already has its own prefix; only the screen references change.

### 1.1 Navigation (NAVIGATION_ARCHITECTURE)
| Place | Read as |
|---|---|
| Section 2 workspace table, Institution row | Remotes: **MOD-INS**, MOD-LRN, MOD-MSG (not MOD-ADM) |
| Section 2, Platform row | MOD-ADM |
| Section 3.3 institution navigation | Unchanged (routes unchanged) |
| Section 4.8 route tree | Splits into 4.8 MOD-ADM (`/admin/*`, SCR-ADM-01..16) and 4.9 MOD-INS (`/institution/*`, SCR-INS-01..06 in the order above) |
| Route registration contract | Prefix `/institution` is owned by MOD-INS; `/admin` by MOD-ADM; in bundled mode the same ownership check runs at build time |
| Deep-link and redirect RD-03 | unchanged |

Delivery note for designers: a user with only an institution role never needs back-office chunks; back-office chunks are served only to sessions with `admin.console` (FD-14), so a user who holds both roles sees both workspaces in the switcher and loads each on first entry.

## 2. Offline UX for Phase 1 and the single constants table (REVW-15, REVW-24)
Phase 1 offline = read cache plus **local unsent drafts, no outbox** (OFF-01-REV2 section 0). UX consequences:

| UX-07 place | Read as |
|---|---|
| Section 6.1 "Pending-sync" row; section 6.2 sync indicator and panel; DESIGN_SYSTEM field state `pending-sync`; SCREEN_REGISTRY legend **O-q** | In **Phase 1** the badge is **"Unsent - saved on this device"** (not "Waiting to sync"), the TopBar indicator and Sync panel are not shown, and the screen sends only when the user presses the action while online. The "Waiting to sync" badge, global indicator, Sync panel (ACT-SYS-05) and auto-flush appear only after the outbox activates (ADR-T10 trigger) |
| Section 6.1 set "application drafts, profile edits, message compose, notes" | Five classes after the trigger: add **lesson progress checkpoints**. Assessment answers are never in the set |
| Section 6.2 Reconnect "backoff (1, 2, 4, 8, 30 s cap)" | OFF-01-REV2 section 2: `2 s x 2^n`, +/-30% jitter, cap 5 min; do not restate numbers in UX copy |
| Section 6.2 Expiry "older than 30 days" and OPEN-UX-14 | **14 days**, warning at 5 days (OFF-01-REV2 section 2); OPEN-UX-14 is closed |
| Section 7 remote-load retry "1/2/4 s, 3 auto-tries" | 2 automatic retries at 500 ms and 1500 ms, 10 s bound (HC-01 section 7 / OFF-01-REV2 section 2) |
| ACT-SYS-04 "Report a problem" offline "queued locally [OPEN]" | Phase 1: kept as an unsent local draft with "Needs connection to send"; it is not a queued class |
| SCR-LRN-04 course player "notes queue" | Phase 1: local unsent note; after the trigger `note.put` |
| SCR-CAND-02 onboarding "Steps 1, 2, 4 work (queued)" | Phase 1: steps work as local drafts; step 3 and finish need a connection |

Draft copy, in Phase 1: "Unsent - saved on this device only. Connect to send." On reconnect: "You're back online. Send your changes?" (no automatic send). Conflict (server version moved): two-way choice Keep mine / Use theirs / Edit (no auto-merge in Phase 1).

### 2.1 Assessment connection loss (supersedes SCR-LRN-09 behaviour)
SCREEN_SPECIFICATIONS_KEY section 13 "Connection loss" currently says answers are kept on this device and sent on reconnect, and "Autosave" says a failed save "keeps local buffer". Both are withdrawn: assessment answers are online-only and are not persisted or replayed (ADR-T10a; OFF-01 section 7 "never persisted"). New contract:

| State | Behaviour |
|---|---|
| Autosave failure | "Not saved - reconnect to keep working." The page may retry **in memory only** while it stays open; nothing is written to IndexedDB or Cache Storage |
| Connection loss | Banner: "You're offline. The timer keeps running on our server. Reconnect to keep working. Answers the server has not received yet may be lost if you close this page." |
| Expiry while offline | The server grades what it received; on reconnect the UI states this plainly (unchanged) |
| Technical interruption | Reported as such, never as an integrity anomaly (INV-T20) |
| Tests | After an attempt, a storage scan finds no item or answer in IndexedDB or Cache Storage |

SCR-LRN-09's registry cell "connection loss (autosave queue limited, ...)" reads "connection loss (online-only, in-memory retry while open)".

## 3. iOS push wording (REVW-37)
Wherever the install-gated iOS push behaviour is described (ACT-NTF-04 precondition, UX-07 section 9 install and push paragraph, SCR-ACC-04 and SCR-ACC-06 notes) cite the canonical marker from PWA-01-REV2 section 1: "(V(src), PLT-01; not device-verified)". RES-01 R2 is not the citation.

## 4. Idempotency (REVW-14 b)
UX-07 section 11 already says one `Idempotency-Key` per user intent, created when the form opens, reused across retries and reloads and stored with the local draft. That text stands and is the UI half of the rule; `host.api.intentKey()` implements it (HC-01 revised). ACTION_REGISTRY line 11 ("one key per user intent") is consistent; the earlier host behaviour of injecting a fresh key per call is withdrawn (MFA-01-REV2 section 3).

## 5. Bundled-mode wording (REVW-07)
UX-07 section 7 "Remote-load failure UX" applies to chunk-load failures in bundled mode (same screen, copy and retry) and to remote-load failures when federated. Copy must say "this part of TalentSphere", never "remote". The section 7 text "federation" in its title is read as "module load".

## 6. Supersession map (relationship only)
| This file | Supersedes |
|---|---|
| section 1 | SCREEN_REGISTRY section 8 heading and rows for SCR-ADM-17..22 (IDs become aliases), section 10 coverage table counts for MOD-ADM; NAVIGATION_ARCHITECTURE section 2 Institution row and section 4.8 route tree; ACTION_REGISTRY section 19 screen references |
| section 2 | UX-07 sections 6.1, 6.2, 7 (numbers), OPEN-UX-14; DESIGN_SYSTEM `pending-sync` state wording; SCREEN_REGISTRY offline legend O-q for Phase 1; ACT-SYS-04 offline note |
| section 2.1 | SCREEN_SPECIFICATIONS_KEY section 13 rows "Autosave", "Connection loss"; SCR-LRN-09 registry cell |
| section 3 | ACT-NTF-04 precondition citation; UX-07 section 9 wording |
| section 4 | Nothing; confirms UX-07 section 11 |

## 7. Items for the governance pass
ID_REGISTRY: SCR-INS prefix and aliases; USER_JOURNEYS (folder 02) cites SCR-ADM-17..22 (resolved by aliases, edit optional); OPEN-UX-13 (evidence drafts) remains open; renumber OPEN-UX-* into the global register (REVW-33). Registry totals: MOD-ADM 16, MOD-INS 6, sum 130.
