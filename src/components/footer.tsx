"use client";

import { useState, type FormEvent } from "react";

/**
 * Footer: newsletter signup, link columns, legal row. The newsletter
 * posts to /api/newsletter, which forwards the email to Formspree.
 */

const PRODUCT_LINKS = [
  { label: "How it routes", href: "#pipeline" },
  { label: "Tiers", href: "#tiers" },
  { label: "Calculator", href: "#calculator" },
  { label: "Pricing", href: "#pricing" },
  { label: "Early access", href: "/early-access" },
];

const RESOURCE_LINKS = [
  { label: "Free config", href: "/api/config" },
  { label: "RouteLLM study", href: "https://arxiv.org/abs/2406.18665" },
  { label: "Contact us", href: "mailto:hello@steeros.ai" },
];

const COMPANY_LINKS = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "hello@steeros.ai", href: "mailto:hello@steeros.ai" },
];

type FormState = "idle" | "loading" | "success" | "error";

function Newsletter() {
  const [state, setState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.error === "invalid_email"
            ? "That email doesn't look right. Check it and try again."
            : "Something went wrong on our side. Try again.",
        );
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setError("Network error. Is the dev server still running?");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex h-full flex-col justify-center rounded-2xl border border-line bg-mist px-6 py-6">
        <p className="text-lg font-bold text-ink">Subscribed.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          You’ll get the next dispatch note. Unsubscribe anytime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <label htmlFor="newsletter-email" className="text-sm font-medium text-ink">
        Email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ada@example.com"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-faint outline-none transition-colors duration-200 focus:border-burgundy"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex h-12 shrink-0 items-center justify-center rounded-full bg-burgundy px-7 text-sm font-medium text-white transition-all duration-200 hover:shadow-[0_8px_20px_-8px_rgba(138,34,51,0.6)] active:translate-y-px disabled:opacity-60"
        >
          {state === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-burgundy">
          {error}
        </p>
      )}
      <p className="text-xs leading-relaxed text-faint">
        No drip campaigns. Unsubscribe anytime. By subscribing you agree to
        our{" "}
        <a href="/terms" className="text-burgundy underline underline-offset-2">
          Terms
        </a>
        .
      </p>
    </form>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="border-t border-line">
      {/* newsletter */}
      <div className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-12 md:grid-cols-2 md:items-center md:gap-16 md:px-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Subscribe to our newsletter
            </h3>
            <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-muted">
              One note a month on routing, model pricing, and keeping the
              burn down. No noise.
            </p>
          </div>
          <Newsletter />
        </div>
      </div>

      {/* link columns */}
      <div className="border-t border-line">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:grid-cols-3 md:px-8">
          <div>
            <h3 className="text-sm font-bold text-ink">Product</h3>
            <nav aria-label="Product" className="mt-4 flex flex-col gap-3">
              {PRODUCT_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-muted transition-colors duration-200 hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Resources</h3>
            <nav aria-label="Resources" className="mt-4 flex flex-col gap-3">
              {RESOURCE_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-muted transition-colors duration-200 hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">Company</h3>
            <nav aria-label="Company" className="mt-4 flex flex-col gap-3">
              {COMPANY_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-muted transition-colors duration-200 hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* legal row */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-6 text-xs tracking-wide text-faint sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>© 2026 Steeros</span>
          <span className="flex items-center gap-6">
            <a href="/terms" className="transition-colors duration-200 hover:text-ink">
              Terms of service
            </a>
            <a href="/privacy" className="transition-colors duration-200 hover:text-ink">
              Privacy policy
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
