'use client';

import { useFormStatus } from 'react-dom';

interface AdminPendingFormProps {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  label: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}

function PendingSubmitButton({
  label,
  pendingLabel,
  className,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={disabled || pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AdminPendingForm({
  action,
  children,
  label,
  pendingLabel = 'Working…',
  className,
  disabled,
}: AdminPendingFormProps) {
  return (
    <form action={action}>
      {children}
      <PendingSubmitButton
        label={label}
        pendingLabel={pendingLabel}
        className={className}
        disabled={disabled}
      />
    </form>
  );
}
