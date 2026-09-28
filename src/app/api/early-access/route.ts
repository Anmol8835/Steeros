import { NextResponse } from "next/server";
import { submitToFormspree } from "@/lib/formspree";

/**
 * Early access signup. Validates the email and forwards to Formspree,
 * which emails the submission to the Steeros inbox.
 */

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { email = "" } = (body ?? {}) as Record<string, string>;
  const cleanEmail = String(email).trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    await submitToFormspree({
      email: cleanEmail,
      source: "early-access",
      _subject: `Early access signup: ${cleanEmail}`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
