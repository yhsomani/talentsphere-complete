'use client';

import React from 'react';
import { Badge as BaseBadge, type BadgeProps } from './index';

export default function Badge(props: BadgeProps) {
  return <BaseBadge {...props} />;
}

export type { BadgeProps };
