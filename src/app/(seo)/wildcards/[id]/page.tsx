import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemHero } from "@/components/seo/ItemHero";
import { wildcards, wildcardsById } from "@/data/wildcards";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return wildcards.map((wildcard) => ({ id: wildcard.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const wildcard = wildcardsById[id as keyof typeof wildcardsById];
  if (!wildcard) return { title: "Wildcard" };
  return {
    title: `${wildcard.name} — BO2 Wildcard`,
    description: `${wildcard.name}: ${wildcard.effect} Use it in the Pick 10 Create-a-Class builder.`,
    alternates: { canonical: `/wildcards/${wildcard.id}` },
  };
}

export default async function WildcardDetailPage({ params }: Props) {
  const { id } = await params;
  const wildcard = wildcardsById[id as keyof typeof wildcardsById];
  if (!wildcard) notFound();

  return (
    <ItemHero
      item={wildcard}
      folder="wildcards"
      eyebrow="Wildcard"
      title={wildcard.name}
      description={wildcard.effect}
    />
  );
}
