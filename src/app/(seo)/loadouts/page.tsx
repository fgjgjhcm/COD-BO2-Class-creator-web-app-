import type { Metadata } from "next";
import Link from "next/link";
import {
  FEATURED_LOADOUTS,
  LOADOUT_GROUP_LABELS,
  getBuilderHref,
  getFeaturedLoadoutsByGroup,
  type FeaturedLoadoutGroup,
} from "@/data/featuredLoadouts";
import { weaponsById } from "@/data/weapons";
import { getItemImageSrc } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "BO2 Loadouts by Mode & Playstyle",
  description:
    "Proven Black Ops II Pick 10 loadouts for Search and Destroy, nuclears, Domination, MSMC rush, Assault Shield rage bait, and more. Open any class in the builder.",
  alternates: { canonical: "/loadouts" },
};

const GROUP_ORDER: FeaturedLoadoutGroup[] = ["mode", "playstyle", "ragebait"];

export default function LoadoutsIndexPage() {
  return (
    <>
      <p className="seo-eyebrow">Create-a-Class</p>
      <h1 className="seo-title">BO2 Loadouts</h1>
      <p className="seo-lead">
        Goal-specific and playstyle classes for Black Ops 2 — Search and
        Destroy, 30-kill nuclears, Domination, rush SMGs, and the Assault
        Shield crimes you pretend not to run. Open any loadout in the Pick 10
        builder.
      </p>

      {GROUP_ORDER.map((group) => {
        const loadouts = getFeaturedLoadoutsByGroup(group);
        return (
          <section key={group} className="seo-section">
            <h2 className="seo-section-title">{LOADOUT_GROUP_LABELS[group]}</h2>
            <ul className="loadout-card-list">
              {loadouts.map((loadout) => {
                const primary = loadout.build.primaryWeaponId
                  ? weaponsById[loadout.build.primaryWeaponId]
                  : null;
                return (
                  <li key={loadout.slug}>
                    <Link
                      href={`/loadouts/${loadout.slug}`}
                      className="loadout-card"
                    >
                      {primary ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getItemImageSrc(primary, "weapons")}
                          alt=""
                          className="loadout-card-icon"
                          loading="lazy"
                        />
                      ) : (
                        <span className="loadout-card-icon loadout-card-icon--empty" />
                      )}
                      <span className="loadout-card-copy">
                        <span className="loadout-card-name">{loadout.name}</span>
                        <span className="loadout-card-tag">{loadout.tagline}</span>
                        {primary ? (
                          <span className="loadout-card-meta">{primary.name}</span>
                        ) : null}
                      </span>
                      <span className="loadout-card-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                    <Link
                      href={getBuilderHref(loadout)}
                      className="loadout-card-builder"
                    >
                      Open in builder
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="seo-lead" style={{ marginTop: "2rem" }}>
        Prefer to cook from scratch?{" "}
        <Link href="/builder" style={{ color: "var(--accent)" }}>
          Open the class builder
        </Link>{" "}
        or browse{" "}
        <Link href="/weapons" style={{ color: "var(--accent)" }}>
          weapons
        </Link>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "BO2 Featured Loadouts",
            numberOfItems: FEATURED_LOADOUTS.length,
            itemListElement: FEATURED_LOADOUTS.map((loadout, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/loadouts/${loadout.slug}`,
              name: loadout.name,
            })),
          }),
        }}
      />
    </>
  );
}
