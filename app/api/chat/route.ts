import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PARKER_SYSTEM_PROMPT } from "@/lib/parker-data";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

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

            // Format full transcript for FUB note
            const transcriptLines = [
              "=== Parker Chatbot Transcript ===\n",
              ...messages.map((m: { role: string; content: string }) =>
                `${m.role === "user" ? "Prospect" : "Emma"}: ${m.content}`
              ),
              `Emma: ${fullText.replace(/<lead_data>[\s\S]*?<\/lead_data>/g, "").trim()}`,
            ];
            const transcript = transcriptLines.join("\n\n");

            // Fire and forget — lead capture in background
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
