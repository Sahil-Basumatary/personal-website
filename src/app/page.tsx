import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 style={{ fontFamily: 'var(--font-chicago)', fontSize: '14px' }}>
        Mac OS 9 Button Component
      </h1>
      <div className="flex flex-wrap items-center gap-4">
        <Button>Secondary</Button>
        <Button variant="primary">Primary</Button>
        <Button disabled>Disabled</Button>
        <Button variant="primary" disabled>
          Primary Disabled
        </Button>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-charcoal)',
          fontSize: '12px',
          maxWidth: '400px',
        }}
      >
        Click and hold to see the pressed state. Hover to see the highlight
        effect. Use Tab to see the focus state.
      </p>
    </div>
  );
}
