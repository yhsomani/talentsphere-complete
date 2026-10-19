# Oracle Always Free staging — NOT evidence of a production release

This deployment is an **unverified starting configuration** for Oracle Ampere ARM64.
Public launch is blocked until [issues #44–#50](https://github.com/yhsomani/talentsphere-complete/issues) have appropriate acceptance evidence.

## Host preparation

1. Provision an ARM64 Ubuntu instance in your Oracle home region. Ensure sufficient free RAM/disk, and install supported Docker Engine + Compose plugin from official packages.
2. Configure Oracle VCN security rules and host firewall to accept **only 22/tcp from a trusted management IP, 80/tcp and 443/tcp from intended testers** (and 443/udp only if HTTP/3 is desired). Keep ports 4000 and 5432 private. Prefer SSH keys and disable password SSH.
3. Point SITE_DOMAIN's DNS A/AAAA record to the public IP; verify it resolves before requesting TLS.
4. From repository root, copy `deploy/oracle/.env.example` to `deploy/oracle/.env`. Set a real domain/email, two different strong random secrets, and restrictive file permissions (`chmod 600 deploy/oracle/.env`). Use URL-safe PostgreSQL password characters or percent-encode them in the DATABASE_URL.
5. Review configuration and migrations before deploying. Do NOT run migrations automatically as part of a public service restart.

## Initial deployment (run from repository root)

```sh
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml build
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d db
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml run --rm --no-deps api node scripts/migrate.mjs
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml up -d
docker compose --env-file deploy/oracle/.env -f deploy/oracle/compose.yaml ps
```

**Do not treat container startup as proof of readiness.** Verify HTTPS, auth, worker heartbeat, migrations, browser journeys, tenant isolation, resource use, and outbound mail (if enabled). Provision a non-public staging account and restrict testers; this compose file does not include an access-control gateway.

## Important limitations

- Exactly **one API instance** is supported per DB. The API uses a PostgreSQL advisory lock and caches read state. Never `--scale api` or turn on multiple replicas.
- The database is intentionally private to the Compose network. The host must have a separate encrypted off-instance backup process; this Compose file **does not implement backups**. Prove a full restore into an isolated database, including migration history and jobs, before accepting real user data.
- Email verification needs provider credentials, domain verification and real deliverability testing. `EMAIL_PROVIDER=none` fails closed.
- Billing is disabled; do not enable simulated billing. Interview scoring and ephemeral modules remain release-gated.
- The image contains build tooling and source for simplicity. Hardening to smaller runtime images, pinned image digests, scans, resource ceilings, service health checks and deployment rollback remain necessary prior to public launch.
- Environment variable interpolation may break with reserved URL characters in POSTGRES_PASSWORD; prefer cryptographically generated URL-safe secrets.
- This config has not been executed on an Oracle VM. Review storage, ARM64 image availability and free-tier limits for the selected tenancy.
