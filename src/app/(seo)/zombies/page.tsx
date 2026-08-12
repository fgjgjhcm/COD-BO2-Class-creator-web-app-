import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllZwrMapBoards,
  ZWR_MAPS,
  zwrHubUrl,
} from "@/lib/zwr";

export const metadata: Metadata = {
  title: "BO2 Zombies High Rounds",
  description:
    "Black Ops II Zombies high-round leaderboards by map — Solo through 4-player, sourced from Zombies World Records.",
  alternates: { canonical: "/zombies" },
};

export const revalidate = 3600;

export default async function ZombiesIndexPage() {
  const boards = await getAllZwrMapBoards();
  const byId = Object.fromEntries(boards.map((b) => [b.mapId, b]));
  const anyLive = boards.some((b) => b.live);

  return (
    <>
      <p className="seo-eyebrow">Zombies</p>
      <h1 className="seo-title">BO2 High Rounds</h1>
      <p className="seo-lead">
        High-round records for every Black Ops II Zombies map. Source:{" "}
        <a href={zwrHubUrl()} target="_blank" rel="noopener noreferrer">
          Zombies World Records
        </a>
        .
      </p>

      {!anyLive ? (
        <p className="zombies-status" role="status">
          Showing cached snapshot — live fetch from zwr.gg was unavailable.
        </p>
      ) : null}

      <ul className="zombies-map-grid">
        {ZWR_MAPS.map((map) => {
          const board = byId[map.id];
          const top = board?.boards[1]?.[0];
          return (
            <li key={map.id}>
              <Link
                href={`/zombies/${map.id}`}
                className="zombies-map-link"
                style={{ backgroundImage: `url(${map.image})` }}
              >
                <span className="zombies-map-shade" aria-hidden="true" />
                <span className="zombies-map-copy">
                  <span className="zombies-map-name">{map.name}</span>
                  {top ? (
                    <span className="zombies-map-meta">
                      Solo #{top.rank}: round {top.round}
                      {top.players[0] ? ` · ${top.players[0].name}` : ""}
                    </span>
                  ) : (
                    <span className="zombies-map-meta">View leaderboard</span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="zombies-attribution">
        Fan-made mirror for browsing. Official submissions and rules live on{" "}
        <a href={zwrHubUrl()} target="_blank" rel="noopener noreferrer">
          zwr.gg
        </a>
        . Not affiliated with Activision, Treyarch, or Zombies World Records.
      </p>
    </>
  );
}
