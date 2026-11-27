import { describe, expect, it } from 'vitest';
import {
  IMPORT_MAX_CHARS,
  applyImportBatch,
  createImportBatch,
  editImportItem,
  existingRecordImportKey,
  importCsvTemplate,
  importDedupeKey,
  importedRecordInUse,
  isImportReviewExpired,
  matchCanonicalSkill,
  normalizeImportDate,
  parseCsv,
  parseImport,
  planImportCommit,
  undoImportBatch,
} from '../../packages/domain/src/imports.js';
import { DomainError } from '../../packages/domain/src/core.js';

const NOW = '2026-11-27T12:00:00.000Z';
const skills = [
  { id: 's-ts', name: 'TypeScript', slug: 'typescript' },
  { id: 's-node', name: 'Node.js', slug: 'nodejs' },
];
const ctx = { existingKeys: new Set<string>(), skills, nowIso: NOW };

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    return err instanceof DomainError
      ? `${err.code}:${String((err.details as { reason?: string } | undefined)?.reason ?? '')}`
      : 'other';
  }
  return 'none';
};

describe('Import parsing (TS-08)', () => {
  it('reads RFC 4180 CSV: quotes, doubled quotes, CRLF, a byte-order mark, blank lines', () => {
    expect(parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\n"multi\nline",z')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['multi\nline', 'z'],
    ]);
    expect(codeOf(() => parseCsv('a\n"open'))).toBe('VALIDATION_FAILED:');
  });

  it('normalizes partial ISO dates and refuses impossible ones', () => {
    expect(normalizeImportDate('2021')).toBe('2021-01-01');
    expect(normalizeImportDate('2021-04')).toBe('2021-04-01');
    expect(normalizeImportDate('2021-02-29')).toBeNull();
    expect(normalizeImportDate('April 2021')).toBeNull();
    expect(normalizeImportDate('1850')).toBeNull();
    expect(normalizeImportDate('')).toBeNull();
  });

  it('every CSV template parses back to its example row', () => {
    for (const source of [
      'csv_positions',
      'csv_education',
      'csv_skills',
      'csv_certifications',
    ] as const) {
      expect(parseImport(source, importCsvTemplate(source)).items).toHaveLength(1);
    }
  });

  it('strips control characters, trims lengths and keeps only web links', () => {
    const { items } = parseImport(
      'csv_certifications',
      `name,url\n"Cert\u0007 A",javascript:alert(1)\n${'n'.repeat(400)},https://ok.example/c\n`
    );
    expect(items[0]).toMatchObject({ payload: { name: 'Cert A', url: null } });
    expect((items[1].payload as { name: string }).name).toHaveLength(200);
    expect((items[1].payload as { url: string }).url).toBe('https://ok.example/c');
  });

  it('refuses files over the limits with a message, and files with nothing to import', () => {
    expect(codeOf(() => parseImport('csv_skills', 'x'.repeat(IMPORT_MAX_CHARS + 1)))).toBe(
      'VALIDATION_FAILED:'
    );
    expect(codeOf(() => parseImport('json_resume', '[]'))).toBe('VALIDATION_FAILED:');
    expect(codeOf(() => parseImport('csv_skills', 'name\n'))).toBe('VALIDATION_FAILED:');
  });
});

describe('Import review and dedupe (TS-08, §10.1 rule 4)', () => {
  it('matches skills by name or slug, ignoring case and punctuation', () => {
    expect(matchCanonicalSkill('typescript', skills)).toBe('s-ts');
    expect(matchCanonicalSkill('Node JS', skills)).toBe('s-node');
    expect(matchCanonicalSkill('Cobol', skills)).toBeNull();
  });

  it('keys a stored role exactly as it keys the imported position it came from', () => {
    const [item] = parseImport(
      'csv_positions',
      'company,title,start_date\nAcme,Dev,2021-04-09\n'
    ).items;
    expect(
      existingRecordImportKey({
        kind: 'workHistory',
        companyName: 'ACME',
        title: 'dev',
        startDate: '2021-04-01',
      })
    ).toBe(importDedupeKey(item));
  });

  it('does not let a duplicate or a broken entry be committed', () => {
    const batch = createImportBatch({
      ownerId: 'u1',
      source: 'csv_positions',
      parsed: parseImport('csv_positions', 'company,title,start_date\nAcme,Dev,2021-04\nB,C,\n'),
      nowIso: NOW,
    });
    const [ok, broken] = batch.items;
    expect(codeOf(() => planImportCommit(batch, [{ itemId: broken.id }], ctx))).toBe(
      'VALIDATION_FAILED:'
    );
    const existingKeys = new Set([importDedupeKey(ok)!]);
    expect(
      codeOf(() => planImportCommit(batch, [{ itemId: ok.id }], { ...ctx, existingKeys }))
    ).toBe('CONFLICT:profile_changed');
    const plan = planImportCommit(
      batch,
      [{ itemId: ok.id }, { itemId: broken.id, edit: { startDate: '2020' } }],
      ctx
    );
    expect(plan.items).toHaveLength(2);
    expect(plan.skipped).toBe(0);
    expect(codeOf(() => editImportItem(ok, { company: '', title: '' }))).toBe('VALIDATION_FAILED:');
  });
});

describe('Import lifecycle (TS-08)', () => {
  const batch = createImportBatch({
    ownerId: 'u1',
    source: 'csv_skills',
    parsed: parseImport('csv_skills', 'name\nTypeScript\n'),
    nowIso: NOW,
  });

  it('expires an unconfirmed import after its review window', () => {
    expect(isImportReviewExpired(batch, NOW)).toBe(false);
    expect(isImportReviewExpired(batch, '2026-12-04T12:00:00.000Z')).toBe(true);
    expect(
      codeOf(() => planImportCommit(batch, [], { ...ctx, nowIso: '2026-12-05T00:00:00.000Z' }))
    ).toBe('CONFLICT:review_expired');
  });

  it('undoes only inside the window, and never over records in use', () => {
    const applied = applyImportBatch(batch, [], NOW);
    expect(codeOf(() => planImportCommit(applied, [], ctx))).toBe('CONFLICT:not_reviewable');
    expect(undoImportBatch(applied, NOW, []).status).toBe('undone');
    expect(codeOf(() => undoImportBatch(applied, '2026-12-05T00:00:00.000Z', []))).toBe(
      'CONFLICT:undo_window_closed'
    );
    expect(codeOf(() => undoImportBatch(applied, NOW, ['e1']))).toBe('CONFLICT:records_in_use');
    expect(codeOf(() => undoImportBatch(batch, NOW, []))).toBe('CONFLICT:not_applied');
  });

  it('counts a record as in use once it is more than an imported claim', () => {
    const role = {
      kind: 'workHistory' as const,
      verificationStatus: 'unverified',
      references: 0,
      openEmailCheck: false,
    };
    expect(importedRecordInUse(role)).toBe(false);
    expect(importedRecordInUse({ ...role, references: 1 })).toBe(true);
    expect(importedRecordInUse({ ...role, openEmailCheck: true })).toBe(true);
    expect(importedRecordInUse({ ...role, emailVerifiedAt: NOW })).toBe(true);
    const claim = {
      kind: 'evidence' as const,
      status: 'pending',
      verificationLevel: 'unverified',
      attached: false,
    };
    expect(importedRecordInUse(claim)).toBe(false);
    expect(importedRecordInUse({ ...claim, attached: true })).toBe(true);
    expect(importedRecordInUse({ ...claim, verificationLevel: 'peer_reviewed' })).toBe(true);
    expect(importedRecordInUse({ ...claim, status: 'disputed' })).toBe(true);
  });
});
