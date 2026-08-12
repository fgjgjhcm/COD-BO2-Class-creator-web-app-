"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCurrentEmblemAction } from "@/lib/community/actions";

export function SetCurrentEmblemButton({
  emblemId,
  isCurrent,
}: {
  emblemId: string;
  isCurrent: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="community-inline-action">
      <button
        type="button"
        className={
          isCurrent
            ? "community-action-btn community-action-primary"
            : "community-action-btn"
        }
        disabled={pending || isCurrent}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await setCurrentEmblemAction(emblemId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending ? "Saving…" : isCurrent ? "Current emblem" : "Set as current"}
      </button>
      {error ? <p className="community-inline-error">{error}</p> : null}
    </div>
  );
}
