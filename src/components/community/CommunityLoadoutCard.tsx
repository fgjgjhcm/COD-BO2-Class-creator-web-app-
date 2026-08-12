"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommunityLoadout } from "@/types/community";
import { LoadoutPreview } from "@/components/community/LoadoutPreview";
import { LikeButton } from "@/components/community/LikeButton";
import { SaveButton } from "@/components/community/SaveButton";
import { DeleteLoadoutButton } from "@/components/community/DeleteLoadoutButton";
import { UserBadge } from "@/components/community/UserBadge";
import { weaponsById } from "@/data/weapons";
import { getItemImageSrc } from "@/lib/icons";
import { SITE_URL } from "@/lib/site";

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

export function CommunityLoadoutCard({
  loadout,
  canDelete = false,
}: {
  loadout: CommunityLoadout;
  canDelete?: boolean;
}) {
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const primary = loadout.loadout_data.primaryWeaponId
    ? weaponsById[loadout.loadout_data.primaryWeaponId]
    : null;
  const openHref = `/builder?community=${loadout.id}`;
  const remixHref = `/builder?community=${loadout.id}&remix=1`;
  const detailHref = `/community/loadout/${loadout.slug}`;

  return (
    <article className="community-card">
      <header className="community-card-header">
        <div className="community-card-title-row">
          {primary ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getItemImageSrc(primary, "weapons")}
              alt=""
              className="community-card-gun"
            />
          ) : null}
          <div>
            <Link href={detailHref} className="community-card-title">
              {loadout.title}
            </Link>
            <div className="community-card-meta">
              <UserBadge profile={loadout.profile} />
              <span>{relativeTime(loadout.created_at)}</span>
            </div>
          </div>
        </div>
        {loadout.remix_of ? (
          <p className="community-remix-tag">
            Remix
            {loadout.remix_of_slug ? (
              <>
                {" of "}
                <Link href={`/community/loadout/${loadout.remix_of_slug}`}>
                  {loadout.remix_of_title ?? "original"}
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </header>

      {loadout.description ? (
        <p className="community-card-desc">{loadout.description}</p>
      ) : null}

      <LoadoutPreview build={loadout.loadout_data} compact />

      <footer className="community-card-actions">
        <LikeButton
          loadoutId={loadout.id}
          initialLiked={loadout.liked_by_me}
          initialCount={loadout.like_count}
        />
        <SaveButton
          loadoutId={loadout.id}
          initialSaved={loadout.saved_by_me}
          initialCount={loadout.save_count}
        />
        <Link
          href={openHref}
          className="community-action-btn community-action-primary"
        >
          Open Class
        </Link>
        <Link href={remixHref} className="community-action-btn">
          Remix
        </Link>
        <button
          type="button"
          className="community-action-btn"
          onClick={async () => {
            const url = `${SITE_URL}${detailHref}`;
            try {
              await navigator.clipboard.writeText(url);
              setShareMsg("Copied");
              window.setTimeout(() => setShareMsg(null), 1500);
            } catch {
              setShareMsg("Copy failed");
            }
          }}
        >
          {shareMsg ?? "Share"}
        </button>
        {canDelete ? (
          <DeleteLoadoutButton
            loadoutId={loadout.id}
            redirectTo={
              loadout.profile?.username
                ? `/community/user/${loadout.profile.username}`
                : "/community"
            }
          />
        ) : null}
      </footer>
    </article>
  );
}
