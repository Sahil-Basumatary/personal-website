import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScrollArea } from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleContent = Array.from({ length: 50 }, (_, i) => (
  <div key={i} style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
    Item {i + 1}
  </div>
));

export const Default: Story = {
  args: {
    children: sampleContent,
    style: { width: 300, height: 200 },
  },
};

export const WithLongContent: Story = {
  args: {
    children: (
      <div style={{ padding: '12px' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Long Content Example</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident.
        </p>
        {sampleContent}
      </div>
    ),
    style: { width: 350, height: 250 },
  },
};

export const NoOverflow: Story = {
  args: {
    children: (
      <div style={{ padding: '12px' }}>
        <p>This content fits without scrolling.</p>
      </div>
    ),
    style: { width: 300, height: 200 },
  },
};
