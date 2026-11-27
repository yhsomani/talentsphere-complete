/**
 * Object storage for uploaded files (ADR-020). One interface, two adapters:
 * local disk for development and tests, and any S3-compatible service
 * (Oracle Object Storage, Cloudflare R2, AWS S3) signed with AWS Signature
 * Version 4 over native fetch, so there is no vendor SDK. Objects are
 * private; readers get a short-lived signed URL.
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export interface SignedUrlOptions {
  ttlSeconds: number;
  /** Suggested download name and type, applied by stores that support it. */
  fileName: string;
  contentType: string;
}

export interface ObjectStore {
  readonly kind: 'local' | 's3';
  put(key: string, bytes: Buffer, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  /**
   * A URL that reads the object until it expires. The local store returns
   * null: its bytes are served by the API's own signed content route.
   */
  signedGetUrl(key: string, options: SignedUrlOptions): string | null;
  /** Local store only: the object's bytes. */
  get?(key: string): Promise<Buffer | null>;
}

/** Files on the API host's disk, for development and tests. */
export class LocalDiskObjectStore implements ObjectStore {
  readonly kind = 'local' as const;
  private readonly root: string;

  constructor(root?: string) {
    this.root = path.resolve(root ?? path.join(os.tmpdir(), 'talentsphere-files'));
  }

  private pathOf(key: string): string {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error('Object key escapes the store.');
    return full;
  }

  async put(key: string, bytes: Buffer): Promise<void> {
    const full = this.pathOf(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, bytes, { mode: 0o600 });
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(this.pathOf(key));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.pathOf(key), { force: true });
  }

  signedGetUrl(): null {
    return null;
  }
}

// --- AWS Signature Version 4 -------------------------------------------------

export interface SigV4Credentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  /** 's3' for every S3-compatible service. */
  service?: string;
}

const sha256Hex = (data: string | Buffer) => crypto.createHash('sha256').update(data).digest('hex');
const hmac = (key: crypto.BinaryLike, data: string) =>
  crypto.createHmac('sha256', key).update(data).digest();

/** RFC 3986 encoding, as SigV4 requires (encodeURIComponent leaves !'()* alone). */
const rfc3986 = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );

const amzDateOf = (now: Date) =>
  now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

function canonicalQuery(params: URLSearchParams): string {
  return [...params.entries()]
    .map(([k, v]) => [rfc3986(k), rfc3986(v)] as const)
    .sort(([a, av], [b, bv]) => (a < b ? -1 : a > b ? 1 : av < bv ? -1 : av > bv ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

function signature(
  creds: SigV4Credentials,
  amzDate: string,
  canonicalRequest: string
): { scope: string; signature: string } {
  const date = amzDate.slice(0, 8);
  const service = creds.service ?? 's3';
  const scope = `${date}/${creds.region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
  const kDate = hmac(`AWS4${creds.secretAccessKey}`, date);
  const kRegion = hmac(kDate, creds.region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  return { scope, signature: hmac(kSigning, stringToSign).toString('hex') };
}

/** The Authorization header for a request signed with its headers. */
export function signRequestHeaders(input: {
  method: string;
  url: URL;
  headers: Record<string, string>;
  payloadHash: string;
  creds: SigV4Credentials;
  now: Date;
}): string {
  const amzDate = amzDateOf(input.now);
  const headers: Record<string, string> = { host: input.url.host };
  for (const [k, v] of Object.entries(input.headers)) headers[k.toLowerCase()] = v.trim();
  const names = Object.keys(headers).sort();
  const canonicalRequest = [
    input.method,
    input.url.pathname,
    canonicalQuery(input.url.searchParams),
    names.map((n) => `${n}:${headers[n]}\n`).join(''),
    names.join(';'),
    input.payloadHash,
  ].join('\n');
  const { scope, signature: sig } = signature(input.creds, amzDate, canonicalRequest);
  return `AWS4-HMAC-SHA256 Credential=${input.creds.accessKeyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${sig}`;
}

/** A presigned URL (query-string authentication). */
export function presignUrl(input: {
  method: string;
  url: URL;
  creds: SigV4Credentials;
  now: Date;
  expiresSeconds: number;
}): string {
  const amzDate = amzDateOf(input.now);
  const service = input.creds.service ?? 's3';
  const url = new URL(input.url.toString());
  url.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.set(
    'X-Amz-Credential',
    `${input.creds.accessKeyId}/${amzDate.slice(0, 8)}/${input.creds.region}/${service}/aws4_request`
  );
  url.searchParams.set('X-Amz-Date', amzDate);
  url.searchParams.set('X-Amz-Expires', String(input.expiresSeconds));
  url.searchParams.set('X-Amz-SignedHeaders', 'host');
  const query = canonicalQuery(url.searchParams);
  const canonicalRequest = [
    input.method,
    url.pathname,
    query,
    `host:${url.host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  const { signature: sig } = signature(input.creds, amzDate, canonicalRequest);
  return `${url.origin}${url.pathname}?${query}&X-Amz-Signature=${sig}`;
}

export interface S3Config extends SigV4Credentials {
  /** Service endpoint, e.g. https://<namespace>.compat.objectstorage.<region>.oraclecloud.com */
  endpoint: string;
  bucket: string;
}

/** Any S3-compatible service, addressed path-style (endpoint/bucket/key). */
export class S3ObjectStore implements ObjectStore {
  readonly kind = 's3' as const;

  constructor(
    private readonly config: S3Config,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly clock: () => Date = () => new Date()
  ) {}

  private urlOf(key: string): URL {
    const base = this.config.endpoint.replace(/\/+$/, '');
    const encodedKey = key.split('/').map(rfc3986).join('/');
    return new URL(`${base}/${rfc3986(this.config.bucket)}/${encodedKey}`);
  }

  private async send(method: 'PUT' | 'DELETE', key: string, body?: Buffer, contentType?: string) {
    const url = this.urlOf(key);
    const payloadHash = sha256Hex(body ?? '');
    const now = this.clock();
    const headers: Record<string, string> = {
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDateOf(now),
      ...(contentType ? { 'content-type': contentType } : {}),
    };
    const authorization = signRequestHeaders({
      method,
      url,
      headers,
      payloadHash,
      creds: this.config,
      now,
    });
    const res = await this.fetchImpl(url, {
      method,
      headers: { ...headers, authorization },
      body: body ? new Uint8Array(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });
    // A missing object is already deleted.
    if (!res.ok && !(method === 'DELETE' && res.status === 404)) {
      // The response body can echo request details; the status is enough.
      throw new Error(`Object storage ${method} failed with HTTP ${res.status}.`);
    }
  }

  put(key: string, bytes: Buffer, contentType: string): Promise<void> {
    return this.send('PUT', key, bytes, contentType);
  }

  delete(key: string): Promise<void> {
    return this.send('DELETE', key);
  }

  signedGetUrl(key: string, options: SignedUrlOptions): string {
    const url = this.urlOf(key);
    url.searchParams.set(
      'response-content-disposition',
      `attachment; filename="${options.fileName.replace(/["\\]/g, '_')}"`
    );
    url.searchParams.set('response-content-type', options.contentType);
    return presignUrl({
      method: 'GET',
      url,
      creds: this.config,
      now: this.clock(),
      expiresSeconds: options.ttlSeconds,
    });
  }
}
