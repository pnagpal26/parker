import { NextRequest, NextResponse } from "next/server";
import { createFUBNote } from "@/lib/fub";

export async function POST(req: NextRequest) {
  try {
    const { personId, transcript } = await req.json();
    if (!personId || typeof personId !== "number") {
      return NextResponse.json({ error: "personId required" }, { status: 400 });
    }
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "transcript required" }, { status: 400 });
    }
    await createFUBNote(personId, transcript);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Transcript update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
