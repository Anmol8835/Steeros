import { NextResponse } from "next/server";

/**
 * Free-tier config download. Mirrors the real Steeros
 * GET /api/free/download endpoint (routes.free.yaml template from the
 * Steeros repo, trimmed to its working core).
 */

const CONFIG_YAML = `# STEEROS FREE - routes.free.yaml
# Hand-tune ceilings for your wallet. Smallest model that clears the bar wins.
version: 2.0.0
mode: free

proxy:
  listen: "127.0.0.1:4040"
  upstream_base: "http://localhost:8000"

routes:
  - id: light-model
    difficulty: easy
    max_input_tokens: 2048
    cost_ceiling: 0.003
    provider: local

  - id: balanced-model
    difficulty: medium
    max_input_tokens: 8192
    cost_ceiling: 0.012
    provider: cloud-tier-2

  - id: top-model
    difficulty: hard
    max_input_tokens: 64000
    cost_ceiling: 0.20
    provider: cloud-flagship

classifier:
  mode: heuristic
  fallback_route: balanced-model
  escalate_on_failure: true

guardrails:
  monthly_requests_cap: 25000
  over_cap_policy: degrade_to_light
  alert_email: ""
`;

export async function GET() {
  return new NextResponse(CONFIG_YAML, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="routes.free.yaml"',
    },
  });
}
