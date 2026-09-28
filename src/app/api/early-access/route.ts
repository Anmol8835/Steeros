import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Early access signup. Validates the email, dedupes on email, persists
 * to early-access.json on disk. Mirrors the same pattern as the
 * newsletter and lead endpoints.
 */

const WAITLIST_FILE = path.join(process.cwd(), "early-access.json");

type Entry = {
  id: number;
  ts: string;
  email: string;
};

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

  let entries: Entry[] = [];
  try {
    entries = JSON.parse(await fs.readFile(WAITLIST_FILE, "utf-8"));
  } catch {
    entries = [];
  }

  const existing = entries.find((e) => e.email === cleanEmail);
  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id, existing: true });
  }

  const entry: Entry = {
    id: entries.length + 1,
    ts: new Date().toISOString(),
    email: cleanEmail,
  };
  entries.push(entry);
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2), "utf-8");

  return NextResponse.json({ ok: true, id: entry.id, existing: false });
}
