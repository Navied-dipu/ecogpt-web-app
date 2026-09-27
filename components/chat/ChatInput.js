"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const EMOJIS = [
  "😀", "😂", "😍", "😎", "😭",
  "😊", "🤔", "😴", "😡", "😱",
  "👍", "👎", "❤️", "🔥", "✨",
  "🎉", "💯", "🚀", "💡", "🤖",
];

const MAX_CHARS = 4000;
const MAX_ROWS = 6;

export default function ChatInput({ onSend, isLoading = false, onStop, defaultValue = "" }) {
  const [value, setValue] = useState(defaultValue);
  const [rows, setRows] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isWebContextOn, setIsWebContextOn] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (defaultValue && defaultValue !== value) {
      setValue(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop, 10) || 12;
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom, 10) || 12;
    const newHeight = Math.min(textarea.scrollHeight, lineHeight * MAX_ROWS + paddingTop + paddingBottom);
    const newRows = Math.min(Math.max(Math.ceil((textarea.scrollHeight - paddingTop - paddingBottom) / lineHeight), 1), MAX_ROWS);
    
    textarea.style.height = `${newHeight}px`;
    setRows(newRows);
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARS) {
      setValue(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setValue("");
      textareaRef.current?.focus();
    } else if (e.key === "Enter" && !e.shiftKey && !isLoading && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    handleChange(e);
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && !isLoading && onSend) {
      onSend(trimmed);
      setValue("");
      setShowEmojiPicker(false);
    }
  };

  const handleStop = () => {
    if (onStop) onStop();
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.slice(0, start) + emoji + value.slice(end);
    
    if (newValue.length <= MAX_CHARS) {
      setValue(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
    }
    e.target.value = "";
  };

  const handleClickOutside = (e) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const charCount = value.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isAtLimit = charCount >= MAX_CHARS;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="shrink-0"
    >
      <div className="mx-auto max-w-[720px]">
        <div className="relative">
          <div
            className={cn(
              "rounded-2xl border bg-white dark:bg-slate-900 shadow-xl",
              "border-slate-200 dark:border-slate-700",
              "transition-all duration-200",
              isLoading && "ring-2 ring-sky-500/30",
            )}
          >
            <div className="flex items-end gap-1 p-3">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handleFileClick}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Attach file"
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21.44 11.05a1 1 0 0 0-1.41-1.41L12 18.17 7.55 13.72a1 1 0 0 0-1.41 1.41l5 5a1 1 0 0 0 1.41 0l7-7a1 1 0 0 0 0-1.41z" />
                    <path d="M14 6v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setIsWebContextOn(!isWebContextOn)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all",
                    isWebContextOn
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                  aria-label={isWebContextOn ? "Disable web context" : "Enable web context"}
                  aria-pressed={isWebContextOn}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Emoji picker"
                    disabled={isLoading}
                  >
                    😊
                  </button>

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        key="emoji-picker"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        ref={emojiPickerRef}
                        className="absolute bottom-full left-0 mb-2 hidden p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg sm:flex"
                      >
                        <div className="grid grid-cols-7 gap-1">
                          {EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => insertEmoji(emoji)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              aria-label={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder="Ask EchoGPT anything..."
                rows={rows}
                className={cn(
                  "flex-1 min-h-[44px] max-h-[200px] resize-none rounded-xl border-0 bg-transparent",
                  "px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
                  "outline-none focus:ring-0",
                  "scrollbar-hide",
                )}
                disabled={isLoading}
                aria-label="Message input"
              />

              <div className="flex items-center gap-2 pr-1">
                <span className={cn(
                  "text-[11px] font-mono tabular-nums transition-colors",
                  isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-muted-foreground",
                )}>
                  {charCount} / {MAX_CHARS}
                </span>

                <AnimatePresence mode="wait">
                  {!isLoading ? (
                    <motion.button
                      key="send"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      type="button"
                      onClick={handleSubmit}
                      disabled={!value.trim() || isLoading}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                        value.trim()
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/25"
                          : "text-slate-400 cursor-not-allowed hover:bg-transparent",
                      )}
                      aria-label="Send message"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 12 22 2 2" />
                      </svg>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="stop"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      type="button"
                      onClick={handleStop}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                      aria-label="Stop generation"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground">
            <span>Press Enter to send · Shift+Enter for new line</span>
            <span>EchoGPT can make mistakes. Verify important info.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}