'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

interface DialogContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DialogRoot({
  children,
  open: controlledOpen,
  onOpenChange,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const openDialog = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(true);
    } else {
      setUncontrolledOpen(true);
    }
  }, [isControlled, onOpenChange]);
  const closeDialog = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setUncontrolledOpen(false);
    }
  }, [isControlled, onOpenChange]);
  return (
    <DialogContext.Provider
      value={{ isOpen, open: openDialog, close: closeDialog }}
    >
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  children: React.ReactNode;
}

function DialogTrigger({ children }: DialogTriggerProps) {
  const { open } = useDialog();
  return (
    <span onClick={open} style={{ display: 'inline-block', cursor: 'pointer' }}>
      {children}
    </span>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}

function DialogContent({
  children,
  closeOnBackdrop = true,
}: DialogContentProps) {
  const { isOpen, close } = useDialog();
  const dialogRef = useRef<HTMLDivElement>(null);
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        close();
      }
    },
    [closeOnBackdrop, close]
  );
  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div
      className="dialog-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="dialog"
        role="alertdialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

interface DialogCloseProps {
  children: React.ReactNode;
}

function DialogClose({ children }: DialogCloseProps) {
  const { close } = useDialog();
  return (
    <span onClick={close} style={{ display: 'inline-block' }}>
      {children}
    </span>
  );
}

const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Close: DialogClose,
});

export { Dialog };
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogCloseProps,
};
