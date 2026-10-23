import React, { useCallback, useEffect, useState } from 'react';
import { spacing, textColors } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatDateTime } from '../lib/format.js';
import { useSession } from '../lib/SessionContext.js';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Notice,
  PageHeader,
  Select,
} from '../components/ui/index.js';

type UserStatus = 'active' | 'suspended' | 'deactivated';

interface AdminUser {
  id: string;
  email: string;
  roles: string[];
  status: UserStatus;
  createdAt: string;
}

interface AuditLog {
  id?: string;
  eventName: string;
  actorId?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface Diagnostics {
  status: string;
  database: string;
  queue: string;
  inMaintenance: boolean;
  uptimeSeconds: number;
  registeredUsersCount: number;
  activeJobsCount: number;
  evaluatedAt: string;
}

interface HealthResponse {
  diagnostics: Diagnostics;
  persistence: { coreLoop: string; note: string };
}

const STATUS_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'deactivated', label: 'Deactivated' },
];

const NEXT_STATUS: Record<UserStatus, { to: UserStatus; label: string }[]> = {
  active: [{ to: 'suspended', label: 'Suspend' }],
  suspended: [{ to: 'active', label: 'Reactivate' }],
  deactivated: [{ to: 'active', label: 'Reactivate' }],
};

export const AdminPage: React.FC = () => {
  usePageMeta('Admin console', 'Manage users, review the audit log and check system health.');
  // The server enforces this on every route; the page also refuses to send admin requests
  // (or draw the console) for anyone the session does not confirm as a platform admin.
  const session = useSession();
  const isAdmin =
    session.status === 'ready' && Boolean(session.user?.roles.includes('platform_admin'));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await apiJson<{ users: AdminUser[] }>(`/api/v1/admin/users?${params.toString()}`);
      setUsers(res.users);
      setUsersError(null);
    } catch (err) {
      setUsersError(errorMessage(err));
    }
  }, [search, statusFilter]);

  const loadLogs = useCallback(async () => {
    try {
      const res = await apiJson<{ logs: AuditLog[] }>('/api/v1/admin/audit-logs?limit=50');
      setLogs(res.logs);
      setLogsError(null);
    } catch (err) {
      setLogsError(errorMessage(err));
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      setHealth(await apiJson<HealthResponse>('/api/v1/admin/health-diagnostics'));
      setHealthError(null);
    } catch (err) {
      setHealthError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void loadUsers();
  }, [isAdmin, loadUsers]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadLogs();
    void loadHealth();
  }, [isAdmin, loadLogs, loadHealth]);

  const changeStatus = async (user: AdminUser, to: UserStatus) => {
    setActionError(null);
    setActionNotice(null);
    if (reason.trim().length < 3) {
      setActionError('Enter a reason of at least 3 characters before changing a user’s status.');
      return;
    }
    setPendingUserId(user.id);
    try {
      await apiJson(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: to, reason: reason.trim() }),
      });
      setActionNotice(`${user.email} is now ${to}.`);
      await Promise.all([loadUsers(), loadLogs()]);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setPendingUserId(null);
    }
  };

  const toggleMaintenance = async (inMaintenance: boolean) => {
    setMaintenanceError(null);
    try {
      await apiJson('/api/v1/admin/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          inMaintenance,
          reason: maintenanceReason.trim() || undefined,
        }),
      });
      await Promise.all([loadHealth(), loadLogs()]);
    } catch (err) {
      setMaintenanceError(errorMessage(err));
    }
  };

  if (session.status === 'loading') return <p role="status">Loading.</p>;
  if (!isAdmin) {
    return (
      <div data-testid="admin-forbidden">
        <PageHeader title="Admin console" />
        <Notice tone="error">
          The admin console is only available to platform administrators.
        </Notice>
      </div>
    );
  }

  const diag = health?.diagnostics;

  return (
    <div data-testid="admin-page">
      <PageHeader
        title="Admin console"
        intro="Platform administration. Every change here is written to the audit log."
      />

      <section aria-labelledby="admin-users-heading" style={{ marginBottom: spacing.xl }}>
        <h2 id="admin-users-heading" style={{ marginBottom: spacing.md }}>
          Users
        </h2>

        <div
          style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', marginBottom: spacing.md }}
        >
          <Input
            label="Search by email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="admin-user-search"
          />
          <Select
            id="admin-status-filter"
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Input
            label="Reason for the next change"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            helperText="Required (3 to 500 characters). Stored with the audit entry."
            data-testid="admin-reason"
          />
        </div>

        {actionError && (
          <Notice
            tone="error"
            data-testid="admin-action-error"
            style={{ marginBottom: spacing.md }}
          >
            {actionError}
          </Notice>
        )}
        {actionNotice && (
          <Notice
            tone="success"
            data-testid="admin-action-notice"
            style={{ marginBottom: spacing.md }}
          >
            {actionNotice}
          </Notice>
        )}
        {usersError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }}>
            {usersError}
          </Notice>
        )}

        {users.length === 0 && !usersError ? (
          <EmptyState title="No users match" description="Try a different email or status." />
        ) : (
          <ul
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: spacing.sm }}
          >
            {users.map((user) => (
              <li key={user.id} data-testid="admin-user-row">
                <Card>
                  <CardContent
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: spacing.md,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <strong>{user.email}</strong>
                      <div style={{ color: textColors.muted }}>
                        {user.roles.join(', ') || 'no roles'} · {user.status} · joined{' '}
                        {formatDateTime(user.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      {NEXT_STATUS[user.status].map((action) => (
                        <Button
                          key={action.to}
                          variant="outline"
                          disabled={pendingUserId === user.id}
                          onClick={() => void changeStatus(user, action.to)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="admin-health-heading" style={{ marginBottom: spacing.xl }}>
        <h2 id="admin-health-heading" style={{ marginBottom: spacing.md }}>
          System health
        </h2>
        {healthError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }}>
            {healthError}
          </Notice>
        )}
        {diag && (
          <Card>
            <CardContent>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: spacing.xs,
                }}
              >
                <li>Status: {diag.status}</li>
                <li>Database: {diag.database}</li>
                <li>Queue: {diag.queue}</li>
                <li>Maintenance mode: {diag.inMaintenance ? 'on' : 'off'}</li>
                <li>Registered users: {diag.registeredUsersCount}</li>
                <li>Active jobs: {diag.activeJobsCount}</li>
                <li>Persistence (core loop): {health?.persistence.coreLoop}</li>
              </ul>
              <p style={{ marginTop: spacing.sm, color: textColors.muted }}>
                {health?.persistence.note}
              </p>
            </CardContent>
          </Card>
        )}
        <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.md }}>
          <Button variant="outline" onClick={() => void loadHealth()}>
            Refresh health
          </Button>
          <Button
            variant="outline"
            onClick={() => void toggleMaintenance(!(diag?.inMaintenance ?? false))}
            disabled={!diag}
          >
            {diag?.inMaintenance ? 'Turn maintenance off' : 'Turn maintenance on'}
          </Button>
          <Input
            label="Maintenance reason (optional)"
            value={maintenanceReason}
            onChange={(e) => setMaintenanceReason(e.target.value)}
          />
        </div>
        {maintenanceError && (
          <Notice tone="error" style={{ marginTop: spacing.md }}>
            {maintenanceError}
          </Notice>
        )}
      </section>

      <section aria-labelledby="admin-audit-heading">
        <h2 id="admin-audit-heading" style={{ marginBottom: spacing.md }}>
          Audit log
        </h2>
        {logsError && (
          <Notice tone="error" style={{ marginBottom: spacing.md }}>
            {logsError}
          </Notice>
        )}
        {logs.length === 0 && !logsError ? (
          <EmptyState
            title="No admin actions yet"
            description="Changes appear here as they happen."
          />
        ) : (
          <ul
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: spacing.sm }}
            data-testid="admin-audit-list"
          >
            {logs.map((log, index) => (
              <li key={log.id ?? `${log.createdAt}-${index}`} data-testid="admin-audit-row">
                <strong>{log.eventName}</strong>{' '}
                <span style={{ color: textColors.muted }}>
                  {formatDateTime(log.createdAt)}
                  {log.targetId ? ` · target ${log.targetId}` : ''}
                  {log.metadata?.reason ? ` · reason: ${String(log.metadata.reason)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
