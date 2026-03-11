import { NextRequest, NextResponse } from "next/server";
import { sendLeadEmail, type LeadData } from "@/lib/resend";
import { createFUBLead, createFUBNote } from "@/lib/fub";

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

    const [emailResult, fubResult] = await Promise.allSettled([
      sendLeadEmail(lead),
      createFUBLead(lead),
    ]);

    const emailOk = emailResult.status === "fulfilled";
    const fubOk = fubResult.status === "fulfilled";

    if (!emailOk) console.error("Resend error:", emailResult.reason);
    if (!fubOk) console.error("FUB error:", fubResult.reason);

    // Post transcript as a FUB note if we have a personId and transcript
    if (fubOk && lead.transcript) {
      const fubData = fubResult.value as { personId?: number } | null;
      if (fubData?.personId) {
        createFUBNote(fubData.personId, lead.transcript).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, email: emailOk, fub: fubOk });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
