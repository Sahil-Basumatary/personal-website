'use client';
import { forwardRef, useId } from 'react';

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, disabled, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    return (
      <label
        htmlFor={checkboxId}
        className={`checkbox-wrapper ${disabled ? 'disabled' : ''} ${className}`}
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          className="checkbox-input"
          {...props}
        />
        <span className="checkbox-box" />
        {label && <span className="checkbox-label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
