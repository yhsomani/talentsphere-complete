'use client';

import React from 'react';
import { Input as BaseInput, type InputProps } from './index';

export default function Input(props: InputProps) {
  return <BaseInput {...props} />;
}

export type { InputProps };
