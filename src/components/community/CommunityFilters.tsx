"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { CommunitySort, CommunityTab } from "@/types/community";

const TABS: { id: CommunityTab; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
  { id: "top", label: "Top" },
  { id: "loadouts", label: "Loadouts" },
  { id: "emblems", label: "Emblems" },
];

export function CommunityFilters({
  sort,
  q,
}: {
  sort: CommunitySort;
  q: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(q);
  const [pending, startTransition] = useTransition();

  function go(next: { sort?: string; q?: string; page?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.sort !== undefined) {
      if (next.sort === "new") params.delete("sort");
      else params.set("sort", next.sort);
    }
    if (next.q !== undefined) {
      if (!next.q) params.delete("q");
      else params.set("q", next.q);
    }
    if (next.page !== undefined) {
      if (next.page === "1") params.delete("page");
      else params.set("page", next.page);
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/community?${qs}` : "/community");
    });
  }

  return (
    <div className="community-filters">
      <div className="community-tabs" role="tablist" aria-label="Community filters">
        {TABS.map((tab) => {
          if (tab.id === "emblems") {
            return (
              <Link
                key={tab.id}
                href="/community/emblems"
                className="community-tab"
              >
                {tab.label}
              </Link>
            );
          }
          const activeSort: CommunitySort =
            tab.id === "loadouts" ? "new" : (tab.id as CommunitySort);
          const active =
            tab.id === "trending" || tab.id === "new" || tab.id === "top"
              ? sort === tab.id
              : tab.id === "loadouts" && sort === "new";
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`community-tab${active ? " is-active" : ""}`}
              disabled={pending}
              onClick={() => go({ sort: activeSort })}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <form
        className="community-search"
        onSubmit={(event) => {
          event.preventDefault();
          go({ q: query.trim() });
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or username"
          aria-label="Search community loadouts"
        />
        <button type="submit" className="seo-cta" disabled={pending}>
          Search
        </button>
      </form>
    </div>
  );
}
