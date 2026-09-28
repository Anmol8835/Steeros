/**
 * Shared signup forwarder. All three forms (early access, newsletter,
 * enterprise leads) POST through their /api routes, which validate and
 * then forward here — Formspree emails each submission to the Steeros
 * inbox. No database.
 */

export const FORMSPREE_ENDPOINT =
  process.env.FORMSPREE_ENDPOINT ?? "https://formspree.io/f/xjykjkyd";

export async function submitToFormspree(fields: Record<string, string>): Promise<void> {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(fields),
  });

  if (!res.ok) {
    throw new Error(`Formspree responded ${res.status}`);
  }
}
