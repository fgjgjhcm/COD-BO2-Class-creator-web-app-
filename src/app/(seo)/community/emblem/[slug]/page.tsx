import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserBadge } from "@/components/community/UserBadge";
import { DeleteEmblemButton } from "@/components/community/DeleteEmblemButton";
import { getEmblemBySlug, getMyProfile } from "@/lib/community/queries";
import { emblemEditorLoadUrl } from "@/lib/community/emblemLinks";
import { SITE_URL } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const emblem = await getEmblemBySlug(slug);
  if (!emblem) return { title: "Emblem" };
  return {
    title: { absolute: `${emblem.title} | BO2 Community Emblem` },
    description:
      emblem.description ||
      `Community BO2 emblem by @${emblem.profile?.username ?? "unknown"}.`,
    alternates: { canonical: `/community/emblem/${emblem.slug}` },
    openGraph: {
      title: emblem.title,
      description: emblem.description || "BO2 community emblem",
      url: `${SITE_URL}/community/emblem/${emblem.slug}`,
      images: emblem.preview_url ? [emblem.preview_url] : undefined,
    },
  };
}

export default async function CommunityEmblemPage({ params }: Props) {
  const { slug } = await params;
  const [emblem, me] = await Promise.all([
    getEmblemBySlug(slug),
    getMyProfile(),
  ]);
  if (!emblem) notFound();

  const isOwner = me?.id === emblem.user_id;
  const openHref = emblemEditorLoadUrl(emblem.emblem_code);

  return (
    <>
      <p className="seo-eyebrow">Community Emblem</p>
      <h1 className="seo-title">{emblem.title}</h1>
      <div className="community-detail-meta">
        <UserBadge profile={emblem.profile} />
        <span>{emblem.layer_count ?? 0}/32 layers</span>
        <span>{new Date(emblem.created_at).toLocaleDateString()}</span>
      </div>

      {emblem.description ? (
        <p className="seo-lead">{emblem.description}</p>
      ) : null}

      <div className="community-emblem-detail-preview">
        {emblem.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emblem.preview_url} alt="" />
        ) : (
          <div className="community-emblem-card-placeholder community-emblem-card-placeholder--lg">
            No preview uploaded · open in editor to view
          </div>
        )}
      </div>

      <div className="community-detail-actions">
        <a href={openHref} target="_blank" rel="noreferrer" className="seo-cta seo-cta-lg">
          Open in Emblem Editor
        </a>
        {isOwner ? (
          <DeleteEmblemButton
            emblemId={emblem.id}
            redirectTo="/community/emblems"
          />
        ) : null}
      </div>

      <label className="community-field" style={{ marginTop: "1.25rem" }}>
        <span>SAVE code</span>
        <textarea
          readOnly
          value={emblem.emblem_code}
          rows={4}
          spellCheck={false}
        />
      </label>

      <p className="seo-lead">
        <Link href="/community/emblems" style={{ color: "var(--accent)" }}>
          Back to Emblems
        </Link>
      </p>
    </>
  );
}
