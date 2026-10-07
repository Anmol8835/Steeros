import { NextResponse } from "next/server";

/**
 * Server-to-server relay to the Steeros auth API on the VPS (the
 * Express proxy behind app.steerosai.com — same SQLite users/sessions
 * tables as the dashboard). The site's own /api/auth/* routes call
 * forwardAuth, so the browser never talks cross-origin: the VPS sets
 * the SSO session cookie (Domain=.steerosai.com in production) and we
 * relay that Set-Cookie header back verbatim.
 *
 * AUTH_API_BASE is only needed for local development against a local
 * proxy (e.g. http://localhost:8002); production uses the default.
 */

export const AUTH_API_BASE = (
  process.env.AUTH_API_BASE ?? "https://app.steerosai.com"
).replace(/\/+$/, "");

export type AuthPath = "signup" | "login" | "logout" | "me";

export async function forwardAuth(
  request: Request,
  path: AuthPath,
): Promise<NextResponse> {
  const isMe = path === "me";

  const headers: Record<string, string> = {};
  // Forward the session cookie so `me` and `logout` can see it. The
  // client IP is deliberately NOT forwarded: the VPS throttles per
  // (ip, email), and leaving ip as Vercel's egress makes that lockout
  // apply site-wide per email instead of being spoofable via a fake
  // x-forwarded-for on the inbound request.
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;
  if (!isMe) {
    headers["content-type"] = request.headers.get("content-type") ?? "application/json";
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${AUTH_API_BASE}/auth/${path}`, {
      method: isMe ? "GET" : "POST",
      headers,
      // Raw body relay — the VPS validates shape and returns its own
      // friendly errors, which the form shows verbatim.
      body: isMe ? undefined : await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Unreachable VPS or 8s timeout: fail fast instead of hanging.
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 502 });
  }

  const res = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });

  // Relay every Set-Cookie separately — comma-joining corrupts cookie
  // attributes (Expires contains a comma).
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie") as string]
        : [];
  for (const c of setCookies) res.headers.append("set-cookie", c);

  return res;
}
