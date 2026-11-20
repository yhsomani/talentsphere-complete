import React, { useEffect, useState } from 'react';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { useSession } from '../lib/SessionContext.js';
import { LoadError, Button, Notice, PageHeader, Select } from '../components/ui/index.js';

type Theme = 'light' | 'dark' | 'system';
type Visibility = 'public' | 'connections_only' | 'recruiters_only' | 'private';
type DirectMessages = 'everyone' | 'connections_only' | 'none';
type Digest = 'realtime' | 'daily' | 'weekly' | 'none';

// The preference fields the account settings API accepts. The stored BYO AI key
// and two-factor are left out on purpose: a key needs encrypted secret storage,
// and two-factor changes how people sign in, so each belongs to its own flow.
// Only controls the product acts on are shown (C-29): profile visibility, email
// and activity display, and connection requests. Theme, language, time zone,
// direct-message rules, search indexing, push, marketing and summary emails,
// activity emails and AI consent are not acted on yet, so they are not offered;
// their saved values still round-trip untouched (the form sends only changes).
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

const VISIBILITY_OPTIONS: ReadonlyArray<{ value: Visibility; label: string }> = [
  { value: 'public', label: 'Anyone' },
  { value: 'connections_only', label: 'Only my connections' },
  { value: 'recruiters_only', label: 'Only people hiring on TalentSphere' },
  { value: 'private', label: 'Only me' },
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
  usePageMeta('Settings', 'Choose who can see you and who can reach you on TalentSphere.');
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
        <LoadError message={loadError} data-testid="settings-load-error" />
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
        intro="Choose who can see you and who can reach you on TalentSphere."
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
        </Group>

        <Button type="submit" loading={busy} data-testid="settings-save">
          Save settings
        </Button>
      </form>
    </div>
  );
};
