"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/chat/Sidebar";
import ChatNavbar from "@/components/chat/ChatNavbar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { cn } from "@/lib/utils";

const MOCK_CONVERSATIONS = [
  { id: "c1", title: "How does Framer Motion work?", time: "2h ago", group: "Today", model: "gpt-4o" },
  { id: "c2", title: "Explain React Server Components", time: "5h ago", group: "Today", model: "claude-3.5" },
  { id: "c3", title: "Build a Next.js chat app", time: "1d ago", group: "Yesterday", model: "gemini-pro" },
  { id: "c4", title: "Tailwind CSS tips & tricks", time: "3d ago", group: "Last 7 Days", model: "llama-3" },
  { id: "c5", title: "Deploy to Vercel production", time: "5d ago", group: "Last 7 Days", model: "mistral-large" },
  { id: "c6", title: "Migrate from TypeScript to JavaScript", time: "2w ago", group: "Older", model: "gpt-4o" },
  { id: "c7", title: "Optimizing Next.js build times", time: "1mo ago", group: "Older", model: "claude-3.5" },
  { id: "c8", title: "Best practices for React hooks", time: "2mo ago", group: "Older", model: "gemini-pro" },
];

const MOCK_MESSAGES = {
  c1: [
    { id: "m1", role: "user", content: "How does Framer Motion work?", model: null, timestamp: Date.now() - 3600000 },
    { id: "m2", role: "assistant", content: "Framer Motion is a production-ready animation library for React. It provides a simple declarative API for creating complex animations.\n\n**Key concepts:**\n- `motion` components - enhanced HTML/SVG elements\n- `animate` prop - defines target values\n- `initial`/`exit` - enter/exit animations\n- `transition` - controls timing/easing\n\n**Example:**\n```jsx\n<motion.div\n  initial={{ opacity: 0, y: 20 }}\n  animate={{ opacity: 1, y: 0 }}\n  transition={{ type: 'spring', stiffness: 300 }}\n>\n  Hello\n</motion.div>\n```", model: "GPT-4o", timestamp: Date.now() - 3500000 },
    { id: "m3", role: "user", content: "Can you show me a spring animation example?", model: null, timestamp: Date.now() - 3400000 },
    { id: "m4", role: "assistant", content: "Here's a spring animation with bounce:\n\n```jsx\n<motion.div\n  animate={{ scale: 1 }}\n  transition={{ type: 'spring', stiffness: 200, damping: 15 }}\n  whileHover={{ scale: 1.05 }}\n  whileTap={{ scale: 0.95 }}\n>\n  Hover me\n</motion.div>\n```\n\nThe `stiffness` and `damping` control the spring feel. Lower damping = more bounce!", model: "GPT-4o", timestamp: Date.now() - 3300000 },
  ],
  c2: [
    { id: "m1", role: "user", content: "Explain React Server Components", model: null, timestamp: Date.now() - 3600000 },
    { id: "m2", role: "assistant", content: "React Server Components (RSC) let you write components that run **only on the server**. They send serialized React elements (not HTML) to the client.\n\n**Benefits:**\n- Zero client-side JS for static content\n- Direct DB/data access in components\n- Smaller bundles\n- Better SEO\n\n**Example:**\n```jsx\n// Server Component (default in app/)\nasync function Post({ id }) {\n  const post = await db.posts.find(id);\n  return <article>{post.content}</article>;\n}\n```\n\nUse `'use client'` directive for interactive components.", model: "Claude 3.5 Sonnet", timestamp: Date.now() - 3500000 },
  ],
  c3: [
    { id: "m1", role: "user", content: "Build a Next.js chat app", model: null, timestamp: Date.now() - 3600000 },
    { id: "m2", role: "assistant", content: "Here's a minimal Next.js 14 chat setup:\n\n```jsx\n// app/page.js\n'use client';\nimport { useState } from 'react';\n\nexport default function Chat() {\n  const [messages, setMessages] = useState([]);\n  const [input, setInput] = useState('');\n  \n  const send = () => {\n    setMessages([...messages, { role: 'user', content: input }]);\n    setInput('');\n    // Simulate AI response\n    setTimeout(() => {\n      setMessages(m => [...m, { role: 'assistant', content: 'Hello!' }]);\n    }, 1000);\n  };\n  \n  return (\n    <div className='flex flex-col h-screen'>\n      <div className='flex-1 overflow-y-auto p-4'>\n        {messages.map((m, i) => (\n          <div key={i} className='mb-4'>{m.content}</div>\n        ))}\n      </div>\n      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} />\n    </div>\n  );\n}\n```", model: "Gemini Pro", timestamp: Date.now() - 3500000 },
  ],
};

const DEFAULT_MESSAGES = [
  { id: "welcome", role: "assistant", content: "Hello! I'm EchoGPT, your gateway to GPT-4o, Gemini, Claude, Llama, Mistral, and Grok. How can I help you today?", model: "EchoGPT", timestamp: Date.now() },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState("c1");
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find(c => c.id === activeConversationId);

  const loadConversation = useCallback((conversationId) => {
    const convo = MOCK_MESSAGES[conversationId] || DEFAULT_MESSAGES;
    setMessages(convo);
    setActiveConversationId(conversationId);
    setSidebarOpen(false);
  }, []);

  const handleNewChat = useCallback(() => {
    const newId = `c${Date.now()}`;
    const newConvo = {
      id: newId,
      title: "New chat",
      time: "Just now",
      group: "Today",
      model: selectedModel,
    };
    setConversations([newConvo, ...conversations]);
    setMessages(DEFAULT_MESSAGES);
    setActiveConversationId(newId);
    setSidebarOpen(false);
  }, [conversations, selectedModel]);

  const handleSend = useCallback((content) => {
    if (isLoading) return;
    
    const userMessage = {
      id: generateId(),
      role: "user",
      content,
      model: null,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const aiResponses = [
        "I understand. Let me help you with that.\n\nHere's a detailed response based on your question. **Framer Motion** makes it easy to create fluid animations in React with a simple declarative API.",
        "That's a great question! Let me break it down for you.\n\n**Key points:**\n- Server Components run on the server\n- Client Components run in the browser\n- Use `'use client'` for interactivity\n\n```jsx\n'use client';\nimport { useState } from 'react';\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n```",
        "Here's what you need to know:\n\n1. **Auto-resizing textarea** - Use `useRef` + `scrollHeight`\n2. **Character counter** - Track length in state\n3. **Keyboard handling** - Enter vs Shift+Enter\n\nThe implementation handles all edge cases including IME composition.",
        "I can help with that! Here's a practical approach:\n\n- Use `framer-motion` for animations\n- `AnimatePresence` for enter/exit\n- Spring transitions for natural feel\n\n```jsx\n<AnimatePresence>\n  {items.map(item => (\n    <motion.div\n      key={item.id}\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      exit={{ opacity: 0, y: -20 }}\n    >\n      {item.content}\n    </motion.div>\n  ))}\n</AnimatePresence>\n```",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: generateId(),
        role: "assistant",
        content: randomResponse,
        model: selectedModel === "gpt-4o" ? "GPT-4o" : 
               selectedModel === "gemini-pro" ? "Gemini Pro" :
               selectedModel === "claude-3.5" ? "Claude 3.5 Sonnet" :
               selectedModel === "llama-3" ? "Llama 3" : "Mistral Large",
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Update conversation title if it's "New chat"
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId && c.title === "New chat"
          ? { ...c, title: content.slice(0, 40) + (content.length > 40 ? "..." : "") }
          : c
      ));
    }, 1500);
  }, [isLoading, selectedModel, activeConversationId]);

  const handleStop = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handlePromptClick = useCallback((prompt) => {
    handleSend(prompt);
  }, [handleSend]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const handleModelChange = useCallback((modelId) => {
    setSelectedModel(modelId);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - Conversation History */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="sidebar-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "shrink-0 flex flex-col overflow-hidden border-r",
              "dark:bg-slate-900 light:bg-slate-50",
              "md:w-[280px]",
            )}
          >
            <Sidebar
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={loadConversation}
              onNewChat={handleNewChat}
              collapsed={false}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      {!sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-full flex-col overflow-y-auto md:hidden"
            style={{ backgroundColor: "var(--background)" }}
          >
            <Sidebar
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={loadConversation}
              onNewChat={handleNewChat}
              collapsed={false}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        <ChatNavbar
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          onNewChat={handleNewChat}
          onToggleSidebar={handleSidebarToggle}
          sidebarOpen={sidebarOpen}
          isLoading={isLoading}
        />
        
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onPromptClick={handlePromptClick}
        />
        
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          onStop={handleStop}
        />
      </main>
    </div>
  );
}