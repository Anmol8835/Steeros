import { NextResponse } from "next/server";
import { submitToFormspree } from "@/lib/formspree";

/**
 * Enterprise lead capture. Mirrors the real Steeros
 * POST /api/enterprise/lead endpoint: validates the email and forwards
 * to Formspree, which emails the submission to the Steeros inbox.
 */

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name = "", email = "", company = "" } = (body ?? {}) as Record<string, string>;
  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanCompany = String(company).trim();

  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  try {
    await submitToFormspree({
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
      source: "lead",
      _subject: `Enterprise lead: ${cleanEmail}`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
