import Link from "next/link";
import type { GameItem } from "@/types/class";
import { getItemImageSrc, type ItemImageFolder } from "@/lib/icons";

export function ItemHero({
  item,
  folder,
  eyebrow,
  title,
  description,
}: {
  item: GameItem;
  folder: ItemImageFolder;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="seo-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getItemImageSrc(item, folder)}
        alt=""
        className="seo-hero-icon"
      />
      <div>
        <p className="seo-eyebrow">{eyebrow}</p>
        <h1 className="seo-title">{title}</h1>
        {description ? <p className="seo-lead">{description}</p> : null}
        <Link href="/" className="seo-cta seo-cta-inline">
          Open Class Builder
        </Link>
      </div>
    </div>
  );
}
