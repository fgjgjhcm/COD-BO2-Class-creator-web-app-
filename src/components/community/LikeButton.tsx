"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLikeAction } from "@/lib/community/actions";

export function LikeButton({
  loadoutId,
  initialLiked,
  initialCount,
}: {
  loadoutId: string;
  initialLiked?: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(Boolean(initialLiked));
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span className="community-action-wrap">
      <button
        type="button"
        className={`community-action-btn${liked ? " is-active" : ""}`}
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleLikeAction(loadoutId);
            if (!result.ok) {
              setError(result.error);
              if (result.error.toLowerCase().includes("sign in")) {
                router.push(
                  `/login?next=${encodeURIComponent(window.location.pathname)}`,
                );
              }
              return;
            }
            setLiked(result.data.liked);
            setCount((value) => value + (result.data.liked ? 1 : -1));
            router.refresh();
          });
        }}
      >
        Like {count}
      </button>
      {error ? <span className="community-inline-error">{error}</span> : null}
    </span>
  );
}
