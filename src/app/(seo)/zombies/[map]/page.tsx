import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZombiesBoardTabs } from "@/components/seo/ZombiesBoardTabs";
import {
  getZwrMap,
  getZwrMapBoard,
  ZWR_MAP_IDS,
  zwrMapSourceUrl,
} from "@/lib/zwr";

export const revalidate = 3600;

export function generateStaticParams() {
  return ZWR_MAP_IDS.map((map) => ({ map }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ map: string }>;
}): Promise<Metadata> {
  const { map: mapId } = await params;
  const map = getZwrMap(mapId);
  if (!map) return { title: "Zombies Map" };
  return {
    title: `${map.name} High Rounds`,
    description: `Black Ops II ${map.name} Zombies high-round leaderboard — Solo through 4-player records from Zombies World Records.`,
    alternates: { canonical: `/zombies/${map.id}` },
  };
}

export default async function ZombiesMapPage({
  params,
}: {
  params: Promise<{ map: string }>;
}) {
  const { map: mapId } = await params;
  const map = getZwrMap(mapId);
  if (!map) notFound();

  const board = await getZwrMapBoard(map.id);
  const sourceUrl = zwrMapSourceUrl(map.slug);

  return (
    <>
      <nav className="seo-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="seo-breadcrumb-item">
          <span aria-hidden="true">/</span>
          <Link href="/zombies">Zombies</Link>
        </span>
        <span className="seo-breadcrumb-item">
          <span aria-hidden="true">/</span>
          <span>{map.name}</span>
        </span>
      </nav>

      <p className="seo-eyebrow">High Rounds</p>
      <h1 className="seo-title">{map.name}</h1>
      <p className="seo-lead">
        Official high-round standings for {map.name}. Source:{" "}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          Zombies World Records
        </a>
        .
      </p>

      {!board.live ? (
        <p className="zombies-status" role="status">
          Showing cached snapshot — live fetch from zwr.gg was unavailable.
        </p>
      ) : null}

      <ZombiesBoardTabs boards={board.boards} />

      <p className="zombies-attribution">
        Submit runs and view full history on{" "}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          zwr.gg/{map.slug}
        </a>
        . Not affiliated with Activision, Treyarch, or Zombies World Records.
      </p>
    </>
  );
}
