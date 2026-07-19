import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlatinumLoading } from './PlatinumLoading';

const meta: Meta<typeof PlatinumLoading> = {
  title: 'Phase12/PlatinumLoading',
  component: PlatinumLoading,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Panel: Story = {
  args: { label: 'Opening Terminal…', variant: 'panel' },
};

export const Inline: Story = {
  args: { label: 'Loading recent documents…', variant: 'inline' },
};

export const Bar: Story = {
  args: { label: 'Loading page…', variant: 'bar' },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};
