import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tooltip } from './Tooltip';
import { Button } from './Button';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    delay: {
      control: { type: 'number', min: 0, max: 2000 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <Tooltip.Trigger>
        <Button>Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>This is a helpful tooltip message</Tooltip.Content>
    </Tooltip>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <Tooltip delay={800}>
      <Tooltip.Trigger>
        <Button>Hover (800ms delay)</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>This tooltip has a longer delay</Tooltip.Content>
    </Tooltip>
  ),
};

export const OnText: Story = {
  render: () => (
    <p>
      Click on the{' '}
      <Tooltip delay={200}>
        <Tooltip.Trigger>
          <span
            style={{
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              cursor: 'help',
            }}
          >
            highlighted text
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Additional information about this term appears here
        </Tooltip.Content>
      </Tooltip>{' '}
      to learn more.
    </p>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <Tooltip.Trigger>
        <Button>Info</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        This is a longer tooltip that contains more detailed information. It
        will wrap to multiple lines if necessary.
      </Tooltip.Content>
    </Tooltip>
  ),
};
