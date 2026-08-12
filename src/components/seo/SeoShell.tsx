import Link from "next/link";
import type { ReactNode } from "react";
import { SeoTabs } from "@/components/seo/SeoTabs";
import { SITE_DOMAIN, SITE_ICON } from "@/lib/site";

export function SeoShell({
  children,
  breadcrumb,
  hideTabs = false,
  bleed = false,
}: {
  children: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  /** Home page uses its own large section tabs */
  hideTabs?: boolean;
  /** Full-bleed landing (no main max-width padding) */
  bleed?: boolean;
}) {
  return (
    <div className={`seo-shell${bleed ? " seo-shell--bleed" : ""}`}>
      <header className="seo-header">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE_ICON}
              alt=""
              className="seo-brand-icon"
              width={28}
              height={28}
            />
            <span>{SITE_DOMAIN}</span>
          </Link>
          <Link href="/builder" className="seo-cta">
            Open Class Builder
          </Link>
        </div>
        {!hideTabs ? <SeoTabs /> : null}
      </header>

      <main className={bleed ? "seo-main seo-main--bleed" : "seo-main"}>
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav className="seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {breadcrumb.map((crumb) => (
              <span key={crumb.label} className="seo-breadcrumb-item">
                <span aria-hidden="true">/</span>
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        {children}
      </main>

      <footer className="seo-footer">
        <p>
          Fan-made Black Ops II Create-a-Class tool. Not affiliated with
          Activision or Treyarch.
        </p>
        <p className="seo-footer-meta">
          <Link href="/">{SITE_DOMAIN}</Link>
          {" · "}
          <Link href="/builder">Class builder</Link>
        </p>
      </footer>
    </div>
  );
}
