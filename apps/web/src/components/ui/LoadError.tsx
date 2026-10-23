import React from 'react';
import { spacing } from '@talentsphere/ui';
import { Button } from './Button.js';
import { Notice } from './Notice.js';

export interface LoadErrorProps {
  message: React.ReactNode;
  /** Defaults to reloading the page, which re-runs every load on it. */
  onRetry?: () => void;
  'data-testid'?: string;
  style?: React.CSSProperties;
}

/** A failed load says what happened and offers one action: try again. */
export const LoadError: React.FC<LoadErrorProps> = ({
  message,
  onRetry = () => window.location.reload(),
  style,
  'data-testid': testId = 'load-error',
}) => (
  <Notice tone="error" data-testid={testId} style={{ ...style }}>
    <span style={{ display: 'block', marginBottom: spacing.sm }}>{message}</span>
    <Button variant="outline" onClick={onRetry} data-testid="load-error-retry">
      Try again
    </Button>
  </Notice>
);
