import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { Browser } from './Browser';

vi.mock('@/components/ui', () => ({
  PlatinumLoading: ({ label }: { label: string }) => <div>{label}</div>,
}));

describe('Browser', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'open',
      vi.fn().mockReturnValue({ focus: vi.fn(), closed: false })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('always offers Open Externally away from home', () => {
    render(<Browser initialUrl="https://example.com" embedTimeoutMs={50} />);
    expect(
      screen.getByRole('button', { name: 'Open Externally' })
    ).toBeEnabled();
  });

  it('shows recovery UI after the embed timeout', () => {
    render(<Browser initialUrl="https://example.com" embedTimeoutMs={50} />);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(
      screen.getByText(/This page could not be shown here/i)
    ).toBeInTheDocument();
    const recovery = screen.getByRole('status');
    fireEvent.click(
      within(recovery).getByRole('button', { name: 'Open Externally' })
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer'
    );
  });
});
