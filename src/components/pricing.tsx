"use client";

import { useState, type FormEvent } from "react";
import { DownloadSimple, Check } from "@phosphor-icons/react";
import { Magnetic } from "@/components/ui/magnetic";

/**
 * Two ways in. The free config download mirrors the real Steeros
 * /api/free/download endpoint. The enterprise form mirrors the real
 * /api/enterprise/lead endpoint (name, email, company -> leads.json).
 * On a white page, the enterprise card is the one burgundy field
 * besides the stat band.
 */

const FREE_ITEMS = [
  "Working config template, routes.free.yaml",
  "One-line localhost proxy",
  "Cost ceilings you edit by hand",
  "Enough for a solo dev or a small team pilot",
];

const ENTERPRISE_ITEMS = [
  "Every agent: Claude Code, Cursor, Copilot, Gemini CLI",
  "PII scrubbing and redaction",
  "Self-tuning classifier on your prompt mix",
  "Unlimited seats, real support",
];

type FormState = "idle" | "loading" | "success" | "error";

function LeadForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
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
      <div className="mt-8 flex flex-col justify-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-5 py-6">
        <Check size={20} weight="bold" className="text-white" />
        <p className="text-lg font-bold text-white">You’re in.</p>
        <p className="text-sm leading-relaxed text-white/80">
          We’ll reach out within a working day.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 outline-none transition-colors duration-200 focus:border-white";

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="lead-name" className="text-sm font-medium text-white">
          Name
        </label>
        <input
          id="lead-name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="lead-email" className="text-sm font-medium text-white">
          Work email
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ada@company.dev"
          className={inputClass}
        />
        <p className="text-xs text-white/75">
          We only use this to reply. No drip campaigns.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="lead-company" className="text-sm font-medium text-white">
          Company
        </label>
        <input
          id="lead-company"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Analytical Engines Inc."
          className={inputClass}
        />
      </div>

      {state === "error" && (
        <p role="alert" className="text-sm text-white">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-burgundy transition-opacity duration-200 hover:opacity-90 active:translate-y-px disabled:opacity-60"
      >
        {state === "loading" ? "Sending..." : "Book a pilot"}
      </button>
    </form>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-[1200px] overflow-hidden px-5 py-20 md:px-8 md:py-28"
    >
      <h2 className="mx-auto max-w-[24ch] text-center text-4xl font-bold leading-[1.1] tracking-tight text-balance text-ink md:text-6xl">
        Free to pilot. Built for fleets.
      </h2>

      <div className="mt-11 grid gap-6 lg:grid-cols-2">
        {/* free */}
        <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-8 shadow-[0_2px_4px_rgba(34,22,26,0.04),0_24px_48px_-24px_rgba(34,22,26,0.16)] md:p-10">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-muted">Steeros Free</span>
            <span className="text-4xl font-bold tracking-tight tabular-nums text-ink">
              25k
              <span className="ml-1.5 text-sm font-normal text-faint">req/mo</span>
            </span>
          </div>
          <ul className="mt-7 flex flex-col gap-3">
            {FREE_ITEMS.map((f) => (
              <li key={f} className="flex items-start gap-3 text-base text-muted">
                <Check size={14} weight="bold" className="mt-1 shrink-0 text-burgundy" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            <Magnetic strength={0.15}>
              <a
                href="/api/config"
                download
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-7 text-sm font-medium text-ink transition-colors duration-200 hover:border-burgundy hover:text-burgundy active:translate-y-px"
              >
                <DownloadSimple size={16} weight="bold" />
                Get the free config
              </a>
            </Magnetic>
          </div>
        </div>

        {/* enterprise, the burgundy field */}
        <div className="flex h-full flex-col rounded-2xl bg-burgundy p-8 shadow-[0_2px_4px_rgba(34,22,26,0.06),0_28px_56px_-24px_rgba(138,34,51,0.55)] md:p-10">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-white">Enterprise</span>
            <span className="text-sm text-white/70">Custom pricing</span>
          </div>
          <ul className="mt-7 flex flex-col gap-3">
            {ENTERPRISE_ITEMS.map((f) => (
              <li key={f} className="flex items-start gap-3 text-base text-white/90">
                <Check size={14} weight="bold" className="mt-1 shrink-0 text-white/70" />
                {f}
              </li>
            ))}
          </ul>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
