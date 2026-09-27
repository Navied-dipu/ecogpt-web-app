"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const modelColors = {
  "gpt-4o": "bg-purple-500",
  "gpt-4": "bg-purple-600",
  "gemini": "bg-green-500",
  "claude": "bg-orange-500",
  "llama": "bg-blue-500",
  "mistral": "bg-pink-500",
  "grok": "bg-amber-500",
  "default": "bg-sky-500",
};

function getModelColor(model) {
  if (!model) return modelColors.default;
  const lower = model.toLowerCase();
  for (const [key, color] of Object.entries(modelColors)) {
    if (lower.includes(key)) return color;
  }
  return modelColors.default;
}

function getModelInitial(model) {
  if (!model) return "?";
  const lower = model.toLowerCase();
  if (lower.includes("gpt")) return "G";
  if (lower.includes("gemini")) return "G";
  if (lower.includes("claude")) return "C";
  if (lower.includes("llama")) return "L";
  if (lower.includes("mistral")) return "M";
  if (lower.includes("grok")) return "G";
  return model.charAt(0).toUpperCase();
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function parseMarkdown(content) {
  if (!content) return [];

  const parts = [];
  let remaining = content;
  let lastIndex = 0;

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: remaining.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "codeBlock",
      language: match[1] || "",
      code: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push({ type: "text", content: remaining.slice(lastIndex) });
  }

  return parts;
}

function parseInlineMarkdown(text) {
  if (!text) return [];

  const parts = [];
  let remaining = text;
  let lastIndex = 0;

  const inlineCodeRegex = /`([^`]+)`/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;

  const matches = [];

  let match;
  while ((match = inlineCodeRegex.exec(text)) !== null) {
    matches.push({ type: "inlineCode", index: match.index, length: match[0].length, content: match[1] });
  }
  while ((match = boldRegex.exec(text)) !== null) {
    matches.push({ type: "bold", index: match.index, length: match[0].length, content: match[1] });
  }

  matches.sort((a, b) => a.index - b.index);

  for (const match of matches) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: match.type, content: match.content });
    lastIndex = match.index + match.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

function RenderMarkdown({ content }) {
  const blocks = parseMarkdown(content);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        if (block.type === "codeBlock") {
          return (
            <CodeBlock
              key={index}
              code={block.code}
              language={block.language}
            />
          );
        }
        return (
          <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed">
            {parseInlineMarkdown(block.content).map((part, i) => {
              if (part.type === "bold") {
                return <strong key={i} className="font-semibold">{part.content}</strong>;
              }
              if (part.type === "inlineCode") {
                return (
                  <code
                    key={i}
                    className="rounded px-1 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400"
                  >
                    {part.content}
                  </code>
                );
              }
              return <span key={i}>{part.content}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <div className="relative group my-2 overflow-hidden rounded-xl bg-slate-900 border border-slate-700">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800/50">
        <span className="text-xs text-slate-400 font-mono">{language || "plaintext"}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm"><code className="font-mono text-slate-100">{code}</code></pre>
    </div>
  );
}

function UserAvatar({ className }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-purple-500 to-blue-500",
        className,
      )}
      aria-label="User"
    >
      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function ModelAvatar({ model, className }) {
  const colorClass = getModelColor(model);
  const initial = getModelInitial(model);

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        colorClass,
        className,
      )}
      aria-label={`Model: ${model || "AI"}`}
    >
      <span className="text-white text-xs font-bold">{initial}</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <ModelAvatar model="default" />
      <div className="flex gap-1 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
        <motion.span
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.span
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const messageTransition = { type: "spring", stiffness: 300, damping: 30 };

function UserMessage({ message, index }) {
  return (
    <motion.div
      key={message.id}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={messageVariants}
      transition={messageTransition}
      className="flex flex-col items-end gap-1.5"
    >
      <div className="flex max-w-[85%] items-end gap-2">
        <motion.div
          className="relative rounded-2xl px-4 py-2.5 bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 25 }}
        >
          <RenderMarkdown content={message.content} />
        </motion.div>
        <UserAvatar />
      </div>
      <div className="w-8" />
      <div className="pr-2 text-[10px] text-muted-foreground">
        {formatTimestamp(message.timestamp)}
      </div>
    </motion.div>
  );
}

function AssistantMessage({ message, index }) {
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
    <motion.div
      key={message.id}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={messageVariants}
      transition={messageTransition}
      className="flex flex-col items-start gap-1.5 group"
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <div className="flex max-w-[85%] items-start gap-2">
        <ModelAvatar model={message.model} />
        <motion.div
          className="relative rounded-2xl px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 25 }}
        >
          {message.model && (
            <div className="mb-1.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              {message.model}
            </div>
          )}
          <RenderMarkdown content={message.content} />
          <button
            onClick={handleCopy}
            className={cn(
              "absolute right-2 top-2 rounded px-2 py-0.5 text-[10px] font-medium transition-all duration-200",
              "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
              "hover:bg-slate-200 dark:hover:bg-slate-600",
              "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto",
              showCopy && "opacity-100 pointer-events-auto",
              copied && "bg-sky-500 text-white",
            )}
            aria-label="Copy message"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </motion.div>
      </div>
      <div className="w-8" />
      <div className="pl-2 text-[10px] text-muted-foreground">
        {formatTimestamp(message.timestamp)}
      </div>
    </motion.div>
  );
}

const quickPrompts = [
  "Summarize a webpage",
  "Explain a concept",
  "Write some code",
  "Compare AI models",
];

function EmptyState({ onPromptClick }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500">
        <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 8V4h8v4" />
          <path d="M6 10h12" />
          <path d="M6 14h12" />
          <path d="M9 18h6" />
          <path d="M9 22h6" />
          <path d="M4 6h16" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">How can I help you today?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Select a suggestion or start typing below</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium transition-all hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScrollToBottom({ onClick, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-bottom"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onClick}
          className="fixed bottom-20 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          aria-label="Scroll to bottom"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function ChatMessages({ messages = [], isLoading = false, onPromptClick }) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isNearBottom && scrollTop > 50);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div className="mx-auto max-w-[720px] space-y-4">
        {messages.length === 0 && !isLoading ? (
          <EmptyState onPromptClick={onPromptClick} />
        ) : (
          <>
            <AnimatePresence>
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <UserMessage key={message.id} message={message} index={index} />
                ) : (
                  <AssistantMessage key={message.id} message={message} index={index} />
                )
              )}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <ScrollToBottom onClick={scrollToBottom} visible={showScrollButton} />
    </div>
  );
}