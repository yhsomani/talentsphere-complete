'use client';

import React from 'react';
import { Button as BaseButton, type ButtonProps } from './index';

export default function Button(props: ButtonProps) {
  return <BaseButton {...props} />;
}

export type { ButtonProps };
