import React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}
/**
 * Canonical button. States are declarative (React state-driven styles), never
 * imperative DOM mutation — hover/focus/active must survive re-renders and
 * respect prefers-reduced-motion via the global CSS kill-switch.
 *
 * Motion contract: only colour/shadow/ring changes at `motion.duration.fast`
 * with token easings. No lift, no bounce. The single deliberate exception is
 * the active press (-1px), which communicates cause-and-effect on click.
 */
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=Button.d.ts.map