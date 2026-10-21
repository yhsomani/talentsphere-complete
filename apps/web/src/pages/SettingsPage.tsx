import React, { useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { Button, Input, Notice, PageHeader, Select } from '../components/ui/index.js';

type Theme = 'light' | 'dark' | 'system';
type Visibility = 'public' | 'connections_only' | 'recruiters_only' | 'private';
type DirectMessages = 'everyone' | 'connections_only' | 'none';
type Digest = 'realtime' | 'daily' | 'weekly' | 'none';

// The preference fields the account settings API accepts. The stored BYO AI key
// and two-factor are left out on purpose: a key needs encrypted secret storage,
// and two-factor changes how people sign in, so each belongs to its own flow.
interface Preferences {
  theme: Theme;
  language: string;
  timezone: string;
  profileVisibility: Visibility;
  showEmail: boolean;
  showActivity: boolean;
  allowConnectionRequests: boolean;
  allowDirectMessages: DirectMessages;
  searchEngineIndexing: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  digestFrequency: Digest;
  aiDataUsageConsent: boolean;
}

const PREFERENCE_KEYS: ReadonlyArray<keyof Preferences> = [
  'theme',
  'language',
  'timezone',
  'profileVisibility',
  'showEmail',
  'showActivity',
  'allowConnectionRequests',
  'allowDirectMessages',
  'searchEngineIndexing',
  'emailNotifications',
  'pushNotifications',
  'marketingEmails',
  'digestFrequency',
  'aiDataUsageConsent',
];

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'system', label: 'Match my device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const VISIBILITY_OPTIONS: ReadonlyArray<{ value: Visibility; label: string }> = [
  { value: 'public', label: 'Anyone' },
  { value: 'connections_only', label: 'Only my connections' },
  { value: 'recruiters_only', label: 'Only people hiring on TalentSphere' },
  { value: 'private', label: 'Only me' },
];

const DIRECT_MESSAGE_OPTIONS: ReadonlyArray<{ value: DirectMessages; label: string }> = [
  { value: 'everyone', label: 'Anyone' },
  { value: 'connections_only', label: 'Only my connections' },
  { value: 'none', label: 'Nobody' },
];

const DIGEST_OPTIONS: ReadonlyArray<{ value: Digest; label: string }> = [
  { value: 'realtime', label: 'As it happens' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'none', label: 'Never' },
];

const Toggle: React.FC<{
  id: string;
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ id, label, help, checked, onChange }) => (
  <div style={{ marginBottom: spacing.md }}>
    <label htmlFor={id} style={{ display: 'flex', gap: spacing.sm, cursor: 'pointer' }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: spacing.xs }}
      />
      <span>
        {label}
        {help && (
          <span style={{ display: 'block', color: colors.neutral[700], fontSize: '0.875rem' }}>
            {help}
          </span>
        )}
      </span>
    </label>
  </div>
);

// A ruled section, not a box: each group is a line of the settings record.
const Group: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset
    style={{
      border: 0,
      borderTop: `1px solid ${colors.neutral[300]}`,
      padding: `${spacing.lg} 0`,
      margin: `0 0 ${spacing.lg}`,
    }}
  >
    <legend
      className="serif-display"
      style={{ fontSize: '1.5rem', color: colors.neutral[900], marginBottom: spacing.md }}
    >
      {title}
    </legend>
    {children}
  </fieldset>
);

export const SettingsPage: React.FC = () => {
  usePageMeta('Settings', 'Choose how TalentSphere looks, who can see you, and what we send you.');
  const session = useSession();
  // baseline is what the server last confirmed; draft is what the form shows.
  const [baseline, setBaseline] = useState<Preferences | null>(null);
  const [draft, setDraft] = useState<Preferences | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiJson<{ settings: Preferences }>('/api/v1/settings')
      .then(({ settings }) => {
        if (!active) return;
        setBaseline(settings);
        setDraft(settings);
      })
      .catch((err) => {
        if (active) setLoadError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !baseline || !draft) return;
    setError(null);
    setSaved(false);
    // Send only what changed, so a stale tab cannot overwrite other settings.
    const changes = Object.fromEntries(
      PREFERENCE_KEYS.filter((key) => draft[key] !== baseline[key]).map((key) => [key, draft[key]])
    );
    if (Object.keys(changes).length === 0) {
      setSaved(true);
      return;
    }
    setBusy(true);
    try {
      const { settings } = await apiJson<{ settings: Preferences }>('/api/v1/settings', {
        method: 'PATCH',
        body: JSON.stringify(changes),
      });
      setBaseline(settings);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
      return;
    } finally {
      setBusy(false);
    }
    // Profile visibility is also stored on the profile, so refresh the session copy.
    // refresh() never throws: its own failures land in session.error, not in this save's error.
    await session.refresh();
  };

  if (loadError) {
    return (
      <div>
        <PageHeader title="Settings" />
        <Notice tone="error" data-testid="settings-load-error">
          {loadError}
        </Notice>
      </div>
    );
  }

  if (!draft) {
    return <p role="status">Loading your settings.</p>;
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        intro="Choose how TalentSphere looks, who can see you, and what we send you."
      />
      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="settings-error">
          {error}
        </Notice>
      )}
      {saved && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="settings-saved">
          Settings saved.
        </Notice>
      )}

      <form onSubmit={save} noValidate>
        <Group title="Appearance">
          <Select
            id="settings-theme"
            label="Theme"
            value={draft.theme}
            onChange={(e) => update('theme', e.target.value as Theme)}
            options={THEME_OPTIONS}
            data-testid="settings-theme"
          />
          <Input
            id="settings-language"
            label="Language"
            helperText="A language tag such as en."
            value={draft.language}
            maxLength={10}
            onChange={(e) => update('language', e.target.value)}
            data-testid="settings-language"
          />
          <Input
            id="settings-timezone"
            label="Time zone"
            helperText="For example Europe/London."
            value={draft.timezone}
            maxLength={64}
            onChange={(e) => update('timezone', e.target.value)}
            data-testid="settings-timezone"
          />
        </Group>

        <Group title="Privacy">
          <Select
            id="settings-visibility"
            label="Who can see your profile"
            value={draft.profileVisibility}
            onChange={(e) => update('profileVisibility', e.target.value as Visibility)}
            options={VISIBILITY_OPTIONS}
            data-testid="settings-visibility"
          />
          <Toggle
            id="settings-show-email"
            label="Show my email address on my profile"
            checked={draft.showEmail}
            onChange={(checked) => update('showEmail', checked)}
          />
          <Toggle
            id="settings-show-activity"
            label="Show my activity"
            checked={draft.showActivity}
            onChange={(checked) => update('showActivity', checked)}
          />
          <Toggle
            id="settings-allow-connections"
            label="Allow connection requests"
            checked={draft.allowConnectionRequests}
            onChange={(checked) => update('allowConnectionRequests', checked)}
          />
          <Select
            id="settings-direct-messages"
            label="Who can message you directly"
            value={draft.allowDirectMessages}
            onChange={(e) => update('allowDirectMessages', e.target.value as DirectMessages)}
            options={DIRECT_MESSAGE_OPTIONS}
            data-testid="settings-direct-messages"
          />
          <Toggle
            id="settings-search-indexing"
            label="Allow search engines to index my profile"
            checked={draft.searchEngineIndexing}
            onChange={(checked) => update('searchEngineIndexing', checked)}
          />
        </Group>

        <Group title="Notifications">
          <Toggle
            id="settings-email-notifications"
            label="Email me about activity"
            checked={draft.emailNotifications}
            onChange={(checked) => update('emailNotifications', checked)}
          />
          <Toggle
            id="settings-push-notifications"
            label="Send push notifications"
            checked={draft.pushNotifications}
            onChange={(checked) => update('pushNotifications', checked)}
          />
          <Toggle
            id="settings-marketing-emails"
            label="Email me about new features and offers"
            checked={draft.marketingEmails}
            onChange={(checked) => update('marketingEmails', checked)}
          />
          <Select
            id="settings-digest"
            label="Summary email frequency"
            value={draft.digestFrequency}
            onChange={(e) => update('digestFrequency', e.target.value as Digest)}
            options={DIGEST_OPTIONS}
            data-testid="settings-digest"
          />
        </Group>

        <Group title="AI features">
          <Toggle
            id="settings-ai-consent"
            label="Allow TalentSphere AI to use my profile data"
            checked={draft.aiDataUsageConsent}
            onChange={(checked) => update('aiDataUsageConsent', checked)}
          />
        </Group>

        <Button type="submit" loading={busy} data-testid="settings-save">
          Save settings
        </Button>
      </form>
    </div>
  );
};
