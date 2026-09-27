# EchoGPT Web App

A redesign of the EchoGPT web app — a chat interface that unifies GPT-4o, Gemini, Claude, Llama, Mistral, and Grok.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Framer Motion** using plain JavaScript.

## Chat layout shell

The main layout lives in `app/(chat)/layout.js` and is backed by `components/chat/AppLayout.js`. It provides a responsive three-panel shell:

- **Left — Sidebar** (260px expanded, 60px icon-only when collapsed) with a Framer Motion width animation. On mobile it becomes a slide-over drawer with a backdrop; a hamburger in the header opens it.
- **Center — Chat area** (flex-1) with a fixed header, an internally scrollable messages region, and an input bar.
- **Right — Info panel** (optional, hidden by default) toggled from the header.

Layout state (collapsed / mobile open / info open) is shared through a React `createContext` + `useState` exposed via a `useSidebar()` hook.

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```
