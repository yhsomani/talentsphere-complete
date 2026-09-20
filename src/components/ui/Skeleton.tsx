'use client';

import React from 'react';
import { Skeleton as BaseSkeleton, type SkeletonProps } from './index';

export default function Skeleton(props: SkeletonProps) {
  return <BaseSkeleton {...props} />;
}

export type { SkeletonProps };
