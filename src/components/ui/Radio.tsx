'use client';
import { forwardRef, useId } from 'react';

interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, disabled, id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || generatedId;
    return (
      <label
        htmlFor={radioId}
        className={`radio-wrapper ${disabled ? 'disabled' : ''} ${className}`}
      >
        <input
          ref={ref}
          type="radio"
          id={radioId}
          disabled={disabled}
          className="radio-input"
          {...props}
        />
        <span className="radio-circle" />
        {label && <span className="radio-label">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };
export type { RadioProps };
