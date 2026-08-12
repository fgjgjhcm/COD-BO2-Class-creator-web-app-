"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEO_NAV } from "@/lib/site";

export function SeoTabs() {
  const pathname = usePathname();

  return (
    <nav className="seo-tabs" aria-label="Sections">
      <div className="seo-tabs-inner">
        {SEO_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`seo-tab${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
