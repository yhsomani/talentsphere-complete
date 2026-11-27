/**
 * Profile import v1 (plan TS-08, ADR-033, blueprint FR-PRF-019). A user
 * brings data from a file they made or exported themselves: a JSON Resume
 * file or one of TalentSphere's CSV templates. Parsing produces the plan's
 * intermediate model (§10.3); nothing reaches the profile until the user
 * reviews and confirms (BR-PRF-016). Every committed item is a claim with
 * provenance `imported:<source>`; importing never raises a verification
 * rung (§10.1 rule 3).
 */
import crypto from 'node:crypto';
import { DomainError } from './core.js';
import { validateWorkHistoryDates, type EmploymentType } from './work-history-graph.js';

export const IMPORT_SOURCES = [
  'json_resume',
  'csv_positions',
  'csv_education',
  'csv_skills',
  'csv_certifications',
] as const;
export type ImportSource = (typeof IMPORT_SOURCES)[number];

export const IMPORT_ITEM_KINDS = ['position', 'education', 'skill', 'certification'] as const;
export type ImportItemKind = (typeof IMPORT_ITEM_KINDS)[number];

/** Text in, so the limit is on characters of the file as sent. */
export const IMPORT_MAX_CHARS = 512 * 1024;
export const IMPORT_MAX_ITEMS = 300;
/** A batch nobody confirmed is deleted after this (§10.1 rule 5). */
export const IMPORT_REVIEW_DAYS = 7;
/** A committed batch can be undone for this long (§10.1 rule 7). */
export const IMPORT_UNDO_DAYS = 7;

const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'freelance',
];

export interface PositionPayload {
  company: string;
  title: string;
  employmentType: EmploymentType;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}
export interface EducationPayload {
  institution: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
}
export interface SkillPayload {
  name: string;
}
export interface CertificationPayload {
  name: string;
  issuer: string | null;
  issuedDate: string | null;
  credentialId: string | null;
  url: string | null;
}

export type ImportPayload =
  | { kind: 'position'; payload: PositionPayload }
  | { kind: 'education'; payload: EducationPayload }
  | { kind: 'skill'; payload: SkillPayload }
  | { kind: 'certification'; payload: CertificationPayload };

export type ImportItem = ImportPayload & {
  id: string;
  /** Set on commit: the record the item became. */
  createdRef?: { type: 'workHistory' | 'evidence'; id: string };
};

export type ImportBatchStatus = 'ready_for_review' | 'applied' | 'undone';

export interface ImportBatch {
  id: string;
  ownerId: string;
  source: ImportSource;
  status: ImportBatchStatus;
  items: ImportItem[];
  /** Sections the file held that v1 does not import, with their entry counts. */
  ignored: Record<string, number>;
  reviewExpiresAt: string;
  appliedAt?: string;
  undoUntil?: string;
  undoneAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Text and dates
// ---------------------------------------------------------------------------

// Control characters other than tab and newline never belong in profile text.
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const cleaned = String(value).replace(CONTROL, '').replace(/\r\n?/g, '\n').trim();
  if (!cleaned) return null;
  return cleaned.length > max ? cleaned.slice(0, max).trimEnd() : cleaned;
}

function line(value: unknown, max: number): string | null {
  const t = text(value, max);
  return t === null ? null : t.replace(/\s+/g, ' ');
}

/**
 * JSON Resume dates are ISO 8601 with optional month and day ("2021",
 * "2021-04", "2021-04-12"). A missing month or day becomes the first, so the
 * date is never later than what the person wrote. Anything else is null and
 * shows as a problem in review rather than a guessed date.
 */
export function normalizeImportDate(value: unknown): string | null {
  const t = line(value, 32);
  if (!t) return null;
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(t);
  if (!m) return null;
  const date = `${m[1]}-${m[2] ?? '01'}-${m[3] ?? '01'}`;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  // The range the API's date columns accept.
  if (Number(m[1]) < 1900 || Number(m[1]) > 2100) return null;
  return date;
}

function employmentType(value: unknown): EmploymentType {
  const t = line(value, 32)
    ?.toLowerCase()
    .replace(/[\s-]+/g, '_');
  return EMPLOYMENT_TYPES.find((type) => type === t) ?? 'full_time';
}

function bool(value: unknown): boolean {
  const t = line(value, 8)?.toLowerCase();
  return value === true || t === 'true' || t === 'yes' || t === 'y' || t === '1';
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export interface ParsedImport {
  items: ImportPayload[];
  ignored: Record<string, number>;
}

const NOTHING_FOUND = 'We could not find profile data in this file.';

/**
 * RFC 4180 CSV: comma separated, double quotes around fields that hold
 * commas, quotes or line breaks, a doubled quote inside a quoted field.
 */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let i = content.charCodeAt(0) === 0xfeff ? 1 : 0; // byte-order mark
  for (; i < content.length; i++) {
    const c = content[i];
    if (quoted) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && content[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (quoted) {
    throw new DomainError('VALIDATION_FAILED', 'The CSV file has a quote that is never closed.');
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** The columns of each CSV template, in order; the first ones are required. */
export const IMPORT_CSV_TEMPLATES: Record<
  Exclude<ImportSource, 'json_resume'>,
  { columns: string[]; required: string[]; example: string[] }
> = {
  csv_positions: {
    columns: ['company', 'title', 'employment_type', 'start_date', 'end_date', 'description'],
    required: ['company', 'title'],
    example: ['Acme Ltd', 'Software Engineer', 'full_time', '2021-04', '', 'Built the billing API'],
  },
  csv_education: {
    columns: ['institution', 'degree', 'field', 'start_date', 'end_date'],
    required: ['institution'],
    example: ['City University', 'BSc', 'Computer Science', '2016', '2019'],
  },
  csv_skills: {
    columns: ['name'],
    required: ['name'],
    example: ['TypeScript'],
  },
  csv_certifications: {
    columns: ['name', 'issuer', 'issued_date', 'credential_id', 'url'],
    required: ['name'],
    example: ['Cloud Practitioner', 'Example Cloud', '2023-06', 'ABC-123', ''],
  },
};

/** The template file a user downloads and fills in: header and one example row. */
export function importCsvTemplate(source: Exclude<ImportSource, 'json_resume'>): string {
  const t = IMPORT_CSV_TEMPLATES[source];
  const quote = (cell: string) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell);
  return `${t.columns.join(',')}\n${t.example.map(quote).join(',')}\n`;
}

function parseCsvSource(source: Exclude<ImportSource, 'json_resume'>, content: string) {
  const rows = parseCsv(content);
  const template = IMPORT_CSV_TEMPLATES[source];
  const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const missing = template.required.filter((column) => !header.includes(column));
  if (missing.length > 0) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `This file does not match the template: the ${missing.join(', ')} column is missing.`,
      { missingColumns: missing }
    );
  }
  const records = rows.map((cells) =>
    Object.fromEntries(header.map((column, i) => [column, cells[i] ?? '']))
  );
  const items: ImportPayload[] = [];
  for (const r of records) {
    const item = csvRecordToItem(source, r);
    if (item) items.push(item);
  }
  return items;
}

function csvRecordToItem(
  source: Exclude<ImportSource, 'json_resume'>,
  r: Record<string, string>
): ImportPayload | null {
  switch (source) {
    case 'csv_positions':
      return position({
        company: r.company,
        title: r.title,
        employmentType: r.employment_type,
        startDate: r.start_date,
        endDate: r.end_date,
        isCurrent: r.is_current !== undefined ? bool(r.is_current) : !line(r.end_date, 32),
        description: r.description,
      });
    case 'csv_education':
      return education({
        institution: r.institution,
        degree: r.degree,
        field: r.field,
        startDate: r.start_date,
        endDate: r.end_date,
      });
    case 'csv_skills':
      return skill(r.name);
    case 'csv_certifications':
      return certification({
        name: r.name,
        issuer: r.issuer,
        issuedDate: r.issued_date,
        credentialId: r.credential_id,
        url: r.url,
      });
  }
}

function position(r: {
  company: unknown;
  title: unknown;
  employmentType?: unknown;
  startDate: unknown;
  endDate: unknown;
  isCurrent: boolean;
  description: unknown;
}): ImportPayload | null {
  const company = line(r.company, 150);
  const title = line(r.title, 150);
  if (!company && !title) return null;
  const endDate = normalizeImportDate(r.endDate);
  return {
    kind: 'position',
    payload: {
      company: company ?? '',
      title: title ?? '',
      employmentType: employmentType(r.employmentType),
      startDate: normalizeImportDate(r.startDate),
      endDate: r.isCurrent ? null : endDate,
      isCurrent: r.isCurrent,
      description: text(r.description, 3000),
    },
  };
}

function education(r: {
  institution: unknown;
  degree: unknown;
  field: unknown;
  startDate: unknown;
  endDate: unknown;
}): ImportPayload | null {
  const institution = line(r.institution, 200);
  if (!institution) return null;
  return {
    kind: 'education',
    payload: {
      institution,
      degree: line(r.degree, 150),
      field: line(r.field, 150),
      startDate: normalizeImportDate(r.startDate),
      endDate: normalizeImportDate(r.endDate),
    },
  };
}

function skill(name: unknown): ImportPayload | null {
  const n = line(name, 100);
  return n ? { kind: 'skill', payload: { name: n } } : null;
}

function certification(r: {
  name: unknown;
  issuer: unknown;
  issuedDate: unknown;
  credentialId: unknown;
  url: unknown;
}): ImportPayload | null {
  const name = line(r.name, 200);
  if (!name) return null;
  const url = line(r.url, 500);
  return {
    kind: 'certification',
    payload: {
      name,
      issuer: line(r.issuer, 200),
      issuedDate: normalizeImportDate(r.issuedDate),
      credentialId: line(r.credentialId, 100),
      // Only a web address is kept; it is shown as "link provided", never as verified.
      url: url && /^https?:\/\/\S+$/i.test(url) ? url : null,
    },
  };
}

/** JSON Resume sections v1 reads; every other top-level key is counted as ignored. */
const JSON_RESUME_READ = new Set(['work', 'education', 'skills', 'certificates']);

function parseJsonResume(content: string): ParsedImport {
  let doc: unknown;
  try {
    doc = JSON.parse(content.charCodeAt(0) === 0xfeff ? content.slice(1) : content);
  } catch {
    throw new DomainError('VALIDATION_FAILED', 'This file is not valid JSON.');
  }
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    throw new DomainError('VALIDATION_FAILED', NOTHING_FOUND);
  }
  const resume = doc as Record<string, unknown>;
  const list = (key: string): Record<string, unknown>[] =>
    Array.isArray(resume[key])
      ? (resume[key] as unknown[]).filter(
          (e): e is Record<string, unknown> => !!e && typeof e === 'object' && !Array.isArray(e)
        )
      : [];

  const items: ImportPayload[] = [];
  for (const w of list('work')) {
    const item = position({
      company: w.name ?? w.company,
      title: w.position,
      startDate: w.startDate,
      endDate: w.endDate,
      isCurrent: !line(w.endDate, 32),
      description: w.summary ?? w.description,
    });
    if (item) items.push(item);
  }
  for (const e of list('education')) {
    const item = education({
      institution: e.institution,
      degree: e.studyType,
      field: e.area,
      startDate: e.startDate,
      endDate: e.endDate,
    });
    if (item) items.push(item);
  }
  for (const s of list('skills')) {
    const names = [s.name, ...(Array.isArray(s.keywords) ? s.keywords : [])];
    for (const name of names) {
      const item = skill(name);
      if (item) items.push(item);
    }
  }
  for (const c of list('certificates')) {
    const item = certification({
      name: c.name,
      issuer: c.issuer,
      issuedDate: c.date,
      credentialId: c.id ?? c.credentialId,
      url: c.url,
    });
    if (item) items.push(item);
  }

  // Contacts and references hold other people's data (§10.1 rule 6); basics,
  // projects, languages and the rest are not imported by v1. Each is counted
  // so the review screen can say what was left out.
  const ignored: Record<string, number> = {};
  for (const [key, value] of Object.entries(resume)) {
    if (JSON_RESUME_READ.has(key) || key === '$schema' || key === 'meta') continue;
    const count = Array.isArray(value) ? value.length : value && typeof value === 'object' ? 1 : 0;
    if (count > 0) ignored[key] = count;
  }
  return { items, ignored };
}

/** Parses a file's text into the intermediate model. Writes nothing. */
export function parseImport(source: ImportSource, content: string): ParsedImport {
  if (content.length > IMPORT_MAX_CHARS) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `This file is too large to import. The limit is ${IMPORT_MAX_CHARS / 1024} KB.`
    );
  }
  const parsed =
    source === 'json_resume'
      ? parseJsonResume(content)
      : { items: parseCsvSource(source, content), ignored: {} };
  if (parsed.items.length === 0) {
    throw new DomainError('VALIDATION_FAILED', NOTHING_FOUND);
  }
  if (parsed.items.length > IMPORT_MAX_ITEMS) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `This file has ${parsed.items.length} entries. One import can hold at most ${IMPORT_MAX_ITEMS}.`
    );
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Review: problems and duplicates
// ---------------------------------------------------------------------------

const norm = (value: string | null | undefined) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9+#]+/g, ' ')
    .trim();

/** Skill names match a canonical skill by name or slug, ignoring case, spaces and punctuation. */
export function matchCanonicalSkill(
  name: string,
  skills: Iterable<{ id: string; name: string; slug: string }>
): string | null {
  const key = norm(name).replace(/\s+/g, '');
  if (!key) return null;
  for (const s of skills) {
    if (norm(s.name).replace(/\s+/g, '') === key || norm(s.slug).replace(/\s+/g, '') === key) {
      return s.id;
    }
  }
  return null;
}

/**
 * The dedupe key of an item (§10.1 rule 4): positions on company, title and
 * start month; education on institution, degree and start year; skills on
 * the canonical skill; certifications on issuer and credential id, or on
 * issuer and name when there is no id.
 */
export function importDedupeKey(item: ImportPayload, skillId?: string | null): string | null {
  switch (item.kind) {
    case 'position':
      return `position|${norm(item.payload.company)}|${norm(item.payload.title)}|${(item.payload.startDate ?? '').slice(0, 7)}`;
    case 'education':
      return `education|${norm(item.payload.institution)}|${norm(item.payload.degree)}|${(item.payload.startDate ?? '').slice(0, 4)}`;
    case 'skill':
      return skillId ? `skill|${skillId}` : null;
    case 'certification':
      return `certification|${norm(item.payload.issuer)}|${
        item.payload.credentialId
          ? `id:${norm(item.payload.credentialId)}`
          : norm(item.payload.name)
      }`;
  }
}

/** What stops an item being committed as it stands, or null. */
export function importItemProblem(
  item: ImportPayload,
  skillId: string | null,
  nowIso: string
): string | null {
  switch (item.kind) {
    case 'position': {
      const p = item.payload;
      if (!p.company) return 'Company is missing.';
      if (!p.title) return 'Job title is missing.';
      if (!p.startDate) return 'Start date is missing or not a date.';
      try {
        validateWorkHistoryDates(p.startDate, p.endDate ?? undefined, p.isCurrent, nowIso);
      } catch (err) {
        return err instanceof DomainError ? err.message : 'The dates are not valid.';
      }
      return null;
    }
    case 'education': {
      const today = nowIso.slice(0, 10);
      const { startDate, endDate } = item.payload;
      if (startDate && startDate > today) return 'Start date cannot be in the future.';
      if (startDate && endDate && endDate < startDate) {
        return 'End date cannot be before the start date.';
      }
      return null;
    }
    case 'skill':
      return skillId ? null : 'Not in the TalentSphere skill list yet.';
    case 'certification': {
      const issued = item.payload.issuedDate;
      return issued && issued > nowIso.slice(0, 10) ? 'Issue date cannot be in the future.' : null;
    }
  }
}

export interface ImportItemReview {
  id: string;
  kind: ImportItemKind;
  skillId: string | null;
  problem: string | null;
  duplicate: boolean;
  /** Accept when the item is new and valid, otherwise skip (§10.1 rule 4). */
  suggested: 'accept' | 'skip';
}

/**
 * Reviews every item against the profile as it is now, so a batch read a day
 * later reflects what was added since. Within a file, a repeat of an earlier
 * item is a duplicate too.
 */
export function reviewImportItems(
  items: ReadonlyArray<ImportPayload & { id?: string }>,
  ctx: {
    existingKeys: ReadonlySet<string>;
    skills: Iterable<{ id: string; name: string; slug: string }>;
    nowIso: string;
  }
): ImportItemReview[] {
  const skills = [...ctx.skills];
  const seen = new Set<string>();
  return items.map((item, index) => {
    const skillId = item.kind === 'skill' ? matchCanonicalSkill(item.payload.name, skills) : null;
    const key = importDedupeKey(item, skillId);
    const duplicate = key !== null && (ctx.existingKeys.has(key) || seen.has(key));
    if (key) seen.add(key);
    const problem = importItemProblem(item, skillId, ctx.nowIso);
    return {
      id: item.id ?? String(index),
      kind: item.kind,
      skillId,
      problem,
      duplicate,
      suggested: problem || duplicate ? 'skip' : 'accept',
    };
  });
}

// ---------------------------------------------------------------------------
// Batch lifecycle
// ---------------------------------------------------------------------------

const addDays = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();

export function createImportBatch(params: {
  ownerId: string;
  source: ImportSource;
  parsed: ParsedImport;
  nowIso?: string;
  id?: string;
}): ImportBatch {
  const now = params.nowIso ?? new Date().toISOString();
  return {
    id: params.id ?? crypto.randomUUID(),
    ownerId: params.ownerId,
    source: params.source,
    status: 'ready_for_review',
    items: params.parsed.items.map((item) => ({ ...item, id: crypto.randomUUID() })),
    ignored: params.parsed.ignored,
    reviewExpiresAt: addDays(now, IMPORT_REVIEW_DAYS),
    createdAt: now,
    updatedAt: now,
  };
}

/** A batch waiting for review past its window is gone for every purpose. */
export function isImportReviewExpired(batch: ImportBatch, nowIso: string): boolean {
  return batch.status === 'ready_for_review' && batch.reviewExpiresAt <= nowIso;
}

/** Replaces an item's payload with the user's edit, cleaned like a parsed value. */
export function editImportItem(item: ImportItem, edit: Record<string, unknown>): ImportItem {
  const merged = { ...item.payload, ...edit } as Record<string, unknown>;
  const cleaned =
    item.kind === 'position'
      ? position({
          company: merged.company,
          title: merged.title,
          employmentType: merged.employmentType,
          startDate: merged.startDate,
          endDate: merged.endDate,
          isCurrent: merged.isCurrent === true,
          description: merged.description,
        })
      : item.kind === 'education'
        ? education({
            institution: merged.institution,
            degree: merged.degree,
            field: merged.field,
            startDate: merged.startDate,
            endDate: merged.endDate,
          })
        : item.kind === 'skill'
          ? skill(merged.name)
          : certification({
              name: merged.name,
              issuer: merged.issuer,
              issuedDate: merged.issuedDate,
              credentialId: merged.credentialId,
              url: merged.url,
            });
  if (!cleaned || cleaned.kind !== item.kind) {
    throw new DomainError('VALIDATION_FAILED', 'An edited entry is empty.', { itemId: item.id });
  }
  return { ...cleaned, id: item.id } as ImportItem;
}

export interface ImportDecision {
  itemId: string;
  edit?: Record<string, unknown>;
}

/**
 * Which items a commit writes. Only listed items are accepted; the rest are
 * skipped. An accepted item must have no problem and must not duplicate the
 * profile or another accepted item, judged on the profile as it is at commit
 * time: if it changed since the review, the commit is refused and the user
 * reviews again (FR-PRF-019).
 */
export function planImportCommit(
  batch: ImportBatch,
  accepted: readonly ImportDecision[],
  ctx: {
    existingKeys: ReadonlySet<string>;
    skills: Iterable<{ id: string; name: string; slug: string }>;
    nowIso: string;
  }
): { items: Array<{ item: ImportItem; skillId: string | null }>; skipped: number } {
  if (batch.status !== 'ready_for_review') {
    throw new DomainError('CONFLICT', 'This import has already been confirmed or undone.', {
      reason: 'not_reviewable',
      status: batch.status,
    });
  }
  if (isImportReviewExpired(batch, ctx.nowIso)) {
    throw new DomainError('CONFLICT', 'This import expired before it was confirmed. Start again.', {
      reason: 'review_expired',
    });
  }
  const byId = new Map(batch.items.map((item) => [item.id, item]));
  const chosen: ImportItem[] = [];
  const ids = new Set<string>();
  for (const decision of accepted) {
    const item = byId.get(decision.itemId);
    if (!item) {
      throw new DomainError('VALIDATION_FAILED', 'An accepted entry is not part of this import.', {
        itemId: decision.itemId,
      });
    }
    if (ids.has(item.id)) continue;
    ids.add(item.id);
    chosen.push(decision.edit ? editImportItem(item, decision.edit) : item);
  }
  const reviews = reviewImportItems(chosen, ctx);
  const blocked = reviews.filter((r) => r.problem);
  if (blocked.length > 0) {
    throw new DomainError('VALIDATION_FAILED', 'Some accepted entries need fixing first.', {
      items: blocked.map((r) => ({ itemId: r.id, problem: r.problem })),
    });
  }
  const duplicates = reviews.filter((r) => r.duplicate);
  if (duplicates.length > 0) {
    throw new DomainError(
      'CONFLICT',
      'Some accepted entries are already on your profile. Review the import again.',
      { reason: 'profile_changed', itemIds: duplicates.map((r) => r.id) }
    );
  }
  return {
    items: chosen.map((item, i) => ({ item, skillId: reviews[i].skillId })),
    skipped: batch.items.length - chosen.length,
  };
}

/** The batch after a commit: accepted items carry the record they became. */
export function applyImportBatch(
  batch: ImportBatch,
  committed: readonly ImportItem[],
  nowIso: string
): ImportBatch {
  const done = new Map(committed.map((item) => [item.id, item]));
  return {
    ...batch,
    status: 'applied',
    items: batch.items.map((item) => done.get(item.id) ?? item),
    appliedAt: nowIso,
    undoUntil: addDays(nowIso, IMPORT_UNDO_DAYS),
    updatedAt: nowIso,
  };
}

/**
 * Undo removes every record the batch created (§10.4 case 5). It is refused
 * after the window, and when any record has since become more than an
 * imported claim (verified, referenced, attached to an application), because
 * deleting it would destroy work done after the import.
 */
export function undoImportBatch(
  batch: ImportBatch,
  nowIso: string,
  changedRecordIds: readonly string[]
): ImportBatch {
  if (batch.status !== 'applied') {
    throw new DomainError('CONFLICT', 'Only a confirmed import can be undone.', {
      reason: 'not_applied',
      status: batch.status,
    });
  }
  if (!batch.undoUntil || batch.undoUntil <= nowIso) {
    throw new DomainError('CONFLICT', 'The time to undo this import has passed.', {
      reason: 'undo_window_closed',
    });
  }
  if (changedRecordIds.length > 0) {
    throw new DomainError(
      'CONFLICT',
      'Some imported entries have been verified or used since. Remove the others one by one.',
      { reason: 'records_in_use', recordIds: [...changedRecordIds] }
    );
  }
  return { ...batch, status: 'undone', undoneAt: nowIso, updatedAt: nowIso };
}

/** The provenance every imported record carries (§10.1 rule 3). */
export const importProvenance = (source: ImportSource) => `imported:${source}`;

const IMPORT_SOURCE_LABELS: Record<ImportSource, string> = {
  json_resume: 'JSON Resume file',
  csv_positions: 'positions CSV',
  csv_education: 'education CSV',
  csv_skills: 'skills CSV',
  csv_certifications: 'certifications CSV',
};

/** The work-history fields a committed position becomes; always an unverified claim. */
export function importedWorkHistoryFields(item: ImportItem & { kind: 'position' }) {
  const p = item.payload;
  return {
    companyName: p.company,
    title: p.title,
    employmentType: p.employmentType,
    startDate: p.startDate as string,
    endDate: p.isCurrent ? undefined : (p.endDate ?? undefined),
    isCurrent: p.isCurrent,
    description: p.description ?? undefined,
  };
}

/**
 * The evidence a committed education, certification or skill entry becomes:
 * a self declaration (never a higher type), with the import named in its
 * source and provenance and the parsed entry kept in its metadata, which is
 * what later imports compare against to find duplicates.
 */
export function importedEvidenceFields(
  batch: Pick<ImportBatch, 'id' | 'source'>,
  item: ImportItem & { kind: 'education' | 'certification' | 'skill' },
  ctx: { skillName?: string; nowIso: string }
) {
  const today = ctx.nowIso.slice(0, 10);
  const metadata = {
    importKind: item.kind,
    importBatchId: batch.id,
    importItemId: item.id,
    imported: item.payload,
  };
  const base = {
    type: 'self_declaration' as const,
    source: `Imported from a ${IMPORT_SOURCE_LABELS[batch.source]}`,
    provenance: importProvenance(batch.source),
    metadata,
  };
  switch (item.kind) {
    case 'education': {
      const p = item.payload;
      const course = [p.degree, p.field].filter(Boolean).join(', ');
      const years = [p.startDate?.slice(0, 4), p.endDate?.slice(0, 4)].filter(Boolean).join(' to ');
      return {
        ...base,
        title: course ? `${course}, ${p.institution}` : p.institution,
        description: years ? `Education, ${years}.` : 'Education.',
        recencyDate: p.endDate && p.endDate <= today ? p.endDate : (p.startDate ?? today),
      };
    }
    case 'certification': {
      const p = item.payload;
      const parts = [
        p.issuer ? `Issued by ${p.issuer}.` : null,
        p.credentialId ? `Credential ID ${p.credentialId}.` : null,
        // §10.1 rule 8: a link that was not checked is only a link.
        p.url ? `Link provided, not checked: ${p.url}` : null,
      ].filter(Boolean);
      return {
        ...base,
        title: p.name,
        description: parts.join(' '),
        recencyDate: p.issuedDate ?? today,
      };
    }
    case 'skill':
      return {
        ...base,
        title: ctx.skillName ?? item.payload.name,
        description: `Skill listed in an imported ${IMPORT_SOURCE_LABELS[batch.source]}.`,
        recencyDate: today,
      };
  }
}

/**
 * The dedupe key of a record already on the profile: a work-history role,
 * or evidence an earlier import created (its metadata keeps the entry).
 */
export function existingRecordImportKey(
  record:
    | { kind: 'workHistory'; companyName: string; title: string; startDate: string }
    | { kind: 'evidence'; metadata?: Record<string, unknown> }
): string | null {
  if (record.kind === 'workHistory') {
    return importDedupeKey({
      kind: 'position',
      payload: {
        company: record.companyName,
        title: record.title,
        employmentType: 'full_time',
        startDate: record.startDate,
        endDate: null,
        isCurrent: false,
        description: null,
      },
    });
  }
  const kind = record.metadata?.importKind;
  const imported = record.metadata?.imported;
  if ((kind !== 'education' && kind !== 'certification') || !imported) return null;
  return importDedupeKey({ kind, payload: imported } as ImportPayload);
}

/**
 * Whether a record an import created has become more than an imported claim,
 * so undo must not delete it: a role with a verified email, a reference or
 * an open email check; evidence that was verified, disputed or attached to
 * an application.
 */
export function importedRecordInUse(
  record:
    | {
        kind: 'workHistory';
        emailVerifiedAt?: string;
        verificationStatus: string;
        references: number;
        openEmailCheck: boolean;
      }
    | { kind: 'evidence'; status: string; verificationLevel: string; attached: boolean }
): boolean {
  if (record.kind === 'workHistory') {
    return (
      Boolean(record.emailVerifiedAt) ||
      record.verificationStatus !== 'unverified' ||
      record.references > 0 ||
      record.openEmailCheck
    );
  }
  return (
    record.status !== 'pending' || record.verificationLevel !== 'unverified' || record.attached
  );
}
