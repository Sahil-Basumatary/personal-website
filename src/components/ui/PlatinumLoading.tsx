'use client';

interface PlatinumLoadingProps {
  label?: string;
  variant?: 'panel' | 'inline' | 'bar';
  className?: string;
}

export function PlatinumLoading({
  label = 'Loading…',
  variant = 'panel',
  className = '',
}: PlatinumLoadingProps) {
  const classes = [
    'platinum-loading',
    `platinum-loading--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" aria-busy="true">
      <div className="platinum-loading__track" aria-hidden="true">
        <div className="platinum-loading__fill" />
      </div>
      <p
        className={
          variant === 'bar'
            ? 'platinum-loading__label platinum-loading__label--sr'
            : 'platinum-loading__label'
        }
      >
        {label}
      </p>
    </div>
  );
}

export type { PlatinumLoadingProps };
