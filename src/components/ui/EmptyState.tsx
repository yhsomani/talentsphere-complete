'use client';

import React from 'react';
import { EmptyState as BaseEmptyState, type EmptyStateProps } from './index';

export default function EmptyState(props: EmptyStateProps) {
  return <BaseEmptyState {...props} />;
}

export type { EmptyStateProps };
