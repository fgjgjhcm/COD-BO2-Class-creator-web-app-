import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { ItemHero } from "@/components/seo/ItemHero";
import { getAttachmentsForWeapon } from "@/data/attachments";
import { weapons, weaponsById } from "@/data/weapons";
import { getWeaponCategoryLabel } from "@/lib/items";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return weapons.map((weapon) => ({ id: weapon.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const weapon = weaponsById[id];
  if (!weapon) return { title: "Weapon" };
  const category = getWeaponCategoryLabel(weapon.category);
  return {
    title: `${weapon.name} — BO2 ${category.replace(/s$/, "")}`,
    description: `${weapon.name} Black Ops II loadout page: slot, category, and compatible attachments for the Pick 10 class builder.`,
    alternates: { canonical: `/weapons/${weapon.id}` },
  };
}

export default async function WeaponDetailPage({ params }: Props) {
  const { id } = await params;
  const weapon = weaponsById[id];
  if (!weapon) notFound();

  const categoryLabel = getWeaponCategoryLabel(weapon.category);
  const compatible = getAttachmentsForWeapon(weapon);

  return (
    <>
      <ItemHero
        item={weapon}
        folder="weapons"
        eyebrow={`${categoryLabel} · ${weapon.slot}`}
        title={weapon.name}
        description={
          weapon.description ??
          `Black Ops II ${categoryLabel.toLowerCase()} for Create-a-Class.`
        }
      />

      <SeoSection title="Compatible attachments">
        {compatible.length > 0 ? (
          <ItemGrid
            items={compatible.map((attachment) => ({
              href: `/attachments/${attachment.id}`,
              item: attachment,
              folder: "attachments",
              meta: attachment.category,
            }))}
          />
        ) : (
          <p className="seo-lead">This weapon does not use attachments.</p>
        )}
      </SeoSection>
    </>
  );
}
