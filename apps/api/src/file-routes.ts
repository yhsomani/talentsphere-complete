/**
 * File uploads (ADR-020, plan TS-06). The request body is the file itself,
 * sent with its Content-Type; the purpose and name are in the query. Every
 * upload is checked against its purpose (packages/domain/src/files.ts),
 * scanned for malware, written to object storage and then recorded. A
 * deployed API with no scanner refuses uploads. Files are private: the owner
 * gets a short-lived signed URL, never a permanent link.
 */
import crypto from 'node:crypto';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  canAccessFile,
  DomainError,
  FILE_MAX_BYTES,
  FILE_SIGNED_URL_TTL_SECONDS,
  planFileUpload,
  type AuthPayload,
  type StoredFile,
} from '@talentsphere/domain';
import { FileContentQuerySchema, FileUploadQuerySchema } from '@talentsphere/contracts';
import type { Storage } from './storage/index.js';
import type { ObjectStore } from './file-storage/object-store.js';
import type { MalwareScanner } from './file-storage/malware-scanner.js';

export interface FileRouteDeps {
  storage: Pick<Storage, 'files'>;
  objectStore: ObjectStore;
  /** Null when no scanner is configured. */
  scanner: MalwareScanner | null;
  deployed: boolean;
  /** Signs local content URLs. */
  urlSecret: string;
  extractUser(req: FastifyRequest): AuthPayload;
  log: {
    warn(obj: Record<string, unknown>, msg: string): void;
    error(obj: Record<string, unknown>, msg: string): void;
  };
}

/** What the API shows of a file: never its storage key. */
export const publicFile = (f: StoredFile) => ({
  id: f.id,
  purpose: f.purpose,
  contentType: f.contentType,
  sizeBytes: f.sizeBytes,
  sha256: f.sha256,
  name: f.originalName,
  scanStatus: f.scanStatus,
  createdAt: f.createdAt,
});

const notFound = () => new DomainError('NOT_FOUND', 'File not found.');

export async function registerFileRoutes(app: FastifyInstance, deps: FileRouteDeps): Promise<void> {
  const { files } = deps.storage;
  const contentSignature = (id: string, expires: number) =>
    crypto.createHmac('sha256', deps.urlSecret).update(`file:${id}:${expires}`).digest('hex');

  const ownedFile = async (req: FastifyRequest, id: string): Promise<StoredFile> => {
    const session = deps.extractUser(req);
    const file = await files.get(id);
    // Someone else's file looks the same as a missing one.
    if (!file || !canAccessFile(file, session.userId)) throw notFound();
    return file;
  };

  // The upload route reads its body as raw bytes. It sits in its own scope,
  // so the JSON parser of every other route is unchanged.
  await app.register(async (scope) => {
    scope.removeAllContentTypeParsers();
    scope.addContentTypeParser(
      '*',
      { parseAs: 'buffer', bodyLimit: FILE_MAX_BYTES },
      (_req, body, done) => done(null, body)
    );
    scope.post('/api/v1/files', async (req: FastifyRequest, reply: FastifyReply) => {
      const session = deps.extractUser(req);
      const query = FileUploadQuerySchema.parse(req.query);
      if (!deps.scanner && deps.deployed) {
        throw new DomainError(
          'SERVICE_UNAVAILABLE',
          'File uploads are not available: no malware scanner is configured.'
        );
      }
      const bytes = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      const planned = planFileUpload({
        ownerId: session.userId,
        purpose: query.purpose,
        contentType: String(req.headers['content-type'] ?? ''),
        fileName: query.name,
        bytes,
        existingCount: await files.countByOwner(session.userId),
      });
      let scanStatus: StoredFile['scanStatus'] = 'not_scanned';
      if (deps.scanner) {
        let result;
        try {
          result = await deps.scanner.scan(bytes);
        } catch (err) {
          deps.log.error({ err }, 'malware scan failed');
          throw new DomainError('SERVICE_UNAVAILABLE', 'The file could not be scanned. Try again.');
        }
        if (!result.clean) {
          deps.log.warn(
            { userId: session.userId, signature: result.signature },
            'upload refused by malware scan'
          );
          throw new DomainError('VALIDATION_FAILED', 'This file was refused by the malware scan.', {
            field: 'file',
          });
        }
        scanStatus = 'clean';
      }
      const file: StoredFile = { ...planned, scanStatus };
      try {
        await deps.objectStore.put(file.storageKey, bytes, file.contentType);
      } catch (err) {
        deps.log.error({ err }, 'file upload to object storage failed');
        throw new DomainError('SERVICE_UNAVAILABLE', 'The file could not be stored. Try again.');
      }
      try {
        await files.create(file);
      } catch (err) {
        await deps.objectStore.delete(file.storageKey).catch(() => undefined);
        throw err;
      }
      return reply.status(201).send({ file: publicFile(file) });
    });
  });

  app.get('/api/v1/files', async (req: FastifyRequest) => {
    const session = deps.extractUser(req);
    return { files: (await files.listByOwner(session.userId)).map(publicFile) };
  });

  // A download link that works for FILE_SIGNED_URL_TTL_SECONDS.
  app.get('/api/v1/files/:id/url', async (req: FastifyRequest) => {
    const file = await ownedFile(req, (req.params as { id: string }).id);
    const expiresMs = Date.now() + FILE_SIGNED_URL_TTL_SECONDS * 1000;
    const direct = deps.objectStore.signedGetUrl(file.storageKey, {
      ttlSeconds: FILE_SIGNED_URL_TTL_SECONDS,
      fileName: file.originalName,
      contentType: file.contentType,
    });
    const expires = Math.floor(expiresMs / 1000);
    const url =
      direct ??
      `/api/v1/files/${file.id}/content?expires=${expires}&signature=${contentSignature(file.id, expires)}`;
    return { url, expiresAt: new Date(expires * 1000).toISOString() };
  });

  // Local storage only: serves the bytes for a signed, unexpired link. The
  // signature is the credential, so the link works in a plain <a href>.
  app.get('/api/v1/files/:id/content', async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const parsed = FileContentQuerySchema.safeParse(req.query);
    if (!parsed.success || !deps.objectStore.get) throw notFound();
    const { expires, signature } = parsed.data;
    const expected = contentSignature(id, expires);
    if (
      expires * 1000 < Date.now() ||
      !crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
    ) {
      throw new DomainError('FORBIDDEN', 'This download link is not valid or has expired.');
    }
    const file = await files.get(id);
    const bytes = file ? await deps.objectStore.get(file.storageKey) : null;
    if (!file || !bytes) throw notFound();
    return reply
      .header('content-type', file.contentType)
      .header(
        'content-disposition',
        `attachment; filename="${file.originalName.replace(/["\\]/g, '_')}"`
      )
      .header('x-content-type-options', 'nosniff')
      .header('cache-control', 'private, no-store')
      .send(bytes);
  });

  app.delete('/api/v1/files/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const file = await ownedFile(req, (req.params as { id: string }).id);
    await files.delete(file.id);
    // The row is gone, so the file is unreachable; an object left behind
    // by a storage error is logged for cleanup.
    await deps.objectStore.delete(file.storageKey).catch((err) => {
      deps.log.error({ err, fileId: file.id }, 'object delete failed after file delete');
    });
    return reply.status(204).send();
  });
}

/** Account erasure: every file row and object of the person. */
export async function eraseUserFiles(
  deps: Pick<FileRouteDeps, 'storage' | 'objectStore' | 'log'>,
  userId: string
): Promise<void> {
  const removed = await deps.storage.files.eraseOwner(userId);
  for (const file of removed) {
    await deps.objectStore.delete(file.storageKey).catch((err) => {
      deps.log.error({ err, fileId: file.id }, 'object delete failed during erasure');
    });
  }
}
