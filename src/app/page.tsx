import type { Metadata } from "next";
import Link from "next/link";
import { SeoShell } from "@/components/seo/SeoShell";
import { SEO_NAV, SITE_DOMAIN } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "BO2 Loadouts | Black Ops II Create-a-Class",
  },
  description:
    "Fan-made Black Ops II Create-a-Class and Pick 10 loadout builder. Browse weapons, attachments, perks, equipment, and wildcards.",
  alternates: { canonical: "/" },
};

export default function HomeMarketingPage() {
  return (
    <SeoShell hideTabs bleed>
      <div className="home-landing">
        <section className="home-hero" aria-label="BO2 Loadouts">
          <div className="home-hero-stage" aria-hidden="true">
            <div className="home-hero-glow" />
            <div className="home-hero-grid" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="home-hero-gun"
              src="/images/weapons/dsr_50.webp"
              alt=""
              width={640}
              height={240}
            />
            <div className="home-hero-scan" />
          </div>

          <div className="home-hero-copy">
            <p className="home-kicker">Black Ops II · Pick 10</p>
            <h1 className="home-brand">{SITE_DOMAIN}</h1>
            <p className="home-tag">
              Build the class. Spend the ten. Share the loadout.
            </p>
            <div className="home-actions">
              <Link href="/builder" className="seo-cta seo-cta-lg home-cta-primary">
                Open Class Builder
              </Link>
              <Link href="/guide/pick-10" className="home-cta-ghost">
                How Pick 10 works
              </Link>
            </div>
          </div>
        </section>

        <section className="home-browse" aria-labelledby="home-browse-title">
          <div className="home-browse-inner">
            <p className="home-browse-eyebrow">Reference</p>
            <h2 id="home-browse-title" className="home-browse-title">
              Browse the arsenal
            </h2>
            <nav className="home-browse-list" aria-label="Browse sections">
              {SEO_NAV.map((item) => (
                <Link key={item.href} href={item.href} className="home-browse-link">
                  <span className="home-browse-label">{item.label}</span>
                  <span className="home-browse-blurb">{item.blurb}</span>
                  <span className="home-browse-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </SeoShell>
  );
}
