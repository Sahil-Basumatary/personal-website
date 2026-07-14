'use client';

import { useWindowStore } from '@/stores/window-store';

interface UnknownApplicationProps {
  windowId: string;
  component: string;
}

export function UnknownApplication({
  windowId,
  component,
}: UnknownApplicationProps) {
  const closeWindow = useWindowStore((s) => s.requestCloseWindow);
  const titleId = `unknown-app-title-${windowId}`;
  const descriptionId = `unknown-app-description-${windowId}`;

  return (
    <div
      className="unknown-application"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="dialog-icon dialog-icon-warning" aria-hidden />
      <div className="unknown-application__copy">
        <h2 id={titleId} className="unknown-application__title">
          The application &ldquo;{component}&rdquo; could not be found.
        </h2>
        <p id={descriptionId} className="unknown-application__description">
          That program is not available on this disk. Close this window and open
          an application from the Applications folder or the Apple menu.
        </p>
        <div className="unknown-application__actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => closeWindow(windowId)}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export type { UnknownApplicationProps };
