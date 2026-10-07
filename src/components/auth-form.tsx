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

      <div className="my-1 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      {/* The whole OAuth dance runs on the VPS (app.steerosai.com) — this
          is just a link, so the client secret never touches this site. */}
      <a
        href="https://app.steerosai.com/auth/google/start"
        className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-medium text-ink transition-all duration-200 hover:border-burgundy/40"
      >
        <svg viewBox="0 0 48 48" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        Continue with Google
      </a>

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
