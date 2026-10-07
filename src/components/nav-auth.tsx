"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Account links in the nav. Checks the session through the site's
 * /api/auth/me relay (the cookie lives on .steerosai.com in production,
 * so the browser sends it to the site; the VPS does the lookup). While
 * loading it renders nothing so the nav doesn't flash the wrong state.
 */

type AuthState = "loading" | "anon" | { name: string | null; email: string };

export function NavAuth() {
  const [state, setState] = useState<AuthState>("loading");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setState(
          data?.ok && data.user
            ? { name: data.user.name ?? null, email: data.user.email }
            : "anon",
        );
      })
      .catch(() => {
        if (!cancelled) setState("anon");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* reload still re-checks the session below */
    }
    window.location.reload();
  };

  if (state === "loading") return null;

  if (state === "anon") {
    return (
      <>
        <Link
          href="/login"
          className="text-base font-medium text-muted transition-colors duration-200 hover:text-ink"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-line px-4 py-1.5 text-base font-medium text-ink transition-colors duration-200 hover:border-burgundy hover:text-burgundy"
        >
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <a
        href="https://app.steerosai.com/"
        className="text-base font-medium text-muted transition-colors duration-200 hover:text-ink"
      >
        Open dashboard
      </a>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="text-base font-medium text-muted transition-colors duration-200 hover:text-ink disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </>
  );
}
