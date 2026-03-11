import type { LeadData } from "./resend";

const FUB_BASE = "https://api.followupboss.com/v1";

function fubHeaders(apiKey: string) {
  const credentials = Buffer.from(`${apiKey}:`).toString("base64");
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
    "X-System": "Parker Website",
    "X-System-Key": apiKey,
  };
}

export async function createFUBLead(lead: LeadData): Promise<{ personId?: number } | null> {
  const apiKey = process.env.FUB_API_KEY;
  if (!apiKey) {
    console.warn("FUB_API_KEY not set — skipping FUB lead creation");
    return null;
  }

  const [firstName, ...lastParts] = lead.name.trim().split(" ");
  const lastName = lastParts.join(" ") || "";

  const noteLines = [
    lead.moveIn && `Move-in: ${lead.moveIn}`,
    lead.suiteType && `Suite: ${lead.suiteType}`,
    lead.budget && `Budget: ${lead.budget}`,
    lead.message && `Message: ${lead.message}`,
    `Source: ${lead.source}`,
  ].filter(Boolean);

  const body = {
    source: "Parker Website",
    type: "Registration",
    person: {
      firstName,
      lastName,
      emails: [{ value: lead.email, type: "work" }],
      phones: lead.phone ? [{ value: lead.phone, type: "mobile" }] : [],
    },
    tags: ["parker", "parker-website"],
    note: noteLines.join(", "),
  };

  const res = await fetch(`${FUB_BASE}/events`, {
    method: "POST",
    headers: fubHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`FUB API error ${res.status}:`, text);
    return null;
  }

  const data = await res.json();
  return { personId: data.personId ?? data.person?.id ?? undefined };
}

export async function createFUBNote(personId: number, transcript: string): Promise<void> {
  const apiKey = process.env.FUB_API_KEY;
  if (!apiKey) return;

  const res = await fetch(`${FUB_BASE}/notes`, {
    method: "POST",
    headers: fubHeaders(apiKey),
    body: JSON.stringify({
      personId,
      body: transcript,
      isHtml: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`FUB note error ${res.status}:`, text);
  }
}
