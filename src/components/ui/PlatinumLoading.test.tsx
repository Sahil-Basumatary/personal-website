import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PlatinumLoading } from './PlatinumLoading';

describe('PlatinumLoading', () => {
  it('exposes an accessible busy status with the provided label', () => {
    const { getByRole } = render(<PlatinumLoading label="Opening Terminal…" />);
    const status = getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('Opening Terminal…');
  });

  it('supports compact variants without axe violations', async () => {
    const { container, rerender } = render(
      <PlatinumLoading variant="inline" label="Loading recent documents…" />
    );
    expect(await axe(container)).toHaveNoViolations();

    rerender(<PlatinumLoading variant="bar" label="Loading page…" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
