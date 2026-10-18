/**
 * Fail closed before running new migrations if the database ledger differs
 * from the checked-in SQL. Applied migrations are immutable history.
 * The input rows contain only migration filenames/checksums, never secrets.
 */
export function assertMigrationHistory(localFiles, appliedRows, expectedChecksum) {
  const known = new Set(localFiles);
  const applied = new Set();
  for (const row of appliedRows) {
    if (!known.has(row.filename)) {
      throw new Error(`Applied migration is missing from this release: ${row.filename}`);
    }
    if (applied.has(row.filename)) {
      throw new Error(`Duplicate migration ledger entry: ${row.filename}`);
    }
    applied.add(row.filename);
    if (row.checksum !== expectedChecksum(row.filename)) {
      throw new Error(
        `Applied migration checksum mismatch: ${row.filename}. Restore the original migration; create a new numbered migration for further changes.`
      );
    }
  }
  let pendingStarted = false;
  for (const filename of localFiles) {
    if (!applied.has(filename)) pendingStarted = true;
    else if (pendingStarted) {
      throw new Error(
        `Migration ledger gap before ${filename}: applied migrations must be a contiguous prefix.`
      );
    }
  }
}
