import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { useSession, type SessionProfile } from '../lib/SessionContext.js';
import {
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Notice,
  PageHeader,
  Select,
  TextArea,
} from '../components/ui/index.js';

const PRIVACY_OPTIONS: ReadonlyArray<{ value: SessionProfile['privacy']; label: string }> = [
  { value: 'public', label: 'Anyone' },
  { value: 'recruiters_only', label: 'Only people hiring on TalentSphere' },
  { value: 'private', label: 'Only me' },
];

const PRIVACY_HELP: Record<string, string> = {
  public: 'Anyone with the link can see your name, headline, bio and location.',
  recruiters_only: 'Only signed-in hiring accounts can see your profile.',
  private: 'Nobody else can open your profile. Companies you apply to still see it.',
  connections_only: 'Only your connections can see your profile.',
};

export const ProfilePage: React.FC = () => {
  usePageMeta('Your profile', 'Edit what people see about you on TalentSphere.');
  const session = useSession();
  const navigate = useNavigate();
  const profile = session.profile;
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState<SessionProfile['privacy']>('public');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Seed the form from the server's profile (and again if it reloads).
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setHeadline(profile.headline ?? '');
    setBio(profile.bio ?? '');
    setLocation(profile.location ?? '');
    setPrivacy(profile.privacy);
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !profile) return;
    setError(null);
    setSaved(false);
    if (fullName.trim().length < 2) {
      setError('Your name needs at least 2 characters.');
      return;
    }
    // Send only what changed, so a stale tab cannot overwrite other fields.
    const changes: Record<string, string> = {};
    if (fullName.trim() !== profile.fullName) changes.fullName = fullName.trim();
    if (headline.trim() !== (profile.headline ?? '')) changes.headline = headline.trim();
    if (bio.trim() !== (profile.bio ?? '')) changes.bio = bio.trim();
    if (location.trim() !== (profile.location ?? '')) changes.location = location.trim();
    if (privacy !== profile.privacy) changes.privacy = privacy;
    if (Object.keys(changes).length === 0) {
      setSaved(true);
      return;
    }
    setBusy(true);
    try {
      await apiJson('/api/v1/profile/me', { method: 'PATCH', body: JSON.stringify(changes) });
      await session.refresh();
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await apiJson('/api/v1/settings/erasure/execute', { method: 'POST' });
      session.signOut();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
      setDeleteBusy(false);
    }
  };

  if (!profile) {
    return (
      <p style={{ color: colors.neutral[600] }}>
        {session.status === 'error' ? 'Could not load your profile.' : 'Loading…'}
      </p>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <PageHeader
        title="Your profile"
        intro="This is what recruiters and other members see about you."
      />

      {error && (
        <Notice tone="error" style={{ marginBottom: spacing.md }} data-testid="profile-error">
          {error}
        </Notice>
      )}
      {saved && (
        <Notice tone="success" style={{ marginBottom: spacing.md }} data-testid="profile-saved">
          Profile saved.
        </Notice>
      )}

      <form onSubmit={save} data-testid="profile-form" noValidate>
        <Input
          id="profile-name"
          label="Full name"
          required
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSaved(false);
          }}
          data-testid="profile-name"
        />
        <Input
          id="profile-headline"
          label="Headline"
          maxLength={160}
          placeholder="e.g. Backend engineer focused on payments"
          helperText="One line about what you do. Shown next to your name."
          value={headline}
          onChange={(e) => {
            setHeadline(e.target.value);
            setSaved(false);
          }}
          data-testid="profile-headline"
        />
        <Input
          id="profile-location"
          label="Location"
          maxLength={100}
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setSaved(false);
          }}
          data-testid="profile-location"
        />
        <TextArea
          id="profile-bio"
          label="About you"
          maxLength={2000}
          rows={5}
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
            setSaved(false);
          }}
          data-testid="profile-bio"
        />
        <Select
          id="profile-privacy"
          label="Who can see your profile"
          value={privacy}
          onChange={(e) => {
            setPrivacy(e.target.value as SessionProfile['privacy']);
            setSaved(false);
          }}
          options={PRIVACY_OPTIONS}
          helperText={PRIVACY_HELP[privacy]}
          data-testid="profile-privacy"
        />
        <Button type="submit" loading={busy} data-testid="profile-save">
          Save profile
        </Button>
      </form>

      <Card style={{ marginTop: spacing['2xl'] }}>
        <CardContent style={{ padding: spacing.lg }}>
          <h2 style={{ fontSize: '1.125rem' }}>Account</h2>
          <p style={{ color: colors.neutral[700], marginTop: spacing.xs }}>
            Signed in as <strong>{session.user?.email}</strong>.
          </p>
          <h3 style={{ fontSize: '1rem', marginTop: spacing.lg }}>Delete your account</h3>
          <p style={{ color: colors.neutral[700], margin: `${spacing.xs} 0 ${spacing.md}` }}>
            Removes your name, work history, references and evidence, and withdraws open
            applications. You will be signed out and cannot sign in again. This cannot be undone.
          </p>
          <Button
            variant="outline"
            onClick={() => setDeleteOpen(true)}
            data-testid="delete-account"
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        busy={deleteBusy}
        title="Delete your account?"
        description="Type DELETE to confirm. Your data is removed immediately."
      >
        {deleteError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }}>
            {deleteError}
          </Notice>
        )}
        <Input
          id="delete-confirm"
          label="Type DELETE"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          data-testid="delete-confirm-input"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing.sm }}>
          <Button variant="secondary" disabled={deleteBusy} onClick={() => setDeleteOpen(false)}>
            Keep my account
          </Button>
          <Button
            disabled={deleteConfirm !== 'DELETE'}
            loading={deleteBusy}
            onClick={() => void deleteAccount()}
            data-testid="delete-confirm"
          >
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
};
