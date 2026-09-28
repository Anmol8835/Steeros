import { promises as fs } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";

/**
 * Append-only JSON entry store for the signup forms.
 *
 * On Vercel, when BLOB_READ_WRITE_TOKEN is set, entries live in a
 * PRIVATE Vercel Blob (serverless filesystems are ephemeral, so the
 * local JSON files would not survive). Without the token — local dev —
 * it falls back to a JSON file in the project root. Same shape either
 * way, so the route handlers never care where the data lives.
 */

export type StoreEntry = {
  id: number;
  ts: string;
  email: string;
};

const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readAll<T>(name: string): Promise<T[]> {
  if (blobEnabled()) {
    const res = await get(name, { access: "private" });
    if (!res || res.statusCode !== 200) return [];
    const text = await new Response(res.stream).text();
    return JSON.parse(text) as T[];
  }
  try {
    return JSON.parse(
      await fs.readFile(path.join(process.cwd(), name), "utf-8"),
    ) as T[];
  } catch {
    return [];
  }
}

async function writeAll<T>(name: string, entries: T[]): Promise<void> {
  const body = JSON.stringify(entries, null, 2);
  if (blobEnabled()) {
    await put(name, body, {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }
  await fs.writeFile(path.join(process.cwd(), name), body, "utf-8");
}

/**
 * Dedupe on email (case-insensitive) and append. Returns the id and
 * whether the email was already present.
 */
export async function addEntry<T extends StoreEntry>(
  name: string,
  email: string,
  makeEntry: (id: number, ts: string) => T,
): Promise<{ id: number; existing: boolean }> {
  const entries = await readAll<T>(name);

  const found = entries.find((e) => e.email === email);
  if (found) {
    return { id: found.id, existing: true };
  }

  const entry = makeEntry(entries.length + 1, new Date().toISOString());
  entries.push(entry);
  await writeAll(name, entries);

  return { id: entry.id, existing: false };
}
