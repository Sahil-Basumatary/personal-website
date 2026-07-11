# My Personal Website/portfolio

[sahilbzy.com](https://www.sahilbzy.com) is my portfolio rebuilt as a working Mac OS 9 desktop.

The idea came from my father's first work laptop and me secretly playing SimCity at the time, and the feeling that a computer used to be a place you explored is very nostalgic personally. I wanted to make the portfolio that made me and others relive the experience to my best abilities. There are windows to move, files to inspect, commands to run and a few things that are deliberately not explained so you, and I mean YOU have the chance to explore, the same as I did.

## What is in it

| Part                       | What it does                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Desktop and window manager | Draggable, resizable and stackable application windows with a menu bar, dock, context menus and keyboard shortcuts |
| Macintosh HD               | A navigable virtual filesystem containing my projects, skills and interest, writing and contact details            |
| Terminal                   | Filesystem commands, tab completion, command history, project shortcuts and a fun commands                         |
| Text Editor                | Opens portfolio files in a Monaco editor                                                                           |
| Code Playground            | Runs JavaScript and TypeScript in a sandboxed iframe and Python through Pyodide                                    |
| Browser                    | Opens external pages inside the desktop when those sites permit embedding                                          |
| Minesweeper                | A legendary game you can play                                                                                      |
| Contact                    | Validates and stores messages, sends email notifications through Resend and lets me reply from the private admin   |
| Admin                      | Owner-only content, messages and analytics area backed by Clerk, Neon and Drizzle                                  |
| Operations                 | Installable PWA, Sentry error monitoring, Vercel Speed Insights and a database-aware uptime check                  |

## How to explore it

Start by double-clicking **Macintosh HD**. The project folders contain a README, a structured tech stack and links where they exist. **About Me**, **Skills.json** and **Contact** are files on the same virtual drive.

If you prefer a keyboard, open **Terminal** and try:

```text
help
whoami
projects
skills
ls /Applications
open Code Playground
neofetch
```

The Code Playground starts in JavaScript, supports TypeScript, and downloads the Python runtime only when Python is selected and run for the first time. The Browser app act like a real iframe-based browser, which means sites such as GitHub that block framing will refuse to open inside it; use their external links instead.

There are also a few terminal commands, shortcuts and desktop interactions that are easier to find by experimenting. Short visual tutorials are in works.

## My Architecture decisions

### Security

The Content Security Policy was deployed in Report-Only mode before enforcement. I tested the desktop, Monaco, Pyodide, Clerk and Sentry against the production build, fixed the violations, then turned on blocking.

The final policy uses a fresh nonce and `strict-dynamic`. For this personal portfolio, I accepted the small caching tradeoff for a stronger script policy.

### Analytics

The site records page views and app launches in its own Postgres database. I use daily salted hash for visitor counting and not raw IP addresses. Vercel Speed Insights for Web Vitals, while Sentry handles errors and traces.

### Private Admin

There is no sign-up/sign-in element on the portfolio.

## Stack

- Next.js 16, React 19 and TypeScript
- Zustand for desktop and window state
- Monaco Editor and Pyodide for the playground
- Neon Postgres with Drizzle ORM
- Clerk for owner authentication
- Resend for contact notifications and replies
- Serwist for PWA/offline support
- Sentry, Vercel Speed Insights and UptimeRobot for production
- Vitest, Playwright, Storybook and axe tooling for verification

## Run it locally

Requirements:

- Node.js 22
- pnpm 10
- A Neon database for database-backed routes
- Clerk, Resend and Sentry credentials for their respective integrations

```bash
git clone https://github.com/Sahil-Basumatary/personal-website.git
cd personal-website
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Work with me

I’m interested in software engineering roles and open-source collaborations with like-minded students and professionals, especially in low-level systems, concurrency, and systems design. The quickest way to reach me is:

- Email: [sahil@sahilbasumatary.dev](mailto:sahil@sahilbasumatary.dev)
- GitHub: [Sahil-Basumatary](https://github.com/Sahil-Basumatary)
- Blog: [blog.sahilbzy.com](https://blog.sahilbzy.com)

You can also send a message through the **Contact** file on the desktop.

## Project and license

This repository is public so the implementation and engineering decisions can be inspected. I am not currently soliciting contributions.

The code is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). Noncommercial use is permitted under its terms; commercial use is not granted. Please read the license before copying, redistributing or building on the work.
