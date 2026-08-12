"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSaveAction } from "@/lib/community/actions";

export function SaveButton({
  loadoutId,
  initialSaved,
  initialCount,
}: {
  loadoutId: string;
  initialSaved?: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(Boolean(initialSaved));
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span className="community-action-wrap">
      <button
        type="button"
        className={`community-action-btn${saved ? " is-active" : ""}`}
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleSaveAction(loadoutId);
            if (!result.ok) {
              setError(result.error);
              if (result.error.toLowerCase().includes("sign in")) {
                router.push(
                  `/login?next=${encodeURIComponent(window.location.pathname)}`,
                );
              }
              return;
            }
            setSaved(result.data.saved);
            setCount((value) => value + (result.data.saved ? 1 : -1));
            router.refresh();
          });
        }}
      >
        Save {count}
      </button>
      {error ? <span className="community-inline-error">{error}</span> : null}
    </span>
  );
}
