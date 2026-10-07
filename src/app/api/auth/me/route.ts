import { forwardAuth } from "@/lib/auth-api";

/**
 * Relay for the VPS auth API's GET /auth/me (see lib/auth-api.ts).
 */
export async function GET(request: Request) {
  return forwardAuth(request, "me");
}
