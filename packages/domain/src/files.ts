/**
 * Uploaded files (ADR-020). A file belongs to one account and has one
 * purpose; the purpose decides which types and sizes are accepted. The
 * declared type must match the file's first bytes, so a renamed executable
 * is not stored as a PDF. Files are private: they are read only through a
 * short-lived signed URL issued after an ownership check.
 */
import crypto from 'node:crypto';
import { DomainError } from './core.js';

export const FILE_PURPOSES = ['resume', 'profile_photo', 'import'] as const;
export type FilePurpose = (typeof FILE_PURPOSES)[number];

export const FILE_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/json',
  'text/csv',
] as const;
export type FileContentType = (typeof FILE_CONTENT_TYPES)[number];

const MB = 1024 * 1024;

/** What each purpose accepts. */
export const FILE_PURPOSE_RULES: Record<
  FilePurpose,
  { types: readonly FileContentType[]; maxBytes: number }
> = {
  resume: {
    types: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxBytes: 5 * MB,
  },
  profile_photo: { types: ['image/png', 'image/jpeg', 'image/webp'], maxBytes: 2 * MB },
  import: { types: ['application/json', 'text/csv'], maxBytes: 2 * MB },
};

/** The largest file any purpose accepts: the upload route's body limit. */
export const FILE_MAX_BYTES = Math.max(...Object.values(FILE_PURPOSE_RULES).map((r) => r.maxBytes));

/** Files one account may keep at once. */
export const FILE_MAX_PER_USER = 50;

/** Lifetime of a download link. */
export const FILE_SIGNED_URL_TTL_SECONDS = 300;

/** 'not_scanned' exists only outside deployed environments, which refuse uploads without a scanner. */
export type FileScanStatus = 'clean' | 'not_scanned';

export interface StoredFile {
  id: string;
  ownerId: string;
  purpose: FilePurpose;
  contentType: FileContentType;
  sizeBytes: number;
  sha256: string;
  originalName: string;
  storageKey: string;
  scanStatus: FileScanStatus;
  createdAt: string;
}

const startsWith = (bytes: Uint8Array, prefix: readonly number[], offset = 0) =>
  bytes.length >= offset + prefix.length && prefix.every((b, i) => bytes[offset + i] === b);

/** True when the first bytes are what the declared type says. */
export function contentMatchesType(bytes: Uint8Array, type: FileContentType): boolean {
  switch (type) {
    case 'application/pdf':
      return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]); // %PDF-
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]); // ZIP container
    case 'image/png':
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/jpeg':
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case 'image/webp':
      return (
        startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      );
    case 'application/json':
    case 'text/csv':
      // Text: valid UTF-8 with no NUL byte.
      if (bytes.includes(0)) return false;
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        return true;
      } catch {
        return false;
      }
  }
}

/** A display name safe to store and show: no path, no control characters, at most 120 characters. */
export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  const flat = base.replace(/[\p{Cc}\p{Cf}]+/gu, '').trim();
  return Array.from(flat).slice(0, 120).join('') || 'file';
}

/**
 * Checks an upload against its purpose's rules and the account's file count,
 * and returns the record to store (scan status is the caller's to set).
 */
export function planFileUpload(input: {
  ownerId: string;
  purpose: FilePurpose;
  contentType: string;
  fileName: string;
  bytes: Uint8Array;
  existingCount: number;
  nowMs?: number;
}): Omit<StoredFile, 'scanStatus'> {
  const rules = FILE_PURPOSE_RULES[input.purpose];
  const type = input.contentType.split(';')[0]!.trim().toLowerCase() as FileContentType;
  if (!rules.types.includes(type)) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `A ${input.purpose} file must be one of: ${rules.types.join(', ')}.`,
      {
        field: 'contentType',
      }
    );
  }
  if (input.bytes.length === 0) {
    throw new DomainError('VALIDATION_FAILED', 'The file is empty.', { field: 'file' });
  }
  if (input.bytes.length > rules.maxBytes) {
    throw new DomainError(
      'VALIDATION_FAILED',
      `A ${input.purpose} file can be at most ${rules.maxBytes / MB} MB.`,
      { field: 'file' }
    );
  }
  if (!contentMatchesType(input.bytes, type)) {
    throw new DomainError('VALIDATION_FAILED', `The file's content is not ${type}.`, {
      field: 'file',
    });
  }
  if (input.existingCount >= FILE_MAX_PER_USER) {
    throw new DomainError(
      'CONFLICT',
      `You can keep at most ${FILE_MAX_PER_USER} files. Delete one to upload another.`
    );
  }
  const id = crypto.randomUUID();
  return {
    id,
    ownerId: input.ownerId,
    purpose: input.purpose,
    contentType: type,
    sizeBytes: input.bytes.length,
    sha256: crypto.createHash('sha256').update(input.bytes).digest('hex'),
    originalName: cleanFileName(input.fileName),
    // Keys never contain user text, so a name cannot steer where a file lands.
    storageKey: `files/${input.ownerId}/${id}`,
    createdAt: new Date(input.nowMs ?? Date.now()).toISOString(),
  };
}

/** Only the owner reads, lists or deletes a file. */
export function canAccessFile(file: Pick<StoredFile, 'ownerId'>, userId: string): boolean {
  return file.ownerId === userId;
}
