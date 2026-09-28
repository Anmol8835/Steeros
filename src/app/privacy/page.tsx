import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy: Steeros",
};

/**
 * Short, plain-language privacy statement: Steeros runs locally and
 * collects almost nothing.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[620px] px-5 pb-24 pt-28 md:px-8">
      <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-faint">Last updated: September 2026</p>

      <div className="mt-10 flex flex-col gap-8 text-base leading-relaxed text-muted">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">Your prompts stay local</h2>
          <p>
            Steeros is a local proxy. It forwards prompts to the providers
            you configured, and nothing else. We do not see, store, or
            process your prompts, code, or API keys. The providers you
            route to see what they have always seen.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">What this site collects</h2>
          <p>
            Two forms: the enterprise pilot form and the newsletter. Both
            store the email address you submit in a local file on the
            server, used only to reply or send the newsletter you asked
            for. We do not sell, share, or drip-campaign your address.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-ink">Cookies</h2>
          <p>This site does not use cookies.</p>
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
