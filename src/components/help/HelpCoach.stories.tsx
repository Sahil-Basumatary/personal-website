import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { HelpCoach } from './HelpCoach';
import { useHelpStore } from '@/stores/help-store';

function HelpStage({ stepIndex }: { stepIndex: number }) {
  useEffect(() => {
    useHelpStore.setState({ isOpen: true, stepIndex });
    return () => {
      useHelpStore.setState({ isOpen: false, stepIndex: 0 });
    };
  }, [stepIndex]);

  return (
    <div
      style={{
        position: 'relative',
        width: 720,
        height: 520,
        background: '#555',
      }}
    >
      <div
        data-help-anchor="dock"
        style={{
          position: 'absolute',
          left: 200,
          bottom: 24,
          width: 320,
          height: 48,
          background: '#999',
        }}
      />
      <div
        data-help-anchor="system-drive"
        style={{
          position: 'absolute',
          right: 40,
          top: 80,
          width: 72,
          height: 80,
          background: '#777',
        }}
      />
      <div
        data-help-anchor="terminal"
        style={{
          position: 'absolute',
          right: 40,
          top: 180,
          width: 72,
          height: 80,
          background: '#777',
        }}
      />
      <div
        data-help-anchor="code-playground"
        style={{
          position: 'absolute',
          right: 40,
          top: 280,
          width: 72,
          height: 80,
          background: '#777',
        }}
      />
      <div
        data-help-anchor="menubar-audio"
        style={{
          position: 'absolute',
          right: 24,
          top: 8,
          width: 28,
          height: 20,
          background: '#aaa',
        }}
      />
      <HelpCoach />
    </div>
  );
}

const meta: Meta<typeof HelpStage> = {
  title: 'Phase12/HelpCoach',
  component: HelpStage,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  args: { stepIndex: 0 },
};

export const TerminalStep: Story = {
  args: { stepIndex: 2 },
};
