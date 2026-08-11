import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { ItemHero } from "@/components/seo/ItemHero";
import {
  attachments,
  attachmentsById,
  isAttachmentCompatibleWithWeapon,
} from "@/data/attachments";
import { weapons } from "@/data/weapons";
import { formatCategoryLabel, getWeaponCategoryLabel } from "@/lib/items";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return attachments.map((attachment) => ({ id: attachment.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const attachment = attachmentsById[id];
  if (!attachment) return { title: "Attachment" };
  return {
    title: `${attachment.name} — BO2 Attachment`,
    description: `${attachment.name} Black Ops II attachment: compatibility and weapons that can equip it in the Pick 10 builder.`,
    alternates: { canonical: `/attachments/${attachment.id}` },
  };
}

export default async function AttachmentDetailPage({ params }: Props) {
  const { id } = await params;
  const attachment = attachmentsById[id];
  if (!attachment) notFound();

  const compatibleWeapons = weapons.filter((weapon) =>
    isAttachmentCompatibleWithWeapon(attachment, weapon),
  );

  return (
    <>
      <ItemHero
        item={attachment}
        folder="attachments"
        eyebrow={`${formatCategoryLabel(attachment.category)} attachment`}
        title={attachment.name}
        description={
          attachment.description ??
          `Compatible with ${attachment.compatibleCategories
            .map(getWeaponCategoryLabel)
            .join(", ")}.`
        }
      />

      <SeoSection title="Compatible categories">
        <p className="seo-lead">
          {attachment.compatibleCategories
            .map(getWeaponCategoryLabel)
            .join(" · ")}
        </p>
      </SeoSection>

      <SeoSection title="Weapons that can equip it">
        {compatibleWeapons.length > 0 ? (
          <ItemGrid
            items={compatibleWeapons.map((weapon) => ({
              href: `/weapons/${weapon.id}`,
              item: weapon,
              folder: "weapons",
              meta: getWeaponCategoryLabel(weapon.category),
            }))}
          />
        ) : (
          <p className="seo-lead">No compatible weapons in the current list.</p>
        )}
      </SeoSection>
    </>
  );
}
