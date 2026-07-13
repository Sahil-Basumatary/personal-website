import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatrixRain } from './MatrixRain';

vi.mock('@/hooks/use-prefers-reduced-motion', () => ({
  usePrefersReducedMotion: () => true,
}));

describe('MatrixRain reduced motion', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1)
    );
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: '',
      font: '',
      globalAlpha: 1,
      fillRect: vi.fn(),
      fillText: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a static frame and does not schedule animation frames', () => {
    render(<MatrixRain onDismiss={vi.fn()} />);
    expect(screen.getByText(/static frame/i)).toBeInTheDocument();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
