import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinderNotFound } from './FinderNotFound';
import { RouteErrorRecovery } from './RouteErrorRecovery';

const captureException = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}));

describe('FinderNotFound', () => {
  it('renders Finder missing-item copy and a desktop link', () => {
    render(<FinderNotFound />);
    expect(
      screen.getByRole('alertdialog', {
        name: /requested item could not be found/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Finder')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Desktop' })).toHaveAttribute(
      'href',
      '/'
    );
  });
});

describe('RouteErrorRecovery', () => {
  beforeEach(() => {
    captureException.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports once, retries, and returns to the desktop', () => {
    const reset = vi.fn();
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });

    const error = Object.assign(new Error('boom'), { digest: 'abc123' });
    const { rerender } = render(
      <RouteErrorRecovery error={error} reset={reset} />
    );
    rerender(<RouteErrorRecovery error={error} reset={reset} />);

    expect(
      screen.getByRole('alertdialog', {
        name: /unexpected error occurred/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Error code')).toHaveTextContent('abc123');
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException.mock.calls[0]?.[1]).toMatchObject({
      tags: { scope: 'route-error' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(reset).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Go to Desktop' }));
    expect(assign).toHaveBeenCalledWith('/');
  });
});
