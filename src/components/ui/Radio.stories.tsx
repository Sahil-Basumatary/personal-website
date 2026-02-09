import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'UI/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    defaultChecked: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Option A',
    name: 'single',
  },
};

export const Checked: Story = {
  args: {
    label: 'Selected option',
    defaultChecked: true,
    name: 'checked',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    disabled: true,
    name: 'disabled',
  },
};

export const RadioGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Radio name="group" label="Option 1" defaultChecked />
      <Radio name="group" label="Option 2" />
      <Radio name="group" label="Option 3" />
      <Radio name="group" label="Disabled" disabled />
    </div>
  ),
};
