"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const SidebarContext = createContext(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const toggleCollapse = () => setCollapsed((value) => !value);
  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);
  const toggleInfo = () => setInfoOpen((value) => !value);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        mobileOpen,
        infoOpen,
        toggleCollapse,
        openMobile,
        closeMobile,
        toggleInfo,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 60;
const DRAWER_WIDTH = 260;
const INFO_PANEL_WIDTH = 280;

const navItems = [
  { name: "New chat", icon: PlusIcon },
  { name: "Chats", icon: ChatsIcon },
  { name: "Models", icon: ModelsIcon },
  { name: "Settings", icon: SettingsIcon },
];

function Logo({ collapsed }) {
  return (
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
            transition={{ duration: 0.18 }}
            className="text-lg font-semibold"
          >
            EchoGPT
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ item, collapsed }) {
  const { name, icon: Icon } = item;
  const href = `/${name.toLowerCase().replace(/\s/g, "")}`;
  return (
    <li>
      <a
        href={href}
        className={cn(
          "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16 }}
            >
              {name}
            </motion.span>
          )}
        </AnimatePresence>
      </a>
    </li>
  );
}

function DesktopSidebar() {
  const { collapsed, toggleCollapse } = useSidebar();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "tween", duration: 0.22, ease: [0.22, 1, 0.36, 1] };

  return (
    <motion.nav
      aria-label="Main navigation"
      className={cn(
        "hidden h-screen shrink-0 flex-col overflow-hidden border-r",
        "md:flex md:flex-col",
        "dark:bg-slate-900 light:bg-slate-50",
      )}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={transition}
    >
      <Logo collapsed={collapsed} />
      <ul className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} collapsed={collapsed} />
        ))}
      </ul>
      <div className="border-t p-3">
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            "transition-colors hover:bg-accent hover:text-accent-foreground",
            collapsed ? "justify-center" : "justify-start",
          )}
        >
          <ChevronIcon
            className={cn(
              "h-5 w-5 shrink-0 transition-transform",
              collapsed && "rotate-180",
            )}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.nav>
  );
}

const drawerVariants = {
  hidden: { x: -DRAWER_WIDTH },
  visible: { x: 0 },
  exit: { x: -DRAWER_WIDTH },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

function MobileSidebar() {
  const { mobileOpen, closeMobile } = useSidebar();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            onClick={closeMobile}
            className="absolute inset-0 z-30 bg-black/50 md:hidden"
            aria-hidden="true"
          />
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className={cn(
              "absolute inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto",
              "dark:bg-slate-900 light:bg-slate-50",
            )}
          >
            <MobileSidebarContent />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileSidebarContent() {
  const { closeMobile } = useSidebar();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <BotIcon className="h-5 w-5 text-sky-500" />
          <span className="text-lg font-semibold">EchoGPT</span>
        </div>
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close menu"
          className="rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      <ul className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <a
              href={`/${item.name.toLowerCase().replace(/\s/g, "")}`}
              onClick={closeMobile}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {<item.icon className="h-5 w-5 shrink-0" />}
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatHeader() {
  const { openMobile, toggleCollapse, toggleInfo, infoOpen } = useSidebar();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-3 dark:bg-slate-900/40 light:bg-slate-50">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          onClick={openMobile}
          className="rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground md:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={toggleCollapse}
          className="hidden rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground md:inline-flex"
        >
          <ChevronIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Toggle info panel"
          onClick={toggleInfo}
          className={cn(
            "rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            infoOpen && "bg-accent text-accent-foreground",
          )}
        >
          <InfoIcon className="h-5 w-5" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="rounded-md p-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
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
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
}

function ChatMessages({ children }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-[720px] space-y-6">{children}</div>
    </div>
  );
}

function ChatInput() {
  return (
    <div className="shrink-0 border-t p-3 dark:bg-slate-900/40 light:bg-slate-50">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            placeholder="Ask EchoGPT anything..."
            className={cn(
              "flex-1 resize-none rounded-lg border border-input bg-background",
              "px-3.5 py-2 text-sm outline-none placeholder:text-muted-foreground",
              "focus-within:ring-2 focus-within:ring-sky-500/20",
            )}
          />
          <button
            type="button"
            className={cn(
              "shrink-0 rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white",
              "transition-opacity hover:bg-sky-600",
            )}
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const infoPanelVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: INFO_PANEL_WIDTH, opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

function InfoPanel() {
  const { infoOpen, toggleInfo } = useSidebar();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence>
      {infoOpen && (
        <motion.aside
          key="info"
          variants={infoPanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
          className={cn(
            "shrink-0 overflow-hidden border-l",
            "dark:bg-slate-900 light:bg-slate-50",
          )}
        >
          <div className="flex h-full w-[280px] flex-col p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Chat info</h2>
              <button
                type="button"
                onClick={toggleInfo}
                aria-label="Close info panel"
                className="rounded-md p-1 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p>
                This panel is hidden by default. It can hold model details,
                sources, or context metadata.
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <MobileSidebar />
        <DesktopSidebar />

        <main className="flex flex-1 flex-col overflow-hidden dark:bg-slate-800 light:bg-white">
          <ChatHeader />
          <ChatMessages>{children}</ChatMessages>
          <ChatInput />
        </main>

        <InfoPanel />
      </div>
    </SidebarProvider>
  );
}

function MenuIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 19 9 12 15 5" />
    </svg>
  );
}

function BotIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 8V4h8v4" />
      <path d="M6 10h12" />
      <path d="M6 14h12" />
      <path d="M9 18h6" />
      <path d="M9 22h6" />
      <path d="M4 6h16" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChatsIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ModelsIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h4" />
    </svg>
  );
}

function SettingsIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 10v6" />
      <path d="M4.22 4.22 8.46 8.46" />
      <path d="M15.54 15.54 19.78 19.78" />
      <path d="M1 12h6m10 0h6" />
    </svg>
  );
}

function InfoIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 12 22 2 2" />
    </svg>
  );
}

function SunIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <line x1="1" y1="1" x2="3" y2="3" />
      <line x1="21" y1="21" x2="23" y2="23" />
    </svg>
  );
}
