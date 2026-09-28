import { NextResponse } from "next/server";
import { addEntry, type StoreEntry } from "@/lib/entries-store";

/**
 * Newsletter signup. Validates the email, dedupes on email, and
 * persists via the shared store: a private Vercel Blob in production,
 * newsletter.json on disk in local dev.
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

  const { id, existing } = await addEntry<StoreEntry>(
    "newsletter.json",
    cleanEmail,
    (entryId, ts) => ({ id: entryId, ts, email: cleanEmail }),
  );

  return NextResponse.json({ ok: true, id, existing });
}
