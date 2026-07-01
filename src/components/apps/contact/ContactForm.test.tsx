import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { ContactForm } from './ContactForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(impl: () => Promise<unknown>) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

async function fillForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Name'), 'Sahil');
  await user.type(screen.getByLabelText('Email'), 'sahil@example.com');
  await user.type(screen.getByLabelText('Subject'), 'Hi');
  await user.type(screen.getByLabelText('Message'), 'Hello there');
}

describe('ContactForm', () => {
  it('updates fields as the user types', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    const name = screen.getByLabelText('Name');
    await user.type(name, 'Sahil');
    expect(name).toHaveValue('Sahil');
  });

  it('shows a success dialog and clears the form on success', async () => {
    mockFetch(async () => ({ ok: true, json: async () => ({ ok: true }) }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Message sent')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('surfaces a server-provided error message', async () => {
    mockFetch(async () => ({
      ok: false,
      json: async () => ({ ok: false, error: 'Slow down a moment.' }),
    }));
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Slow down a moment.')).toBeInTheDocument();
  });

  it('shows a network error when the request throws', async () => {
    mockFetch(async () => {
      throw new Error('offline');
    });
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(
      await screen.findByText(/Couldn't reach the server/)
    ).toBeInTheDocument();
  });

  it('clears the form when Clear is pressed', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    const name = screen.getByLabelText('Name');
    await user.type(name, 'Sahil');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(name).toHaveValue('');
  });
});
