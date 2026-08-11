import type { Metadata } from "next";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { wildcards } from "@/data/wildcards";

export const metadata: Metadata = {
  title: "BO2 Wildcards",
  description:
    "Black Ops II wildcards for Pick 10 — Gunfighter, Overkill, Perk Greed, Danger Close, and Tactician.",
  alternates: { canonical: "/wildcards" },
};

export default function WildcardsIndexPage() {
  return (
    <>
      <p className="seo-eyebrow">Create-a-Class</p>
      <h1 className="seo-title">BO2 Wildcards</h1>
      <p className="seo-lead">
        Wildcards spend Pick 10 points to unlock extra attachment, perk, or
        equipment slots.
      </p>

      <SeoSection title="All wildcards">
        <ItemGrid
          items={wildcards.map((wildcard) => ({
            href: `/wildcards/${wildcard.id}`,
            item: wildcard,
            folder: "wildcards",
          }))}
        />
      </SeoSection>
    </>
  );
}
