"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

function cleanContent(text: string): string {
  return text.replace(/<lead_data>[\s\S]*?<\/lead_data>/g, "").trim();
}

const DOTS = (
  <span className="flex gap-1 items-center py-0.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="block rounded-full"
        style={{
          width: 5, height: 5,
          background: "var(--ink-muted)",
          animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes dotBounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-4px); opacity: 1; }
      }
    `}</style>
  </span>
);

const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;
const GADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL;

export default function Chatbot({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const chatStartedFired = useRef(false);

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      // chat_opened event
      window.gtag?.("event", "chat_opened", { event_category: "Parker Chatbot" });
      window.fbq?.("track", "ViewContent", { content_name: "Parker Chat" });
      sendMessage("", true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (userText: string, isWelcome = false) => {
    const newMessages: Message[] = isWelcome
      ? []
      : [...messages, { role: "user" as const, content: userText }];

    if (!isWelcome) {
      setMessages(newMessages);
      setInput("");
      // chat_started event — fire only on the first real user message
      if (!chatStartedFired.current) {
        chatStartedFired.current = true;
        window.gtag?.("event", "chat_started", { event_category: "Parker Chatbot" });
      }
    }
    setLoading(true);

    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    const toSend = isWelcome
      ? [{ role: "user", content: "Hello, I'm interested in Parker." }]
      : newMessages;

    try {
      const [res] = await Promise.all([
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: toSend }),
        }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);

      if (!res.ok) throw new Error("Chat request failed");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        const clean = cleanContent(fullText);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: clean };
          return updated;
        });
      }

      if (fullText.includes("<lead_data>") && !leadCaptured) {
        setLeadCaptured(true);
        // lead_captured events
        window.gtag?.("event", "lead_captured", { event_category: "Parker Chatbot" });
        if (GADS_ID && GADS_CONVERSION_LABEL) {
          window.gtag?.("event", "conversion", { send_to: `${GADS_ID}/${GADS_CONVERSION_LABEL}` });
        }
        window.fbq?.("track", "Lead", { content_name: "Parker Suite Inquiry" });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please call 416-312-5282 or email Garima@TeamNagpal.ca and we'll get back to you shortly.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300"
        style={{
          background: "var(--orange)",
          transform: open ? "scale(0.9)" : "scale(1)",
          boxShadow: "0 8px 32px rgba(232,91,58,0.35)",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = open ? "scale(0.9)" : "scale(1)"; }}
        aria-label="Open chat"
      >
        {open ? (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        className="chat-glass fixed z-50 flex flex-col overflow-hidden"
        style={{
          bottom: 88,
          right: 24,
          width: "min(380px, calc(100vw - 32px))",
          height: "min(520px, calc(100vh - 120px))",
          transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(12px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transformOrigin: "bottom right",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}
            >
              Emma · Team Nagpal
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="block h-1.5 w-1.5 rounded-full" style={{ background: "#2ecc71" }} />
              <span
                className="text-xs"
                style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)" }}
              >
                Online now
              </span>
            </div>
          </div>
          <span
            className="text-xs font-medium tracking-widest uppercase px-2 py-1"
            style={{
              background: "var(--orange-light)",
              color: "var(--orange)",
              fontFamily: "var(--font-body)",
            }}
          >
            AI
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] text-sm leading-relaxed"
                style={{
                  ...(msg.role === "user"
                    ? {
                        background: "var(--orange)",
                        color: "white",
                        padding: "10px 14px",
                        borderRadius: "14px 14px 4px 14px",
                        fontFamily: "var(--font-body)",
                      }
                    : {
                        background: "var(--cream-mid)",
                        color: "var(--ink)",
                        padding: "10px 14px",
                        borderRadius: "14px 14px 14px 4px",
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                      }),
                }}
              >
                {msg.content === "" && loading && i === messages.length - 1
                  ? DOTS
                  : msg.content}
              </div>
            </div>
          ))}

          {leadCaptured && (
            <div className="text-center py-1">
              <span
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
                style={{
                  background: "rgba(46,204,113,0.1)",
                  color: "#27ae60",
                  border: "1px solid rgba(46,204,113,0.25)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your info has been sent to our team
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Parker..."
            disabled={loading}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              fontWeight: 300,
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30"
            style={{ background: "var(--orange)", color: "white" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
