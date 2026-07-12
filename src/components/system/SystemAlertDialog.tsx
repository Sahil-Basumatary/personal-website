'use client';

interface SystemAlertDialogProps {
  titleBar: string;
  title: string;
  description: string;
  iconVariant?: 'error' | 'warning' | 'info';
  titleId: string;
  descriptionId: string;
  code?: string;
  actions: React.ReactNode;
}

export function SystemAlertDialog({
  titleBar,
  title,
  description,
  iconVariant = 'error',
  titleId,
  descriptionId,
  code,
  actions,
}: SystemAlertDialogProps) {
  return (
    <main className="system-alert-stage">
      <section
        className="system-alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="system-alert__titlebar">
          <span className="system-alert__titlebar-label">{titleBar}</span>
        </div>
        <div className="system-alert__body">
          <div
            className={`dialog-icon dialog-icon-${iconVariant}`}
            aria-hidden
          />
          <div className="system-alert__copy">
            <h1 id={titleId} className="system-alert__title">
              {title}
            </h1>
            <p id={descriptionId} className="system-alert__description">
              {description}
            </p>
            {code ? (
              <p className="system-alert__code" aria-label="Error code">
                {code}
              </p>
            ) : null}
            <div className="system-alert__actions">{actions}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export type { SystemAlertDialogProps };
