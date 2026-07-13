'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dialog } from '@/components/ui';
import type { AdminFormState } from '@/app/admin/_lib/form-state';

interface AdminConfirmFormProps {
  action: (formData: FormData) => Promise<AdminFormState>;
  children: React.ReactNode;
  label: string;
  itemName: string;
  pendingLabel?: string;
  className?: string;
  redirectTo?: string;
}

export function AdminConfirmForm({
  action,
  children,
  label,
  itemName,
  pendingLabel = 'Deleting…',
  className,
  redirectTo,
}: AdminConfirmFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleTriggerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setOpen(true);
  }

  function handleConfirm() {
    const form = formRef.current;
    if (!form || isPending) return;

    startTransition(async () => {
      const result = await action(new FormData(form));
      if (result.status === 'error') {
        setError(result.message);
        setOpen(false);
        return;
      }
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    });
  }

  return (
    <div className="admin-confirm-form">
      <form ref={formRef} onSubmit={handleTriggerSubmit}>
        {children}
        <button type="submit" className={className} disabled={isPending}>
          {isPending ? pendingLabel : label}
        </button>
      </form>
      {error ? (
        <p className="admin-feedback admin-feedback--error" role="alert">
          {error}
        </p>
      ) : null}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!isPending) setOpen(next);
        }}
      >
        <Dialog.Content closeOnBackdrop={!isPending}>
          <Dialog.Header>
            <Dialog.Icon variant="warning" />
            <Dialog.Body>
              <Dialog.Title>
                Permanently remove &ldquo;{itemName}&rdquo;?
              </Dialog.Title>
              <Dialog.Description>
                This cannot be undone. The item will be deleted from the
                database immediately.
              </Dialog.Description>
            </Dialog.Body>
          </Dialog.Header>
          <Dialog.Actions>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending ? pendingLabel : 'Delete'}
            </Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
