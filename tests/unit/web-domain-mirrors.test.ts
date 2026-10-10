import { describe, expect, it } from 'vitest';
import { ALLOWED_APPLICATION_TRANSITIONS } from '../../packages/domain/src/core.js';
import { ALLOWED_JOB_TRANSITIONS } from '../../packages/domain/src/jobs.js';
import { APPLICATION_TRANSITIONS, JOB_TRANSITIONS } from '../../apps/web/src/lib/types.js';

/**
 * The browser offers only the moves the server will accept. The web app
 * keeps its own copy of the state machines (it must not bundle server-side
 * domain code), so this guards the copy against drift.
 */
describe('Web state-machine mirrors match the domain', () => {
  it('application pipeline transitions', () => {
    expect(APPLICATION_TRANSITIONS).toEqual(ALLOWED_APPLICATION_TRANSITIONS);
  });

  it('job posting transitions', () => {
    expect(JOB_TRANSITIONS).toEqual(ALLOWED_JOB_TRANSITIONS);
  });
});
