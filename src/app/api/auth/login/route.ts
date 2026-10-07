import { forwardAuth } from "@/lib/auth-api";

/**
 * Relay for the VPS auth API's POST /auth/login (see lib/auth-api.ts).
 */
export async function POST(request: Request) {
  return forwardAuth(request, "login");
}
