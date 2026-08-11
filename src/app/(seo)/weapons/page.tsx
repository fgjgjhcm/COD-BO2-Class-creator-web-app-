import type { Metadata } from "next";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { weapons } from "@/data/weapons";
import { groupWeaponsByCategory } from "@/lib/items";

export const metadata: Metadata = {
  title: "BO2 Weapons",
  description:
    "Full Black Ops II weapon list for the Pick 10 Create-a-Class builder — assault rifles, SMGs, LMGs, snipers, shotguns, pistols, and more.",
  alternates: { canonical: "/weapons" },
};

export default function WeaponsIndexPage() {
  const groups = groupWeaponsByCategory(weapons);

  return (
    <>
      <p className="seo-eyebrow">Create-a-Class</p>
      <h1 className="seo-title">BO2 Weapons</h1>
      <p className="seo-lead">
        Browse every weapon in the builder. Open a gun for compatible
        attachments, then build your Pick 10 loadout.
      </p>

      {groups.map((group) => (
        <SeoSection key={group.category} title={group.label}>
          <ItemGrid
            items={group.weapons.map((weapon) => ({
              href: `/weapons/${weapon.id}`,
              item: weapon,
              folder: "weapons",
              meta: weapon.slot,
            }))}
          />
        </SeoSection>
      ))}
    </>
  );
}
