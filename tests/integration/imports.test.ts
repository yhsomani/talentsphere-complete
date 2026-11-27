import { beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../apps/api/src/server.js';

// Profile import v1 (plan TS-08, ADR-033): parse, review, confirm, undo.
const resume = {
  basics: { name: 'Asha Rao', email: 'asha@example.com' },
  work: [
    { name: 'Acme Ltd', position: 'Software Engineer', startDate: '2021-04', summary: 'APIs' },
    { name: 'Beta Co', position: 'Intern', startDate: '2019', endDate: '2020-06' },
    // Same company, title and start month as the first: a duplicate in the file.
    { name: 'ACME ltd.', position: 'software engineer', startDate: '2021-04-20' },
    // No start date: shown, but cannot be confirmed until edited.
    { name: 'Gamma', position: 'Contractor' },
  ],
  education: [{ institution: 'City University', studyType: 'BSc', area: 'CS', startDate: '2016' }],
  skills: [{ name: 'TypeScript', keywords: ['React', 'Quantum Basket Weaving'] }],
  certificates: [
    { name: 'Cloud Practitioner', issuer: 'Example Cloud', date: '2023-06', url: 'https://x.io/c' },
  ],
  references: [{ name: 'A Referee', reference: 'Great colleague' }],
  projects: [{ name: 'Side project' }],
};

type View = {
  id: string;
  status: string;
  ignored: Record<string, number>;
  counts: Record<string, number>;
  items: Array<{
    id: string;
    kind: string;
    payload: Record<string, unknown>;
    createdRef: { type: string; id: string } | null;
    review: { suggested: string; duplicate: boolean; problem: string | null } | null;
  }>;
};

describe('Profile import v1 (TS-08)', () => {
  let app: FastifyInstance;
  let token: string;
  let userId: string;
  let otherToken: string;

  const call = async (method: string, url: string, auth: string, payload?: unknown) => {
    const res = await app.inject({
      method: method as 'GET',
      url,
      headers: { authorization: `Bearer ${auth}` },
      payload: payload as Record<string, unknown>,
    });
    const json = res.headers['content-type']?.toString().includes('json');
    return { status: res.statusCode, body: json ? res.json() : undefined, raw: res };
  };
  const start = (auth: string, source: string, content: string) =>
    call('POST', '/api/v1/imports', auth, { source, content });
  const suggested = (view: View) =>
    view.items.filter((i) => i.review?.suggested === 'accept').map((i) => ({ itemId: i.id }));

  beforeAll(async () => {
    app = await buildApp({ NODE_ENV: 'test', PORT: 3000 });
    await app.ready();
    const reg = async (email: string) =>
      (
        await app.inject({
          method: 'POST',
          url: '/api/v1/auth/register',
          payload: {
            email,
            password: 'Password123!',
            fullName: 'Import Tester',
            role: 'candidate',
          },
        })
      ).json();
    const owner = await reg('importer@example.com');
    token = owner.token;
    userId = owner.user.id;
    otherToken = (await reg('import_other@example.com')).token;
  });

  let first: View;

  it('parses a JSON Resume into entries for review and adds nothing yet', async () => {
    const res = await start(token, 'json_resume', JSON.stringify(resume));
    expect(res.status).toBe(201);
    first = res.body.import;
    expect(first.status).toBe('ready_for_review');
    const kinds = first.items.map((i) => i.kind);
    expect(kinds.filter((k) => k === 'position')).toHaveLength(4);
    expect(kinds.filter((k) => k === 'skill')).toHaveLength(3);
    // Other people's data and sections v1 does not read are only counted.
    expect(first.ignored).toEqual({ basics: 1, references: 1, projects: 1 });
    expect(JSON.stringify(first)).not.toContain('A Referee');

    const problems = first.items.filter((i) => i.review?.problem).map((i) => i.review!.problem);
    expect(problems).toEqual(
      expect.arrayContaining([
        'Start date is missing or not a date.',
        'Not in the TalentSphere skill list yet.',
      ])
    );
    expect(first.items.filter((i) => i.review?.duplicate)).toHaveLength(1);
    expect(first.counts.suggestedAccept).toBe(6);

    const history = await call('GET', `/api/v1/candidates/${userId}/work-history`, token);
    expect(history.body.workHistories).toHaveLength(0);
    const evidence = await call('GET', '/api/v1/evidence/mine', token);
    expect(evidence.body.evidence).toHaveLength(0);
  });

  it('keeps an import private to its owner', async () => {
    expect((await call('GET', `/api/v1/imports/${first.id}`, otherToken)).status).toBe(404);
    expect(
      (await call('POST', `/api/v1/imports/${first.id}/commit`, otherToken, { accept: [] })).status
    ).toBe(404);
    expect((await call('GET', '/api/v1/imports', otherToken)).body.imports).toEqual([]);
  });

  it('refuses to confirm an entry that still has a problem', async () => {
    const broken = first.items.find(
      (i) => i.review?.problem === 'Start date is missing or not a date.'
    )!;
    const res = await call('POST', `/api/v1/imports/${first.id}/commit`, token, {
      accept: [{ itemId: broken.id }],
    });
    expect(res.status).toBe(422);
  });

  it('confirms the chosen entries, with an edit, as unverified claims that name their source', async () => {
    const broken = first.items.find(
      (i) => i.review?.problem === 'Start date is missing or not a date.'
    )!;
    const res = await call('POST', `/api/v1/imports/${first.id}/commit`, token, {
      accept: [...suggested(first), { itemId: broken.id, edit: { startDate: '2018-02' } }],
    });
    expect(res.status).toBe(200);
    expect(res.body.added).toBe(7);
    expect(res.body.skipped).toBe(2);
    expect(res.body.import.status).toBe('applied');

    const history = (await call('GET', `/api/v1/candidates/${userId}/work-history`, token)).body
      .workHistories as Array<Record<string, unknown>>;
    expect(history).toHaveLength(3);
    for (const h of history) {
      expect(h.verificationStatus).toBe('unverified');
      expect(h.importedFrom).toBe('json_resume');
    }
    expect(history.find((h) => h.companyName === 'Gamma')?.startDate).toBe('2018-02-01');
    expect(history.find((h) => h.companyName === 'Acme Ltd')?.isCurrent).toBe(true);

    const evidence = (await call('GET', '/api/v1/evidence/mine', token)).body.evidence as Array<
      Record<string, unknown>
    >;
    expect(evidence).toHaveLength(4);
    for (const e of evidence) {
      expect(e.type).toBe('self_declaration');
      expect(e.verificationLevel).toBe('unverified');
      expect(e.provenance).toBe('imported:json_resume');
    }
    const cert = evidence.find((e) => e.title === 'Cloud Practitioner')!;
    expect(cert.description).toContain('Link provided, not checked');

    const skills = (await call('GET', '/api/v1/skills/profile/me', token)).body.skills as Array<{
      slug: string;
    }>;
    expect(skills.map((s) => s.slug).sort()).toEqual(['react', 'typescript']);

    // Confirming twice is refused, not repeated.
    expect(
      (await call('POST', `/api/v1/imports/${first.id}/commit`, token, { accept: [] })).status
    ).toBe(409);
  });

  let second: View;

  it('proposes no duplicates when the same file is imported again (§10.4 case 2)', async () => {
    const res = await start(token, 'json_resume', JSON.stringify(resume));
    second = res.body.import;
    expect(second.counts.suggestedAccept).toBe(0);
    for (const item of second.items) expect(item.review?.suggested).toBe('skip');

    const dup = second.items.find((i) => i.kind === 'position' && i.review?.duplicate)!;
    const commit = await call('POST', `/api/v1/imports/${second.id}/commit`, token, {
      accept: [{ itemId: dup.id }],
    });
    expect(commit.status).toBe(409);
    expect(commit.body.error?.details?.reason ?? JSON.stringify(commit.body)).toContain(
      'profile_changed'
    );
  });

  it('discards an unconfirmed import', async () => {
    expect((await call('DELETE', `/api/v1/imports/${second.id}`, token)).status).toBe(200);
    expect((await call('GET', `/api/v1/imports/${second.id}`, token)).status).toBe(404);
    expect((await call('DELETE', `/api/v1/imports/${first.id}`, token)).status).toBe(409);
  });

  it('undo removes every record and signal the import created (§10.4 case 5)', async () => {
    const res = await call('POST', `/api/v1/imports/${first.id}/undo`, token);
    expect(res.status).toBe(200);
    expect(res.body.removed).toBe(7);
    expect(res.body.import.status).toBe('undone');
    expect(
      (await call('GET', `/api/v1/candidates/${userId}/work-history`, token)).body.workHistories
    ).toHaveLength(0);
    expect((await call('GET', '/api/v1/evidence/mine', token)).body.evidence).toHaveLength(0);
    expect((await call('GET', '/api/v1/skills/profile/me', token)).body.skills).toEqual([]);
    expect((await call('POST', `/api/v1/imports/${first.id}/undo`, token)).status).toBe(409);
  });

  it('will not undo a role that has since been given a reference', async () => {
    const csv = 'company,title,start_date\r\nDelta,"Engineer, Platform",2022-01\r\n';
    const view: View = (await start(token, 'csv_positions', csv)).body.import;
    expect(view.items[0].payload.title).toBe('Engineer, Platform');
    const commit = await call('POST', `/api/v1/imports/${view.id}/commit`, token, {
      accept: suggested(view),
    });
    expect(commit.status).toBe(200);
    const historyId = commit.body.import.items[0].createdRef.id;
    const ref = await call(
      'POST',
      `/api/v1/candidates/work-history/${historyId}/references/request`,
      token,
      {
        refereeName: 'Ref Person',
        refereeEmail: 'ref.person@delta.example',
        relationship: 'manager',
      }
    );
    expect(ref.status).toBe(201);
    const undo = await call('POST', `/api/v1/imports/${view.id}/undo`, token);
    expect(undo.status).toBe(409);
    expect(
      (await call('GET', `/api/v1/candidates/${userId}/work-history`, token)).body.workHistories
    ).toHaveLength(1);
  });

  it('serves CSV templates and explains a file it cannot read', async () => {
    const tpl = await call('GET', '/api/v1/imports/templates/csv_positions', token);
    expect(tpl.status).toBe(200);
    expect(tpl.raw.headers['content-type']).toContain('text/csv');
    expect(tpl.raw.body.split('\n')[0]).toBe(
      'company,title,employment_type,start_date,end_date,description'
    );
    expect((await call('GET', '/api/v1/imports/templates/json_resume', token)).status).toBe(400);

    const wrong = await start(token, 'csv_skills', 'skill_name\nTypeScript\n');
    expect(wrong.status).toBe(422);
    expect(JSON.stringify(wrong.body)).toContain('the name column is missing');
    const notJson = await start(token, 'json_resume', '{not json');
    expect(JSON.stringify(notJson.body)).toContain('not valid JSON');
    const empty = await start(token, 'json_resume', '{"basics":{"name":"x"}}');
    expect(JSON.stringify(empty.body)).toContain('could not find profile data');
    const many = await start(
      token,
      'csv_skills',
      `name\n${Array.from({ length: 301 }, (_, i) => `skill ${i}`).join('\n')}\n`
    );
    expect(JSON.stringify(many.body)).toContain('at most 300');
    expect((await call('GET', '/api/v1/imports', 'not-a-token')).status).toBe(401);
  });
});
