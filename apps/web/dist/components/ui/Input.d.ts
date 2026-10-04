import React from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
}
/**
 * Canonical input. Focus/hover styling is declarative (React state), never
 * imperative DOM mutation. Error text uses the AA-safe semantic tone so the
 * message is readable, not just red. The focus ring mirrors Button's so the
 * form surfaces share one interaction language.
 */
export declare const Input: React.FC<InputProps>;
//# sourceMappingURL=Input.d.ts.map