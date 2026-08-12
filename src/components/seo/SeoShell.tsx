import Link from "next/link";
import type { ReactNode } from "react";
import { AuthButton } from "@/components/community/AuthButton";
import { SeoTabs } from "@/components/seo/SeoTabs";
import { SEO_HUB_NAV, SITE_DOMAIN, SITE_ICON } from "@/lib/site";

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
          <nav className="seo-header-hub" aria-label="Hub">
            {SEO_HUB_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`seo-header-hub-btn seo-header-hub-btn--${item.glow}`}
              >
                <span className="seo-header-hub-icon-wrap" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.icon}
                    alt=""
                    className="seo-header-hub-icon"
                    width={40}
                    height={40}
                  />
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="seo-header-actions">
            <AuthButton />
            <Link href="/builder" className="seo-cta">
              Open Class Builder
            </Link>
          </div>
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
          {" · "}
          <Link href="/community">Community</Link>
          {" · "}
          <Link href="/zombies">Zombies</Link>
        </p>
      </footer>
    </div>
  );
}
