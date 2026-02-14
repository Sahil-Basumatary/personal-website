import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Window } from './Window';

const meta: Meta<typeof Window.TitleBar> = {
  title: 'Window/TitleBar',
  component: Window.TitleBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveTitleBar: Story = {
  render: () => (
    <Window defaultActive style={{ width: 400 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox onClose={() => console.log('close')} />
          <Window.TitleBar.ZoomBox onZoom={() => console.log('zoom')} />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>Active Title Bar</Window.TitleBar.Title>
      </Window.TitleBar>
    </Window>
  ),
};

export const InactiveTitleBar: Story = {
  render: () => (
    <Window defaultActive={false} style={{ width: 400 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox />
          <Window.TitleBar.ZoomBox />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>Inactive Title Bar</Window.TitleBar.Title>
      </Window.TitleBar>
    </Window>
  ),
};

export const LongTitle: Story = {
  render: () => (
    <Window defaultActive style={{ width: 300 }}>
      <Window.TitleBar>
        <Window.TitleBar.Controls>
          <Window.TitleBar.CloseBox />
          <Window.TitleBar.ZoomBox />
          <Window.TitleBar.CollapseBox />
        </Window.TitleBar.Controls>
        <Window.TitleBar.Title>
          This Is A Very Long Window Title That Should Truncate
        </Window.TitleBar.Title>
      </Window.TitleBar>
    </Window>
  ),
};

export const ControlBoxStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ marginBottom: 8 }}>Active controls:</p>
        <Window defaultActive style={{ width: 200 }}>
          <Window.TitleBar>
            <Window.TitleBar.Controls>
              <Window.TitleBar.CloseBox />
              <Window.TitleBar.ZoomBox />
              <Window.TitleBar.CollapseBox />
            </Window.TitleBar.Controls>
            <Window.TitleBar.Title>Active</Window.TitleBar.Title>
          </Window.TitleBar>
        </Window>
      </div>
      <div>
        <p style={{ marginBottom: 8 }}>Inactive controls:</p>
        <Window defaultActive={false} style={{ width: 200 }}>
          <Window.TitleBar>
            <Window.TitleBar.Controls>
              <Window.TitleBar.CloseBox />
              <Window.TitleBar.ZoomBox />
              <Window.TitleBar.CollapseBox />
            </Window.TitleBar.Controls>
            <Window.TitleBar.Title>Inactive</Window.TitleBar.Title>
          </Window.TitleBar>
        </Window>
      </div>
    </div>
  ),
};
