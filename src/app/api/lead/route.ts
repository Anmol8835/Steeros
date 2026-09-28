import { NextResponse } from "next/server";
import { addEntry, type StoreEntry } from "@/lib/entries-store";

/**
 * Enterprise lead capture. Mirrors the real Steeros
 * POST /api/enterprise/lead endpoint: validates the email, dedupes on
 * email, and persists via the shared store — a private Vercel Blob in
 * production, leads.json on disk in local dev.
 */

type Lead = StoreEntry & {
  name: string;
  company: string;
};

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

  const { id, existing } = await addEntry<Lead>(
    "leads.json",
    cleanEmail,
    (entryId, ts) => ({
      id: entryId,
      ts,
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
    }),
  );

  return NextResponse.json({ ok: true, id, existing });
}
