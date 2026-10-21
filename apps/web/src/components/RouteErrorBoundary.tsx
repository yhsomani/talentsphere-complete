import React from 'react';
import { spacing } from '@talentsphere/ui';
import { Button, Notice, PageHeader } from './ui/index.js';

interface Props {
  /** Changing the key (the path) clears a caught error on navigation. */
  resetKey: string;
  children: React.ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * One error boundary per page: a render error replaces only the page body,
 * keeps the header and navigation usable, and offers a retry that re-mounts
 * the page.
 */
export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div data-testid="route-error">
        <PageHeader title="This page could not be shown" />
        <Notice tone="error" style={{ marginBottom: spacing.md }}>
          Something went wrong while drawing this page. Your data is safe. Try again, or go back and
          continue.
        </Notice>
        <Button variant="outline" onClick={() => this.setState({ failed: false })}>
          Try again
        </Button>
      </div>
    );
  }
}
