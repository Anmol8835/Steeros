"use client";

import { useState, type FormEvent } from "react";
import { Check } from "@phosphor-icons/react";

/**
 * Early access signup form. Posts to /api/early-access, which dedupes
 * on email and persists to early-access.json.
 */

type FormState = "idle" | "loading" | "success" | "error";

export function EarlyAccessForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/early-access", {
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
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-line bg-mist px-6 py-10 text-center">
        <Check size={24} weight="bold" className="text-burgundy" />
        <p className="text-lg font-bold text-ink">You’re on the list.</p>
        <p className="max-w-[36ch] text-sm leading-relaxed text-muted">
          We’ll reach out as soon as your invite is ready. No spam, ever.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3" noValidate>
      <label htmlFor="early-access-email" className="text-sm font-medium text-ink">
        Work email
      </label>
      <input
        id="early-access-email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ada@company.dev"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-faint outline-none transition-colors duration-200 focus:border-burgundy"
      />
      {state === "error" && (
        <p role="alert" className="text-sm text-burgundy">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-burgundy px-7 text-sm font-medium text-white transition-all duration-200 hover:shadow-[0_8px_20px_-8px_rgba(138,34,51,0.6)] active:translate-y-px disabled:opacity-60"
      >
        {state === "loading" ? "Requesting..." : "Request access"}
      </button>
      <p className="text-xs leading-relaxed text-faint">
        We only use this to send your invite. No drip campaigns.
      </p>
    </form>
  );
}
