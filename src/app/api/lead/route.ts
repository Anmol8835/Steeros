import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Enterprise lead capture. Mirrors the real Steeros
 * POST /api/enterprise/lead endpoint: validates the email, dedupes on
 * email, persists to leads.json on disk.
 */

const LEADS_FILE = path.join(process.cwd(), "leads.json");

type Lead = {
  id: number;
  ts: string;
  name: string;
  email: string;
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

  let leads: Lead[] = [];
  try {
    leads = JSON.parse(await fs.readFile(LEADS_FILE, "utf-8"));
  } catch {
    leads = [];
  }

  const existing = leads.find((l) => l.email === cleanEmail);
  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id, existing: true });
  }

  const lead: Lead = {
    id: leads.length + 1,
    ts: new Date().toISOString(),
    name: cleanName,
    email: cleanEmail,
    company: cleanCompany,
  };
  leads.push(lead);
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");

  return NextResponse.json({ ok: true, id: lead.id, existing: false });
}
