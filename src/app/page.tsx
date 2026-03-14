'use client';
import { WindowManager } from '@/components/window';
import { MenuBar, Dock } from '@/components/menubar';
import { Desktop } from '@/components/desktop';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Terminal } from '@/components/apps/terminal/Terminal';

function AboutComputerContent() {
  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <div
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        Sahil&apos;s Computer
      </div>
      <div style={{ marginBottom: 4, fontSize: 12 }}>Personal Website v1.0</div>
      <div style={{ color: 'var(--border-shadow)', fontSize: 11 }}>
        Built with Next.js, React &amp; TypeScript
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 12,
          borderTop: '1px solid var(--border-shadow)',
          color: 'var(--border-shadow)',
          fontSize: 11,
        }}
      >
        Sahil Basumatary — King&apos;s College London
      </div>
    </div>
  );
}

function AboutMeContent() {
  return (
    <div style={{ padding: 16, lineHeight: 1.6, fontSize: 12 }}>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        About Me
      </p>
      <p>
        Hey! I&apos;m Sahil Basumatary, a first-year Computer Science student at
        King&apos;s College London. I&apos;m passionate about building software
        that solves real problems.
      </p>
      <p style={{ marginTop: 8 }}>
        Currently exploring full-stack development, distributed systems, and
        machine learning. When I&apos;m not coding, you&apos;ll find me on the
        tennis court.
      </p>
    </div>
  );
}

function ProjectsContent() {
  const projects = [
    { name: 'personal-blog', tech: 'React, Express, Clerk', status: 'LIVE' },
    { name: 'pioni', tech: 'Python, FastAPI', status: 'LIVE' },
    {
      name: 'tennisly',
      tech: 'Java, Spring Boot',
      status: 'COMING SOON',
    },
  ];
  return (
    <div style={{ padding: 16, fontSize: 12 }}>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        Projects
      </p>
      {projects.map((p) => (
        <div
          key={p.name}
          style={{
            padding: '8px 0',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <strong>{p.name}</strong>
            <div style={{ color: 'var(--border-shadow)', marginTop: 2 }}>
              {p.tech}
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              padding: '2px 6px',
              background: p.status === 'LIVE' ? '#4caf50' : '#999',
              color: '#fff',
              borderRadius: 2,
              alignSelf: 'flex-start',
            }}
          >
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function SkillsContent() {
  const skills = {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Java', 'SQL'],
    frontend: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
    backend: ['Node.js', 'Express', 'FastAPI', 'Spring Boot'],
    tools: ['Git', 'Docker', 'PostgreSQL', 'MongoDB', 'Vercel'],
  };
  return (
    <div
      style={{
        padding: 16,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        whiteSpace: 'pre',
        lineHeight: 1.5,
      }}
    >
      {JSON.stringify(skills, null, 2)}
    </div>
  );
}

function ContactContent() {
  return (
    <div style={{ padding: 16, fontSize: 12, lineHeight: 1.8 }}>
      <p
        style={{
          fontFamily: 'var(--font-system)',
          fontSize: 13,
          marginBottom: 12,
        }}
      >
        Get in Touch
      </p>
      <div>GitHub: github.com/Sahil-Basumatary</div>
      <div>Website: sahilbzy.com</div>
      <div>Blog: blog.sahilbzy.com</div>
      <div
        style={{ color: 'var(--border-shadow)', marginTop: 16, fontSize: 11 }}
      >
        Contact form coming in Phase 6.
      </div>
    </div>
  );
}

function FileExplorerContent() {
  const items = [
    { name: 'Desktop', type: 'folder' },
    { name: 'Documents', type: 'folder' },
    { name: 'Applications', type: 'folder' },
    { name: 'README.md', type: 'file' },
  ];
  return (
    <div>
      {items.map((item) => (
        <div
          key={item.name}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>
            {item.type === 'folder' ? '[DIR]' : '[FILE]'}
          </span>
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function NotepadContent() {
  return (
    <div
      style={{
        padding: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
      }}
    >
      {`The quick brown fox jumps over the lazy dog.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`}
    </div>
  );
}

function renderContent(_windowId: string, component: string) {
  switch (component) {
    case 'about-computer':
      return <AboutComputerContent />;
    case 'about':
      return <AboutMeContent />;
    case 'projects':
      return <ProjectsContent />;
    case 'skills':
      return <SkillsContent />;
    case 'terminal':
      return <Terminal />;
    case 'contact':
      return <ContactContent />;
    case 'file-explorer':
      return <FileExplorerContent />;
    case 'notepad':
      return <NotepadContent />;
    default:
      return <div style={{ padding: 16, fontSize: 12 }}>{component}</div>;
  }
}

export default function Home() {
  useKeyboardShortcuts();
  return (
    <div className="os-shell">
      <MenuBar />
      <main className="os-content">
        <Desktop />
        <WindowManager renderContent={renderContent} />
      </main>
      <Dock />
    </div>
  );
}
