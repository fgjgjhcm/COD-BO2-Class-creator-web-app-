"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLoadoutAction } from "@/lib/community/actions";

export function DeleteLoadoutButton({
  loadoutId,
  redirectTo = "/community",
}: {
  loadoutId: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <span className="community-action-wrap">
      <button
        type="button"
        className="community-action-btn community-delete-btn"
        disabled={pending}
        onClick={() => {
          setError(null);
          if (
            !window.confirm(
              "Delete this loadout? This cannot be undone.",
            )
          ) {
            return;
          }
          startTransition(async () => {
            const result = await deleteLoadoutAction(loadoutId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.push(redirectTo);
            router.refresh();
          });
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <span className="community-inline-error">{error}</span> : null}
    </span>
  );
}
