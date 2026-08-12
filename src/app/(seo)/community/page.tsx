import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { CommunityLoadoutCard } from "@/components/community/CommunityLoadoutCard";
import { listCommunityLoadouts } from "@/lib/community/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  COMMUNITY_PAGE_SIZE,
  type CommunitySort,
} from "@/types/community";

export const metadata: Metadata = {
  title: "BO2 Community Loadouts",
  description:
    "Browse and publish Black Ops II Pick 10 loadouts from the community. Open any class in the builder, remix, like, and save.",
  alternates: { canonical: "/community" },
};

function parseSort(raw: string | undefined): CommunitySort {
  if (raw === "trending" || raw === "top" || raw === "new") return raw;
  return "new";
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const sort = parseSort(params.sort);
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const configured = isSupabaseConfigured();

  const { items, total } = configured
    ? await listCommunityLoadouts({ sort, q, page })
    : { items: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / COMMUNITY_PAGE_SIZE));

  return (
    <>
      <div className="community-hero">
        <div>
          <p className="seo-eyebrow">Multiplayer Menu</p>
          <h1 className="seo-title">Community</h1>
          <p className="seo-lead">Loadouts from the BO2 community.</p>
        </div>
        <Link href="/builder?publish=1" className="seo-cta seo-cta-lg">
          Post Loadout
        </Link>
      </div>

      {!configured ? (
        <div className="community-empty">
          <p className="community-empty-title">SYSTEM OFFLINE</p>
          <p className="seo-lead">
            Community requires Supabase. Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY, then run the SQL migration.
          </p>
        </div>
      ) : (
        <>
          <Suspense fallback={null}>
            <CommunityFilters sort={sort} q={q} />
          </Suspense>

          {items.length === 0 ? (
            <div className="community-empty">
              <p className="community-empty-title">
                {q ? "NO MATCHING LOADOUTS" : "NO INTEL FOUND"}
              </p>
              <p className="seo-lead">
                {q
                  ? "Try another search term."
                  : "Be the first operative to publish a loadout."}
              </p>
              <Link href="/builder?publish=1" className="seo-cta">
                Post Loadout
              </Link>
            </div>
          ) : (
            <div className="community-grid">
              {items.map((loadout) => (
                <CommunityLoadoutCard key={loadout.id} loadout={loadout} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="community-pagination" aria-label="Pagination">
              {page > 1 ? (
                <Link
                  href={`/community?${new URLSearchParams({
                    ...(sort !== "new" ? { sort } : {}),
                    ...(q ? { q } : {}),
                    page: String(page - 1),
                  }).toString()}`}
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span>
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/community?${new URLSearchParams({
                    ...(sort !== "new" ? { sort } : {}),
                    ...(q ? { q } : {}),
                    page: String(page + 1),
                  }).toString()}`}
                >
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
