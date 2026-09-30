"use client";

import { useState } from "react";
import { Calligraph } from "calligraph";

/**
 * Interactive savings model. Costs are the real pilot numbers from the
 * Steeros repo: light $0.004, balanced $0.020, flagship $0.090 per
 * request, with a 51/32/17 difficulty mix. Unsteered baseline is $0.068
 * per request (the pilot's measured average). Labeled as a model; no
 * invented precision.
 */

const TIER_MIX = { light: 0.51, balanced: 0.32, flagship: 0.17 };
const TIER_COST = { light: 0.004, balanced: 0.02, flagship: 0.09 };
const UNSTEERED = 0.068;
const WORKDAYS = 21;

const money = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function Calculator() {
  const [seats, setSeats] = useState(10);
  const [promptsPerDay, setPromptsPerDay] = useState(60);

  const monthly = seats * promptsPerDay * WORKDAYS;
  const before = monthly * UNSTEERED;
  const after =
    monthly *
    (TIER_MIX.light * TIER_COST.light +
      TIER_MIX.balanced * TIER_COST.balanced +
      TIER_MIX.flagship * TIER_COST.flagship);
  const saved = before - after;
  const pct = Math.round((saved / before) * 100);

  return (
    <section id="calculator" className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* controls */}
        <div>
          <h2 className="max-w-[18ch] text-4xl font-bold leading-[1.1] tracking-tight text-balance text-ink md:text-6xl">
            Do the math on your burn.
          </h2>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted md:text-lg">
            Slide your team size and see spend before Steeros, spend
            after, and what stays in your budget.
          </p>

          <div className="mt-9 flex max-w-md flex-col gap-9">
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="seats" className="text-sm font-medium text-ink">
                  Developers
                </label>
                <span className="text-lg font-bold tabular-nums text-burgundy">{seats}</span>
              </div>
              <input
                id="seats"
                type="range"
                min={1}
                max={100}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="steer-range mt-2"
              />
              <p className="mt-1 text-xs text-faint">1 to 100 seats</p>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="prompts" className="text-sm font-medium text-ink">
                  Prompts per developer, per day
                </label>
                <span className="text-lg font-bold tabular-nums text-burgundy">{promptsPerDay}</span>
              </div>
              <input
                id="prompts"
                type="range"
                min={10}
                max={300}
                step={10}
                value={promptsPerDay}
                onChange={(e) => setPromptsPerDay(Number(e.target.value))}
                className="steer-range mt-2"
              />
              <p className="mt-1 text-xs text-faint">10 to 300 prompts</p>
            </div>
          </div>
        </div>

        {/* the results card — the one ink field on the white page */}
        <div className="relative w-full max-w-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-[0_2px_4px_rgba(34,22,26,0.04),0_24px_48px_-24px_rgba(34,22,26,0.28)] lg:justify-self-end">
          <div className="flex h-full flex-col gap-6 p-7 md:p-8">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-6">
              <div>
                <div className="text-xs tracking-wide text-white/50">without Steeros</div>
                {/* leading-[1.4]: the slot mask fades 0.25em at the top and
                    bottom of each digit, so a tight line box leaks the
                    neighbouring digits as smudges */}
                <div className="mt-2 text-3xl font-bold leading-[1.4] tracking-tight tabular-nums text-white md:text-4xl">
                  <Calligraph variant="slots">{money(before)}</Calligraph>
                  <span className="ml-1 text-sm font-medium text-white/50">/mo</span>
                </div>
              </div>
              <div className="text-right text-xs leading-relaxed text-white/50">
                {monthly.toLocaleString("en-US")} requests
                <br />
                all at flagship prices
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs tracking-wide text-white/50">with Steeros</div>
                <div className="mt-2 text-3xl font-bold leading-[1.4] tracking-tight tabular-nums text-burgundy-on-ink md:text-4xl">
                  <Calligraph variant="slots">{money(after)}</Calligraph>
                  <span className="ml-1 text-sm font-medium text-white/50">/mo</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-lg font-bold tabular-nums text-burgundy-on-ink">
                −{pct}%
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white/70">Kept in your budget</span>
                <span className="text-2xl font-bold tracking-tight tabular-nums text-burgundy-on-ink">
                  <Calligraph variant="slots">{money(saved)}</Calligraph>
                  <span className="ml-1 text-sm font-medium text-white/50">
                    every month
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-auto text-sm leading-relaxed text-white/70">
              Same output, roughly {pct}% fewer flagship tokens, so energy
              falls with the bill.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 max-w-[72ch] text-xs leading-relaxed text-faint">
        Modeled on our pilot mix: 51% light at $0.004, 32% balanced at
        $0.020, 17% flagship at $0.090 per request. Your distribution
        will differ.
      </p>
    </section>
  );
}
