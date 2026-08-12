"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setEmblemVisibilityAction,
  setLoadoutVisibilityAction,
} from "@/lib/community/actions";

export function OwnerVisibilityButton({
  kind,
  id,
  isPublic,
}: {
  kind: "loadout" | "emblem";
  id: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="community-inline-action">
      <button
        type="button"
        className="community-action-btn"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result =
              kind === "loadout"
                ? await setLoadoutVisibilityAction(id, !isPublic)
                : await setEmblemVisibilityAction(id, !isPublic);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending
          ? "Updating…"
          : isPublic
            ? "Make private"
            : "Make public"}
      </button>
      {error ? <p className="community-inline-error">{error}</p> : null}
    </div>
  );
}
