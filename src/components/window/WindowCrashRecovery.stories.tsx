import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WindowCrashRecovery } from './WindowCrashRecovery';

const meta: Meta<typeof WindowCrashRecovery> = {
  title: 'Phase12/WindowCrashRecovery',
  component: WindowCrashRecovery,
  parameters: { layout: 'centered' },
  args: {
    windowId: 'story-crash',
    windowTitle: 'Terminal',
    onRetry: () => undefined,
    onClose: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const UnexpectedlyQuit: Story = {
  decorators: [
    (Story) => (
      <div
        style={{
          width: 420,
          minHeight: 220,
          border: '2px solid #666',
          background: '#ccc',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
