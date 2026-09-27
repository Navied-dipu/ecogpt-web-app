import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata = {
  title: "EchoGPT — Chat with every AI in one place",
  description:
    "EchoGPT brings GPT-4o, Gemini Pro, Claude 3.5, Llama 3, Mistral and Grok into one interface. Chat, summarize and explain on the web and in your browser.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
