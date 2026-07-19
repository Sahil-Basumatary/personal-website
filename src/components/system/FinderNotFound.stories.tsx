import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FinderNotFound } from './FinderNotFound';

const meta: Meta<typeof FinderNotFound> = {
  title: 'Phase12/FinderNotFound',
  component: FinderNotFound,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
