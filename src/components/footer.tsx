import { ParticleWordmark } from "@/components/ui/particle-wordmark";

/**
 * Footer: link columns, legal row, and the particle wordmark at the foot.
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

export function Footer() {
  return (
    <footer id="footer" className="border-t border-white/10 bg-black">
      {/* link columns */}
      <div>
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:grid-cols-3 md:px-8">
          <div>
            <h3 className="text-sm font-bold text-white">Product</h3>
            <nav aria-label="Product" className="mt-4 flex flex-col gap-3">
              {PRODUCT_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Resources</h3>
            <nav aria-label="Resources" className="mt-4 flex flex-col gap-3">
              {RESOURCE_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Company</h3>
            <nav aria-label="Company" className="mt-4 flex flex-col gap-3">
              {COMPANY_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* legal row */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-6 text-xs tracking-wide text-white/50 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>© 2026 Steeros</span>
          <span className="flex items-center gap-6">
            <a href="/terms" className="transition-colors duration-200 hover:text-white">
              Terms of service
            </a>
            <a href="/privacy" className="transition-colors duration-200 hover:text-white">
              Privacy policy
            </a>
          </span>
        </div>
      </div>

      <ParticleWordmark />
    </footer>
  );
}
