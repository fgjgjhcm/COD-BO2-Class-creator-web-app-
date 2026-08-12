"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CommunityEmblem } from "@/types/community";
import { UserBadge } from "@/components/community/UserBadge";
import { deleteEmblemAction } from "@/lib/community/actions";
import { emblemEditorLoadUrl } from "@/lib/community/emblemLinks";

function relativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommunityEmblemCard({
  emblem,
  canDelete = false,
}: {
  emblem: CommunityEmblem;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const detailHref = `/community/emblem/${emblem.slug}`;
  const openHref = emblemEditorLoadUrl(emblem.emblem_code);

  return (
    <article className="community-card community-emblem-card">
      <Link href={detailHref} className="community-emblem-card-media">
        {emblem.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emblem.preview_url} alt="" />
        ) : (
          <span className="community-emblem-card-placeholder">
            {emblem.layer_count ?? 0} layers
          </span>
        )}
      </Link>
      <header className="community-card-header">
        <div>
          <Link href={detailHref} className="community-card-title">
            {emblem.title}
          </Link>
          <div className="community-card-meta">
            <UserBadge profile={emblem.profile} />
            <span>{relativeTime(emblem.created_at)}</span>
            <span>{emblem.layer_count ?? 0}/32 layers</span>
          </div>
        </div>
      </header>
      {emblem.description ? (
        <p className="community-card-desc">{emblem.description}</p>
      ) : null}
      <footer className="community-card-actions">
        <a
          href={openHref}
          target="_blank"
          rel="noreferrer"
          className="community-action-btn community-action-primary"
        >
          Open in Editor
        </a>
        <Link href={detailHref} className="community-action-btn">
          Details
        </Link>
        {canDelete ? (
          <button
            type="button"
            className="community-action-btn community-delete-btn"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Delete this emblem?")) return;
              setError(null);
              startTransition(async () => {
                const result = await deleteEmblemAction(emblem.id);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                router.refresh();
              });
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        ) : null}
      </footer>
      {error ? <p className="community-inline-error">{error}</p> : null}
    </article>
  );
}
