import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// C-29: the Settings page offers only controls the product acts on, and the
// Profile page offers the connections-only visibility it now honours.
const read = (file: string) => fs.readFileSync(path.resolve('apps/web/src/pages', file), 'utf8');

describe('Settings page controls (C-29)', () => {
  const source = read('SettingsPage.tsx');

  it('keeps the controls the product acts on', () => {
    for (const id of [
      'settings-visibility',
      'settings-show-email',
      'settings-show-activity',
      'settings-allow-connections',
      'settings-save',
    ]) {
      expect(source).toContain(`"${id}"`);
    }
  });

  it('does not offer controls that do nothing yet', () => {
    for (const id of [
      'settings-theme',
      'settings-language',
      'settings-timezone',
      'settings-direct-messages',
      'settings-search-indexing',
      'settings-email-notifications',
      'settings-push-notifications',
      'settings-marketing-emails',
      'settings-digest',
      'settings-ai-consent',
    ]) {
      expect(source).not.toContain(`"${id}"`);
    }
  });

  it('still round-trips every saved preference field', () => {
    const keys = source.slice(source.indexOf('const PREFERENCE_KEYS'), source.indexOf('];'));
    for (const key of [
      'theme',
      'language',
      'timezone',
      'allowDirectMessages',
      'searchEngineIndexing',
      'pushNotifications',
      'marketingEmails',
      'digestFrequency',
      'emailNotifications',
      'aiDataUsageConsent',
    ]) {
      expect(keys).toContain(`'${key}'`);
    }
  });
});

describe('Profile page visibility options (C-29)', () => {
  it('offers connections-only, which the API now honours', () => {
    const source = read('ProfilePage.tsx');
    const options = source.slice(
      source.indexOf('const PRIVACY_OPTIONS'),
      source.indexOf('const PRIVACY_HELP')
    );
    expect(options).toContain("value: 'connections_only'");
  });
});
