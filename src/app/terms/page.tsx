import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service: Steeros",
};

/**
 * Short, plain-language terms. Not a lawyer's document; it says what
 * Steeros does and does not promise.
 */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[620px] px-5 pb-24 pt-28 md:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Terms of service
      </h1>
      <p className="mt-4 text-sm text-faint">Last updated: September 2026</p>

      <div className="mt-10 flex flex-col gap-8 text-base leading-relaxed text-muted">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">What Steeros is</h2>
          <p>
            Steeros is a proxy that sits between your coding agent and your
            LLM providers. It classifies each prompt and routes it to the
            cheapest model that can handle the job. It runs on your
            machine; your API keys never leave it.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">What we promise</h2>
          <p>
            We aim for accurate routing and honest accounting, priced at
            six decimals. We do not promise that every route matches a
            flagship model’s output, or that the savings model on this
            site matches your exact workload. The numbers on this site
            come from cited research and our pilot data, and are labeled
            as such.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">What we do not promise</h2>
          <p>
            The software is provided as is, without warranty of any kind.
            You are responsible for your own usage caps, cost ceilings,
            and provider bills. If a routed response misses, escalate it:
            the fallback chain exists for exactly that.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">Questions</h2>
          <p>
            Email{" "}
            <a href="mailto:hello@steeros.ai" className="text-burgundy underline underline-offset-2">
              hello@steeros.ai
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
