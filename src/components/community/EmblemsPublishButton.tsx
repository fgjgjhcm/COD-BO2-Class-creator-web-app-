"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PublishEmblemModal } from "@/components/community/PublishEmblemModal";

export function EmblemsPublishButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("publish") === "1") {
      setOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("publish");
      const qs = params.toString();
      router.replace(qs ? `/community/emblems?${qs}` : "/community/emblems");
    }
  }, [searchParams, router]);

  return (
    <>
      <button
        type="button"
        className="seo-cta seo-cta-lg"
        onClick={() => setOpen(true)}
      >
        Post Emblem
      </button>
      <PublishEmblemModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
