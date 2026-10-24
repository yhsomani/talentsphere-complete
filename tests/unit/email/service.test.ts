import { describe, expect, it, vi } from 'vitest';
import { emailConfigProblems, loadEmailConfig } from '../../../apps/worker/src/email/config.js';
import { createEmailService } from '../../../apps/worker/src/email/service.js';
import { renderTemplate } from '../../../apps/worker/src/email/templates.js';
import { EmailError, type EmailProvider } from '../../../apps/worker/src/email/types.js';

const env = {
  EMAIL_PROVIDER: 'brevo',
  BREVO_API_KEY: 'test-api-key-0000',
  EMAIL_FROM: 'verified@example.test',
  APP_URL: 'https://app.example.test/',
};
const verification = {
  templateId: 'work_history.email_verification' as const,
  to: 'a@example.test',
  variables: { code: '123456', expiresAt: '2026-01-01T00:00:00Z' },
  idempotencyKey: 'job_9',
};

describe('email configuration', () => {
  it('rejects an unsupported provider instead of falling back', () => {
    expect(() => loadEmailConfig({ EMAIL_PROVIDER: 'resend' })).toThrow(
      /Unsupported EMAIL_PROVIDER/
    );
  });
  it('defaults to none and reports missing brevo settings', () => {
    expect(loadEmailConfig({}).provider).toBe('none');
    expect(emailConfigProblems(loadEmailConfig({}))).toEqual([]);
    const p = emailConfigProblems(loadEmailConfig({ EMAIL_PROVIDER: 'brevo' }));
    expect(p.join(' ')).toMatch(/BREVO_API_KEY/);
    expect(p.join(' ')).toMatch(/EMAIL_FROM/);
  });
  it('strips trailing slash from APP_URL', () => {
    expect(loadEmailConfig(env).appUrl).toBe('https://app.example.test');
  });
});

describe('email templates', () => {
  it('renders reference links with token in the fragment', () => {
    const r = renderTemplate(
      {
        templateId: 'reference.request',
        variables: { title: 'Eng', companyName: 'Acme', referenceId: 'r1', token: 't0k' },
      },
      'https://app.example.test'
    );
    expect(r.subject).toBe('A candidate asked you for a reference');
    expect(r.text).toContain('https://app.example.test/reference/r1#token=t0k');
  });
  it('keeps CR/LF out of the subject when the candidate name contains them', () => {
    const r = renderTemplate(
      {
        templateId: 'reference.request',
        variables: {
          candidateName: 'Eve\r\nBcc: x@evil.test',
          title: 'Eng',
          companyName: 'Acme',
          referenceId: 'r1',
          token: 't0k',
        },
      },
      'https://app.example.test'
    );
    expect(r.subject).not.toMatch(/[\r\n]/);
    expect(r.subject).toBe('Eve Bcc: x@evil.test asked you for a reference');
    expect(r.text).not.toMatch(/[\r\n]/);
  });
  it('treats a whitespace-only title as missing', () => {
    expect(() =>
      renderTemplate(
        {
          templateId: 'reference.request',
          variables: {
            candidateName: 'Eve',
            title: '   ',
            companyName: 'Acme',
            referenceId: 'r1',
            token: 't0k',
          },
        },
        'https://app.example.test'
      )
    ).toThrow(EmailError);
    expect(() =>
      renderTemplate(
        {
          templateId: 'reference.request',
          variables: {
            candidateName: 'Eve',
            title: '   ',
            companyName: 'Acme',
            referenceId: 'r1',
            token: 't0k',
          },
        },
        'https://app.example.test'
      )
    ).toThrow(/title/);
  });
  it('removes CR/LF from companyName in the body', () => {
    const r = renderTemplate(
      {
        templateId: 'reference.request',
        variables: {
          candidateName: 'Eve',
          title: 'Eng',
          companyName: 'Acme\r\nBcc: x@evil.test',
          referenceId: 'r1',
          token: 't0k',
        },
      },
      'https://app.example.test'
    );
    expect(r.text).not.toMatch(/[\r\n]/);
    expect(r.text).toContain('at Acme Bcc: x@evil.test.');
  });
  it('removes the U+202E bidi override from a candidate name', () => {
    const r = renderTemplate(
      {
        templateId: 'reference.request',
        variables: {
          candidateName: 'Eve‮evil',
          title: 'Eng',
          companyName: 'Acme',
          referenceId: 'r1',
          token: 't0k',
        },
      },
      'https://app.example.test'
    );
    expect(r.subject).not.toContain('‮');
    expect(r.subject).toBe('Eve evil asked you for a reference');
  });
  it('truncates a 200-character candidate name to 80 characters plus an ellipsis', () => {
    const r = renderTemplate(
      {
        templateId: 'reference.request',
        variables: {
          candidateName: 'a'.repeat(200),
          title: 'Eng',
          companyName: 'Acme',
          referenceId: 'r1',
          token: 't0k',
        },
      },
      'https://app.example.test'
    );
    expect(r.subject).toBe(`${'a'.repeat(80)}… asked you for a reference`);
  });
  it('names missing variables without echoing values', () => {
    expect(() =>
      renderTemplate(
        { templateId: 'work_history.email_verification', variables: { code: '123456' } },
        'x'
      )
    ).toThrow(/expiresAt/);
  });
});

describe('email service', () => {
  it('sends through the injected provider with rendered content', async () => {
    const send = vi.fn(async () => ({ provider: 'fake', status: 'accepted' as const }));
    const provider: EmailProvider = { name: 'fake', send };
    await createEmailService(loadEmailConfig(env), { provider }).send(verification);
    expect(send).toHaveBeenCalledOnce();
    expect((send.mock.calls as unknown as unknown[][])[0][0]).toMatchObject({
      from: { email: 'verified@example.test', name: 'TalentSphere' },
      to: 'a@example.test',
      idempotencyKey: 'job_9',
    });
  });
  it('fails closed (non-retryable) when unconfigured or invalid', async () => {
    const send = vi.fn();
    const none = createEmailService(loadEmailConfig({}), { provider: { name: 'f', send } });
    await expect(none.send(verification)).rejects.toMatchObject({
      code: 'configuration',
      retryable: false,
    });
    const bad = createEmailService(loadEmailConfig(env), { provider: { name: 'f', send } });
    await expect(bad.send({ ...verification, to: 'nope' })).rejects.toBeInstanceOf(EmailError);
    expect(send).not.toHaveBeenCalled();
  });
  it('does not call the network for an unconfigured brevo key', async () => {
    const f = vi.fn();
    const svc = createEmailService(loadEmailConfig({ ...env, BREVO_API_KEY: '' }), {
      fetchImpl: f as typeof fetch,
    });
    await expect(svc.send(verification)).rejects.toMatchObject({ code: 'configuration' });
    expect(f).not.toHaveBeenCalled();
  });
  it('builds the Brevo adapter from config when no provider is injected', async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({ messageId: 'm1' }), { status: 201 }));
    const r = await createEmailService(loadEmailConfig(env), { fetchImpl: f as typeof fetch }).send(
      verification
    );
    expect(r).toMatchObject({ provider: 'brevo', messageId: 'm1', status: 'accepted' });
  });
});
