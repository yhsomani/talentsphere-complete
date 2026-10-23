import { test, expect, type APIRequestContext } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { API_BASE, registerAccount, type TestAccount } from './fixtures.js';
import { ensureCourse } from './content.js';

// Digital credentials (F-96) and the public verification page (F-52): a certificate
// earned through the API shows on the candidate's profile with a verification link,
// and that link opens a page anyone can read without signing in.
test.describe('E2E: Credentials on the profile and public verification (F-96, F-52)', () => {
  async function earnCertificate(request: APIRequestContext, account: TestAccount) {
    const auth = { authorization: `Bearer ${account.token}` };
    const courseId = (await ensureCourse(request)).id;
    expect(
      (await request.post(`${API_BASE}/courses/${courseId}/enroll`, { headers: auth })).status()
    ).toBe(201);
    const detail = await (await request.get(`${API_BASE}/courses/${courseId}`)).json();
    let certificate: { certificateNumber: string; verificationProofHash: string } | undefined;
    for (const lesson of detail.course.modules.flatMap(
      (m: { lessons: { id: string }[] }) => m.lessons
    )) {
      const done = await (
        await request.post(`${API_BASE}/lessons/${lesson.id}/complete`, { headers: auth })
      ).json();
      if (done.completed) certificate = done.certificate;
    }
    expect(certificate, 'completing every lesson issues a certificate').toBeDefined();
    return { courseTitle: detail.course.title as string, ...certificate! };
  }

  async function signIn(page: import('@playwright/test').Page, account: TestAccount) {
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  }

  test('a new candidate sees an empty credentials section', async ({ page, request }) => {
    const account = await registerAccount(request, 'cred.empty');
    await signIn(page, account);
    await page.goto('/profile');
    await expect(page.getByTestId('credentials-empty')).toBeVisible();
  });

  test('an earned certificate is listed with a link to its public verification', async ({
    page,
    browser,
    request,
  }) => {
    const account = await registerAccount(request, 'cred.cert');
    const cert = await earnCertificate(request, account);
    await signIn(page, account);
    await page.goto('/profile');

    const list = page.getByTestId('credentials-list');
    await expect(list).toContainText(cert.courseTitle);
    await expect(list).toContainText(cert.certificateNumber);
    // Finishing a course also mints a "course completion" evidence item; it is the same
    // achievement, so it must not be listed a second time.
    await expect(page.getByTestId('credential-verify-link')).toHaveCount(1);
    await page.getByTestId('credential-verify-link').first().click();
    await expect(page).toHaveURL(`/verify/${cert.verificationProofHash}`);
    await expect(page.getByTestId('verify-status')).toContainText('Valid');
    await expect(page.getByTestId('verify-page')).toContainText(cert.certificateNumber);

    // The same link works for a stranger with no session, and shows no personal details.
    const anonymous = await browser.newContext();
    const stranger = await anonymous.newPage();
    await stranger.goto(`/verify/${cert.verificationProofHash}`);
    await expect(stranger.getByTestId('verify-status')).toContainText('Valid');
    await expect(stranger.getByTestId('verify-page')).not.toContainText(account.email);
    await expect(stranger.getByTestId('verify-page')).not.toContainText(account.profile.fullName);
    await anonymous.close();
  });

  test('verified skill evidence is listed with a working link; unverified evidence is not', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'cred.evidence');
    const auth = { authorization: `Bearer ${account.token}` };
    const create = async (title: string) => {
      const res = await request.post(`${API_BASE}/evidence`, {
        headers: auth,
        data: {
          type: 'project',
          title,
          description: 'Built and shipped a real-time ingestion pipeline for the credentials test.',
          source: 'GitHub / example',
          provenance: 'git:commit:a9f82d1c',
          recencyDate: '2026-09-01',
        },
      });
      expect(res.status()).toBe(201);
      return (await res.json()).evidence.id as string;
    };
    const verifiedId = await create('Verified ingestion pipeline');
    await create('Still unverified side project');
    const verifier = createSessionToken(
      `00000000-0000-4000-a000-${Date.now().toString().padStart(12, '0').slice(-12)}`,
      `verifier.cred.${Date.now()}@talentsphere.internal`,
      ['institution_admin']
    );
    const verify = await request.post(`${API_BASE}/evidence/${verifiedId}/verify`, {
      headers: { authorization: `Bearer ${verifier}` },
      data: { verificationLevel: 'institution_verified' },
    });
    expect(verify.status()).toBe(200);

    await signIn(page, account);
    await page.goto('/profile');
    const list = page.getByTestId('credentials-list');
    await expect(list).toContainText('Verified ingestion pipeline');
    await expect(list).not.toContainText('Still unverified side project');

    await page.getByTestId('credential-verify-link').first().click();
    await expect(page).toHaveURL(/\/verify\/[0-9a-f]{64}$/);
    await expect(page.getByTestId('verify-status')).toContainText('Valid');
    await expect(page.getByTestId('verify-page')).toContainText('Verified ingestion pipeline');
  });

  test('a revoked certificate is shown as not valid, with the reason', async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request, 'cred.revoked');
    const cert = await earnCertificate(request, account);
    const admin = createSessionToken(
      `00000000-0000-4000-a000-${Date.now().toString().padStart(12, '0').slice(-12)}`,
      `admin.cred.${Date.now()}@talentsphere.internal`,
      ['platform_admin']
    );
    const revoke = await request.post(`${API_BASE}/certificates/${cert.certificateNumber}/revoke`, {
      headers: { authorization: `Bearer ${admin}` },
      data: { reason: 'Integrity review failed in the credentials test.' },
    });
    expect(revoke.status()).toBe(200);

    await page.goto(`/verify/${cert.verificationProofHash}`);
    await expect(page.getByTestId('verify-status')).toContainText('Not valid');
    await expect(page.getByTestId('verify-status')).toContainText('Integrity review failed');
  });

  test('a link that matches nothing is a final answer with no retry button', async ({ page }) => {
    await page.goto('/verify/0000000000000000000000000000000000000000000000000000000000000000');
    await expect(page.getByTestId('verify-notfound')).toBeVisible();
    await expect(page.getByTestId('load-error-retry')).toHaveCount(0);
  });
});
