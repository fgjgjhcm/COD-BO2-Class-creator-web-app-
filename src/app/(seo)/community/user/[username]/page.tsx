import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityEmblemCard } from "@/components/community/CommunityEmblemCard";
import { CommunityLoadoutCard } from "@/components/community/CommunityLoadoutCard";
import { FollowButton } from "@/components/community/FollowButton";
import { ProfileEditForm } from "@/components/community/ProfileEditForm";
import {
  getMyProfile,
  getProfileByUsername,
  getProfileStats,
  isFollowingUser,
  listEmblemsByUser,
  listLoadoutsByUser,
} from "@/lib/community/queries";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile?.username) return { title: "Operative" };
  return {
    title: `@${profile.username} — Community Profile`,
    description:
      profile.bio ||
      `BO2 Community profile for @${profile.username}. View published Pick 10 loadouts.`,
    alternates: { canonical: `/community/user/${profile.username}` },
  };
}

function currentEmblemFromProfile(
  profile: NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>,
) {
  const raw = (profile as { current_emblem?: unknown }).current_emblem as
    | {
        id: string;
        title: string;
        slug: string;
        preview_url: string | null;
        is_public?: boolean;
      }
    | {
        id: string;
        title: string;
        slug: string;
        preview_url: string | null;
        is_public?: boolean;
      }[]
    | null
    | undefined;
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

export default async function CommunityUserPage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile?.username) notFound();

  const me = await getMyProfile();
  const isSelf = me?.id === profile.id;

  const [stats, loadouts, emblems, following] = await Promise.all([
    getProfileStats(profile.id),
    listLoadoutsByUser(profile.id, { includePrivate: isSelf }),
    listEmblemsByUser(profile.id, { includePrivate: isSelf }),
    isFollowingUser(profile.id),
  ]);

  const currentEmblem = currentEmblemFromProfile(profile);

  return (
    <>
      <p className="seo-eyebrow">Operative Profile</p>
      <div className="community-profile-hero">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="community-profile-avatar"
            width={72}
            height={72}
          />
        ) : (
          <div className="community-profile-avatar community-profile-avatar--fallback">
            {profile.username.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="community-profile-hero-main">
          <h1 className="seo-title">@{profile.username}</h1>
          {profile.display_name ? (
            <p className="community-profile-display">{profile.display_name}</p>
          ) : null}
          {profile.bio ? <p className="seo-lead">{profile.bio}</p> : null}
          <p className="community-profile-stats">
            Joined {new Date(profile.created_at).toLocaleDateString()} ·{" "}
            {stats.loadoutCount} loadouts · {stats.totalLikes} likes ·{" "}
            {stats.followerCount} followers · {stats.followingCount} following
          </p>
          {!isSelf ? (
            <div className="community-profile-actions">
              <FollowButton
                targetUserId={profile.id}
                initialFollowing={following}
              />
            </div>
          ) : null}
        </div>
        {currentEmblem ? (
          <Link
            href={`/community/emblem/${currentEmblem.slug}`}
            className="community-profile-current-emblem"
          >
            {currentEmblem.preview_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentEmblem.preview_url} alt="" />
            ) : (
              <span className="community-emblem-card-placeholder">Emblem</span>
            )}
            <span>
              <em>Current emblem</em>
              <strong>{currentEmblem.title}</strong>
            </span>
          </Link>
        ) : null}
      </div>

      {isSelf ? (
        <ProfileEditForm
          userId={profile.id}
          initialDisplayName={profile.display_name ?? ""}
          initialBio={profile.bio ?? ""}
          initialAvatarUrl={profile.avatar_url}
        />
      ) : null}

      <h2 className="seo-section-title">
        {isSelf ? "Your loadouts" : "Published loadouts"}
      </h2>
      {loadouts.length === 0 ? (
        <div className="community-empty">
          <p className="community-empty-title">NO INTEL FOUND</p>
          <p className="seo-lead">This operative has not published yet.</p>
          {isSelf ? (
            <Link href="/builder?publish=1" className="seo-cta">
              Post Loadout
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="community-grid">
          {loadouts.map((loadout) => (
            <CommunityLoadoutCard
              key={loadout.id}
              loadout={loadout}
              canManage={isSelf}
            />
          ))}
        </div>
      )}

      <h2 className="seo-section-title">
        {isSelf ? "Your emblems" : "Emblems"}
      </h2>
      {emblems.length === 0 ? (
        <div className="community-empty">
          <p className="community-empty-title">NO EMBLEMS</p>
          <p className="seo-lead">
            {isSelf
              ? "Post an emblem and set one as current to show it on your profile."
              : "This operative has not shared emblems yet."}
          </p>
          {isSelf ? (
            <Link href="/community/emblems?publish=1" className="seo-cta">
              Post Emblem
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="community-grid">
          {emblems.map((emblem) => (
            <CommunityEmblemCard
              key={emblem.id}
              emblem={emblem}
              canManage={isSelf}
            />
          ))}
        </div>
      )}
    </>
  );
}
