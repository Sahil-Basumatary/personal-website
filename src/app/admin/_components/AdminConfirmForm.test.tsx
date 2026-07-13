import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminConfirmForm } from './AdminConfirmForm';
import { formError, formSuccess } from '@/app/admin/_lib/form-state';

const refresh = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push }),
}));

describe('AdminConfirmForm', () => {
  beforeEach(() => {
    refresh.mockClear();
    push.mockClear();
  });

  it('asks before deleting and only runs the action after confirm', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => formSuccess('deleted'));
    render(
      <AdminConfirmForm
        action={action}
        itemName="Pioni"
        label="Delete"
        className="admin-link-button"
      >
        <input type="hidden" name="id" value="abc" />
      </AdminConfirmForm>
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(action).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    expect(
      within(dialog).getByText(/Permanently remove “Pioni”/i)
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(action).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      })
    );
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalled();
  });

  it('shows a recoverable error when the action fails', async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => formError('Could not delete.'));
    render(
      <AdminConfirmForm
        action={action}
        itemName="Pioni"
        label="Delete"
        className="admin-link-button"
      >
        <input type="hidden" name="id" value="abc" />
      </AdminConfirmForm>
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Delete',
      })
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete.'
    );
    expect(push).not.toHaveBeenCalled();
  });
});
