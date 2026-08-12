"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reportLoadoutAction } from "@/lib/community/actions";

export function ReportButton({ loadoutId }: { loadoutId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        className="community-report-btn"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await reportLoadoutAction({
              loadoutId,
              reason: "Reported from loadout page",
            });
            if (!result.ok) {
              if (result.error.toLowerCase().includes("sign in")) {
                router.push(
                  `/login?next=${encodeURIComponent(window.location.pathname)}`,
                );
                return;
              }
              setMessage(result.error);
              return;
            }
            setMessage("Report submitted.");
          });
        }}
      >
        Report post
      </button>
      {message ? <p className="community-inline-error">{message}</p> : null}
    </div>
  );
}
