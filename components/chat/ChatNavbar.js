"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "claude-3.5", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "llama-3", name: "Llama 3", provider: "Meta" },
  { id: "mistral-large", name: "Mistral Large", provider: "Mistral" },
];

function ModelSelector({ selectedModel, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  return (
    <div className="relative" ref={triggerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all",
          "border border-slate-200 dark:border-slate-700",
          "bg-white dark:bg-slate-800",
          "hover:bg-slate-50 dark:hover:bg-slate-700",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        aria-label="Select model"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-sky-500">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M8 9h8" />
            <path d="M8 13h8" />
            <path d="M8 17h4" />
          </svg>
        </span>
        <span className="hidden sm:inline-block max-w-[140px] truncate">{selected.name}</span>
        <svg className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && mounted && (
          <motion.div
            key="model-menu"
            ref={menuRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden py-1"
            role="listbox"
            aria-label="Select AI model"
          >
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => { onSelect(model.id); setOpen(false); }}
                disabled={disabled}
                role="option"
                aria-selected={selectedModel === model.id}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors",
                  "hover:bg-slate-100 dark:hover:bg-slate-700",
                  selectedModel === model.id && "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
                )}
              >
                <span className="flex-1 text-left font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.provider}</span>
                {selectedModel === model.id && (
                  <svg className="h-4 w-4 shrink-0 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-xl p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {mounted ? (
        <AnimatePresence initial={false} mode="wait">
          {theme === "dark" ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: reduced ? 0 : -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: reduced ? 0 : 90 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 21 12.79z" />
                <line x1="1" y1="1" x2="3" y2="3" />
                <line x1="21" y1="21" x2="23" y2="23" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: reduced ? 0 : 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: reduced ? 0 : -90 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
        </svg>
      )}
    </button>
  );
}

function NewChatButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-white transition-all",
        "bg-gradient-to-r from-sky-500 to-cyan-500",
        "hover:from-sky-600 hover:to-cyan-600",
        "shadow-lg shadow-sky-500/25",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      aria-label="New chat"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span className="hidden sm:inline">New chat</span>
    </button>
  );
}

export default function ChatNavbar({
  selectedModel,
  onModelChange,
  onNewChat,
  onToggleSidebar,
  sidebarOpen,
  isLoading,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-3 dark:bg-slate-900/40 light:bg-slate-50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          onClick={onToggleSidebar}
          className="rounded-xl p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors md:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ModelSelector
          selectedModel={selectedModel}
          onSelect={onModelChange}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <NewChatButton onClick={onNewChat} disabled={isLoading} />
        <ThemeToggle />
      </div>
    </header>
  );
}