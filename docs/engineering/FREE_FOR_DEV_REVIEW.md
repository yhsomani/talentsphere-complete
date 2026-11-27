# Free for Developers: full category review

> **Status.** Reviewed 2026-11-27 against the [Free for Developers](https://free-for.dev/) list ([source README](https://github.com/ripienaar/free-for-dev), 56 categories). The decisions are [ADR-030](DECISIONS.md#adr-030--free-tier-services-for-the-pilot-free-for-developers-list) (infrastructure) and [ADR-031](DECISIONS.md#adr-031--free-security-and-launch-checks-from-the-free-for-developers-review) (security and launch checks). This page is the evidence behind both. Limits are quoted as the list states them; check the provider's own page at sign-up.

## How each category was judged

- **Used:** TalentSphere uses it now, or ADR-030 or ADR-031 adopts it.
- **Considered, rejected:** it could serve TalentSphere, but it fails one of the rules below, or something we already have covers it.
- **Considered, later:** useful, but only after a trigger named in the row.
- **Not relevant:** TalentSphere has no need for it.

The rules come from earlier ADRs:

1. **Free-only launch (ADR-027).** Free tiers only, and never one that is free only for non-commercial or personal use.
2. **Privacy first (ADR-024, ADR-028).** Candidate data, resumes and code stay in our systems unless there is no other way. A new processor of personal data has to be listed in the privacy policy.
3. **No duplicates.** Where the repository already does something itself, we don't add a service for it:
   - sign-in is self-issued HMAC sessions (INVARIANT-011);
   - feature flags are the database-backed `FEATURE_*` flags (TPD-04);
   - UI quality is checked by ADR-016 and Reticle.
4. **Protected build files.** A change to `package.json`, `.github/` or `deploy/` needs the owner's go-ahead first (AGENTS.md).

## Matrix (all 56 categories)

| # | Category | Verdict | Choice and reason |
| --- | --- | --- | --- |
| 1 | Major Cloud Providers | **Used** | Oracle Always Free for hosting, object storage and the runner VM (ADR-025, ADR-020, ADR-021). Cloudflare for DNS and email routing (ADR-030). Rejected: Google Cloud Run (scales to zero, which the boot-hydrated API can't), the AWS 12-month offers (not always free), IBM and Azure (nothing they offer is missing). |
| 2 | Cloud management solutions | Not relevant | One Compose file on one host. Pulumi and similar tools add nothing until there are several hosts. |
| 3 | Source Code Repos | **Used** | GitHub. The repository is public, which makes the free tiers for open-source projects apply (rows 10, 26 and 27). |
| 4 | APIs, Data, and ML | Considered, rejected | IP geolocation, OCR (resume parsing), PDF and web-scraping APIs would all receive candidate data. Resume PDFs are rendered by our own code. Hoppscotch and Postman are optional desktop tools, not services. |
| 5 | Artifact Repos | Not relevant | No private packages are published. |
| 6 | Tools for Teams and Collaboration | Considered, later | meet.jit.si already works with no integration, because interviews take a `meetingUrl` (`packages/contracts`), so a recruiter can paste a Jitsi link. A Discord or Slack space for pilot feedback is the owner's choice. |
| 7 | CMS | Not relevant | Product copy lives in the code. A headless CMS would only make sense for a marketing site. |
| 8 | Code Generation | Not relevant | The category has no entries. |
| 9 | Code Quality | Considered, later | Free for public repositories: codecov.io, SonarQube Cloud, CodeFactor. CodeRabbit and Codex already review pull requests. Coverage upload needs a `.github/` change, so it waits for the owner's go-ahead. |
| 10 | Code Search and Browsing | Not relevant | GitHub code search is enough. |
| 11 | CI and CD | **Used** | GitHub Actions (`ci.yml`). Public repositories get unlimited standard minutes on GitHub's free plan; this comes from GitHub's own billing documentation, because the list doesn't say. Rejected: CircleCI, Buildkite and the rest, which would duplicate it. |
| 12 | Testing | Considered, later | Checkly (1,500 browser check runs a month) could replay the Playwright smoke tests against staging. Revisit after the first deploy. Rejected: Argos and lost-pixel, which duplicate ADR-016. |
| 13 | Security and PKI | **Used (ADR-031)** | Let's Encrypt is already used, through Caddy. Adopted: GitHub CodeQL and Dependabot (repository settings, free for public repositories); Mozilla Observatory, SSL Labs and Internet.nl as launch checks; Pwned Passwords as a later code PR. Considered, later: Semgrep (10 private repositories, unlimited public ones) and Socket (supply chain). Rejected: GitGuardian (GitHub secret scanning covers it) and Infisical and Doppler (environment files on one host are enough). |
| 14 | Authentication, Authorization, and User Management | Considered, rejected | Self-issued HMAC sessions with cookies are built (ADR-019, INVARIANT-011). Moving to Auth0, Clerk or similar means migrating every account and adding a new processor. |
| 15 | Mobile App Distribution and Feedback | Not relevant | The product is a PWA with no store build. |
| 16 | Management System | Not relevant | Compose on one VM. |
| 17 | Messaging and Streaming | Considered, rejected | Notifications are built in the API and worker. Push services (OneSignal, Novu, Knock) would receive user identifiers. Web Push can use VAPID keys with no vendor when it is needed. |
| 18 | Log Management | Considered, later | Logs stay on the host (ADR-030). Grafana Cloud comes first at a second host. |
| 19 | Translation Management | Considered, later | The interface is English only. If a second language is added, self-hosted Tolgee comes first. |
| 20 | Monitoring | **Used** | UptimeRobot (50 monitors, 5-minute checks) and healthchecks.io (20 checks) (ADR-030). Instatus (free status page) can be added later, if pilot users ask for one. |
| 21 | Crash and Exception Handling | **Used (opt-in)** | Sentry in the EU region, off by default (ADR-030). GlitchTip is the fallback. |
| 22 | Search | Considered, rejected | PostgreSQL full-text search (ADR-030). Algolia, Bonsai and Searchly would copy profiles to a third party. |
| 23 | Education and Career Development | Considered, later | This category is product content, not infrastructure. Free curricula (freeCodeCamp, The Odin Project, Full Stack Open, Exercism, MIT OpenCourseWare) could be linked from learning paths as external resources. Linking shares no data, and completion stays unverified (ADR-023). Check each site's licence and terms before quoting any content. Roadmap.sh content is not openly licensed, so link only. Reactive Resume is a comparable product, not a dependency. |
| 24 | Email | **Used** | Brevo for sending (ADR-018). Cloudflare Email Routing for `privacy@` and `security@` (ADR-030). Adopted under ADR-031: mail-tester.com (20 tests a month) and dkimvalidator.com to check SPF, DKIM and DMARC before the first real send. Rejected: Is It Disposable and UserCheck (every sign-up address would go to a third party), and Mailtrap and mailcatcher (the labelled dev outbox already does that job). |
| 25 | Feature Toggles Management Platforms | Not relevant | Database-backed `FEATURE_*` flags (TPD-04, PR #101). |
| 26 | Font | Not relevant | The web app loads no hosted fonts (no Google Fonts references in `apps/web`). If one is added, use Bunny Fonts or self-host it. |
| 27 | Forms | Not relevant | Every form posts to our own API. |
| 28 | Generative AI | Considered, rejected | AI uses local heuristics, and ADR-029 gates each AI feature on its own evaluation. OpenRouter free models would receive candidate text, under rate limits and changing terms. Langfuse self-hosted can be revisited if a model provider is ever adopted. |
| 29 | CDN and Protection | Considered, later | Vite bundles every asset. The Cloudflare proxy stays off (ADR-030) until there is a DDoS need. |
| 30 | PaaS | Considered, rejected | Oracle covers hosting (ADR-025). Most entries sleep, are small, or would split the web origin, which the ADR-019 cookie relies on. |
| 31 | BaaS | Considered, rejected | Supabase, Appwrite and Convex would replace the Fastify and PostgreSQL architecture that ADR-017 ratified. |
| 32 | Low-code Platform | Not relevant | Admin screens are built into the app. |
| 33 | Web Hosting | Considered, rejected | The same origin reason as PaaS (row 30). Read the Docs and similar hosts are not needed, because docs live in the repository. |
| 34 | DNS | **Used** | Cloudflare (ADR-030). deSEC is the fallback. |
| 35 | Domain | Considered, rejected | Free subdomains (DigitalPlat, pp.ua) hurt email deliverability and trust. A **paid domain, roughly 10 USD a year, is the one unavoidable cost** of the launch. The owner buys it. |
| 36 | IaaS | Considered, later | Backblaze B2 (10 GB) is the off-site backup fallback named in ADR-030. Modal is not needed. |
| 37 | Managed Data Services | Considered, rejected | Neon, Aiven and CockroachDB were rejected in ADR-030. Upstash Redis (500,000 commands a month) is not needed with one API process and in-process rate limits. MongoDB, Neo4j and Qdrant are not in the architecture. |
| 38 | Tunneling, WebRTC, Web Socket Servers and Other Routers | Considered, rejected | The Tailscale free plan is for personal use, which breaks rule 1. Use SSH keys only, or the Oracle Bastion service, for host access. ngrok-style tunnels are not needed while billing stays disabled. |
| 39 | Issue Tracking and Project Management | **Used** | GitHub Issues (#44 to #50). The others would duplicate it. |
| 40 | Storage and Media Processing | Considered, rejected | Oracle Object Storage (ADR-020). Uploadcare, Cloudinary and ImageKit would hold resumes and photos outside our systems. |
| 41 | Design and UI | Not relevant | Design tokens live in `packages/ui/src/tokens.ts`. The owner prefers Mermaid for diagrams. |
| 42 | Data Visualization on Maps | Not relevant | No map feature. Nominatim's usage policy rules out production geocoding in any case. |
| 43 | Package Build System | Not relevant | Linux distribution packaging. |
| 44 | IDE and Code Editing | Considered, rejected | Hosted compilers (JDoodle, OnlineCompiler.io) were rejected for judging in ADR-021 and ADR-030. Editors are a personal choice. |
| 45 | Analytics, Events and Statistics | Considered, rejected | No third-party analytics (ADR-030). Cloudflare Web Analytics or self-hosted Umami can be added later, if page views are needed. |
| 46 | Visitor Session Recording | Considered, rejected | Recording candidates' sessions would capture personal data and needs consent. |
| 47 | International Mobile Number Verification API and SDK | Not relevant | No phone verification. |
| 48 | Payment and Billing Integration | Not relevant | Stripe is wired and disabled (ADR-027). The entries are currency and subscription APIs for app stores. |
| 49 | Docker Related | Not relevant | Images are built on the host from `deploy/oracle/Dockerfile`. GitHub Container Registry is the first choice if images are ever pushed. |
| 50 | Dev Blogging Sites | Not relevant | Marketing, not engineering. |
| 51 | Commenting Platforms | Not relevant | No comments feature that would need an outside service. |
| 52 | Screenshot APIs | Not relevant | Playwright already takes screenshots in CI. |
| 53 | Flutter Related and Building iOS Apps without Mac | Not relevant | No native app. |
| 54 | Privacy Management | Not relevant | Only the essential `ts_session` cookie is set, so no consent banner is needed. Revisit if analytics or Sentry in the browser is turned on. |
| 55 | Miscellaneous | Not relevant | Scheduled work runs in the worker. cron-job.org and similar would duplicate it. |
| 56 | Remote Desktop Tools and Other Free Resources | Not relevant | Personal tools. GitHub Education and Microsoft 365 Developer offers don't apply to a company. |

## What is new beyond ADR-030

See [ADR-031](DECISIONS.md#adr-031--free-security-and-launch-checks-from-the-free-for-developers-review). In short:

1. Turn on GitHub CodeQL default setup and Dependabot alerts.
2. Run Mozilla Observatory, SSL Labs and Internet.nl against staging before the pilot opens.
3. Check the sending domain with mail-tester.com before the first real email.
4. Check new passwords against Pwned Passwords in a later code PR.
5. The paid domain is the one unavoidable cost of the launch.
