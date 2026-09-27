"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * A conversation entry shown in the history list.
 * @typedef {Object} Conversation
 * @property {string} id    - Unique conversation id.
 * @property {string} title - Conversation title (truncated in the list).
 * @property {string} time  - Relative timestamp, e.g. "2h ago".
 * @property {string} group - History group: Today | Yesterday | Last 7 Days | Older.
 */

/**
 * A user record for the bottom section.
 * @typedef {Object} User
 * @property {string} [avatar] - Optional avatar image URL.
 * @property {string} name     - Full name (initials fallback when no avatar).
 * @property {string} email    - Email shown under the name.
 */

const CONVERSATION_GROUPS = ["Today", "Yesterday", "Last 7 Days", "Older"];

const mockConversations = [
  { id: "c1", title: "How does Framer Motion work?", time: "2h ago", group: "Today" },
  { id: "c2", title: "Explain React Server Components", time: "5h ago", group: "Today" },
  { id: "c3", title: "Build a Next.js chat app", time: "1d ago", group: "Yesterday" },
  { id: "c4", title: "Tailwind CSS tips & tricks", time: "3d ago", group: "Last 7 Days" },
  { id: "c5", title: "Deploy to Vercel production", time: "5d ago", group: "Last 7 Days" },
  { id: "c6", title: "Migrate from TypeScript to JavaScript", time: "2w ago", group: "Older" },
  { id: "c7", title: "Optimizing Next.js build times", time: "1mo ago", group: "Older" },
];

const defaultUser = { avatar: "", name: "Dipu Ahmed", email: "dipu@ecogpt.app" };

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 64;

const listItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

const actionButton =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

const gradientButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-white hover:from-sky-600 hover:to-cyan-500";

const collapsedIconBtn =
  "mx-auto mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

function Avatar({ src, name, className }) {
  const initials =
    (name || "U")
      .split(" ")
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("") || "?";

  if (src) {
    return (
      <div
        aria-label={name}
        className={cn(
          "h-8 w-8 shrink-0 rounded-full bg-center bg-cover bg-no-repeat",
          className,
        )}
        style={{ backgroundImage: `url(${src})` }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        "bg-sky-500/15 text-xs font-semibold text-sky-600",
        className,
      )}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
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
      title="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-medium",
        "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        {mounted && theme === "dark" ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: reduced ? 0 : -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: reduced ? 0 : 90 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <MoonIcon className="h-5 w-5" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: reduced ? 0 : 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: reduced ? 0 : -90 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            <SunIcon className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function NewChatButton({ collapsed, onNewChat }) {
  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="New chat"
        title="New chat"
        onClick={onNewChat}
        className={cn(
          "mx-auto mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          "bg-gradient-to-r from-sky-500 to-cyan-500",
        )}
      >
        <PlusIcon className="h-5 w-5 text-white" />
      </button>
    );
  }

  return (
    <button type="button" onClick={onNewChat} className={gradientButton}>
      <PlusIcon className="h-4 w-4" />
      <span>New chat</span>
    </button>
  );
}

function SearchBar({ search, onChange, collapsed, onExpand }) {
  const inputRef = useRef(null);
  const focusRequestedRef = useRef(false);

  useEffect(() => {
    if (!collapsed && focusRequestedRef.current && inputRef.current) {
      inputRef.current.focus();
      focusRequestedRef.current = false;
    }
  }, [collapsed]);

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (event.key === "/" && inputRef.current !== null) {
        event.preventDefault();
        onExpand();
        focusRequestedRef.current = true;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onExpand]);

  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="Search conversations"
        title="Search conversations"
        onClick={onExpand}
        className={cn(
          "mx-auto mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          "text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="mx-3 mb-3 relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={search}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search conversations"
        className={cn(
          "w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none",
          "placeholder:text-muted-foreground focus:ring-2 focus:ring-sky-500/20",
        )}
      />
    </div>
  );
}

function ConversationItem({
  conversation,
  active,
  hoveredId,
  setHoveredId,
  onSelect,
  onEdit,
  onDelete,
  collapsed,
}) {
  const reduceMotion = useReducedMotion();
  const isHovered = hoveredId === conversation.id;

  if (collapsed) {
    return (
      <button
        type="button"
        aria-label={conversation.title}
        title={conversation.title}
        onClick={() => onSelect(conversation)}
        className={cn(
          collapsedIconBtn,
          active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <ChatIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group mx-3 mb-1 flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium",
        active
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
      )}
      onMouseEnter={() => setHoveredId(conversation.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => onSelect(conversation)}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <ChatIcon className="h-5 w-5 shrink-0" />
        <span className="block w-full min-w-0 truncate" title={conversation.title}>
          {conversation.title}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{conversation.time}</span>
        <AnimatePresence>
          {isHovered && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: reduceMotion ? 0 : 0.12 }}
              className="flex items-center gap-1"
            >
              <button
                type="button"
                aria-label="Rename conversation"
                title="Rename"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(conversation);
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete conversation"
                title="Delete"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(conversation);
                }}
                className="rounded p-1 text-muted-foreground hover:text-red-500"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  activeId,
  hoveredId,
  setHoveredId,
  onSelect,
  onEdit,
  onDelete,
  collapsed,
}) {
  const grouped = CONVERSATION_GROUPS.map((group) => [
    group,
    conversations.filter((c) => c.group === group),
  ]);

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <SearchIcon className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No conversations found.</p>
      </div>
    );
  }

  return (
    <nav className="overflow-y-auto px-1">
      {grouped.map(([group, items]) => {
        if (!items.length) {
          return null;
        }
        return (
          <div key={group}>
            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {group}
            </p>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.04, delayChildren: 0.06 },
                },
              }}
              className="pb-2"
            >
              {items.map((conversation) => (
                <motion.li
                  key={conversation.id}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <ConversationItem
                    conversation={conversation}
                    active={activeId === conversation.id}
                    hoveredId={hoveredId}
                    setHoveredId={setHoveredId}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    collapsed={collapsed}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        );
      })}
    </nav>
  );
}

function BottomSection({ user, collapsed, onProfile, onSettings, onUpgrade }) {
  if (collapsed) {
    return (
      <div className="shrink-0 border-t p-3">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl">
            <Avatar src={user.avatar} name={user.name} />
          </div>
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={onSettings}
            className={cn("h-9 w-9 rounded-md", actionButton)}
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Upgrade to Pro"
            title="Upgrade to Pro"
            onClick={onUpgrade}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              "bg-gradient-to-r from-amber-400 to-orange-500",
            )}
          >
            <RocketIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t p-3">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          aria-label="User profile"
          onClick={onProfile}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Avatar src={user.avatar} name={user.name} />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </button>

        <button
          type="button"
          aria-label="Settings"
          onClick={onSettings}
          className={cn(actionButton, "justify-start")}
        >
          <SettingsIcon className="h-5 w-5" />
          <span>Settings</span>
        </button>

        <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium">
          <span>Dark mode</span>
          <ThemeToggle />
        </div>

        <button
          type="button"
          aria-label="Upgrade to Pro"
          onClick={onUpgrade}
          className={cn(
            "mt-1 flex items-center justify-center gap-2 rounded-xl",
            "bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-sm font-semibold text-white",
            "hover:from-amber-300 hover:to-orange-400",
          )}
        >
          <RocketIcon className="h-4 w-4" />
          <span>Upgrade to Pro</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Conversations sidebar for the EchoGPT chat interface.
 *
 * @param {Object} props
 * @param {boolean} [props.collapsed=false] - Whether the sidebar is collapsed to icon-only.
 * @param {() => void} [props.onToggleCollapse] - Toggles collapsed state.
 * @param {Conversation[]} [props.conversations] - Conversations to list.
 * @param {string} [props.activeId] - Active conversation id (highlighted).
 * @param {(conversation: Conversation) => void} [props.onSelect] - Selects a conversation.
 * @param {(conversation: Conversation) => void} [props.onEdit] - Edits a conversation.
 * @param {(conversation: Conversation) => void} [props.onDelete] - Deletes a conversation.
 * @param {() => void} [props.onNewChat] - Creates a new chat.
 * @param {User} [props.user] - User shown in the bottom section.
 * @param {() => void} [props.onProfile]
 * @param {() => void} [props.onSettings]
 * @param {() => void} [props.onUpgrade] - Upgrades to Pro.
 */
export default function Sidebar({
  collapsed = false,
  onToggleCollapse = () => {},
  conversations = mockConversations,
  activeId = "c1",
  onSelect = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onNewChat = () => {},
  user = defaultUser,
  onProfile = () => {},
  onSettings = () => {},
  onUpgrade = () => {},
} = {}) {
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(conversations);
  const [hoveredId, setHoveredId] = useState(null);
  const reduceMotion = useReducedMotion();
  const sidebarTransition = reduceMotion
    ? { duration: 0 }
    : { type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] };

  useEffect(() => {
    const query = search.trim().toLowerCase();
    setFiltered(
      query
        ? conversations.filter(
            (c) =>
              c.title.toLowerCase().includes(query) ||
              c.group.toLowerCase().includes(query),
          )
        : conversations,
    );
  }, [search, conversations]);

  const toggleSidebar = () => onToggleCollapse();

  return (
    <motion.nav
      id="sidebar"
      aria-label="Conversations"
      className={cn(
        "hidden h-screen shrink-0 flex-col overflow-hidden border-r",
        "md:flex md:flex-col",
        "dark:bg-slate-900 light:bg-slate-50",
      )}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={sidebarTransition}
    >
      {/* Top area */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
            <BotIcon className="h-5 w-5 text-sky-500" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="text-lg font-semibold"
              >
                EchoGPT
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebar}
          className={cn(
            actionButton,
            "mx-3 mb-1 justify-between",
            collapsed && "rotate-180",
          )}
        >
          <ChevronIcon className="h-5 w-5 shrink-0 transition-transform" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="px-3 pb-2">
          <NewChatButton collapsed={collapsed} onNewChat={onNewChat} />
        </div>
      </div>

      {/* Middle area (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <SearchBar
          search={search}
          onChange={setSearch}
          collapsed={collapsed}
          onExpand={toggleSidebar}
        />
        <ConversationList
          conversations={filtered}
          activeId={activeId}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          collapsed={collapsed}
        />
      </div>

      {/* Bottom area (fixed) */}
      <BottomSection
        user={user}
        collapsed={collapsed}
        onProfile={onProfile}
        onSettings={onSettings}
        onUpgrade={onUpgrade}
      />
    </motion.nav>
  );
}

function BotIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8V4h8v4" />
      <path d="M6 10h12" />
      <path d="M6 14h12" />
      <path d="M9 18h6" />
      <path d="M9 22h6" />
      <path d="M4 6h16" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 19 9 12 15 5" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <line x1="15" y1="15" x2="21" y2="21" />
    </svg>
  );
}

function ChatIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PencilIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19h9" />
      <path d="M17 2a2.85 2.85 0 1 1 4 4L8 19l-5 1 1-5z" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M5 6l1 14a2 2 0 0 1 2 2h8a2 2 0 0 1 2-2l1-14" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 10v6" />
      <path d="M4.22 4.22 8.46 8.46" />
      <path d="M15.54 15.54 19.78 19.78" />
      <path d="M1 12h6m10 0h6" />
    </svg>
  );
}

function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <line x1="1" y1="1" x2="3" y2="3" />
      <line x1="21" y1="21" x2="23" y2="23" />
    </svg>
  );
}

function RocketIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l1.9 5.4h5.1l-4 2.9 1.5 4.8L12 14.8l-4.5 2.9 1.5-4.8-4-2.9h5.1z" />
      <path d="M5 16c2-2 4-3 7-3s5 1 7 3" />
      <path d="M12 20v4" />
      <path d="M9 22h6" />
    </svg>
  );
}
