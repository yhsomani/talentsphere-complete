import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiJson, validationMessage } from '../../apps/web/src/lib/api.js';

const respond = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(typeof body === 'string' ? body : JSON.stringify(body), {
          status,
          headers: { 'content-type': 'application/json', ...headers },
        })
    )
  );

const failure = async (): Promise<ApiError> => {
  try {
    await apiJson('/api/v1/x');
  } catch (err) {
    return err as ApiError;
  }
  throw new Error('apiJson did not throw');
};

afterEach(() => vi.unstubAllGlobals());

describe('apiJson error messages (audit findings G01, G03, E19b, E23b, N06)', () => {
  it('names the field when validation fails instead of the generic schema message', async () => {
    respond(400, {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'The submitted payload failed schema validation.',
        details: [
          { path: 'projectUrl', message: 'Use a link that starts with http:// or https://' },
        ],
      },
    });
    const err = await failure();
    expect(err.message).toBe('Project url: Use a link that starts with http:// or https://');
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_FAILED');
  });

  it('falls back to the server message when there are no field details', async () => {
    respond(400, { error: { code: 'VALIDATION_FAILED', message: 'Bad input.', details: [] } });
    expect((await failure()).message).toBe('Bad input.');
  });

  it('keeps explanations for 4xx responses', async () => {
    respond(409, {
      error: { code: 'CONFLICT', message: 'A connection request is already pending.' },
    });
    expect((await failure()).message).toBe('A connection request is already pending.');
  });

  it('never shows a 5xx body, which can carry server internals', async () => {
    respond(500, { error: { code: 'INTERNAL', message: 'Error at /srv/app/dist/server.js:1234' } });
    const err = await failure();
    expect(err.message).toBe('TalentSphere had a problem on its side. Try again in a moment.');
    expect(err.message).not.toContain('server.js');
  });

  it('lets an explicit 503 speak for itself', async () => {
    respond(503, {
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Down for maintenance until 10:00.' },
    });
    expect((await failure()).message).toBe('Down for maintenance until 10:00.');
  });

  it('turns an HTML page served with 200 into a clear error, not a TypeError downstream', async () => {
    respond(200, '<html>Bad gateway</html>', { 'content-type': 'text/html' });
    const err = await failure();
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('TalentSphere sent an unexpected response. Try again in a moment.');
  });

  it('still resolves an empty non-HTML success body (for example a 204)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 }))
    );
    await expect(apiJson('/api/v1/x')).resolves.toBeNull();
  });

  it('reports an unreachable network and a timeout in plain words', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch')))
    );
    expect((await failure()).message).toMatch(/Could not reach TalentSphere/);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new DOMException('timed out', 'TimeoutError')))
    );
    expect((await failure()).message).toMatch(/timed out/);
  });
});

describe('validationMessage', () => {
  it('turns camelCase paths into a readable label', () => {
    expect(validationMessage([{ path: 'contactEmail', message: 'Invalid email' }])).toBe(
      'Contact email: Invalid email'
    );
    expect(validationMessage([{ path: 'items.0.startDate', message: 'Required' }])).toBe(
      'Start date: Required'
    );
  });

  it('returns undefined for anything that is not a usable issue list', () => {
    expect(validationMessage(undefined)).toBeUndefined();
    expect(validationMessage([])).toBeUndefined();
    expect(validationMessage([{ path: 'a' }])).toBeUndefined();
  });

  it('shows the message alone when the path is empty', () => {
    expect(validationMessage([{ path: '', message: 'Invalid input' }])).toBe('Invalid input');
  });
});
