import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoSection } from "@/components/seo/ItemGrid";
import { LoadoutPreview } from "@/components/community/LoadoutPreview";
import { LikeButton } from "@/components/community/LikeButton";
import { SaveButton } from "@/components/community/SaveButton";
import { UserBadge } from "@/components/community/UserBadge";
import { ReportButton } from "@/components/community/ReportButton";
import { getLoadoutBySlug } from "@/lib/community/queries";
import { countUsedPoints } from "@/lib/pick10";
import { SITE_URL } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const loadout = await getLoadoutBySlug(slug);
  if (!loadout) return { title: "Loadout" };
  return {
    title: { absolute: `${loadout.title} | BO2 Community` },
    description:
      loadout.description ||
      `Community Pick 10 loadout by @${loadout.profile?.username ?? "unknown"}. Open in the class builder.`,
    alternates: { canonical: `/community/loadout/${loadout.slug}` },
    openGraph: {
      title: loadout.title,
      description: loadout.description || "BO2 community loadout",
      url: `${SITE_URL}/community/loadout/${loadout.slug}`,
    },
  };
}

export default async function CommunityLoadoutPage({ params }: Props) {
  const { slug } = await params;
  const loadout = await getLoadoutBySlug(slug);
  if (!loadout) notFound();

  const points = countUsedPoints(loadout.loadout_data);
  const openHref = `/builder?community=${loadout.id}`;
  const remixHref = `/builder?community=${loadout.id}&remix=1`;

  return (
    <>
      <p className="seo-eyebrow">Community Loadout</p>
      <h1 className="seo-title">{loadout.title}</h1>
      <div className="community-detail-meta">
        <UserBadge profile={loadout.profile} />
        <span>{points}/10 Pick 10</span>
        <span>{new Date(loadout.created_at).toLocaleDateString()}</span>
      </div>

      {loadout.remix_of_slug ? (
        <p className="community-remix-tag">
          Remix of{" "}
          <Link href={`/community/loadout/${loadout.remix_of_slug}`}>
            {loadout.remix_of_title ?? "original loadout"}
          </Link>
        </p>
      ) : null}

      {loadout.description ? (
        <p className="seo-lead">{loadout.description}</p>
      ) : null}

      <div className="community-detail-actions">
        <Link href={openHref} className="seo-cta seo-cta-lg">
          Open in Class Builder
        </Link>
        <Link href={remixHref} className="community-action-btn">
          Remix
        </Link>
        <LikeButton
          loadoutId={loadout.id}
          initialLiked={loadout.liked_by_me}
          initialCount={loadout.like_count}
        />
        <SaveButton
          loadoutId={loadout.id}
          initialSaved={loadout.saved_by_me}
          initialCount={loadout.save_count}
        />
      </div>

      <SeoSection title="Class">
        <LoadoutPreview build={loadout.loadout_data} />
      </SeoSection>

      <ReportButton loadoutId={loadout.id} />

      <p className="seo-lead">
        <Link href="/community" style={{ color: "var(--accent)" }}>
          Back to Community
        </Link>
      </p>
    </>
  );
}
