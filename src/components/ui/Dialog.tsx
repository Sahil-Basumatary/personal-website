'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    firstFocusable?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);
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

type IconVariant = 'error' | 'warning' | 'info';

interface DialogIconProps {
  variant: IconVariant;
}

function DialogIcon({ variant }: DialogIconProps) {
  return (
    <div className={`dialog-icon dialog-icon-${variant}`} aria-hidden="true" />
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="dialog-header">{children}</div>;
}

interface DialogBodyProps {
  children: React.ReactNode;
}

function DialogBody({ children }: DialogBodyProps) {
  return <div className="dialog-body">{children}</div>;
}

interface DialogTitleProps {
  children: React.ReactNode;
}

function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="dialog-title">{children}</h2>;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="dialog-description">{children}</p>;
}

interface DialogActionsProps {
  children: React.ReactNode;
}

function DialogActions({ children }: DialogActionsProps) {
  return <div className="dialog-actions">{children}</div>;
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
  Header: DialogHeader,
  Body: DialogBody,
  Icon: DialogIcon,
  Title: DialogTitle,
  Description: DialogDescription,
  Actions: DialogActions,
  Close: DialogClose,
});

export { Dialog };
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogIconProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogActionsProps,
  DialogCloseProps,
};
