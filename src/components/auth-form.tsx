"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

/**
 * Signup / login form. Posts to this site's /api/auth/* routes, which
 * relay to the auth API on the VPS (app.steerosai.com) and return the
 * SSO session cookie. On success the browser is handed to the
 * dashboard — new accounts to /billing (they pick a plan there),
 * logins to the console home.
 */

type Mode = "login" | "signup";
type FormState = "idle" | "loading" | "error";

export function AuthForm({ mode }: { mode: Mode }) {
  const isSignup = mode === "signup";
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { email, password, name } : { email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          typeof data.error === "string" && data.error !== "server_error"
            ? data.error
            : "Something went wrong on our side. Try again.",
        );
        setState("error");
        return;
      }
      // Session cookie is set — hand over to the dashboard (SSO).
      window.location.href = isSignup
        ? "https://app.steerosai.com/billing"
        : "https://app.steerosai.com/";
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3" noValidate>
      {isSignup && (
        <>
          <label htmlFor="auth-name" className="text-sm font-medium text-ink">
            Name <span className="font-normal text-faint">(optional)</span>
          </label>
          <input
            id="auth-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-faint outline-none transition-colors duration-200 focus:border-burgundy"
          />
        </>
      )}

      <label htmlFor="auth-email" className="text-sm font-medium text-ink">
        Email
      </label>
      <input
        id="auth-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ada@example.com"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-faint outline-none transition-colors duration-200 focus:border-burgundy"
      />

      <label htmlFor="auth-password" className="text-sm font-medium text-ink">
        Password
      </label>
      <input
        id="auth-password"
        name="password"
        type="password"
        required
        autoComplete={isSignup ? "new-password" : "current-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={isSignup ? "At least 8 characters" : "Your password"}
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
        {state === "loading"
          ? isSignup
            ? "Creating account…"
            : "Signing in…"
          : isSignup
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-xs leading-relaxed text-faint">
        {isSignup ? (
          <>
            One account for the console, billing, and API keys. Already have
            one?{" "}
            <Link href="/login" className="text-burgundy hover:underline">
              Sign in
            </Link>
            .
          </>
        ) : (
          <>
            New to Steeros?{" "}
            <Link href="/signup" className="text-burgundy hover:underline">
              Create an account
            </Link>
            .
          </>
        )}
      </p>
    </form>
  );
}
