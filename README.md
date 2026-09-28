# Steeros — landing site

Sell-worthy landing page for Steeros: token-aware LLM routing. Every prompt is classified and sent to the cheapest model that can handle it, so spend and carbon fall together.

Built on the real product facts from the `Steeros` and `llm_api_server` repos: tier ceilings, pilot cost data, the RouteLLM study claim, cache pricing rules, and the classify / route / convert / account pipeline.

## Design direction

**White editorial.** Majority white page, one neutral burgundy accent (`#8A2233`, the brand's own token, alpha variants only), one typeface (Space Grotesk everywhere), soft corners throughout (cards 16px, nested 12px, buttons pill).

- Burgundy appears as a field in exactly two places: the full-bleed stat band and the enterprise card
- Muted green appears once, in the carbon row, because it states a real product property
- Sequence numbers appear only in the pipeline, because that content really is a sequence

## Stack

Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4. [Motion](https://motion.dev) for UI animation, [GSAP](https://gsap.com) + ScrollTrigger for the scroll setpieces. Space Grotesk via `next/font`.

## Motion inventory

| Section | Motion | Why |
|---|---|---|
| Hero | one orchestrated load sequence + live console slip | the single entrance moment; product proof |
| Stat band | count-up numerals | the claim lands as measured |
| Problem | scroll-scrubbed word reveal | the Ferrari line lands as you read it |
| Pipeline | GSAP pinned horizontal pan | the four stages are a linear story |
| Tiers | GSAP sticky stack | the ladder is a hierarchy |
| Calculator | spring-animated numbers | feedback on user input |
| Final CTA | one masked reveal + magnetic button | conversion moment |

No per-section fades, no marquee, no hover-everything. Everything collapses to static under `prefers-reduced-motion`; GSAP sections fall back to vertical stacks. `html` and `body` are white from the first paint, no flash.

## API routes

- `GET /api/config` — downloads `routes.free.yaml` (mirrors the real Steeros free-config endpoint)
- `POST /api/lead` — enterprise lead capture, persists to `leads.json` (gitignored), dedupes on email
- `POST /api/newsletter` — newsletter signup, persists to `newsletter.json` (gitignored), dedupes on email

## Footer

Structured like the Amini.ai footer: closing CTA, newsletter signup, link columns (Product / Resources / Company), legal row with real `/terms` and `/privacy` pages. The Socials column is intentionally absent until Steeros has public profiles.
# Steeros
