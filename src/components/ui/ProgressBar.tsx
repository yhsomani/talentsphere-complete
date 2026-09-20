'use client';

import React from 'react';
import { ProgressBar as BaseProgressBar, type ProgressBarProps } from './index';

export default function ProgressBar(props: ProgressBarProps) {
  return <BaseProgressBar {...props} />;
}

export type { ProgressBarProps };
