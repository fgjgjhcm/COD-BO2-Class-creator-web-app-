import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityLoadoutCard } from "@/components/community/CommunityLoadoutCard";
import { ProfileEditForm } from "@/components/community/ProfileEditForm";
import {
  getMyProfile,
  getProfileByUsername,
  getProfileStats,
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

export default async function CommunityUserPage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile?.username) notFound();

  const [stats, loadouts, me] = await Promise.all([
    getProfileStats(profile.id),
    listLoadoutsByUser(profile.id),
    getMyProfile(),
  ]);
  const isSelf = me?.id === profile.id;

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
        <div>
          <h1 className="seo-title">@{profile.username}</h1>
          {profile.display_name ? (
            <p className="community-profile-display">{profile.display_name}</p>
          ) : null}
          {profile.bio ? <p className="seo-lead">{profile.bio}</p> : null}
          <p className="community-profile-stats">
            Joined {new Date(profile.created_at).toLocaleDateString()} ·{" "}
            {stats.loadoutCount} loadouts · {stats.totalLikes} likes
          </p>
          {/* Future: EASTER EGG HUNTER and other badges */}
        </div>
      </div>

      {isSelf ? (
        <ProfileEditForm
          initialDisplayName={profile.display_name ?? ""}
          initialBio={profile.bio ?? ""}
        />
      ) : null}

      <h2 className="seo-section-title">Published loadouts</h2>
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
            <CommunityLoadoutCard key={loadout.id} loadout={loadout} />
          ))}
        </div>
      )}
    </>
  );
}
