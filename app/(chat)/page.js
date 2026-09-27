const messages = [
  {
    type: "bot",
    text: "Hello! I'm EchoGPT, your gateway to GPT-4o, Gemini, Claude, Llama, and more. How can I help you today?",
  },
  { type: "user", text: "What models can you use?" },
  {
    type: "bot",
    text: "I connect to GPT-4o, Gemini 2.5 Pro, Claude 3.5 Sonnet, Llama 3.3, Mistral Large, and Grok 3. You can switch models per-conversation from the sidebar.",
  },
  { type: "user", text: "Summarize the difference between them." },
  {
    type: "bot",
    text: "GPT-4o excels at reasoning and coding, Gemini is strong at multimodal tasks, Claude handles long documents well, Llama 3 is open and fast, Mistral is lightweight, and Grok integrates real-time X data. Each has strengths — pick based on your task.",
  },
  { type: "user", text: "Cool, thanks! What about pricing?" },
  {
    type: "bot",
    text: "We offer a free tier with limited chats, plus Pro, Team, and Enterprise plans. Full details are in the Settings > Subscription panel. Anything else I can clarify?",
  },
  { type: "user", text: "No, that's everything. One more — can you cite sources?" },
  {
    type: "bot",
    text: "Yes. Enable the info panel from the header to see retrieved sources, model details, and context metadata for each response.",
  },
];

export default function ChatPage() {
  return messages.map((message, index) => (
    <MessageBubble key={index} type={message.type} message={message.text} />
  ));
}

function MessageBubble({ type, message }) {
  const isBot = type === "bot";
  return (
    <div className="flex gap-3">
      <div
        className={
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
          (isBot ? "bg-sky-500/15" : "bg-slate-300 dark:bg-slate-700")
        }
      >
        {isBot ? <BotIcon /> : <UserIcon />}
      </div>
      <div
        className={
          "rounded-xl px-4 py-2.5 text-sm " +
          (isBot
            ? "dark:bg-slate-700 light:bg-slate-100"
            : "bg-sky-500 text-white")
        }
      >
        {message}
      </div>
    </div>
  );
}

function BotIcon() {
  return (
    <svg
      className="h-4 w-4 text-sky-500"
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

function UserIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
