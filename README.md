# EchoGPT Web App

A redesign of the EchoGPT web app — a chat interface that unifies GPT-4o, Gemini, Claude, Llama, Mistral, and Grok.

**Live Demo:** https://ecogpt-web-app.vercel.app/

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Framer Motion** using plain JavaScript (no TypeScript).

## Features

- **Multi-model chat**: Switch between GPT-4o, Gemini Pro, Claude 3.5 Sonnet, Llama 3, Mistral Large
- **Responsive layout**: Sidebar + chat area side-by-side on desktop; drawer overlay on mobile (<768px)
- **Real-time interactions**:
  - Auto-resizing textarea (1-6 rows)
  - Markdown rendering (bold, inline code, code blocks with copy button)
  - Typing indicator with bouncing dots animation
  - Message entrance animations (slide up + fade in)
  - Scroll-to-bottom floating button
  - Character counter (4000 limit)
  - Emoji picker (20 common emojis)
  - File attach, web context toggle
- **Conversation history**: 8 mock conversations with timestamps, grouped by date
- **Dark mode**: System-aware theme with manual toggle
- **Keyboard shortcuts**: Enter to send, Shift+Enter for newline, Escape to clear

## Chat Layout

The main layout lives in `app/(chat)/layout.js` and is backed by components in `components/chat/`:

- **Sidebar** (`Sidebar.js`) — Conversation history with groups (Today, Yesterday, Last 7 Days, Older), search, new chat, user profile
- **ChatNavbar** (`ChatNavbar.js`) — Model selector dropdown, theme toggle, new chat button, mobile sidebar toggle
- **ChatMessages** (`ChatMessages.js`) — Scrollable message list with markdown rendering, typing indicator, empty state with quick suggestions
- **ChatInput** (`ChatInput.js`) — Floating input bar with auto-resize, icons, char counter, send/stop states

Layout state (sidebar open/closed, mobile drawer) managed via React Context + `useState`.

## Scripts

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Tech Stack

- **Next.js 14.2.35** (App Router, static export)
- **React 18** (hooks, context)
- **Tailwind CSS 3.4** (utility-first styling, dark mode)
- **Framer Motion 11.18** (animations, AnimatePresence)
- **next-themes 0.3** (theme management)
- **clsx + tailwind-merge** (className utilities)