import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { RoutingMap } from "@/components/routing-map";
import { StatStrip } from "@/components/stat-strip";
import { Problem } from "@/components/problem";
import { Pipeline } from "@/components/pipeline";
import { Tiers } from "@/components/tiers";
import { Ledger } from "@/components/ledger";
import { Calculator } from "@/components/calculator";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <RoutingMap />
        <StatStrip />
        <Problem />
        <Pipeline />
        <Tiers />
        <Ledger />
        <Calculator />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
