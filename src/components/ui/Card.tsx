'use client';

import React from 'react';
import { Card as BaseCard, type CardProps } from './index';

export default function Card(props: CardProps) {
  return <BaseCard {...props} />;
}

export type { CardProps };
