'use client';

import React from 'react';
import { Avatar as BaseAvatar, type AvatarProps } from './index';

export default function Avatar(props: AvatarProps) {
  return <BaseAvatar {...props} />;
}

export type { AvatarProps };
