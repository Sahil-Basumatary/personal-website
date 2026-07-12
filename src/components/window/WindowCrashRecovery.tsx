'use client';

interface WindowCrashRecoveryProps {
  windowId: string;
  windowTitle: string;
  onRetry: () => void;
  onClose: () => void;
}

export function WindowCrashRecovery({
  windowId,
  windowTitle,
  onRetry,
  onClose,
}: WindowCrashRecoveryProps) {
  const titleId = `window-crash-title-${windowId}`;
  const descriptionId = `window-crash-description-${windowId}`;

  return (
    <div
      className="window-crash"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="window-crash__icon dialog-icon dialog-icon-error"
        aria-hidden
      />
      <div className="window-crash__copy">
        <h2 id={titleId} className="window-crash__title">
          The application &ldquo;{windowTitle}&rdquo; has unexpectedly quit.
        </h2>
        <p id={descriptionId} className="window-crash__description">
          The other windows are still open. You can try opening this one again,
          or close it.
        </p>
        <div className="window-crash__actions">
          <button type="button" className="btn primary" onClick={onRetry}>
            Retry
          </button>
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export type { WindowCrashRecoveryProps };
