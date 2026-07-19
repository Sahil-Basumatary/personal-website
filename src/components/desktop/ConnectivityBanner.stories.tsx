import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConnectivityBanner } from './ConnectivityBanner';

const meta: Meta<typeof ConnectivityBanner> = {
  title: 'Phase12/ConnectivityBanner',
  component: ConnectivityBanner,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Offline: Story = {
  args: { previewState: 'offline' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 80, background: '#888888' }}>
        <Story />
      </div>
    ),
  ],
};

export const Reconnected: Story = {
  args: { previewState: 'reconnected' },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 80, background: '#888888' }}>
        <Story />
      </div>
    ),
  ],
};
