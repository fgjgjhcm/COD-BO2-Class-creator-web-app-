import Link from "next/link";
import type { Profile } from "@/types/database";

export function UserBadge({
  profile,
}: {
  profile: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
}) {
  if (!profile?.username) {
    return <span className="community-user-badge">Unknown operative</span>;
  }

  return (
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
  );
}
