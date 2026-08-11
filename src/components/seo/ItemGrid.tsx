import Link from "next/link";
import type { ReactNode } from "react";
import type { GameItem } from "@/types/class";
import { getItemImageSrc, type ItemImageFolder } from "@/lib/icons";

export interface SeoItemLink {
  href: string;
  item: GameItem;
  folder: ItemImageFolder;
  meta?: string;
}

export function ItemGrid({ items }: { items: SeoItemLink[] }) {
  return (
    <ul className="seo-item-grid">
      {items.map(({ href, item, folder, meta }) => (
        <li key={href}>
          <Link href={href} className="seo-item-link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getItemImageSrc(item, folder)}
              alt=""
              className="seo-item-icon"
              loading="lazy"
            />
            <span className="seo-item-name">{item.name}</span>
            {meta ? <span className="seo-item-meta">{meta}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SeoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="seo-section">
      <h2 className="seo-section-title">{title}</h2>
      {children}
    </section>
  );
}
