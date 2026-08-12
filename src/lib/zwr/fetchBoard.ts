import { unstable_cache } from "next/cache";
import fallbackJson from "@/data/zwr-fallback.json";
import { getZwrMap, zwrMapSourceUrl } from "./maps";
import { parseZwrMapHtml } from "./parse";
import type { ZwrFallbackFile, ZwrMapBoard } from "./types";

const REVALIDATE_SECONDS = 3600;
const FALLBACK = fallbackJson as ZwrFallbackFile;

const FETCH_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (compatible; bo2loadouts/1.0; +https://bo2loadouts.com)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

function emptyBoard(mapId: string, slug: string): ZwrMapBoard {
  return {
    mapId,
    sourceUrl: zwrMapSourceUrl(slug),
    fetchedAt: new Date(0).toISOString(),
    live: false,
    boards: { 1: [], 2: [], 3: [], 4: [] },
  };
}

async function scrapeMapBoard(mapId: string): Promise<ZwrMapBoard> {
  const map = getZwrMap(mapId);
  if (!map) {
    throw new Error(`Unknown ZWR map: ${mapId}`);
  }

  const sourceUrl = zwrMapSourceUrl(map.slug);
  const res = await fetch(sourceUrl, {
    headers: FETCH_HEADERS,
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`ZWR fetch ${res.status} for ${mapId}`);
  }

  const html = await res.text();
  const boards = parseZwrMapHtml(html);
  const hasRows = Object.values(boards).some((rows) => rows.length > 0);
  if (!hasRows) {
    throw new Error(`ZWR parse empty for ${mapId}`);
  }

  return {
    mapId,
    sourceUrl,
    fetchedAt: new Date().toISOString(),
    live: true,
    boards,
  };
}

function fromFallback(mapId: string): ZwrMapBoard {
  const map = getZwrMap(mapId);
  const cached = FALLBACK[mapId];
  if (cached) {
    return { ...cached, live: false };
  }
  return emptyBoard(mapId, map?.slug ?? mapId);
}

const getCachedLiveBoard = unstable_cache(
  async (mapId: string) => scrapeMapBoard(mapId),
  ["zwr-bo2-high-round"],
  { revalidate: REVALIDATE_SECONDS, tags: ["zwr-leaderboard"] },
);

/** Live scrape with 1h cache; falls back to checked-in snapshot on failure. */
export async function getZwrMapBoard(mapId: string): Promise<ZwrMapBoard> {
  if (!getZwrMap(mapId)) {
    return emptyBoard(mapId, mapId);
  }

  try {
    return await getCachedLiveBoard(mapId);
  } catch {
    return fromFallback(mapId);
  }
}

export async function getAllZwrMapBoards(): Promise<ZwrMapBoard[]> {
  const { ZWR_MAPS } = await import("./maps");
  return Promise.all(ZWR_MAPS.map((m) => getZwrMapBoard(m.id)));
}
