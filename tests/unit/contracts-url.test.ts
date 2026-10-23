import { describe, expect, it } from 'vitest';
import {
  CreateOrganizationInputSchema,
  CreatePortfolioProjectInputSchema,
  CreateResumeInputSchema,
  httpUrl,
} from '../../packages/contracts/src/index.js';

/**
 * Audit finding E20: z.string().url() accepts javascript: URLs, so a portfolio
 * link became a stored-XSS anchor. Every link field must be http(s) only.
 */
describe('httpUrl', () => {
  it.each(['https://example.com/demo', 'http://example.com', 'HTTPS://EXAMPLE.COM/x?a=1#b'])(
    'accepts %s',
    (url) => {
      expect(httpUrl().safeParse(url).success).toBe(true);
    }
  );

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(document.cookie)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'ftp://example.com/file',
    'vbscript:msgbox(1)',
    'not a url',
    '',
  ])('rejects %s', (url) => {
    expect(httpUrl().safeParse(url).success).toBe(false);
  });

  it('enforces the length limit', () => {
    expect(httpUrl(30).safeParse(`https://example.com/${'a'.repeat(30)}`).success).toBe(false);
  });
});

describe('schemas that carry links', () => {
  const project = { title: 'Audit project', description: 'A description that is long enough.' };

  it('portfolio projects reject javascript: in projectUrl and repoUrl', () => {
    expect(
      CreatePortfolioProjectInputSchema.safeParse({ ...project, projectUrl: 'javascript:alert(1)' })
        .success
    ).toBe(false);
    expect(
      CreatePortfolioProjectInputSchema.safeParse({ ...project, repoUrl: 'data:text/html,x' })
        .success
    ).toBe(false);
  });

  it('portfolio projects still accept https links', () => {
    expect(
      CreatePortfolioProjectInputSchema.safeParse({
        ...project,
        projectUrl: 'https://example.com/demo',
        repoUrl: 'https://github.com/example/repo',
      }).success
    ).toBe(true);
  });

  it('organization website rejects non-http schemes', () => {
    const org = { name: 'Audit Org', slug: 'audit-org' };
    expect(
      CreateOrganizationInputSchema.safeParse({ ...org, website: 'javascript:alert(1)' }).success
    ).toBe(false);
    expect(
      CreateOrganizationInputSchema.safeParse({ ...org, website: 'https://example.org' }).success
    ).toBe(true);
  });

  it('resume website rejects non-http schemes', () => {
    expect(CreateResumeInputSchema.safeParse({ websiteUrl: 'javascript:alert(1)' }).success).toBe(
      false
    );
  });
});
