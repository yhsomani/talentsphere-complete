import React from 'react';
export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    style?: React.CSSProperties;
}
/**
 * Shared empty-state panel.
 *
 * Every list/collection surface should render this when there is nothing to
 * show, instead of an awkward blank area — it tells the user what is missing
 * and what to do next.
 */
export declare const EmptyState: React.FC<EmptyStateProps>;
//# sourceMappingURL=EmptyState.d.ts.map