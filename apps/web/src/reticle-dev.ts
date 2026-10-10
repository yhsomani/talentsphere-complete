// Dev-only. Imported automatically by @reticlehq/vite-plugin, so you do not need to import it.
// Self-guards on import.meta.env.DEV, so it is a no-op in a production build.
import { registerCapabilities } from '@reticlehq/react';

if (import.meta.env.DEV) {
  // ── Start with ONE flow. ─────────────────────────────────────────────────────────────────────
  // You do not need to describe the whole app to get value, and trying to is the slow path. Register
  // the store your most important flow reads, and list the testids that flow touches. Add more later,
  // when a flow you actually replay needs them.
  //
  // Registering a store is the highest-value line in this file: it lets the agent check what the app
  // BELIEVES, not just what it rendered — the class of bug a screenshot cannot see. Pass the STORE,
  // not `() => store.getState()`: the store form wires `subscribe` too, so every mutation emits a
  // state diff; the getter form is read-only and silently produces empty diffs.
  // No state library detected. If you add one, register it here — see node_modules/@reticlehq/server/docs/usage.md.

  registerCapabilities({
    // The core loop (tests/e2e/core-loop.spec.ts): sign up, prove a role,
    // apply, and move an applicant through the pipeline.
    testids: [
      'nav-dashboard',
      'nav-jobs',
      'nav-applications',
      'nav-evidence',
      'nav-hiring',
      'nav-signup',
      'signup-form',
      'signup-name',
      'signup-email',
      'signup-password',
      'signup-submit',
      'login-form',
      'login-email',
      'login-password',
      'login-submit',
      'login-error',
      'add-work-history-btn',
      'submit-employment-btn',
      'apply-form',
      'apply-cover-letter',
      'apply-error',
      'apply-done',
      'org-form',
      'org-submit',
      'post-job-btn',
      'job-form',
      'job-submit',
      'hiring-jobs',
      'confirm-withdraw',
      'confirm-reject',
      'reference-form',
      'reference-submit',
    ],
    signals: ['auth:login', 'auth:logout'],
    stores: [],
  });
}
