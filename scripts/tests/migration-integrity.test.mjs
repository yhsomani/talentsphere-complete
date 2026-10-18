import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertMigrationHistory } from '../lib/migration-integrity.mjs';

const files = ['00001_one.sql', '00002_two.sql', '00003_three.sql'];
const checksums = { '00001_one.sql': 'sha1', '00002_two.sql': 'sha2', '00003_three.sql': 'sha3' };
const expected = (name) => checksums[name];

test('empty and contiguous migration ledgers are accepted', () => {
  assert.doesNotThrow(() => assertMigrationHistory(files, [], expected));
  assert.doesNotThrow(() =>
    assertMigrationHistory(files, [{ filename: files[0], checksum: 'sha1' }], expected)
  );
  assert.doesNotThrow(() =>
    assertMigrationHistory(
      files,
      files.map((filename) => ({ filename, checksum: expected(filename) })),
      expected
    )
  );
});

test('changed previously applied SQL is a hard failure', () => {
  assert.throws(
    () => assertMigrationHistory(files, [{ filename: files[0], checksum: 'old-hash' }], expected),
    /checksum mismatch/
  );
});

test('removed or renamed applied migrations refuse the release', () => {
  assert.throws(
    () => assertMigrationHistory(files, [{ filename: '00001_missing.sql', checksum: 'sha1' }], expected),
    /missing from this release/
  );
});

test('out-of-order application and gaps refuse the release', () => {
  assert.throws(
    () => assertMigrationHistory(files, [{ filename: files[1], checksum: 'sha2' }], expected),
    /ledger gap/
  );
  assert.throws(
    () =>
      assertMigrationHistory(
        files,
        [
          { filename: files[0], checksum: 'sha1' },
          { filename: files[2], checksum: 'sha3' },
        ],
        expected
      ),
    /ledger gap/
  );
});

test('duplicate entries refuse the release', () => {
  assert.throws(
    () =>
      assertMigrationHistory(
        files,
        [
          { filename: files[0], checksum: 'sha1' },
          { filename: files[0], checksum: 'sha1' },
        ],
        expected
      ),
    /Duplicate migration/
  );
});
