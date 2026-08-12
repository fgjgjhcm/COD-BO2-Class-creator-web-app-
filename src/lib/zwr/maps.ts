export interface ZwrMap {
  id: string;
  name: string;
  /** Path segment on zwr.gg */
  slug: string;
  /** Hub tile background under /public */
  image: string;
}

export const ZWR_MAPS: readonly ZwrMap[] = [
  {
    id: "tranzit",
    name: "Tranzit",
    slug: "tranzit",
    image: "/images/zombies/tranzit.webp",
  },
  {
    id: "bus-depot",
    name: "Bus Depot",
    slug: "bus-depot",
    image: "/images/zombies/bus-depot.webp",
  },
  {
    id: "town",
    name: "Town",
    slug: "town",
    image: "/images/zombies/town.webp",
  },
  {
    id: "farm",
    name: "Farm",
    slug: "farm",
    image: "/images/zombies/farm.webp",
  },
  {
    id: "nuketown",
    name: "Nuketown",
    slug: "nuketown",
    image: "/images/zombies/nuketown.webp",
  },
  {
    id: "die-rise",
    name: "Die Rise",
    slug: "die-rise",
    image: "/images/zombies/die-rise.webp",
  },
  {
    id: "mob-of-the-dead",
    name: "Mob of the Dead",
    slug: "mob-of-the-dead",
    image: "/images/zombies/mob-of-the-dead.webp",
  },
  {
    id: "buried",
    name: "Buried",
    slug: "buried",
    image: "/images/zombies/buried.webp",
  },
  {
    id: "origins",
    name: "Origins",
    slug: "origins",
    image: "/images/zombies/origins.webp",
  },
] as const;

export const ZWR_MAP_IDS = ZWR_MAPS.map((m) => m.id);

export function getZwrMap(id: string): ZwrMap | undefined {
  return ZWR_MAPS.find((m) => m.id === id);
}

export function zwrMapSourceUrl(slug: string): string {
  return `https://zwr.gg/leaderboards/bo2/high-round/${slug}/`;
}

export function zwrHubUrl(): string {
  return "https://zwr.gg/leaderboards/bo2/high-round/";
}

export const PLAYER_COUNT_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Solo",
  2: "2 Player",
  3: "3 Player",
  4: "4 Player",
};
