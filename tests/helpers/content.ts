import type { FastifyInstance } from 'fastify';
import { createSessionToken } from '../../packages/domain/src/index.js';

/**
 * Content a test needs (a course, a challenge) is created through the API, the
 * way an instructor or admin would. The API ships no pre-loaded content.
 */
export const adminToken = (): string =>
  createSessionToken(
    '00000000-0000-4000-a000-0000000000c2',
    'admin.content@talentsphere.internal',
    ['platform_admin']
  );

export async function grantRoles(
  app: FastifyInstance,
  userId: string,
  roles: string[]
): Promise<void> {
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/admin/users/${userId}/roles`,
    headers: { authorization: `Bearer ${adminToken()}` },
    payload: { roles },
  });
  if (res.statusCode !== 200) throw new Error(`grantRoles failed: ${res.statusCode} ${res.body}`);
}

/** A published course of two modules and three lessons (the second lesson needs the first). */
export async function createPublishedCourse(
  app: FastifyInstance,
  instructorToken: string,
  slug: string
): Promise<{ id: string; slug: string }> {
  const headers = { authorization: `Bearer ${instructorToken}` };
  const post = async (url: string, payload?: unknown) => {
    const res = await app.inject({ method: 'POST', url, headers, payload: payload as never });
    if (res.statusCode >= 300) throw new Error(`POST ${url} failed: ${res.statusCode} ${res.body}`);
    return res.json();
  };

  const { course } = await post('/api/v1/courses', {
    title: `Course ${slug}`,
    slug,
    description: 'A course created by a test instructor through the API.',
    level: 'intermediate',
    estimatedDurationMinutes: 60,
    passingScorePercent: 70,
    xpReward: 50,
  });
  const { module: first } = await post(`/api/v1/courses/${course.id}/modules`, {
    title: 'Module one',
    description: 'First module',
    orderIndex: 0,
  });
  const { module: second } = await post(`/api/v1/courses/${course.id}/modules`, {
    title: 'Module two',
    description: 'Second module',
    orderIndex: 1,
  });
  const { lesson: lessonOne } = await post(`/api/v1/modules/${first.id}/lessons`, {
    title: 'Lesson one',
    contentType: 'text',
    contentBody: 'First lesson text.',
    durationMinutes: 15,
    orderIndex: 0,
    isFreePreview: true,
  });
  await post(`/api/v1/modules/${first.id}/lessons`, {
    title: 'Lesson two',
    contentType: 'text',
    contentBody: 'Second lesson text.',
    durationMinutes: 20,
    orderIndex: 1,
    prerequisiteLessonId: lessonOne.id,
    isFreePreview: false,
  });
  await post(`/api/v1/modules/${second.id}/lessons`, {
    title: 'Lesson three',
    contentType: 'text',
    contentBody: 'Third lesson text.',
    durationMinutes: 25,
    orderIndex: 0,
    isFreePreview: false,
  });
  await post(`/api/v1/courses/${course.id}/publish`);
  return { id: course.id, slug };
}

/** A coding challenge with one visible and one hidden test case. */
export async function createChallenge(
  app: FastifyInstance,
  slug = 'reverse-words-string'
): Promise<{ id: string; slug: string }> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/challenges',
    headers: { authorization: `Bearer ${adminToken()}` },
    payload: {
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
  if (res.statusCode !== 201)
    throw new Error(`createChallenge failed: ${res.statusCode} ${res.body}`);
  return { id: res.json().challenge.id, slug };
}
