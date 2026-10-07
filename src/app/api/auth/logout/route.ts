import { forwardAuth } from "@/lib/auth-api";

/**
 * Relay for the VPS auth API's POST /auth/logout (see lib/auth-api.ts).
 */
export async function POST(request: Request) {
  return forwardAuth(request, "logout");
}
