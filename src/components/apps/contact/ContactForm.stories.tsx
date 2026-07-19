import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ContactForm } from './ContactForm';

const meta: Meta<typeof ContactForm> = {
  title: 'Phase12/ContactForm',
  component: ContactForm,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          width: 420,
          minHeight: 480,
          border: '2px solid #666',
          background: 'var(--surface-primary)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const ValidationErrors: Story = {
  decorators: Empty.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(
      canvas.getByText(
        /The message could not be sent because of the following problems/
      )
    ).toBeVisible();
  },
};
