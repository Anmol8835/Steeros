import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Newsletter signup. Validates the email, dedupes on email, persists to
 * newsletter.json on disk. Mirrors the same pattern as the lead
 * endpoint and the real Steeros backend.
 */

const SUBSCRIBERS_FILE = path.join(process.cwd(), "newsletter.json");

type Subscriber = {
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

  let subscribers: Subscriber[] = [];
  try {
    subscribers = JSON.parse(await fs.readFile(SUBSCRIBERS_FILE, "utf-8"));
  } catch {
    subscribers = [];
  }

  const existing = subscribers.find((s) => s.email === cleanEmail);
  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id, existing: true });
  }

  const subscriber: Subscriber = {
    id: subscribers.length + 1,
    ts: new Date().toISOString(),
    email: cleanEmail,
  };
  subscribers.push(subscriber);
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf-8");

  return NextResponse.json({ ok: true, id: subscriber.id, existing: false });
}
