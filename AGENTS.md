# TalentSphere — AGENTS.md v6.0

## Mission

AI coding agents work under the TalentSphere SSOT. They are implementation agents, not product-authority agents.

## Build files are read-only for AI agents

This repository-wide rule applies to every AI agent, assistant, subagent, IDE integration, and automated coding tool, in every directory. Read these instructions before making changes. More specific agent instructions and tool/skill workflows must preserve this restriction.

Do not create, edit, delete, rename, regenerate, or stage build files. This includes indirect changes made by dependency installation, formatters, code generators, setup tools (including Reticle init), or build/typecheck commands.

Protected files include:

- Dependency and workspace definitions: every `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, other package-manager lockfiles, and package-manager configuration such as `.npmrc`.
- Compiler, bundler, and test-runner configuration: every `tsconfig*.json`, `vite*.config.*` (including audit variants), `vitest*.config.*`, `playwright.config.*`, and equivalent tooling configuration added later.
- Build and release infrastructure: `.github/workflows/**`, `deploy/**`, Dockerfiles, Compose files, `.dockerignore`, and scripts that build, bundle, generate build assets, start test servers, or perform release checks (currently including `scripts/generate-icons.js`, `scripts/start-e2e-api.mjs`, and `scripts/release-preflight.mjs`).
- Formatting and build-input controls: `.prettierrc*`, `.prettierignore`, `.gitignore`, and `.gitattributes`.
- Generated build output and caches: `dist/**`, `build/**`, `coverage/**`, `node_modules/**`, `*.tsbuildinfo`, source maps, and generated JavaScript/declarations emitted by TypeScript. These patterns apply at any depth; handwritten source files are not generated output.

Before running a command, check whether it writes protected files. Use an existing read-only check when available; otherwise report that check as blocked. Do not run repository-wide write-formatting, dependency updates, or emitting builds/typechecks under this rule. Reading build files and running checks that do not write protected files are allowed.

Record the existing working-tree changes before working and compare afterwards. Preserve pre-existing edits, including untracked build files; do not revert, overwrite, or stage someone else's work. If a protected file changes unexpectedly, stop the command, report the exact path and cause, and do not reset it blindly.

If a task needs a protected-file change, explain the blocker and proposed paths without modifying them. Only an explicit user instruction authorizing those build-file changes overrides this rule; a generic request to fix, build, test, install, or complete a task does not. Continue independent work that respects the restriction. Do not weaken this rule to unblock a task.

## Golden workflow

```text
UNDERSTAND
→ SEARCH
→ PLAN
→ MODIFY
→ TEST
→ VERIFY
→ REVIEW
→ DOCUMENT
→ REPORT
```

## Before coding

Read:

1. `SSOT.md`
2. relevant `PRD.md` / `TRD.md`
3. `ARCHITECTURE.md`
4. relevant feature contract
5. relevant security/testing rules.

## Never

- invent undocumented requirements;
- create duplicate systems;
- bypass the API/domain boundary;
- weaken RLS;
- bypass assessment policy;
- add paid AI cost to free users silently;
- change architectural decisions without recording them;
- delete a feature without impact analysis;
- call documentation “implemented”.

## Safe implementation order

```text
foundation
→ identity/authz
→ core domain
→ persistence
→ API
→ UI
→ tests
→ observability
→ release
```

## Agent authority

Agents may:

- fix defects;
- implement approved requirements;
- refactor within established boundaries;
- improve tests/docs;
- make low-risk implementation decisions.

Agents must escalate:

- schema-breaking design;
- security architecture changes;
- AI provider/entitlement changes;
- pricing/entitlement behavior;
- major API versioning;
- consequential decision logic.

## Completion report

Every task reports:

- files changed;
- behavior changed;
- tests executed;
- security considerations;
- migrations;
- known limitations;
- documentation updates;
- final status.

<!-- reticle:begin (managed by `reticle init` — edit outside these markers) -->
## Verifying with Reticle

This app is instrumented by **Reticle**, an in-app verification layer exposed as `reticle_*` MCP tools and the `npx @reticlehq/server` CLI (always through npx: Reticle's server is not installed into this project). Verifying is part of "done", not an optional extra.

**Verify when you have changed something a user can see or do.** A component, a form, a route, a request, a piece of state that reaches the screen. Do it BEFORE telling the user it is complete. Reading the diff proves nothing and unit tests do not run the app.

**Do not reach for Reticle when the change cannot show up in the running app.** It costs tool calls and the user's patience, and a verdict over an unrelated flow proves nothing about what you changed. Skip it for: documentation, comments, tests, build config, CI, dependency bumps with no user-facing effect, backend or CLI work with no UI surface, and any change to a project that is not a running web app. Say in one line that you skipped verification and why, rather than silently not doing it.

**How to verify:**

- Drive the flow with `reticle_act_and_wait({ ref, action, until })`. It names the consequence you expect BEFORE the action, which is the difference between a check and a rationalisation.
- Batch a multi-step journey (a login, a form) into one `reticle_act { steps: [...] }` rather than one round trip per field.
- Read the surrounding evidence with `reticle_look { action: "page" | "state" }` and `reticle_observe { action: "network" | "console" }`.
- **Only `reticle_act_and_wait` and `reticle_assert` produce a verdict.** `reticle_act` and everything else move or read the app and prove nothing, so a session ending without one of those two has no result however many tools it used.
- Covered flows: `npx @reticlehq/server gate` reports which recorded flows the changed files affect and whether they still pass.

**Setting Reticle up? You are mid-sequence — do not stop until a verdict exists.** The whole of it
is: instrument the app → get a dev server running → open the app in a browser → drive one flow →
report the verdict. Every step is yours to do, and none of them needs the user. Stopping short leaves an app that
looks installed and can verify nothing, which is the commonest way this goes wrong. `/reticle`
carries the recovery ladder; never report the install as finished without a verdict to point at.

**Nothing connected? Get the app running.**

**A dev server already running when `reticle init` ran does not have Reticle in its bundle.** It read the build config at boot; `init` edited it afterwards. It serves the old bundle and no session appears. In order:

1. **A dev server was already running?** Restart it, then hard-reload the tab. "Something is listening" does not mean the right bundle is served.
2. **Nothing was running?** Start it in the BACKGROUND and say so in one line. `reticle_session { action: "list" }` gives you this project's own dev command in `next_action`; use that, never compose one. Started after `init`, it needs no restart.

Stopping to ask is how a verification turn ends with nothing verified.

Four guards, none optional:

1. **Never run two at once.** One dev server on the app's port. Restarting a stale one means stopping it first, not starting a second alongside it.
2. **Never guess the command.** It comes from `package.json` scripts. No recognisable dev script means say so and stop, not invent one.
3. **Never kill anything you did not start**, and never a daemon or a port holder. The one exception is the restart above, and say in one line that you did it.
4. **The permission prompt belongs to your host.** Never bypass, suppress or auto-approve it, and take a refusal as the answer.

A dev server that is already running does not pick up an edited build config or a newly created plugin file — restart it and hard-reload the tab. And if a server IS listening and still nothing connects, the cause is the SDK not loading in the page, not a missing dev server; do not tell the user to start one they are already running.

**Finish `src/reticle-dev.ts` before you claim setup is done.** `init` writes it and cannot always fill it in: a store that needs an argument only reading the code supplies (Jotai atoms, an XState actor, a TanStack `queryClient`) is left as a commented `registerStore` line. A file that registers nothing looks exactly like a finished one, and `reticle_look { action: "state" }` then returns empty forever — which is indistinguishable from an app that has nothing to report, so it reads as success. Uncomment the line, complete it, and prove it by driving one flow and seeing your keys come back. If `init` told you to restart your client, this is the job waiting for you on the other side of that restart.

**Verify each feature as you finish it, not all of them at the end.** Asked for four, build one, drive it, get a verdict, then start the second. A red verdict after four builds has four suspects; after one it has none.

**Capture what a change is FOR while you are building it, not afterwards.** The business outcome a change is meant to produce is known only while the change is being made. Pass `intent` when a flow is saved, so the saved flow carries the reason it exists. A flow without one replays for months and then reports "step 3 failed" instead of what stopped being true for a user.

**Honesty, which is the whole point:**

- **`verified: "unknown"` is not a pass.** It means Reticle drove the app and could not tell what happened; `verifiedReason` says which clause decided that. Report it as unknown, never as working.
- **`verified: "no-fault"` is not a pass either.** It means nothing was DECLARED to prove: the page settled and no channel complained, but you asserted nothing, so there is no verification. You get it whenever `until` is omitted. Name a consequence the action changes — a signal, a request, a route, or store state — and call again.
- **Never weaken a check to make it green.** Downgrading, skipping or deleting an assertion is a finding, not a fix.
- **If Reticle cannot run** (no daemon, or this is not a running web app), say so. Do not skip verification silently.
- **Setup is not finished until one real flow has been driven and produced a verdict.** `init` exiting 0, the tools appearing, and a session being listed are all things that happen before anything has been verified.

**The `/reticle` skill runs this whole loop for you** — detect, connect, drive one flow, report. If your client does not have it, install it once: `/plugin marketplace add reticlehq/reticle` then `/plugin install reticle@reticlehq` in Claude Code, or `npx skills add reticlehq/reticle` anywhere the skills CLI works.

**A tool you need is missing?** Call `reticle_tools` before assuming it: this surface merges several families behind an `action`, so what looks absent is usually one argument away. It is the verify loop and nothing else on purpose, and a daemon started with `RETICLE_ADVERTISE_ALL_TOOLS=1` advertises the wider set — it reads that at startup, so it takes effect on the next one.

**Report Reticle's own defects with `reticle_session { action: "feedback" }` the moment you notice**, then carry on with your task. You are the user Reticle is built for and the only one who can say what it cost you, and that knowledge is gone when your context is.

📄 **The rest is in [RETICLE.md](./RETICLE.md): what to do when the tools are missing, when a result carries `version_skew` or `update_available`, when `reticle_look { action: "state" }` comes back empty, and how to write a feedback report that can be acted on. Read it when you hit one of those, not before.**
<!-- reticle:end -->
