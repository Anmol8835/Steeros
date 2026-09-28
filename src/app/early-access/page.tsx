import type { Metadata } from "next";
import Link from "next/link";
import { EarlyAccessForm } from "@/components/early-access-form";

export const metadata: Metadata = {
  title: "Early access: Steeros",
  description:
    "Join the Steeros early access list. One proxy, up to 85% lower LLM spend, same quality.",
};

/**
 * Early access landing. A single email field; submissions are emailed
 * via Formspree through /api/early-access.
 */
export default function EarlyAccessPage() {
  return (
    <main className="mx-auto max-w-[620px] px-5 pb-24 pt-28 md:px-8">
      <Link href="/" className="text-sm text-muted transition-colors duration-200 hover:text-ink">
        ← Back to Steeros
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Get early access
      </h1>
      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted">
        Steeros routes every prompt to the cheapest model that can
        handle it — up to 85% lower spend, same quality. Drop your
        email and we’ll send an invite when a slot opens.
      </p>

      <EarlyAccessForm />
    </main>
  );
}
