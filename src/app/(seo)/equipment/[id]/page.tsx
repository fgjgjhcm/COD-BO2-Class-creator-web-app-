import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemHero } from "@/components/seo/ItemHero";
import { equipment, equipmentById } from "@/data/equipment";
import { formatCategoryLabel } from "@/lib/items";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return equipment.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = equipmentById[id];
  if (!item) return { title: "Equipment" };
  return {
    title: `${item.name} — BO2 ${formatCategoryLabel(item.type)}`,
    description: `${item.name} Black Ops II ${item.type} equipment for the Pick 10 Create-a-Class builder.`,
    alternates: { canonical: `/equipment/${item.id}` },
  };
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { id } = await params;
  const item = equipmentById[id];
  if (!item) notFound();

  return (
    <ItemHero
      item={item}
      folder="equipment"
      eyebrow={formatCategoryLabel(item.type)}
      title={item.name}
      description={item.description}
    />
  );
}
