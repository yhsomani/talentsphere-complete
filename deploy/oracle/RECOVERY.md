# PostgreSQL backup and restore checks

Run `bash deploy/oracle/backup.sh` on the staging host. By default, dumps land in
`private-backups/` at repository root; this directory must remain private, untracked
and inaccessible from the web. Use `BACKUP_DIR` to select a secure external location.

Run `bash deploy/oracle/verify-restore.sh /path/to/backup.dump` to restore into a
temporary database, verify the migration ledger, and drop the test database. Ensure
adequate database disk space. The live `talentsphere` database is not replaced.

**These scripts are not yet executed in Oracle.** A local dump is insufficient:
configure an encrypted off-VM destination, retention, a scheduler, missed-backup
alerts, a separate-host restore drill, and documented RPO/RTO before real users.
Verify application data and workflows after restoring. Protect backup files as
sensitive personal information. Never commit or upload plaintext dumps publicly.
