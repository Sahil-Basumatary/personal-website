import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ContactForm } from './apps/contact/ContactForm';
import { DesktopIcon } from './desktop/DesktopIcon';
import { Dock } from './menubar/Dock';
import { useWindowStore } from '@/stores/window-store';
import type { DesktopIconData } from '@/types/desktop';

const icon: DesktopIconData = {
  id: 'hd',
  label: 'Macintosh HD',
  iconType: 'disk',
  component: 'file-explorer',
};

beforeEach(() => {
  useWindowStore.setState({ windows: {}, activeWindowId: null, nextZIndex: 1 });
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('accessibility (axe)', () => {
  it('contact form has no violations', async () => {
    const { container } = render(<ContactForm />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('desktop icon has no violations', async () => {
    const { container } = render(
      <DesktopIcon
        icon={icon}
        selected={false}
        onSelect={() => {}}
        onOpen={() => {}}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('dock has no violations', async () => {
    const { container } = render(<Dock />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('keyboard navigation', () => {
  it('tabs through the contact fields in order', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.tab();
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Subject')).toHaveFocus();
  });

  it('moves focus into the dialog after a successful submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByLabelText('Name'), 'Sahil');
    await user.type(screen.getByLabelText('Email'), 'sahil@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Hi');
    await user.type(screen.getByLabelText('Message'), 'Hello there');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });
});
