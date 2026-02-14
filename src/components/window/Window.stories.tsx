import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Window } from './Window';

const meta: Meta<typeof Window> = {
  title: 'Window/Window',
  component: Window,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'boolean',
    },
    collapsed: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  render: () => (
    <Window defaultActive style={{ width: 400 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox onClose={() => console.log('close')} />
          <Window.TitleBar.ZoomBox onZoom={() => console.log('zoom')} />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>Active Window</Window.TitleBar.Title>
      </Window.TitleBar>
      <Window.Content style={{ height: 200 }}>
        <div style={{ padding: 12 }}>
          <p>This is the window content area.</p>
          <p>It supports scrolling when content overflows.</p>
        </div>
      </Window.Content>
      <Window.ResizeHandle />
    </Window>
  ),
};

export const Inactive: Story = {
  render: () => (
    <Window defaultActive={false} style={{ width: 400 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox />
          <Window.TitleBar.ZoomBox />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>Inactive Window</Window.TitleBar.Title>
      </Window.TitleBar>
      <Window.Content style={{ height: 200 }}>
        <div style={{ padding: 12 }}>
          <p>This window is inactive.</p>
          <p>Notice the solid title bar without pinstripes.</p>
        </div>
      </Window.Content>
      <Window.ResizeHandle />
    </Window>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <Window defaultCollapsed style={{ width: 400 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox />
          <Window.TitleBar.ZoomBox />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>Collapsed Window</Window.TitleBar.Title>
      </Window.TitleBar>
      <Window.Content style={{ height: 200 }}>
        <div style={{ padding: 12 }}>
          <p>This content is hidden when collapsed.</p>
        </div>
      </Window.Content>
      <Window.ResizeHandle />
    </Window>
  ),
};

export const WithScrollableContent: Story = {
  render: () => (
    <Window defaultActive style={{ width: 400 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox />
          <Window.TitleBar.ZoomBox />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>Scrollable Content</Window.TitleBar.Title>
      </Window.TitleBar>
      <Window.Content style={{ height: 200 }}>
        <div style={{ padding: 12 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Line {i + 1} of scrollable content.</p>
          ))}
        </div>
      </Window.Content>
      <Window.ResizeHandle />
    </Window>
  ),
};

export const MultipleWindows: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 600, height: 400 }}>
      <Window
        defaultActive={false}
        style={{ width: 300, position: 'absolute', top: 20, left: 20 }}
      >
        <Window.TitleBar>
          <Window.TitleBar.Controls>
            <Window.TitleBar.CloseBox />
            <Window.TitleBar.ZoomBox />
            <Window.TitleBar.CollapseBox />
          </Window.TitleBar.Controls>
          <Window.TitleBar.Title>Background Window</Window.TitleBar.Title>
        </Window.TitleBar>
        <Window.Content style={{ height: 150 }}>
          <div style={{ padding: 12 }}>
            <p>This window is in the background.</p>
          </div>
        </Window.Content>
        <Window.ResizeHandle />
      </Window>
      <Window
        defaultActive
        style={{ width: 300, position: 'absolute', top: 80, left: 150 }}
      >
        <Window.TitleBar>
          <Window.TitleBar.Controls>
            <Window.TitleBar.CloseBox />
            <Window.TitleBar.ZoomBox />
            <Window.TitleBar.CollapseBox />
          </Window.TitleBar.Controls>
          <Window.TitleBar.Title>Active Window</Window.TitleBar.Title>
        </Window.TitleBar>
        <Window.Content style={{ height: 150 }}>
          <div style={{ padding: 12 }}>
            <p>This window is in the foreground.</p>
          </div>
        </Window.Content>
        <Window.ResizeHandle />
      </Window>
    </div>
  ),
};
