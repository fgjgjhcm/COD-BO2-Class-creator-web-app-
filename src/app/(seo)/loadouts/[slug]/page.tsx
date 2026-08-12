import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoSection } from "@/components/seo/ItemGrid";
import {
  FEATURED_LOADOUTS,
  featuredLoadoutsBySlug,
  getAbsoluteBuilderHref,
  getBuilderHref,
} from "@/data/featuredLoadouts";
import { attachmentsById } from "@/data/attachments";
import { equipmentById } from "@/data/equipment";
import { perksById } from "@/data/perks";
import { weaponsById } from "@/data/weapons";
import { wildcardsById } from "@/data/wildcards";
import { getItemImageSrc } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";
import { countUsedPoints } from "@/lib/pick10";
import type { GameItem } from "@/types/class";
import type { ItemImageFolder } from "@/lib/icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FEATURED_LOADOUTS.map((loadout) => ({ slug: loadout.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loadout = featuredLoadoutsBySlug[slug];
  if (!loadout) return { title: "Loadout" };
  return {
    title: { absolute: `${loadout.seoTitle} | BO2 Loadouts` },
    description: loadout.seoDescription,
    alternates: { canonical: `/loadouts/${loadout.slug}` },
    openGraph: {
      title: loadout.seoTitle,
      description: loadout.seoDescription,
      url: `${SITE_URL}/loadouts/${loadout.slug}`,
    },
  };
}

function Chip({
  item,
  folder,
  href,
}: {
  item: GameItem;
  folder: ItemImageFolder;
  href?: string;
}) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={getItemImageSrc(item, folder)} alt="" className="loadout-chip-icon" />
      <span>{item.name}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="loadout-chip loadout-chip--link">
        {content}
      </Link>
    );
  }

  return <span className="loadout-chip">{content}</span>;
}

function chipsFromIds(
  ids: (string | null)[],
  resolve: (id: string) => GameItem | undefined,
  folder: ItemImageFolder,
  hrefFor?: (id: string) => string | undefined,
) {
  return ids
    .filter((id): id is string => Boolean(id))
    .map((id) => {
      const item = resolve(id);
      if (!item) return null;
      return (
        <Chip key={`${folder}-${id}-${item.name}`} item={item} folder={folder} href={hrefFor?.(id)} />
      );
    })
    .filter(Boolean);
}

export default async function LoadoutDetailPage({ params }: Props) {
  const { slug } = await params;
  const loadout = featuredLoadoutsBySlug[slug];
  if (!loadout) notFound();

  const { build } = loadout;
  const primary = build.primaryWeaponId
    ? weaponsById[build.primaryWeaponId]
    : null;
  const secondary = build.secondaryWeaponId
    ? weaponsById[build.secondaryWeaponId]
    : null;
  const points = countUsedPoints(build);
  const builderHref = getBuilderHref(loadout);
  const related = FEATURED_LOADOUTS.filter(
    (entry) => entry.group === loadout.group && entry.slug !== loadout.slug,
  ).slice(0, 4);

  return (
    <>
      <p className="seo-eyebrow">Featured Loadout</p>
      <div className="loadout-detail-hero">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getItemImageSrc(primary, "weapons")}
            alt=""
            className="loadout-detail-gun"
          />
        ) : null}
        <div>
          <h1 className="seo-title">{loadout.name}</h1>
          <p className="loadout-detail-tag">{loadout.tagline}</p>
          <p className="seo-lead">{loadout.description}</p>
          <div className="loadout-detail-actions">
            <Link href={builderHref} className="seo-cta seo-cta-lg">
              Open in Class Builder
            </Link>
            <span className="loadout-detail-points">
              {points} / 10 Pick 10
            </span>
          </div>
          {loadout.goals.length > 0 ? (
            <p className="loadout-detail-goals">
              Good for: {loadout.goals.join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <SeoSection title="Primary">
        <div className="loadout-chip-row">
          {primary ? (
            <Chip
              item={primary}
              folder="weapons"
              href={`/weapons/${primary.id}`}
            />
          ) : (
            <span className="seo-lead">No primary</span>
          )}
          {chipsFromIds(
            build.primaryAttachmentIds,
            (id) => attachmentsById[id],
            "attachments",
            (id) => `/attachments/${id}`,
          )}
        </div>
      </SeoSection>

      <SeoSection title="Secondary">
        <div className="loadout-chip-row">
          {secondary ? (
            <Chip
              item={secondary}
              folder="weapons"
              href={`/weapons/${secondary.id}`}
            />
          ) : (
            <span className="seo-lead">No secondary</span>
          )}
          {chipsFromIds(
            build.secondaryAttachmentIds,
            (id) => attachmentsById[id],
            "attachments",
            (id) => `/attachments/${id}`,
          )}
        </div>
      </SeoSection>

      <SeoSection title="Perks">
        <div className="loadout-chip-row">
          {chipsFromIds(
            [...build.perk1Ids, ...build.perk2Ids, ...build.perk3Ids],
            (id) => perksById[id],
            "perks",
            (id) => `/perks/${id}`,
          )}
        </div>
      </SeoSection>

      <SeoSection title="Equipment">
        <div className="loadout-chip-row">
          {chipsFromIds(
            [...build.lethalIds, ...build.tacticalIds],
            (id) => equipmentById[id],
            "equipment",
            (id) => `/equipment/${id}`,
          )}
          {!build.lethalIds.some(Boolean) && !build.tacticalIds.some(Boolean) ? (
            <span className="seo-lead">No equipment — points spent elsewhere</span>
          ) : null}
        </div>
      </SeoSection>

      <SeoSection title="Wildcards">
        <div className="loadout-chip-row">
          {chipsFromIds(
            build.wildcardIds,
            (id) => wildcardsById[id as keyof typeof wildcardsById],
            "wildcards",
            (id) => `/wildcards/${id}`,
          )}
          {!build.wildcardIds.some(Boolean) ? (
            <span className="seo-lead">No wildcards</span>
          ) : null}
        </div>
      </SeoSection>

      {loadout.streaksNote ? (
        <SeoSection title="Scorestreaks">
          <p className="seo-lead">{loadout.streaksNote}</p>
        </SeoSection>
      ) : null}

      {related.length > 0 ? (
        <SeoSection title="Related loadouts">
          <ul className="loadout-related">
            {related.map((entry) => (
              <li key={entry.slug}>
                <Link href={`/loadouts/${entry.slug}`}>{entry.name}</Link>
                <span> — {entry.tagline}</span>
              </li>
            ))}
          </ul>
        </SeoSection>
      ) : null}

      <p className="seo-lead">
        <Link href="/loadouts" style={{ color: "var(--accent)" }}>
          All featured loadouts
        </Link>
        {" · "}
        <Link href="/guide/pick-10" style={{ color: "var(--accent)" }}>
          How Pick 10 works
        </Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: loadout.seoTitle,
            description: loadout.seoDescription,
            url: `${SITE_URL}/loadouts/${loadout.slug}`,
            mainEntity: {
              "@type": "HowTo",
              name: loadout.name,
              description: loadout.description,
              url: getAbsoluteBuilderHref(loadout),
            },
          }),
        }}
      />
    </>
  );
}
