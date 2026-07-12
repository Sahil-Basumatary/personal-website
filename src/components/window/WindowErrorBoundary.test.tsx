import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ErrorInfo } from 'react';
import { WindowErrorBoundary } from './WindowErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

function Stable({ label }: { label: string }) {
  return <div>{label}</div>;
}

describe('WindowErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when healthy', () => {
    render(
      <WindowErrorBoundary
        windowId="w1"
        windowTitle="Terminal"
        onClose={vi.fn()}
      >
        <Stable label="ok" />
      </WindowErrorBoundary>
    );
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('shows recovery UI, reports once, and closes on request', () => {
    const onClose = vi.fn();
    const reportError = vi.fn();
    render(
      <WindowErrorBoundary
        windowId="w1"
        windowTitle="Terminal"
        onClose={onClose}
        reportError={reportError}
      >
        <Boom />
      </WindowErrorBoundary>
    );

    expect(
      screen.getByRole('alertdialog', {
        name: /Terminal.*unexpectedly quit/i,
      })
    ).toBeInTheDocument();
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(reportError.mock.calls[0]?.[2]).toEqual({
      windowId: 'w1',
      windowTitle: 'Terminal',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('retries by remounting children after a crash', () => {
    let shouldThrow = true;
    function Flaky() {
      if (shouldThrow) throw new Error('flaky');
      return <div>recovered</div>;
    }

    const reportError = vi.fn(
      (_error: Error, _info: ErrorInfo, _meta: unknown) => undefined
    );

    render(
      <WindowErrorBoundary
        windowId="w2"
        windowTitle="Browser"
        onClose={vi.fn()}
        reportError={reportError}
      >
        <Flaky />
      </WindowErrorBoundary>
    );

    expect(screen.getByText(/Browser/)).toBeInTheDocument();
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByText('recovered')).toBeInTheDocument();
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});
