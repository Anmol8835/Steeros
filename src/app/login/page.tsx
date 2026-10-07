import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in: Steeros",
  description:
    "Sign in to your Steeros account — one login for the console, billing, and API keys.",
};

/**
 * Sign in. Posts through /api/auth/login, which relays to the auth API
 * on the VPS; the session cookie is shared with app.steerosai.com.
 */
export default function LoginPage() {
  return (
    <main className="mx-auto max-w-[620px] px-5 pb-24 pt-28 md:px-8">
      <Link href="/" className="text-sm text-muted transition-colors duration-200 hover:text-ink">
        ← Back to Steeros
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Welcome back
      </h1>
      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted">
        Sign in to manage your API keys, watch routing and spend, and
        handle billing. You’ll land in the console.
      </p>

      <AuthForm mode="login" />
    </main>
  );
}
