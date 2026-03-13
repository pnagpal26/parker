import { NextRequest, NextResponse } from "next/server";
import { sendLeadEmail, type LeadData } from "@/lib/resend";
import { createFUBLead, createFUBNote } from "@/lib/fub";

const BOGUS_EMAIL_DOMAINS = new Set([
  "test.com", "fake.com", "example.com", "mailinator.com",
  "guerrillamail.com", "temp-mail.org", "throwaway.email",
  "trashmail.com", "yopmail.com", "sharklasers.com",
]);

function isBogusPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return true;
  if (/^(\d)\1+$/.test(digits)) return true; // all same digit: 1111111111
  if (digits === "1234567890" || digits === "0987654321") return true;
  return false;
}

function isBogusEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const [local, domain] = lower.split("@");
  if (!local || !domain) return true;
  if (BOGUS_EMAIL_DOMAINS.has(domain)) return true;
  if (/^(.)\1+$/.test(local)) return true; // all same char: aaa@...
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead: LeadData = {
      name: body.name || "Unknown",
      email: body.email || "",
      phone: body.phone || "",
      moveIn: body.moveIn,
      suiteType: body.suiteType,
      budget: body.budget,
      message: body.message,
      source: body.source || "Parker Website",
      transcript: body.transcript,
    };

    if (!lead.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (isBogusEmail(lead.email)) {
      console.warn("Bogus email rejected:", lead.email);
      return NextResponse.json({ success: false, reason: "bogus_email" }, { status: 422 });
    }

    if (lead.phone && isBogusPhone(lead.phone)) {
      console.warn("Bogus phone rejected:", lead.phone);
      return NextResponse.json({ success: false, reason: "bogus_phone" }, { status: 422 });
    }

    const [emailResult, fubResult] = await Promise.allSettled([
      sendLeadEmail(lead),
      createFUBLead(lead),
    ]);

    const emailOk = emailResult.status === "fulfilled";
    const fubOk = fubResult.status === "fulfilled" && fubResult.value !== null;

    if (!emailOk) console.error("Resend error:", emailResult.status === "rejected" ? emailResult.reason : "null result");
    if (!fubOk) console.error("FUB error:", fubResult.status === "rejected" ? fubResult.reason : "null result");

    // Post transcript as a FUB note if we have a personId and transcript
    if (fubOk && lead.transcript) {
      const fubData = fubResult.value as { personId?: number } | null;
      if (fubData?.personId) {
        await createFUBNote(fubData.personId, lead.transcript).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, email: emailOk, fub: fubOk });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
