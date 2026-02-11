import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ContextMenu } from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: '40px',
            background: '#f0f0f0',
            border: '1px dashed #999',
            cursor: 'context-menu',
          }}
        >
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={() => console.log('New')}>
          New
          <ContextMenu.Shortcut>⌘N</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item onSelect={() => console.log('Open')}>
          Open
          <ContextMenu.Shortcut>⌘O</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Divider />
        <ContextMenu.Item onSelect={() => console.log('Save')}>
          Save
          <ContextMenu.Shortcut>⌘S</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item disabled>
          Save As...
          <ContextMenu.Shortcut>⇧⌘S</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Divider />
        <ContextMenu.Item onSelect={() => console.log('Close')}>
          Close
          <ContextMenu.Shortcut>⌘W</ContextMenu.Shortcut>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenu.Trigger>
        <div
          style={{
            padding: '40px',
            background: '#f0f0f0',
            border: '1px dashed #999',
            cursor: 'context-menu',
          }}
        >
          Right-click for menu with disabled items
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>Cut</ContextMenu.Item>
        <ContextMenu.Item>Copy</ContextMenu.Item>
        <ContextMenu.Item disabled>Paste</ContextMenu.Item>
        <ContextMenu.Divider />
        <ContextMenu.Item disabled>Undo</ContextMenu.Item>
        <ContextMenu.Item disabled>Redo</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  ),
};
