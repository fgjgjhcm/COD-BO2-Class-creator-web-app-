import type { Metadata } from "next";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { getEquipmentByType } from "@/data/equipment";

export const metadata: Metadata = {
  title: "BO2 Equipment",
  description:
    "Black Ops II lethal and tactical equipment for the Pick 10 Create-a-Class builder.",
  alternates: { canonical: "/equipment" },
};

export default function EquipmentIndexPage() {
  return (
    <>
      <p className="seo-eyebrow">Create-a-Class</p>
      <h1 className="seo-title">BO2 Equipment</h1>
      <p className="seo-lead">
        Lethal and tactical gear. Danger Close and Tactician wildcards unlock
        extra slots.
      </p>

      <SeoSection title="Lethal">
        <ItemGrid
          items={getEquipmentByType("lethal").map((item) => ({
            href: `/equipment/${item.id}`,
            item,
            folder: "equipment",
          }))}
        />
      </SeoSection>

      <SeoSection title="Tactical">
        <ItemGrid
          items={getEquipmentByType("tactical").map((item) => ({
            href: `/equipment/${item.id}`,
            item,
            folder: "equipment",
          }))}
        />
      </SeoSection>
    </>
  );
}
