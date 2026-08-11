import Link from "next/link";
import type { ReactNode } from "react";
import { SEO_NAV, SITE_NAME } from "@/lib/site";

export function SeoShell({
  children,
  breadcrumb,
}: {
  children: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}) {
  return (
    <div className="seo-shell">
      <header className="seo-header">
        <div className="seo-header-inner">
          <Link href="/" className="seo-brand">
            {SITE_NAME}
          </Link>
          <nav className="seo-nav" aria-label="Site">
            {SEO_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="seo-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="seo-cta">
            Open Class Builder
          </Link>
        </div>
      </header>

      <main className="seo-main">
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
        <div className="seo-footer-links">
          {SEO_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
