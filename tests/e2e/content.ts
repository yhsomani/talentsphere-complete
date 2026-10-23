/**
 * Content a browser test needs (a course, a challenge) is created through the
 * API, the way an instructor or admin would. The API ships no pre-loaded
 * content. Each helper is idempotent so every spec can call it first.
 */
import { expect, type APIRequestContext } from '@playwright/test';
import { createSessionToken } from '../../packages/domain/src/index.js';
import { API_BASE, registerAccount } from './fixtures.js';

const adminHeaders = () => ({
  authorization: `Bearer ${createSessionToken(
    '00000000-0000-4000-a000-0000000000c3',
    'admin.e2e.content@talentsphere.internal',
    ['platform_admin']
  )}`,
});

export async function ensureChallenge(
  request: APIRequestContext,
  slug = 'reverse-words-string'
): Promise<{ id: string }> {
  const listed = await (await request.get(`${API_BASE}/challenges`)).json();
  const found = listed.challenges.find((c: { slug: string }) => c.slug === slug);
  if (found) return { id: found.id };

  const res = await request.post(`${API_BASE}/challenges`, {
    headers: adminHeaders(),
    data: {
      slug,
      title: 'Reverse Words in a String',
      description: 'Given an input string s, reverse the order of the words.',
      difficulty: 'easy',
      category: 'Strings',
      testCases: [
        {
          id: 'tc1',
          input: '"the sky is blue"',
          expectedOutput: '"blue is sky the"',
          isHidden: false,
        },
        { id: 'tc2', input: '"  hello world  "', expectedOutput: '"world hello"', isHidden: true },
      ],
    },
  });
  expect(res.status(), 'create challenge').toBe(201);
  return { id: (await res.json()).challenge.id };
}

/** A published course of two modules and three lessons (the second lesson needs the first). */
export async function ensureCourse(
  request: APIRequestContext,
  slug = 'typescript-fullstack-architecture',
  title = 'TypeScript Full-Stack Architecture'
): Promise<{ id: string }> {
  const existing = await request.get(`${API_BASE}/courses/${slug}`);
  if (existing.ok()) return { id: (await existing.json()).course.id };

  const instructor = await registerAccount(
    request,
    'content.instructor',
    'candidate',
    'Instructor'
  );
  const granted = await request.patch(`${API_BASE}/admin/users/${instructor.user.id}/roles`, {
    headers: adminHeaders(),
    data: { roles: ['candidate', 'instructor'] },
  });
  expect(granted.status(), 'grant instructor').toBe(200);

  const headers = { authorization: `Bearer ${instructor.token}` };
  const post = async (url: string, data?: unknown) => {
    const res = await request.post(`${API_BASE}${url}`, { headers, data: data as never });
    expect(res.status(), `POST ${url}`).toBeLessThan(300);
    return res.json();
  };

  const { course } = await post('/courses', {
    title,
    slug,
    description: 'A course created through the API by an instructor.',
    level: 'intermediate',
    estimatedDurationMinutes: 60,
    passingScorePercent: 70,
    xpReward: 50,
  });
  const { module: first } = await post(`/courses/${course.id}/modules`, {
    title: 'Module one',
    description: 'First module',
    orderIndex: 0,
  });
  const { module: second } = await post(`/courses/${course.id}/modules`, {
    title: 'Module two',
    description: 'Second module',
    orderIndex: 1,
  });
  const { lesson: lessonOne } = await post(`/modules/${first.id}/lessons`, {
    title: 'Lesson one',
    contentType: 'text',
    contentBody: 'First lesson text.',
    durationMinutes: 15,
    orderIndex: 0,
    isFreePreview: true,
  });
  await post(`/modules/${first.id}/lessons`, {
    title: 'Lesson two',
    contentType: 'text',
    contentBody: 'Second lesson text.',
    durationMinutes: 20,
    orderIndex: 1,
    prerequisiteLessonId: lessonOne.id,
    isFreePreview: false,
  });
  await post(`/modules/${second.id}/lessons`, {
    title: 'Lesson three',
    contentType: 'text',
    contentBody: 'Third lesson text.',
    durationMinutes: 25,
    orderIndex: 0,
    isFreePreview: false,
  });
  await post(`/courses/${course.id}/publish`);
  return { id: course.id };
}
