import React, { useState } from 'react';
import { spacing } from '@talentsphere/ui';
import { useSession } from '../lib/SessionContext.js';
import { Button, Notice } from './ui/index.js';

/**
 * Shown when the API could not confirm who is signed in (offline, throttled,
 * server fault). Says why, and retries the session check in place — a full
 * page reload would repeat every request and, when throttled, make it worse.
 */
export const SessionErrorNotice: React.FC = () => {
  const session = useSession();
  const [retrying, setRetrying] = useState(false);
  const retry = async () => {
    setRetrying(true);
    try {
      await session.refresh();
    } finally {
      setRetrying(false);
    }
  };
  return (
    <Notice tone="error" data-testid="session-error">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }}>
        <span style={{ flex: '1 1 240px' }}>
          We could not confirm your session.{session.error ? ` ${session.error}` : ''}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void retry()}
          disabled={retrying}
          data-testid="session-retry"
        >
          {retrying ? 'Trying…' : 'Try again'}
        </Button>
      </div>
    </Notice>
  );
};
