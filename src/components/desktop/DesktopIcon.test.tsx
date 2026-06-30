import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopIcon } from './DesktopIcon';
import type { DesktopIconData } from '@/types/desktop';

const icon: DesktopIconData = {
  id: 'hd',
  label: 'Macintosh HD',
  iconType: 'disk',
  component: 'file-explorer',
};

function setup(selected = false) {
  const onSelect = vi.fn();
  const onOpen = vi.fn();
  render(
    <DesktopIcon
      icon={icon}
      selected={selected}
      onSelect={onSelect}
      onOpen={onOpen}
    />
  );
  return { onSelect, onOpen };
}

describe('DesktopIcon', () => {
  it('selects on mouse down', () => {
    const { onSelect } = setup();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Macintosh HD' }));
    expect(onSelect).toHaveBeenCalledWith('hd', false);
  });

  it('selects additively when a modifier key is held', () => {
    const { onSelect } = setup();
    fireEvent.mouseDown(screen.getByRole('button'), { metaKey: true });
    expect(onSelect).toHaveBeenCalledWith('hd', true);
  });

  it('opens on double click', () => {
    const { onOpen } = setup();
    fireEvent.doubleClick(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith(icon);
  });

  it('opens on Enter', () => {
    const { onOpen } = setup();
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledWith(icon);
  });

  it('exposes its selection state to assistive tech', () => {
    setup(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
