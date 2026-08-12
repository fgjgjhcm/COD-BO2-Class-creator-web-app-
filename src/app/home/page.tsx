import type { Metadata } from "next";
import Link from "next/link";
import { SeoShell } from "@/components/seo/SeoShell";
import { SEO_NAV } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "BO2 Loadouts | Black Ops II Create-a-Class",
  },
  description:
    "Fan-made Black Ops II Create-a-Class and Pick 10 loadout builder. Browse weapons, attachments, perks, equipment, and wildcards.",
  alternates: { canonical: "/home" },
};

export default function HomeMarketingPage() {
  return (
    <SeoShell hideTabs>
      <div className="seo-home">
        <p className="seo-eyebrow">Black Ops II</p>
        <h1 className="seo-title">Create-a-Class Loadouts</h1>
        <p className="seo-lead">
          Build Pick 10 classes in the browser, or browse every weapon,
          attachment, perk, and wildcard in the reference pages.
        </p>
        <Link href="/" className="seo-cta seo-cta-inline seo-cta-lg">
          Open Class Builder
        </Link>

        <nav className="seo-home-tabs" aria-label="Browse sections">
          {SEO_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="seo-home-tab">
              <span className="seo-home-tab-label">{item.label}</span>
              <span className="seo-home-tab-blurb">{item.blurb}</span>
            </Link>
          ))}
        </nav>
      </div>
    </SeoShell>
  );
}
