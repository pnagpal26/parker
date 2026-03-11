import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PARKER_SYSTEM_PROMPT } from "@/lib/parker-data";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
// Limits each IP to MAX_REQUESTS within WINDOW_MS. Resets per window.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 20;           // per window per IP

const ipWindows = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip);

  if (!entry || now > entry.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

// Prune stale entries occasionally to avoid unbounded memory growth
let lastPrune = Date.now();
function pruneIfNeeded() {
  const now = Date.now();
  if (now - lastPrune < 5 * 60 * 1000) return;
  lastPrune = now;
  for (const [key, val] of ipWindows) {
    if (now > val.resetAt) ipWindows.delete(key);
  }
}

// ── Request validation ────────────────────────────────────────────────────────
const MAX_MESSAGES = 30;
const MAX_MSG_LENGTH = 1000;
const BOT_UA = /bot|crawler|spider|scrapy|python-requests|axios|curl|wget|headless/i;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  pruneIfNeeded();

  // Block obvious bot user-agents
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT_UA.test(ua)) {
    return new Response("Forbidden", { status: 403 });
  }

  // Rate limit by IP
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return new Response("Too many requests", { status: 429 });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    // Validate structure
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Bad request", { status: 400 });
    }
    if (messages.length > MAX_MESSAGES) {
      return new Response("Conversation too long", { status: 400 });
    }
    for (const m of messages) {
      if (
        typeof m?.role !== "string" ||
        typeof m?.content !== "string" ||
        m.content.length > MAX_MSG_LENGTH
      ) {
        return new Response("Bad request", { status: 400 });
      }
    }

    const stream = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: PARKER_SYSTEM_PROMPT,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        // Check for lead data trigger
        const leadMatch = fullText.match(/<lead_data>([\s\S]*?)<\/lead_data>/);
        if (leadMatch) {
          try {
            const leadData = JSON.parse(leadMatch[1].trim());

            const transcriptLines = [
              "=== Parker Chatbot Transcript ===\n",
              ...messages.map((m: { role: string; content: string }) =>
                `${m.role === "user" ? "Prospect" : "Emma"}: ${m.content}`
              ),
              `Emma: ${fullText.replace(/<lead_data>[\s\S]*?<\/lead_data>/g, "").trim()}`,
            ];
            const transcript = transcriptLines.join("\n\n");

            fetch(`${req.nextUrl.origin}/api/lead`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...leadData, source: "Parker Chatbot", transcript }),
            }).catch(console.error);
          } catch (e) {
            console.error("Failed to parse lead data from chatbot:", e);
          }
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
