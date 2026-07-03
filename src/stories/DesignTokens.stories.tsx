import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta = {
  title: 'Foundations/Design Tokens',
  parameters: {
    layout: 'fullscreen',
    chromatic: { viewports: [768] },
  },
};

export default meta;
type Story = StoryObj;

const colors = [
  { name: '--surface-primary', value: '#cccccc' },
  { name: '--surface-elevated', value: '#eeeeee' },
  { name: '--surface-sunken', value: '#999999' },
  { name: '--surface-base', value: '#ffffff' },
  { name: '--color-text', value: '#000000' },
  { name: '--border-highlight', value: '#ffffff' },
  { name: '--border-shadow', value: '#666666' },
  { name: '--border-shadow-deep', value: '#333333' },
  { name: '--window-active-bg', value: '#cccccc' },
  { name: '--window-inactive-bg', value: '#dddddd' },
  { name: '--titlebar-stripe', value: '#999999' },
  { name: '--color-accent', value: '#3366cc' },
  { name: '--color-accent-foreground', value: '#ffffff' },
];

const spacing = [
  { name: '--spacing-1', value: '2px' },
  { name: '--spacing-2', value: '4px' },
  { name: '--spacing-3', value: '8px' },
  { name: '--spacing-4', value: '12px' },
  { name: '--spacing-5', value: '16px' },
  { name: '--spacing-6', value: '20px' },
];

const fonts = [
  { name: '--font-system', value: 'var(--font-system)' },
  { name: '--font-body', value: 'var(--font-body)' },
  { name: '--font-mono', value: 'var(--font-mono)' },
];

const section: CSSProperties = {
  padding: '16px',
  fontFamily: 'var(--font-body)',
  color: 'var(--color-text)',
};

export const Colors: Story = {
  render: () => (
    <div style={section}>
      <h2 style={{ marginBottom: 12 }}>Colors</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {colors.map((token) => (
          <div key={token.name}>
            <div
              style={{
                height: 56,
                background: `var(${token.name})`,
                border: '1px solid var(--border-shadow)',
              }}
            />
            <code style={{ fontSize: 11 }}>{token.name}</code>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{token.value}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div style={section}>
      <h2 style={{ marginBottom: 12 }}>Spacing</h2>
      {spacing.map((token) => (
        <div
          key={token.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: `var(${token.name})`,
              height: 16,
              background: 'var(--color-accent)',
            }}
          />
          <code style={{ fontSize: 11 }}>
            {token.name} ({token.value})
          </code>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div style={section}>
      <h2 style={{ marginBottom: 12 }}>Typography</h2>
      {fonts.map((token) => (
        <div key={token.name} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: token.value, fontSize: 18 }}>
            The quick brown fox jumps over 1234567890
          </div>
          <code style={{ fontSize: 11 }}>{token.name}</code>
        </div>
      ))}
    </div>
  ),
};
