import type { Metadata } from "next";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { getPerksByTier } from "@/data/perks";

export const metadata: Metadata = {
  title: "BO2 Perks",
  description:
    "Black Ops II Perk 1, Perk 2, and Perk 3 list for the Pick 10 Create-a-Class builder.",
  alternates: { canonical: "/perks" },
};

export default function PerksIndexPage() {
  return (
    <>
      <p className="seo-eyebrow">Create-a-Class</p>
      <h1 className="seo-title">BO2 Perks</h1>
      <p className="seo-lead">
        All three perk tiers used by the builder. Pair with Perk Greed wildcards
        for dual picks.
      </p>

      {([1, 2, 3] as const).map((tier) => (
        <SeoSection key={tier} title={`Perk ${tier}`}>
          <ItemGrid
            items={getPerksByTier(tier).map((perk) => ({
              href: `/perks/${perk.id}`,
              item: perk,
              folder: "perks",
            }))}
          />
        </SeoSection>
      ))}
    </>
  );
}
