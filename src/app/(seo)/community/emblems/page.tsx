import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Emblems Coming Soon",
  description:
    "Community emblems for BO2 Loadouts are coming soon. Shape layers, colors, and shareable emblem recipes.",
  alternates: { canonical: "/community/emblems" },
};

export default function CommunityEmblemsPage() {
  return (
    <div className="community-emblems-soon">
      <p className="seo-eyebrow">Create-an-Emblem</p>
      <h1 className="seo-title">Emblems</h1>
      <p className="seo-lead">
        Operative emblem studio is under construction. Layer shapes, colors,
        rotation, and opacity — then publish to Community.
      </p>
      <div className="community-empty">
        <p className="community-empty-title">COMING SOON</p>
        <p className="seo-lead">
          Emblem data will store as JSONB layers (shape, position, scale,
          rotation, color, opacity, order) — same publish loop as loadouts.
        </p>
        <Link href="/community" className="seo-cta">
          Back to Community
        </Link>
      </div>
    </div>
  );
}
