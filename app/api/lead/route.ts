import { NextRequest, NextResponse } from "next/server";
import { sendLeadEmail, type LeadData } from "@/lib/resend";
import { createFUBLead } from "@/lib/fub";

const BOGUS_EMAIL_DOMAINS = new Set([
  "test.com", "fake.com", "example.com", "mailinator.com",
  "guerrillamail.com", "temp-mail.org", "throwaway.email",
  "trashmail.com", "yopmail.com", "sharklasers.com",
]);

function isBogusPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  // Strip leading country code 1 if 11 digits
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (normalized.length !== 10) return true;
  if (/^(\d)\1+$/.test(normalized)) return true; // all same digit: 1111111111
  if (normalized === "1234567890" || normalized === "0987654321") return true;
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
    // Normalize phone: strip all non-digits, drop leading country code 1 if 11 digits
    const rawDigits = (body.phone || "").replace(/\D/g, "");
    const normalizedPhone = rawDigits.length === 11 && rawDigits.startsWith("1")
      ? rawDigits.slice(1)
      : rawDigits;

    const lead: LeadData = {
      name: body.name || "Unknown",
      email: body.email || "",
      phone: normalizedPhone,
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

    const fubData = fubOk ? (fubResult.value as { personId?: number } | null) : null;
    return NextResponse.json({
      success: true,
      email: emailOk,
      fub: fubOk,
      fubPersonId: fubData?.personId ?? null,
    });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
