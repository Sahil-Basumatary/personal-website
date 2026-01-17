'use client';
import { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', disabled, ...props }, ref) => {
    const classes = ['input-field', className].filter(Boolean).join(' ');
    return (
      <input ref={ref} disabled={disabled} className={classes} {...props} />
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
