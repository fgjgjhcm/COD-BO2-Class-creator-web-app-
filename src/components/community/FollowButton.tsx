"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowAction } from "@/lib/community/actions";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span className="community-action-wrap">
      <button
        type="button"
        className={`seo-cta community-follow-btn${following ? " is-following" : ""}`}
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleFollowAction(targetUserId);
            if (!result.ok) {
              setError(result.error);
              if (result.error.toLowerCase().includes("sign in")) {
                router.push(
                  `/login?next=${encodeURIComponent(window.location.pathname)}`,
                );
              }
              return;
            }
            setFollowing(result.data.following);
            router.refresh();
          });
        }}
      >
        {pending ? "…" : following ? "Following" : "Follow"}
      </button>
      {error ? <span className="community-inline-error">{error}</span> : null}
    </span>
  );
}
