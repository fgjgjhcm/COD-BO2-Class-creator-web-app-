import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CommunityEmblemCard } from "@/components/community/CommunityEmblemCard";
import { EmblemsPublishButton } from "@/components/community/EmblemsPublishButton";
import {
  getMyProfile,
  listCommunityEmblems,
} from "@/lib/community/queries";
import { EXTERNAL_EMBLEM_EDITOR_URL } from "@/lib/community/emblemLinks";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "BO2 Community Emblems",
  description:
    "Browse and share Black Ops II playercard emblems. Paste SAVE codes from the BO2 emblem editor and publish to the community.",
  alternates: { canonical: "/community/emblems" },
};

export default async function CommunityEmblemsPage() {
  const configured = isSupabaseConfigured();
  const [me, listed] = await Promise.all([
    configured ? getMyProfile() : Promise.resolve(null),
    configured
      ? listCommunityEmblems({ sort: "new" })
      : Promise.resolve({ items: [], total: 0 }),
  ]);

  return (
    <>
      <div className="community-hero">
        <div>
          <p className="seo-eyebrow">Create-an-Emblem</p>
          <h1 className="seo-title">Emblems</h1>
          <p className="seo-lead">
            Build in the{" "}
            <a
              href={EXTERNAL_EMBLEM_EDITOR_URL}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)" }}
            >
              BO2 Emblem Editor
            </a>
            , SAVE your code, then publish it here for the community.
          </p>
        </div>
        <Suspense fallback={<span className="seo-cta seo-cta-lg">Post Emblem</span>}>
          <EmblemsPublishButton />
        </Suspense>
      </div>

      <p className="seo-lead">
        <Link href="/community" style={{ color: "var(--accent)" }}>
          ← Back to Community loadouts
        </Link>
      </p>

      {!configured ? (
        <div className="community-empty">
          <p className="community-empty-title">SYSTEM OFFLINE</p>
          <p className="seo-lead">Community requires Supabase.</p>
        </div>
      ) : listed.items.length === 0 ? (
        <div className="community-empty">
          <p className="community-empty-title">NO EMBLEMS YET</p>
          <p className="seo-lead">
            Be the first to publish an emblem SAVE code from the editor.
          </p>
        </div>
      ) : (
        <div className="community-grid">
          {listed.items.map((emblem) => (
            <CommunityEmblemCard
              key={emblem.id}
              emblem={emblem}
              canManage={me?.id === emblem.user_id}
            />
          ))}
        </div>
      )}
    </>
  );
}
