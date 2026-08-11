import type { Metadata } from "next";
import { ItemGrid, SeoSection } from "@/components/seo/ItemGrid";
import { attachments } from "@/data/attachments";
import type { AttachmentCategory } from "@/types/class";
import { formatCategoryLabel } from "@/lib/items";

export const metadata: Metadata = {
  title: "BO2 Attachments",
  description:
    "Black Ops II weapon attachments for Pick 10 — optics, barrels, magazines, stocks, and more.",
  alternates: { canonical: "/attachments" },
};

const ORDER: AttachmentCategory[] = [
  "optic",
  "barrel",
  "underbarrel",
  "magazine",
  "stock",
  "other",
];

export default function AttachmentsIndexPage() {
  return (
    <>
      <p className="seo-eyebrow">Create-a-Class</p>
      <h1 className="seo-title">BO2 Attachments</h1>
      <p className="seo-lead">
        Optics, barrels, magazines, and other attachments used by the class
        builder.
      </p>

      {ORDER.map((category) => {
        const items = attachments.filter((a) => a.category === category);
        if (items.length === 0) return null;
        return (
          <SeoSection key={category} title={formatCategoryLabel(category)}>
            <ItemGrid
              items={items.map((attachment) => ({
                href: `/attachments/${attachment.id}`,
                item: attachment,
                folder: "attachments",
              }))}
            />
          </SeoSection>
        );
      })}
    </>
  );
}
