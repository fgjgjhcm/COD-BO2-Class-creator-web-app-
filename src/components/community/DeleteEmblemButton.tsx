"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEmblemAction } from "@/lib/community/actions";

export function DeleteEmblemButton({
  emblemId,
  redirectTo = "/community/emblems",
}: {
  emblemId: string;
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
          if (!window.confirm("Delete this emblem? This cannot be undone.")) {
            return;
          }
          startTransition(async () => {
            const result = await deleteEmblemAction(emblemId);
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
