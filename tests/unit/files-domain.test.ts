import net from 'node:net';
import { afterAll, describe, expect, it } from 'vitest';
import {
  cleanFileName,
  contentMatchesType,
  FILE_MAX_BYTES,
  FILE_MAX_PER_USER,
  planFileUpload,
} from '../../packages/domain/src/files.js';
import {
  presignUrl,
  S3ObjectStore,
  signRequestHeaders,
} from '../../apps/api/src/file-storage/object-store.js';
import { ClamdScanner } from '../../apps/api/src/file-storage/malware-scanner.js';

const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n');
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);

describe('upload rules (ADR-020)', () => {
  it('accepts a resume PDF and keys it by owner and id, never by its name', () => {
    const f = planFileUpload({
      ownerId: 'u1',
      purpose: 'resume',
      contentType: 'application/pdf',
      fileName: '../../etc/passwd\u0000.pdf',
      bytes: pdf,
      existingCount: 0,
    });
    expect(f.storageKey).toBe(`files/u1/${f.id}`);
    expect(f.originalName).toBe('passwd.pdf');
    expect(f.sizeBytes).toBe(pdf.length);
    expect(f.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('refuses a type the purpose does not take, a renamed file, an empty or oversized file, and a full account', () => {
    const base = { ownerId: 'u1', fileName: 'x', existingCount: 0 } as const;
    expect(() =>
      planFileUpload({ ...base, purpose: 'resume', contentType: 'image/png', bytes: png })
    ).toThrow(/must be one of/);
    expect(() =>
      planFileUpload({ ...base, purpose: 'resume', contentType: 'application/pdf', bytes: png })
    ).toThrow(/content is not application\/pdf/);
    expect(() =>
      planFileUpload({
        ...base,
        purpose: 'profile_photo',
        contentType: 'image/png',
        bytes: Buffer.alloc(0),
      })
    ).toThrow(/empty/);
    expect(() =>
      planFileUpload({
        ...base,
        purpose: 'profile_photo',
        contentType: 'image/png',
        bytes: Buffer.concat([png, Buffer.alloc(2 * 1024 * 1024)]),
      })
    ).toThrow(/at most 2 MB/);
    expect(() =>
      planFileUpload({
        ...base,
        purpose: 'resume',
        contentType: 'application/pdf',
        bytes: pdf,
        existingCount: FILE_MAX_PER_USER,
      })
    ).toThrow(/at most 50 files/);
    expect(FILE_MAX_BYTES).toBe(5 * 1024 * 1024);
  });

  it('checks the first bytes of each type', () => {
    expect(contentMatchesType(png, 'image/png')).toBe(true);
    expect(contentMatchesType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg')).toBe(true);
    expect(contentMatchesType(Buffer.from('RIFF\0\0\0\0WEBPVP8 '), 'image/webp')).toBe(true);
    expect(
      contentMatchesType(
        Buffer.from('PK\u0003\u0004'),
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    ).toBe(true);
    expect(contentMatchesType(Buffer.from('name,skill\nAda,SQL\n'), 'text/csv')).toBe(true);
    expect(contentMatchesType(Buffer.from([0x7b, 0x00, 0x7d]), 'application/json')).toBe(false);
    expect(contentMatchesType(Buffer.from([0xc3, 0x28]), 'text/csv')).toBe(false);
    expect(cleanFileName('C:\\Users\\me\\cv.docx')).toBe('cv.docx');
    expect(cleanFileName('\u202e')).toBe('file');
  });
});

// AWS Signature Version 4 examples from the Amazon S3 API reference
// ("Authenticating Requests: Using Query Parameters" and "Using the
// Authorization Header", GET Object example).
describe('S3 Signature Version 4', () => {
  const creds = {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1',
  };
  const now = new Date('2013-05-24T00:00:00Z');

  it('presigns a GET as the reference example does', () => {
    const url = presignUrl({
      method: 'GET',
      url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'),
      creds,
      now,
      expiresSeconds: 86400,
    });
    expect(url).toContain(
      'X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404'
    );
  });

  it('signs headers as the reference example does', () => {
    const authorization = signRequestHeaders({
      method: 'GET',
      url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'),
      headers: {
        range: 'bytes=0-9',
        'x-amz-content-sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'x-amz-date': '20130524T000000Z',
      },
      payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      creds,
      now,
    });
    expect(authorization).toBe(
      'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, ' +
        'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, ' +
        'Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41'
    );
  });

  it('puts and deletes path-style, and treats a missing object as deleted', async () => {
    const calls: { url: string; method: string; headers: Record<string, string> }[] = [];
    const fakeFetch = (async (url: URL, init: RequestInit) => {
      calls.push({
        url: url.toString(),
        method: String(init.method),
        headers: init.headers as Record<string, string>,
      });
      return new Response(null, { status: init.method === 'DELETE' ? 404 : 200 });
    }) as unknown as typeof fetch;
    const store = new S3ObjectStore(
      {
        ...creds,
        endpoint: 'https://ns.compat.objectstorage.eu-frankfurt-1.oraclecloud.com/',
        bucket: 'ts-files',
      },
      fakeFetch,
      () => now
    );
    await store.put('files/u1/f1', pdf, 'application/pdf');
    await store.delete('files/u1/f1');
    expect(calls[0].url).toBe(
      'https://ns.compat.objectstorage.eu-frankfurt-1.oraclecloud.com/ts-files/files/u1/f1'
    );
    expect(calls[0].method).toBe('PUT');
    expect(calls[0].headers.authorization).toMatch(
      /^AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE\/20130524\/us-east-1\/s3\/aws4_request, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=[0-9a-f]{64}$/
    );
    expect(calls[1].method).toBe('DELETE');
    const signed = store.signedGetUrl('files/u1/f1', {
      ttlSeconds: 300,
      fileName: 'cv "final".pdf',
      contentType: 'application/pdf',
    });
    expect(signed).toContain('X-Amz-Expires=300');
    expect(signed).toContain(
      'response-content-disposition=attachment%3B%20filename%3D%22cv%20_final_.pdf%22'
    );
  });
});

describe('ClamAV INSTREAM scanner', () => {
  const servers: net.Server[] = [];
  afterAll(() => servers.forEach((s) => s.close()));

  const fakeClamd = (reply: (received: Buffer) => string) =>
    new Promise<number>((resolve) => {
      const server = net.createServer((socket) => {
        const parts: Buffer[] = [];
        socket.on('data', (d) => {
          parts.push(d);
          const all = Buffer.concat(parts);
          // The stream ends with a zero-length chunk.
          if (all.length >= 14 && all.subarray(-4).equals(Buffer.alloc(4))) {
            socket.end(`${reply(all)}\0`);
          }
        });
      });
      servers.push(server);
      server.listen(0, '127.0.0.1', () => resolve((server.address() as net.AddressInfo).port));
    });

  it('reports a clean file and a found signature', async () => {
    const cleanPort = await fakeClamd((all) => {
      expect(all.subarray(0, 10).toString()).toBe('zINSTREAM\0');
      expect(all.readUInt32BE(10)).toBe(pdf.length);
      return 'stream: OK';
    });
    expect(await new ClamdScanner('127.0.0.1', cleanPort).scan(pdf)).toEqual({ clean: true });
    const infectedPort = await fakeClamd(() => 'stream: Eicar-Test-Signature FOUND');
    expect(await new ClamdScanner('127.0.0.1', infectedPort).scan(pdf)).toEqual({
      clean: false,
      signature: 'Eicar-Test-Signature',
    });
  });

  it('fails when clamd cannot be reached', async () => {
    await expect(new ClamdScanner('127.0.0.1', 1, 2000).scan(pdf)).rejects.toThrow(/not reachable/);
  });
});
