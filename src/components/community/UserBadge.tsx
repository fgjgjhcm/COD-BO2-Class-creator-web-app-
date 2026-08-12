import Link from "next/link";
import type { CommunityProfile } from "@/types/community";

export function UserBadge({
  profile,
}: {
  profile: CommunityProfile | null;
}) {
  if (!profile?.username) {
    return <span className="community-user-badge">Unknown operative</span>;
  }

  const emblem = profile.current_emblem;

  return (
    <span className="community-user-badge-wrap">
      <Link
        href={`/community/user/${profile.username}`}
        className="community-user-badge"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" width={20} height={20} />
        ) : (
          <span className="community-user-initial">
            {profile.username.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span>@{profile.username}</span>
      </Link>
      {emblem ? (
        <span className="community-user-popover" role="tooltip">
          {emblem.preview_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={emblem.preview_url} alt="" />
          ) : (
            <span className="community-user-popover-placeholder">Emblem</span>
          )}
          <span className="community-user-popover-meta">
            <strong>{emblem.title}</strong>
            <Link href={`/community/emblem/${emblem.slug}`}>View emblem</Link>
          </span>
        </span>
      ) : null}
    </span>
  );
}
