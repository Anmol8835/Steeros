import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create your account: Steeros",
  description:
    "Create a Steeros account — up to 85% lower LLM spend, same quality. One login for the console, billing, and API keys.",
};

/**
 * Signup. Posts through /api/auth/signup, which relays to the auth API
 * on the VPS; the session cookie is shared with app.steerosai.com, so
 * the next stop is the dashboard's billing page.
 */
export default function SignupPage() {
  return (
    <main className="mx-auto max-w-[620px] px-5 pb-24 pt-28 md:px-8">
      <Link href="/" className="text-sm text-muted transition-colors duration-200 hover:text-ink">
        ← Back to Steeros
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink md:text-5xl">
        Create your account
      </h1>
      <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted">
        One account for the console, billing, and API keys. After this
        you’ll pick a plan — then Steeros routes every prompt to the
        cheapest model that can handle it.
      </p>

      <AuthForm mode="signup" />
    </main>
  );
}
