import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemHero } from "@/components/seo/ItemHero";
import { perks, perksById } from "@/data/perks";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return perks.map((perk) => ({ id: perk.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const perk = perksById[id];
  if (!perk) return { title: "Perk" };
  return {
    title: `${perk.name} — BO2 Perk ${perk.tier}`,
    description: `${perk.name} (Perk ${perk.tier}): ${perk.description ?? "Black Ops II perk for Pick 10 Create-a-Class."}`,
    alternates: { canonical: `/perks/${perk.id}` },
  };
}

export default async function PerkDetailPage({ params }: Props) {
  const { id } = await params;
  const perk = perksById[id];
  if (!perk) notFound();

  return (
    <ItemHero
      item={perk}
      folder="perks"
      eyebrow={`Perk ${perk.tier}`}
      title={perk.name}
      description={perk.description}
    />
  );
}
