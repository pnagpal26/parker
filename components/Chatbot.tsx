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

interface ParkerChatSession {
  version: 1;
  expiresAt: number;
  name: string;
  email: string;
  phone: string;
  moveIn: string;
  suiteType: string;
  budget: string;
  fubPersonId: number | null;
}

function loadSession(): ParkerChatSession | null {
  try {
    const raw = localStorage.getItem("parker_chat_session");
    if (!raw) return null;
    const s = JSON.parse(raw) as ParkerChatSession;
    if (s.version !== 1 || s.expiresAt < Date.now()) {
      localStorage.removeItem("parker_chat_session");
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function cleanContent(text: string): string {
  return text
    .replace(/<lead_data>[\s\S]*?<\/lead_data>/g, "")
    .replace(/<contact_captured>[\s\S]*?<\/contact_captured>/g, "")
    .trim();
}

function saveTranscriptToStorage(msgs: Message[], personId: number | null) {
  try {
    let storedPersonId: number | null = null;
    try {
      const existing = localStorage.getItem("parker_transcript");
      if (existing) storedPersonId = JSON.parse(existing).personId ?? null;
    } catch { /* ignore */ }
    localStorage.setItem("parker_transcript", JSON.stringify({
      version: 1,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      personId: storedPersonId ?? personId,
      messages: msgs,
    }));
  } catch { /* ignore — private browsing */ }
}

function loadTranscriptFromStorage(): { messages: Message[]; personId: number | null } | null {
  try {
    const raw = localStorage.getItem("parker_transcript");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || parsed.expiresAt < Date.now()) return null;
    return { messages: parsed.messages ?? [], personId: parsed.personId ?? null };
  } catch {
    return null;
  }
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
  const [fubPersonId, setFubPersonId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const chatStartedFired = useRef(false);
  const partialLeadFiredRef = useRef(false);

  // Refs for use in event listeners / sendBeacon (always up-to-date)
  const fubPersonIdRef = useRef<number | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const leadCapturedRef = useRef(false);

  const lastFlushedLengthRef = useRef(0);

  useEffect(() => { fubPersonIdRef.current = fubPersonId; }, [fubPersonId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { leadCapturedRef.current = leadCaptured; }, [leadCaptured]);

  function flushTranscript() {
    // personId: live ref first (most up-to-date), fall back to localStorage (handles async race on quick close)
    const stored = loadTranscriptFromStorage();
    const personId = fubPersonIdRef.current ?? stored?.personId ?? null;
    if (!personId) return;
    // Skip if no new messages since last flush (prevents double-fire from panel close + beforeunload/visibilitychange)
    if (messagesRef.current.length <= lastFlushedLengthRef.current) return;
    // Skip if there are no user messages since the last flush (e.g. returning visitor opened but didn't speak)
    const hasNewUserMessage = messagesRef.current
      .slice(lastFlushedLengthRef.current)
      .some((m) => m.role === "user");
    if (!hasNewUserMessage) return;
    lastFlushedLengthRef.current = messagesRef.current.length;
    // Use stored messages as transcript body — they are saved after each complete response and may be more reliable
    const msgs = stored?.messages?.length ? stored.messages : messagesRef.current;
    const transcript =
      "=== Parker Chatbot Transcript ===\n\n" +
      msgs
        .map((m) => `${m.role === "user" ? "Prospect" : "Emma"}: ${m.content}`)
        .join("\n\n");
    navigator.sendBeacon(
      "/api/transcript",
      new Blob([JSON.stringify({ personId, transcript })], {
        type: "application/json",
      })
    );
  }

  // Flush on page unload and tab hide (visibilitychange is more reliable on mobile/Safari)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushTranscript();
    };
    window.addEventListener("beforeunload", flushTranscript);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", flushTranscript);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      window.gtag?.("event", "chat_opened", { event_category: "Parker Chatbot" });
      window.fbq?.("track", "ViewContent", { content_name: "Parker Chat" });

      const session = loadSession();
      if (session) {
        // Only restore fubPersonId for transcript purposes.
        // Do NOT set leadCaptured — that flag is reserved for captures in THIS session.
        // Setting it from a stale session blocks new lead capture and shows a false banner.
        if (session.fubPersonId) setFubPersonId(session.fubPersonId);
      }
      sendMessage("", true, session);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    if (!loading && open) inputRef.current?.focus();
  }, [loading, open]);

  const sendMessage = async (userText: string, isWelcome = false, session: ParkerChatSession | null = null) => {
    const newMessages: Message[] = isWelcome
      ? []
      : [...messages, { role: "user" as const, content: userText }];

    if (!isWelcome) {
      setMessages(newMessages);
      setInput("");
      if (!chatStartedFired.current) {
        chatStartedFired.current = true;
        window.gtag?.("event", "chat_started", { event_category: "Parker Chatbot" });
      }
    }
    setLoading(true);

    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantPlaceholder]);

    let toSend: { role: string; content: string }[];
    if (isWelcome) {
      if (session) {
        const fields = [
          session.name && `name: ${session.name}`,
          session.email && `email: ${session.email}`,
          session.phone && `phone: ${session.phone}`,
          session.moveIn && `move-in: ${session.moveIn}`,
          session.suiteType && `suite: ${session.suiteType}`,
          session.budget && `budget: ${session.budget}`,
        ].filter(Boolean).join(", ");
        toSend = [{ role: "user", content: `[RETURNING VISITOR — previously provided: ${fields}. Greet them warmly by first name, do not ask for these fields again, ask how you can help today.]` }];
      } else {
        toSend = [{ role: "user", content: "Hello, I'm interested in Parker." }];
      }
    } else {
      toSend = newMessages;
    }

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

      // Build complete message list — reused for transcript and localStorage
      const currentMessages: Message[] = [
        ...(isWelcome ? [] : newMessages),
        { role: "assistant" as const, content: cleanContent(fullText) },
      ];

      // Fix 3: Save transcript snapshot to localStorage after each complete response
      saveTranscriptToStorage(currentMessages, fubPersonIdRef.current);

      // Fix 1b: Early contact capture — detect name+email before full lead_data fires
      if (fullText.includes("<contact_captured>") && !partialLeadFiredRef.current) {
        partialLeadFiredRef.current = true;
        const ccMatch = fullText.match(/<contact_captured>([\s\S]*?)<\/contact_captured>/);
        if (ccMatch) {
          try {
            const partial = JSON.parse(ccMatch[1]);
            if (partial.email) {
              fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: partial.name || "", email: partial.email, source: "Parker Chatbot", partial: true }),
              })
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                  if (data?.fubPersonId) {
                    setFubPersonId(data.fubPersonId);
                    // Update localStorage now that we have a personId
                    saveTranscriptToStorage(messagesRef.current, data.fubPersonId);
                  }
                })
                .catch(console.error);
            }
          } catch {
            console.error("Failed to parse contact_captured");
          }
        }
      }

      // Full lead capture
      if (fullText.includes("<lead_data>") && !leadCapturedRef.current) {
        leadCapturedRef.current = true; // prevent re-entry — set early regardless of API outcome

        const match = fullText.match(/<lead_data>([\s\S]*?)<\/lead_data>/);
        if (match) {
          try {
            const leadData = JSON.parse(match[1]);
            const transcript =
              "=== Parker Chatbot Transcript ===\n\n" +
              currentMessages
                .map((m) => `${m.role === "user" ? "Prospect" : "Emma"}: ${m.content}`)
                .join("\n\n");

            fetch("/api/lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...leadData, source: "Parker Chatbot", transcript }),
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data?.success) {
                  // Banner and analytics only fire on confirmed API success
                  setLeadCaptured(true);
                  window.gtag?.("event", "lead_captured", { event_category: "Parker Chatbot" });
                  if (GADS_ID && GADS_CONVERSION_LABEL) {
                    window.gtag?.("event", "conversion", { send_to: `${GADS_ID}/${GADS_CONVERSION_LABEL}` });
                  }
                  window.fbq?.("track", "Lead", { content_name: "Parker Suite Inquiry" });

                  const sessionData: ParkerChatSession = {
                    version: 1,
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    name: leadData.name || "",
                    email: leadData.email || "",
                    phone: leadData.phone || "",
                    moveIn: leadData.moveIn || "",
                    suiteType: leadData.suiteType || "",
                    budget: leadData.budget || "",
                    fubPersonId: data.fubPersonId ?? null,
                  };
                  try {
                    localStorage.setItem("parker_chat_session", JSON.stringify(sessionData));
                  } catch { /* ignore — private browsing */ }
                  if (data.fubPersonId) setFubPersonId(data.fubPersonId);
                }
              })
              .catch(console.error);
          } catch {
            console.error("Failed to parse lead_data");
          }
        }
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
        onClick={() => { if (open) flushTranscript(); setOpen(!open); }}
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
              <span className="block h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
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
                  color: "var(--success-dark)",
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
